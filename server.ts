import express from 'express';
import { initialSteps, initialAlerts } from './src/data';
import { FlowStep, AlertItem, StatusType } from './src/types';
import { MitsubishiPLC } from './plcConnector';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json({ limit: '10mb' }));

// Custom CORS middleware to avoid cross-origin blocks
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Master in-memory DB for simulated industrial state
let steps: FlowStep[] = JSON.parse(JSON.stringify(initialSteps));
let alerts: AlertItem[] = JSON.parse(JSON.stringify(initialAlerts));
let yieldCounter = 12540;
let defectCounter = 12;
let extraOeeShift = 0;
let simulationActive = true;

// Active Server-Sent Events client channels
let sseClients: any[] = [];

// Helper function to broadcast simulation changes to all connected tabs
function broadcast(data: any) {
  const payload = JSON.stringify(data);
  sseClients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
}

// --- MITSUBISHI PLC INTEGRATION SERVICE ---
const plc = new MitsubishiPLC({
  ip: '192.168.1.250',
  port: 5007,
  enabled: false // Off by default. Activated from Settings View
});

// Start PLC scanner engine
plc.connect();

// 1. SSE Registration Endpoint
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send a welcome payload
  res.write(`data: ${JSON.stringify({ type: 'welcome', simulationActive, plcStatus: plc.getStatus() })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// 2. Fetch baseline state on load
app.get('/api/state', (req, res) => {
  res.json({
    steps,
    alerts,
    yieldCounter,
    defectCounter,
    extraOeeShift,
    simulationActive,
    plcStatus: plc.getStatus()
  });
});

// 3. Sync full steps array from frontend mutations
app.post('/api/sync-steps', (req, res) => {
  const { steps: newSteps } = req.body as { steps: FlowStep[] };
  if (newSteps && Array.isArray(newSteps)) {
    steps = newSteps;
    broadcast({ type: 'update', steps, yieldCounter, defectCounter, extraOeeShift, simulationActive, alerts, plcStatus: plc.getStatus() });
  }
  res.json({ success: true });
});

// 4. Sync full alerts array from frontend mutations
app.post('/api/sync-alerts', (req, res) => {
  const { alerts: newAlerts } = req.body as { alerts: AlertItem[] };
  if (newAlerts && Array.isArray(newAlerts)) {
    alerts = newAlerts;
    broadcast({ type: 'update', steps, yieldCounter, defectCounter, extraOeeShift, simulationActive, alerts, plcStatus: plc.getStatus() });
  }
  res.json({ success: true });
});

// 5. Update PLC step status
app.post('/api/step-status', (req, res) => {
  const { stepId, newStatus } = req.body as { stepId: string, newStatus: StatusType };
  
  steps = steps.map(s => {
    if (s.id === stepId) {
      let adjustedTemp = s.temp;
      let adjustedVib = s.vibration;
      let adjustedOee = s.oee;

      if (newStatus === 'stopped') {
        adjustedTemp = 18.0;
        adjustedVib = 0.0;
        adjustedOee = 0.0;
      } else if (newStatus === 'running') {
        adjustedTemp = 36.5;
        adjustedVib = 1.2;
        adjustedOee = 91.0;
      } else if (newStatus === 'maintenance') {
        adjustedTemp = 24.2;
        adjustedVib = 0.2;
        adjustedOee = 0.0;
      }

      return {
        ...s,
        status: newStatus,
        temp: adjustedTemp,
        vibration: adjustedVib,
        oee: adjustedOee,
      };
    }
    return s;
  });

  // If PLC is connected, we can actively write coil status (e.g. M100 corresponds to s1, M101 to s2, etc.)
  if (plc.connected) {
    const stepIdx = steps.findIndex(s => s.id === stepId);
    if (stepIdx !== -1 && stepIdx < 12) {
      const coilAddr = 100 + stepIdx; // M100, M101, etc.
      const isRun = newStatus === 'running';
      plc.writeMCoils(coilAddr, [isRun]).catch(err => {
        console.error(`[PLC Write] Error writing coil M${coilAddr}:`, err.message);
      });
    }
  }

  broadcast({ type: 'update', steps, yieldCounter, defectCounter, extraOeeShift, simulationActive, alerts, plcStatus: plc.getStatus() });
  res.json({ success: true });
});

// 6. Resolve single alert
app.post('/api/resolve-alert', (req, res) => {
  const { alertId } = req.body as { alertId: string };
  alerts = alerts.map(a => a.id === alertId ? { ...a, isResolved: true } : a);
  defectCounter = Math.max(0, defectCounter - 1);

  // Sync to PLC if online (D202 holds defectCounter)
  if (plc.connected) {
    plc.writeDRegisters(202, [defectCounter]).catch(err => console.error('[PLC Write] Defect sync error:', err.message));
  }

  broadcast({ type: 'update', steps, yieldCounter, defectCounter, extraOeeShift, simulationActive, alerts, plcStatus: plc.getStatus() });
  res.json({ success: true });
});

// 7. Resolve all alerts
app.post('/api/resolve-all-alerts', (req, res) => {
  alerts = alerts.map(a => ({ ...a, isResolved: true }));
  defectCounter = 0;

  // Sync to PLC if online
  if (plc.connected) {
    plc.writeDRegisters(202, [0]).catch(err => console.error('[PLC Write] Defect clear sync error:', err.message));
  }

  broadcast({ type: 'update', steps, yieldCounter, defectCounter, extraOeeShift, simulationActive, alerts, plcStatus: plc.getStatus() });
  res.json({ success: true });
});

// 8. Simulate a new alarm trigger (Inject simulated alarm)
app.post('/api/simulate-alert', (req, res) => {
  const hours = new Date().getHours().toString().padStart(2, '0');
  const minutes = new Date().getMinutes().toString().padStart(2, '0');
  const timeText = `${hours}:${minutes}`;

  const simOptions = [
    { title: 'alertTempError', sub: 'alertTempErrorSub', status: 'warning' },
    { title: 'alertServoError', sub: 'alertServoErrorSub', status: 'error' },
    { title: 'alertMaterialShortage', sub: 'alertMaterialShortageSub', status: 'warning' },
  ];

  const pick = simOptions[Math.floor(Math.random() * simOptions.length)];
  
  const newAlert: AlertItem = {
    id: `sim-a-${Date.now()}`,
    titleKey: pick.title as any,
    subKey: pick.sub as any,
    status: pick.status as any,
    time: timeText,
    isResolved: false,
  };

  alerts = [newAlert, ...alerts];
  defectCounter += 1;

  // Turn step index 5 or 6 to hot temperatures so it aligns visually with the flow
  steps = steps.map(s => {
    if (s.id === 's6') {
      return { ...s, status: 'error', temp: 88.5, vibration: 7.2 };
    }
    return s;
  });

  // Sync to PLC if online
  if (plc.connected) {
    plc.writeDRegisters(202, [defectCounter]).catch(err => console.error('[PLC Write] Defect sync error:', err.message));
  }

  broadcast({ type: 'update', steps, yieldCounter, defectCounter, extraOeeShift, simulationActive, alerts, plcStatus: plc.getStatus() });
  res.json({ success: true, newAlert });
});

// 9. Toggle core active simulator loop
app.post('/api/toggle-simulation', (req, res) => {
  const { active } = req.body as { active: boolean };
  simulationActive = active;
  
  broadcast({ type: 'update', steps, yieldCounter, defectCounter, extraOeeShift, simulationActive, alerts, plcStatus: plc.getStatus() });
  res.json({ success: true, simulationActive });
});

// 10. Fetch current PLC connection status
app.get('/api/plc-status', (req, res) => {
  res.json(plc.getStatus());
});

// 11. Configure PLC connection settings on-the-fly
app.post('/api/plc-config', (req, res) => {
  const { ip, port, enabled } = req.body as { ip: string, port: number, enabled: boolean };
  plc.reconfigure({ ip, port, enabled });
  res.json({ success: true, plcStatus: plc.getStatus() });
});

// 12. Test socket connection to PLC IP/Port (Test connection handshake)
app.post('/api/plc-test-ping', (req, res) => {
  const { ip, port } = req.body as { ip: string, port: number };
  const socket = new net.Socket();
  socket.setTimeout(2000);

  socket.connect(port, ip, () => {
    socket.destroy();
    res.json({ success: true, message: `Kết nối thành công! Cổng ${port} trên ${ip} đang mở.` });
  });

  socket.on('error', (err) => {
    socket.destroy();
    res.json({ success: false, message: `Lỗi kết nối: ${err.message}` });
  });

  socket.on('timeout', () => {
    socket.destroy();
    res.json({ success: false, message: 'Hết thời gian chờ phản hồi (Timeout)!' });
  });
});


// --- SCAN LOOP SYSTEM WITH PLC SCANNING & GRACEFUL FALLBACK ---
setInterval(async () => {
  let ssePayload: any = { type: 'update', plcStatus: plc.getStatus() };

  if (plc.connected) {
    try {
      // 1. Read Batch Registers:
      // - D100 to D123: Telemetry measurements of 12 steps (2 elements per step: Temp [scaled by 10], Vibration [scaled by 10])
      // - D200 (2 words): Yield Counter (32-bit DINT)
      // - D202: Defect Counter
      // - D203: Global OEE Shift (scaled by 10)
      const telemetryVals = await plc.readDRegisters(100, 24);
      const countersVals = await plc.readDRegisters(200, 4);

      // 2. Read Coils (M100 to M111: State bit for each of the 12 steps)
      const stateBits = await plc.readMCoils(100, 12);

      // 3. Map values to our steps state
      steps = steps.map((step, idx) => {
        if (idx < 12) {
          const tempRaw = telemetryVals[idx * 2];
          const vibRaw = telemetryVals[idx * 2 + 1];
          const isRun = stateBits[idx];

          // Gracefully protect OEE from zeroing out if running
          let nextOee = step.oee;
          let nextStatus: StatusType = isRun ? 'running' : 'stopped';

          // Temp-based error overrides (safety system)
          const actualTemp = tempRaw / 10;
          if (actualTemp > 75) {
            nextStatus = 'error';
          } else if (actualTemp > 58) {
            nextStatus = 'warning';
          }

          return {
            ...step,
            temp: actualTemp,
            vibration: vibRaw / 10,
            status: nextStatus,
            oee: isRun ? Math.max(80, nextOee) : 0.0
          };
        }
        return step;
      });

      // 4. Map counters
      // D200 & D201 form a 32-bit DINT for yield
      const lowWord = countersVals[0] & 0xFFFF;
      const highWord = countersVals[1] & 0xFFFF;
      yieldCounter = (highWord << 16) | lowWord;
      
      defectCounter = countersVals[2];
      extraOeeShift = countersVals[3] / 10;

      ssePayload = {
        ...ssePayload,
        steps,
        yieldCounter,
        defectCounter,
        extraOeeShift,
        simulationActive: false, // Force disabled when PLC is driving state
        alerts
      };

      broadcast(ssePayload);
      return; // Skip simulation block!
    } catch (err: any) {
      console.warn(`[PLC Scanner] Error during PLC scan: ${err.message}. Cascading into Graceful Fallback Simulator...`);
    }
  }

  // --- GRACEFUL FALLBACK SIMULATOR BLOCK ---
  // Triggers when PLC is disabled or disconnected, guaranteeing 100% dashboard uptime.
  if (simulationActive) {
    yieldCounter += Math.floor(Math.random() * 2) + 1;

    steps = steps.map(step => {
      if (step.status === 'stopped') return step;

      const tempDelta = (Math.random() - 0.5) * 1.5;
      const vibDelta = (Math.random() - 0.5) * 0.3;
      let nextTemp = step.temp + tempDelta;
      let nextVib = step.vibration + vibDelta;

      if (nextTemp < 20) nextTemp = 20;
      if (nextVib < 0.1) nextVib = 0.1;

      let nextStatus = step.status;
      if (nextTemp > 75) {
        nextStatus = 'error';
      } else if (nextTemp > 58) {
        nextStatus = 'warning';
      }

      return {
        ...step,
        temp: nextTemp,
        vibration: nextVib,
        status: nextStatus as StatusType,
      };
    });

    extraOeeShift += (Math.random() - 0.5) * 0.4;

    ssePayload = {
      ...ssePayload,
      steps,
      yieldCounter,
      defectCounter,
      extraOeeShift,
      simulationActive,
      alerts
    };

    broadcast(ssePayload);
  }
}, 3500);

app.listen(PORT, () => {
  console.log(`[IoT Simulator Server] Running on http://localhost:${PORT}`);
});
