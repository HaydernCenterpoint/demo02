import net from 'net';

export interface PLCConfig {
  ip: string;
  port: number;
  enabled: boolean;
}

interface PendingTransaction {
  requestBuffer: Buffer;
  resolve: (value: any) => void;
  reject: (err: any) => void;
}

export class MitsubishiPLC {
  private ip: string;
  private port: number;
  public enabled: boolean;
  
  private socket: net.Socket | null = null;
  public connected: boolean = false;
  private connecting: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  // Queuing system for thread-safe socket streaming
  private queue: PendingTransaction[] = [];
  private activeTransaction: PendingTransaction | null = null;
  private responseBuffer: Buffer = Buffer.alloc(0);

  constructor(config: PLCConfig) {
    this.ip = config.ip;
    this.port = config.port;
    this.enabled = config.enabled;
  }

  // Connect to the Mitsubishi PLC via TCP socket
  public connect(): void {
    if (!this.enabled) {
      console.log('[PLC Connector] Disabled by configuration.');
      return;
    }
    if (this.connected || this.connecting) return;

    this.connecting = true;
    console.log(`[PLC Connector] Connecting to Mitsubishi PLC at ${this.ip}:${this.port}...`);

    this.socket = new net.Socket();
    this.socket.setTimeout(3000); // 3 seconds timeout

    this.socket.connect(this.port, this.ip, () => {
      this.connected = true;
      this.connecting = false;
      console.log(`[PLC Connector] Successfully connected to Mitsubishi PLC at ${this.ip}:${this.port}`);
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.processQueue();
    });

    this.socket.on('data', (data) => {
      this.responseBuffer = Buffer.concat([this.responseBuffer, data]);
      this.handleIncomingData();
    });

    this.socket.on('error', (err) => {
      console.error(`[PLC Connector] Socket error: ${err.message}`);
      this.handleDisconnect();
    });

    this.socket.on('close', () => {
      console.log('[PLC Connector] Connection closed.');
      this.handleDisconnect();
    });

    this.socket.on('timeout', () => {
      console.error('[PLC Connector] Connection timed out.');
      this.socket?.destroy();
      this.handleDisconnect();
    });
  }

  // Gracefully handle socket disconnection and register periodic reconnection
  private handleDisconnect(): void {
    this.connected = false;
    this.connecting = false;
    this.socket = null;
    
    // Clear any active transaction
    if (this.activeTransaction) {
      this.activeTransaction.reject(new Error('PLC Disconnected'));
      this.activeTransaction = null;
    }
    
    // Clear response buffer
    this.responseBuffer = Buffer.alloc(0);

    // Periodically retry connection every 5s if enabled
    if (this.enabled && !this.reconnectTimer) {
      console.log('[PLC Connector] Scheduling automatic reconnection in 5 seconds...');
      this.reconnectTimer = setInterval(() => {
        this.connect();
      }, 5000);
    }
  }

  // Process queue transactions in thread-safe order
  private processQueue(): void {
    if (this.activeTransaction || this.queue.length === 0 || !this.connected || !this.socket) {
      return;
    }

    this.activeTransaction = this.queue.shift() || null;
    if (this.activeTransaction) {
      this.responseBuffer = Buffer.alloc(0);
      this.socket.write(this.activeTransaction.requestBuffer, (err) => {
        if (err) {
          console.error('[PLC Connector] Error sending data packet:', err);
          this.activeTransaction?.reject(err);
          this.activeTransaction = null;
          this.processQueue();
        }
      });
    }
  }

  // Listen and parse response byte stream
  private handleIncomingData(): void {
    if (!this.activeTransaction) return;

    // A valid QnA 3E response requires at least 11 bytes:
    // Subheader (2) + Net (1) + PLC (1) + IO (2) + Station (1) + Length (2) + EndCode (2) + Data...
    if (this.responseBuffer.length < 11) return;

    // Check response length (Offset 7-8 represents the length of remaining bytes starting from EndCode)
    const dataLength = this.responseBuffer.readUInt16LE(7);
    const expectedTotalLength = 9 + dataLength; // 9 bytes header before length field

    if (this.responseBuffer.length < expectedTotalLength) {
      // Wait for more chunks to arrive
      return;
    }

    // Full packet received. Process transaction
    const packet = this.responseBuffer.subarray(0, expectedTotalLength);
    this.responseBuffer = this.responseBuffer.subarray(expectedTotalLength);

    const subheader = packet.readUInt16BE(0);
    if (subheader !== 0xD000) {
      console.warn(`[PLC Connector] Incorrect response subheader: ${subheader.toString(16)} (expected D000)`);
    }

    const endCode = packet.readUInt16LE(9);
    if (endCode !== 0) {
      const errMsg = `PLC responded with error code: 0x${endCode.toString(16)}`;
      console.error(`[PLC Connector] ${errMsg}`);
      this.activeTransaction.reject(new Error(errMsg));
    } else {
      // Success! Extract payload data
      const dataPayload = packet.subarray(11);
      this.activeTransaction.resolve(dataPayload);
    }

    this.activeTransaction = null;
    this.processQueue();
  }

  // Push request to queue and return transactional Promise
  private sendTransaction(requestBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestBuffer, resolve, reject });
      this.processQueue();
    });
  }

  // --- MC PROTOCOL 3E FRAME BUILDERS & ACTIONS ---

  // 1. Batch Read D (Data) Registers (Word Unit - 2 bytes per point)
  public async readDRegisters(startD: number, count: number): Promise<number[]> {
    if (!this.connected) throw new Error('PLC Offline');
    
    // Device Code: 0x9C (Data register D)
    const requestBuffer = this.buildReadRequest(0x9C, startD, count);
    const responseData = await this.sendTransaction(requestBuffer);

    const values: number[] = [];
    for (let i = 0; i < count; i++) {
      values.push(responseData.readInt16LE(i * 2));
    }
    return values;
  }

  // 2. Batch Read M (Internal Relay) Coils (Bit Unit packed as bytes, but we read in Words to simplify mapping)
  public async readMCoils(startM: number, count: number): Promise<boolean[]> {
    if (!this.connected) throw new Error('PLC Offline');

    // Device Code: 0x90 (Relay register M)
    // To simplify bit operations and remain highly compatible with MC protocol batch read command,
    // we read M coils as word values (readMCoils using word read 0x90 command),
    // then extract bits individually.
    const requestBuffer = this.buildReadRequest(0x90, startM, count);
    const responseData = await this.sendTransaction(requestBuffer);

    // M coils read returns 1 byte per 2 coils for bit read or 2 bytes per word.
    // In Word subcommand 0000, M registers are returned as bitmasks in 16-bit word integers.
    const values: boolean[] = [];
    for (let i = 0; i < count; i++) {
      const wordIdx = Math.floor(i / 16);
      const bitIdx = i % 16;
      const wordValue = responseData.readUInt16LE(wordIdx * 2);
      values.push(((wordValue >> bitIdx) & 0x01) === 1);
    }
    return values;
  }

  // 3. Batch Write D (Data) Registers
  public async writeDRegisters(startD: number, values: number[]): Promise<boolean> {
    if (!this.connected) throw new Error('PLC Offline');

    const requestBuffer = this.buildWriteRequest(0x9C, startD, values);
    await this.sendTransaction(requestBuffer);
    return true;
  }

  // Build binary packet for MC Protocol batch read command
  private buildReadRequest(deviceCode: number, startAddress: number, count: number): Buffer {
    const header = Buffer.from([
      0x50, 0x00, // Subheader (3E Frame)
      0x00,       // Network No
      0xFF,       // PLC No (Self)
      0xFF, 0x03, // Target Station IO No (03FF)
      0x00,       // Multidrop Station No
      0x0C, 0x00, // Request Data Length (12 bytes for sub-payload)
      0x10, 0x00, // CPU Monitoring Timer (2.5s)
      0x01, 0x04, // Command: Batch Read (0401)
      0x00, 0x00, // Subcommand: Word unit (0000)
      deviceCode, // Device Code (e.g. 0x9C for D)
    ]);

    const addrBuf = Buffer.alloc(3);
    addrBuf.writeUInt16LE(startAddress & 0xFFFF, 0);
    addrBuf.writeUInt8((startAddress >> 16) & 0xFF, 2);

    const countBuf = Buffer.alloc(2);
    countBuf.writeUInt16LE(count, 0);

    return Buffer.concat([header, addrBuf, countBuf]);
  }

  // Build binary packet for MC Protocol batch write command
  private buildWriteRequest(deviceCode: number, startAddress: number, values: number[]): Buffer {
    const count = values.length;
    const reqLength = 12 + count * 2; // CPU timer(2) + cmd(2) + subcmd(2) + code(1) + addr(3) + count(2) + data(count * 2)

    const header = Buffer.from([
      0x50, 0x00, // Subheader
      0x00,       // Network No
      0xFF,       // PLC No
      0xFF, 0x03, // Target IO No
      0x00,       // Multidrop No
    ]);

    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16LE(reqLength, 0);

    const cmdHeader = Buffer.from([
      0x10, 0x00, // CPU timer
      0x01, 0x14, // Command: Batch Write (1401)
      0x00, 0x00, // Subcommand: Word unit (0000)
      deviceCode, // Device Code
    ]);

    const addrBuf = Buffer.alloc(3);
    addrBuf.writeUInt16LE(startAddress & 0xFFFF, 0);
    addrBuf.writeUInt8((startAddress >> 16) & 0xFF, 2);

    const countBuf = Buffer.alloc(2);
    countBuf.writeUInt16LE(count, 0);

    const dataBuf = Buffer.alloc(count * 2);
    for (let i = 0; i < count; i++) {
      dataBuf.writeInt16LE(values[i], i * 2);
    }

    return Buffer.concat([header, lenBuf, cmdHeader, addrBuf, countBuf, dataBuf]);
  }

  // Disconnect socket and cleanup timers
  public disconnect(): void {
    this.enabled = false;
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
    this.connecting = false;
    console.log('[PLC Connector] Connection shut down successfully.');
  }

  // Change PLC connection details on-the-fly from dashboard
  public reconfigure(config: PLCConfig): void {
    console.log(`[PLC Connector] Reconfiguring with IP: ${config.ip}, Port: ${config.port}, Enabled: ${config.enabled}`);
    this.disconnect();
    this.ip = config.ip;
    this.port = config.port;
    this.enabled = config.enabled;
    if (this.enabled) {
      this.connect();
    }
  }

  // Get current status summary
  public getStatus() {
    return {
      connected: this.connected,
      connecting: this.connecting,
      enabled: this.enabled,
      ip: this.ip,
      port: this.port
    };
  }
}
