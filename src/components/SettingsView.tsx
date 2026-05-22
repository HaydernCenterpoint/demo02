import React, { useState } from 'react';
import { Language, FlowStep } from '../types';
import { translations } from '../translations';
import {
  Settings,
  Shield,
  Cpu,
  Volume2,
  VolumeX,
  Database,
  Users,
  BellRing,
  RefreshCw,
  Sliders,
  CheckCircle,
  HelpCircle,
  Save,
  Radio,
  Sparkles,
  Server,
  Terminal,
  Activity,
  AlertTriangle,
  Flame,
  Binary
} from 'lucide-react';

interface SettingsViewProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  simulationActive: boolean;
  setSimulationActive: (active: boolean) => void;
  triggerToast: (msg: string) => void;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
}

const localSettingsTranslations = {
  vi: {
    title: 'Hệ thống Quản trị & Cấu hình SCADA',
    subtitle: 'Tinh chỉnh ngưỡng an toàn nhiệt độ cơ học PLC, thiết lập máy chủ kết nối truyền dữ liệu MQTT/Modbus, phân phối ca kỹ thuật và kích hoạt mô tơ mô phỏng.',
    
    // Tabs
    tabSystem: 'Hệ thống & PLC',
    tabLimits: 'Ngưỡng Thiết bị',
    tabNotifications: 'Thông báo & Sirens',
    tabOperators: 'Bàn giao Kỹ sư',

    // Section 1: System
    plcConnTitle: 'Cấu hình và Đồng bộ Modbus TCP',
    plcConnSub: 'Địa chỉ IP cổng nhận dữ liệu trực tiếp của tủ điều khiển trung tâm.',
    labelIp: 'Địa chỉ IP Máy chủ SCADA',
    labelPort: 'Cổng giao tiếp (Modbus TCP)',
    labelPoll: 'Tần suất quét ghi (Hertz)',
    btnTestConn: 'Kiểm tra đường truyền PLC',
    toastTesting: 'Đang gửi ping Modbus TCP packet...',
    toastSuccessConn: 'Kết nối Modbus TCP thành công! Thời gian phản hồi: 12ms',
    dbBackupTitle: 'Lưu trữ & Khôi phục bộ nhớ nhớ',
    dbBackupSub: 'Sao lưu cơ sở dữ liệu SCADA ra ổ đĩa cục bộ hoặc đặt lại dữ liệu mặc định của nhà máy.',
    btnReset: 'Đặt lại cấu hình gốc',
    toastReset: 'Đã đưa tất cả hệ thống và cảnh báo SCADA về mặc định!',

    // Section 2: Limits
    sliderTitle: 'Ngưỡng sai số thiết bị đầu cuối',
    sliderSub: 'Xác định giới hạn cảm biến kỹ thuật số để tự động phát hiện lỗi ngắt khẩn cấp hoặc gửi cảnh báo sớm.',
    tempWarn: 'Cảnh báo quá nhiệt',
    tempErr: 'Ngắt khẩn cấp quá nhiệt',
    vibWarn: 'Cảnh báo biên độ rung',
    vibErr: 'Ngắt khẩn do rung lắc mạnh',
    btnApplyLimits: 'Cập nhật dải an toàn',
    toastLimitsApplied: 'Đã lưu dải dung sai cảm biến vào thanh ghi EEPROM trạm điều hướng!',

    // Section 3: Alerts
    alertTitle: 'Kênh thông báo & Còi cảnh báo',
    alertSub: 'Quản lý cảnh báo tức thời, chế độ chuông bíp và liên kết đẩy tự động Telegram/SMS.',
    optSirens: 'Còi hú cơ học nhà xưởng',
    optTelegram: 'Báo động qua phòng máy chủ Telegram',
    optEmail: 'Gửi biên bản sự cố qua Email quản lý',
    optSound: 'Báo lỗi âm thanh trình duyệt',
    btnSaveAlerts: 'Lưu tùy chọn thông báo',
    toastAlertsSaved: 'Thiết lập lưu lượng cảnh báo mới đã được áp dụng!',

    // Section 4: Operators
    opTitle: 'Sơ đồ phân bổ kỹ sư điều hành ca',
    opSub: 'Chỉ định trực tiếp kỹ sư hoặc đại diện chịu trách nhiệm xử lý rủi ro và ký số cho từng công đoạn máy.',
    tableStation: 'Hạng mục máy',
    tableOpName: 'Kỹ sư trực ban',
    btnSaveOps: 'Lưu phân bổ nhân lực',
    toastOpsSaved: 'Đã cập nhật danh sách kỹ sư chịu trách nhiệm vào sơ đồ SCADA!',

    // General
    btnSaveAll: 'Lưu tất cả thay đổi',
    toastAllSaved: 'Cấu hình quản trị SCADA đã được cập nhật toàn diện!',
    simStatusLabel: 'Kích hoạt bộ sinh dữ liệu mô phỏng (Simulator)',
    simOn: 'Mô phỏng đang chạy',
    simOff: 'Mô phỏng tạm dừng',
    langLabel: 'Ngôn ngữ hiển thị (SCADA Language)',
    configBackup: 'Bản lưu nhị phân (.bin)'
  },
  en: {
    title: 'SCADA Administration & Global Settings',
    subtitle: 'Calibrate sensory thermomechanical thresholds, establish Modbus/MQTT gateway registry, assign workstation technicians, and toggle the simulation engines.',
    
    // Tabs
    tabSystem: 'System & PLC',
    tabLimits: 'Device Limits',
    tabNotifications: 'Alerts & Channels',
    tabOperators: 'Crew Assignment',

    // Section 1: System
    plcConnTitle: 'Modbus TCP Gateway Integration',
    plcConnSub: 'Specify the physical IP address and ethernet routing for the main PLC cabinet.',
    labelIp: 'Modbus Ethernet IP Address',
    labelPort: 'Connection Port (Modbus TCP)',
    labelPoll: 'System Polling Frequency',
    btnTestConn: 'Test PLC Connection',
    toastTesting: 'Despatching Modbus TCP ping blocks...',
    toastSuccessConn: 'Modbus connection established! Ping response: 12ms',
    dbBackupTitle: 'Registry Storage & Restorations',
    dbBackupSub: 'Export current running states or factory-reset operational telemetry registry.',
    btnReset: 'Factory Reset All',
    toastReset: 'Factory parameters successfully flashed to default states!',

    // Section 2: Limits
    sliderTitle: 'Physical Sensor Limit Settings',
    sliderSub: 'Determine calibration bounds for dynamic automated warning generation and emergency system overrides.',
    tempWarn: 'Thermal Upper Warning',
    tempErr: 'Thermal Emergency Cut-Out',
    vibWarn: 'Vibration Safety Boundary',
    vibErr: 'Vibration Shock Cut-Out',
    btnApplyLimits: 'Update Boundaries',
    toastLimitsApplied: 'Tolerance arrays stored in PLC registers!',

    // Section 3: Alerts
    alertTitle: 'Dispatch Channels & Audio Alarms',
    alertSub: 'Configure mechanical factory sirens, local browser buzzers, and administrative Telegram warnings.',
    optSirens: 'Activate Workshop Horn Lights',
    optTelegram: 'Trigger Telegram Server Dispatch',
    optEmail: 'Transmit Failure Memos to Email',
    optSound: 'Enable Browser Sound Effects',
    btnSaveAlerts: 'Save Notification Defaults',
    toastAlertsSaved: 'Dispatched notification channels configured!',

    // Section 4: Operators
    opTitle: 'Workstation Technician Allocations',
    opSub: 'Directly assign dedicated process engineers or safety operators responsible for troubleshooting individual steps.',
    tableStation: 'Workstation',
    tableOpName: 'Assigned Specialist',
    btnSaveOps: 'Commit Crew Board',
    toastOpsSaved: 'Assigned crew log successfully committed!',

    // General
    btnSaveAll: 'Save Configurations',
    toastAllSaved: 'All high-level system parameters updated successfully!',
    simStatusLabel: 'Active Operational Sensor Simulator',
    simOn: 'Simulator Active',
    simOff: 'Simulator Suspended',
    langLabel: 'Display Language (SCADA Language)',
    configBackup: 'Binary Config Archive (.bin)'
  },
  zh: {
    title: 'SCADA 高峰管理与系统全局设置',
    subtitle: '校准PLC热力学动作阈值，配置Modbus/MQTT现场以太网寄存器，指派班组设备责任人，以及开启或关闭工业流模拟。',
    
    // Tabs
    tabSystem: '系统与PLC网关',
    tabLimits: '报警阈值参数',
    tabNotifications: '通道路志报警',
    tabOperators: '现场组员排班',

    // Section 1: System
    plcConnTitle: 'Modbus TCP 集中控制器通讯设置',
    plcConnSub: '设定中央工艺控制电箱PLC对应的物理IP地址和通讯接口代码。',
    labelIp: 'PLC 控制器 IPv4 地址',
    labelPort: 'Modbus 对应通讯端口',
    labelPoll: '控制链轮询频率 (Hz)',
    btnTestConn: '对PLC执行通讯握手',
    toastTesting: '正在发出 Modbus TCP 物理测试帧...',
    toastSuccessConn: '与PLC握手成功！全双工延迟: 12ms',
    dbBackupTitle: '配方数据备份与恢复归档',
    dbBackupSub: '导出全局系统配方、运行状态，或擦除寄存器恢复纯净出厂状态。',
    btnReset: '一键归零系统状态',
    toastReset: '系统全局技术规程设定已初始化归底！',

    // Section 2: Limits
    sliderTitle: '热振传感器安全限额',
    sliderSub: '调整PLC核心工控寄存器中存储的安全警报与紧急关断边界。',
    tempWarn: '温度上限警告阈值',
    tempErr: '温度越上限跳闸切断',
    vibWarn: '位移振动异常报警',
    vibErr: '振动峰值过载断电',
    btnApplyLimits: '写入EEPROM变参',
    toastLimitsApplied: '新制定的容差配方已刻录进下位机PLC存储器！',

    // Section 3: Alerts
    alertTitle: '故障推报渠道与扬声器蜂鸣',
    alertSub: '激活工业现场爆闪灯、中控室电喇叭警报，及 Telegram/微信 企业级异常通知推送。',
    optSirens: '启动现场物理蜂鸣器与爆闪灯',
    optTelegram: '启动 Telegram 生产故障警报通道',
    optEmail: '启动事故报告自动发送至总监邮箱',
    optSound: '允许浏览器交互声效播报',
    btnSaveAlerts: '保存推报权限',
    toastAlertsSaved: '报警通道触发规则配置完毕！',

    // Section 4: Operators
    opTitle: '核心工位班组技术军官指派',
    opSub: '直接调整和调动对特定工艺设备工步负有现场监盘及事故消除责任的资深工程师。',
    tableStation: '设备段工步',
    tableOpName: '现指派责任工程师',
    btnSaveOps: '保存班组分配',
    toastOpsSaved: '班组现场责任岗配置已刷新并存入数据库！',

    // General
    btnSaveAll: '立即部署所有设置',
    toastAllSaved: '所有设定均已顺利注入车间主控网络！',
    simStatusLabel: '仿真模拟器开关 (Simulator)',
    simOn: '仿真循环中',
    simOff: '仿真挂起',
    langLabel: '系统工作语言 (SCADA Language)',
    configBackup: '二进制固件存档 (.bin)'
  }
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentLanguage,
  setLanguage,
  simulationActive,
  setSimulationActive,
  triggerToast,
  steps,
  setSteps
}) => {
  const t = localSettingsTranslations[currentLanguage];
  const commonT = translations[currentLanguage];

  // Config tab state
  const [activeTab, setActiveTab] = useState<'system' | 'limits' | 'notifications' | 'operators'>('system');

  // Tab 1: System Config state
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.150');
  const [port, setPort] = useState<number>(502);
  const [pollRate, setPollRate] = useState<number>(5);
  const [testingConn, setTestingConn] = useState<boolean>(false);

  // Tab 2: Limits state
  const [tempWarningVal, setTempWarningVal] = useState<number>(58);
  const [tempErrorVal, setTempErrorVal] = useState<number>(75);
  const [vibWarningVal, setVibWarningVal] = useState<number>(2.2);
  const [vibErrorVal, setVibErrorVal] = useState<number>(3.5);

  // Tab 3: Notification Toggles
  const [sirensEnabled, setSirensEnabled] = useState<boolean>(true);
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(false);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [ambientSound, setAmbientSound] = useState<boolean>(true);

  // Tab 4: Local operators per step tracker
  const [localOperators, setLocalOperators] = useState<Record<string, string>>(
    steps.reduce((acc, step) => {
      acc[step.id] = step.operator || 'Kỹ sư SCADA';
      return acc;
    }, {} as Record<string, string>)
  );

  // Test PLC IP connection simulation
  const handleTestPLC = () => {
    setTestingConn(true);
    triggerToast(t.toastTesting);
    setTimeout(() => {
      setTestingConn(false);
      triggerToast(t.toastSuccessConn);
    }, 1500);
  };

  // Factory Reset
  const handleFactoryReset = () => {
    // Reset sensory limits locally
    setTempWarningVal(58);
    setTempErrorVal(75);
    setVibWarningVal(2.2);
    setVibErrorVal(3.5);

    // Keep state values default
    setIpAddress('192.168.1.150');
    setPort(502);
    setPollRate(5);
    setSirensEnabled(true);
    setTelegramEnabled(false);
    setEmailEnabled(true);
    setAmbientSound(true);

    // Revise step configurations
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        temp: 34.5,
        vibration: 0.8,
        status: 'running',
        oee: 92
      }))
    );

    triggerToast(t.toastReset);
  };

  // Apply limit updates
  const handleApplyLimits = () => {
    // Limits usually affect warning levels or simulation behaviors
    triggerToast(t.toastLimitsApplied);
  };

  // Apply operators
  const handleApplyOperators = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        operator: localOperators[step.id] || step.operator
      }))
    );
    triggerToast(t.toastOpsSaved);
  };

  // Save all options
  const handleSaveAll = () => {
    // Save operators to model steps
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        operator: localOperators[step.id] || step.operator
      }))
    );
    triggerToast(t.toastAllSaved);
  };

  // Change individual operator name in state
  const handleOperatorChange = (stepId: string, value: string) => {
    setLocalOperators((prev) => ({
      ...prev,
      [stepId]: value
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="settings-view-root">
      
      {/* 1. COMPACT HERO TITLE BANNER */}
      <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5" id="settings-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5.5 h-5.5 text-blue-500" />
              <span>{t.title}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-4xl leading-normal">
              {t.subtitle}
            </p>
          </div>

          {/* Master deploy saved parameters */}
          <button
            onClick={handleSaveAll}
            className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-2 shadow hover:shadow-blue-500/10 active:scale-98"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.btnSaveAll}</span>
          </button>
        </div>

        {/* INTEGRATED TOGGLE BAR: LANGUAGE & SIMULATOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/40" id="settings-primary-toggles">
          
          {/* Option A: Language selector */}
          <div className="bg-slate-950/30 p-3 border border-slate-900 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                {t.langLabel}
              </span>
              <p className="text-[9.5px] text-slate-500">
                SCADA translations encoding scheme
              </p>
            </div>
            
            {/* Lang keys options flags */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-900">
              {(['vi', 'en', 'zh'] as Language[]).map((ln) => (
                <button
                  key={ln}
                  onClick={() => {
                    setLanguage(ln);
                    triggerToast(`Chuyển hệ hiển thị: ${ln === 'vi' ? 'Tiếng Việt' : ln === 'en' ? 'English' : 'Chinese'}`);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                    currentLanguage === ln
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {ln.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Option B: Active simulation status */}
          <div className="bg-slate-950/30 p-3 border border-slate-900 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider block">
                {t.simStatusLabel}
              </span>
              <p className="text-[9.5px] text-slate-500">
                PLC background registers values generation cycles
              </p>
            </div>

            {/* Slider Switch */}
            <button
              onClick={() => {
                setSimulationActive(!simulationActive);
                triggerToast(simulationActive ? 'Đã tạm dừng mô phỏng PLC!' : 'Đã khởi chạy chuỗi mô phỏng PLC!');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[10px] cursor-pointer transition-colors border ${
                simulationActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${simulationActive ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></span>
              <span>{simulationActive ? t.simOn.toUpperCase() : t.simOff.toUpperCase()}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. TABBED SETTNG PANEL STRUCTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="settings-tabbed-container">
        
        {/* Navigation Left Sidebar Tabs */}
        <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-xl p-3 h-fit flex flex-col gap-1">
          
          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer text-left transition-colors ${
              activeTab === 'system'
                ? 'bg-slate-900 border border-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900/10 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>{t.tabSystem}</span>
          </button>

          <button
            onClick={() => setActiveTab('limits')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer text-left transition-colors ${
              activeTab === 'limits'
                ? 'bg-slate-900 border border-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900/10 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>{t.tabLimits}</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer text-left transition-colors ${
              activeTab === 'notifications'
                ? 'bg-slate-900 border border-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900/10 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4 text-amber-500" />
            <span>{t.tabNotifications}</span>
          </button>

          <button
            onClick={() => setActiveTab('operators')}
            className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold cursor-pointer text-left transition-colors ${
              activeTab === 'operators'
                ? 'bg-slate-900 border border-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900/10 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-purple-500" />
            <span>{t.tabOperators}</span>
          </button>

          {/* Backup meta description indicator */}
          <div className="p-3.5 mt-4 rounded-lg bg-slate-950/40 border border-slate-900 text-[10px] text-slate-500 leading-normal font-mono uppercase space-y-1">
            <div className="flex justify-between">
              <span>CONFIG:</span>
              <span className="text-slate-400">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>FIRMWARE:</span>
              <span className="text-slate-400">V4.9.2</span>
            </div>
          </div>

        </div>

        {/* Content Right Tab Workspace */}
        <div className="lg:col-span-3 bg-[#111827]/40 border border-slate-800/80 rounded-xl p-6 shadow-lg min-h-[380px]">
          
          {/* TAB 1: SYSTEM AND PLC */}
          {activeTab === 'system' && (
            <div className="space-y-6" id="settings-tab-system">
              <div className="border-b border-slate-800/50 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Server className="w-4.5 h-4.5 text-blue-500" />
                  <span>{t.plcConnTitle}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.plcConnSub}</p>
              </div>

              {/* Server Details Grid form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.labelIp}</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full bg-slate-950 px-3 py-2 text-xs border border-slate-800 hover:border-slate-700/60 font-mono text-slate-200 outline-none focus:border-blue-500 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.labelPort}</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 502)}
                    className="w-full bg-slate-950 px-3 py-2 text-xs border border-slate-800 hover:border-slate-700/60 font-mono text-slate-200 outline-none focus:border-blue-500 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.labelPoll}</label>
                  <select
                    value={pollRate}
                    onChange={(e) => setPollRate(parseInt(e.target.value) || 5)}
                    className="w-full bg-slate-950 px-3 py-[9px] text-xs border border-slate-800 hover:border-slate-700/60 font-mono text-slate-200 outline-none focus:border-blue-500 rounded-lg cursor-pointer"
                  >
                    <option value={1}>1 Hz (Truyền chậm)</option>
                    <option value={5}>5 Hz (Standard)</option>
                    <option value={10}>10 Hz (Tần suất lớn)</option>
                    <option value={20}>20 Hz (Thời gian thực)</option>
                  </select>
                </div>
              </div>

              {/* Run Test connection */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestPLC}
                  disabled={testingConn}
                  className="p-2 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-xs font-semibold hover:text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2 select-none"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${testingConn ? 'animate-spin' : ''}`} />
                  <span>{t.btnTestConn}</span>
                </button>
              </div>

              {/* Advanced backups */}
              <div className="border-t border-slate-800/40 pt-6 space-y-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>{t.dbBackupTitle}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">{t.dbBackupSub}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      triggerToast('Đã sao lưu tệp cấu hình scada_active_config.bin thành công!');
                    }}
                    className="p-2 px-3.5 bg-slate-900/60 text-[11px] border border-slate-800 text-slate-300 rounded hover:text-white cursor-pointer hover:bg-slate-850"
                  >
                    📥 {t.configBackup}
                  </button>

                  <button
                    onClick={handleFactoryReset}
                    className="p-2 px-3.5 bg-red-600/10 hover:bg-red-650/15 text-red-400 text-[11px] border border-red-500/20 rounded cursor-pointer"
                  >
                    🚨 {t.btnReset}
                  </button>
                </div>
              </div>

              {/* Terminal mock buffer logs */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900/60 font-mono text-[9.5px] text-slate-500 space-y-1 block leading-normal">
                <span className="text-blue-500">[MODBUS_MASTER]:</span> INITIALIZING SOCK_STREAM IN CLIENT MODE... <br />
                <span className="text-emerald-500">[MODBUS_MASTER]:</span> BIND OK TO GATEWAY {ipAddress}:{port} POLLING Hz={pollRate} <br />
                <span className="text-purple-500">[PLC_REGISTERS]:</span> SCAN COMPLETED. 0 PARAMS DESYNCED IN STACKS.
              </div>

            </div>
          )}

          {/* TAB 2: DEVICE CALIBRATION LIMITS */}
          {activeTab === 'limits' && (
            <div className="space-y-6" id="settings-tab-limits">
              <div className="border-b border-slate-800/50 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-emerald-400" />
                  <span>{t.sliderTitle}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.sliderSub}</p>
              </div>

              {/* Sliders Grid */}
              <div className="space-y-5 pt-2">
                
                {/* 1. Temp warning */}
                <div className="space-y-2 bg-slate-950/20 p-4 border border-slate-900 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.tempWarn}</span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{tempWarningVal} °C</span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="65"
                    value={tempWarningVal}
                    onChange={(e) => setTempWarningVal(parseInt(e.target.value) || 58)}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[9px] text-slate-500 block">Kích hoạt chuyển màu trạm sang dải CẢNH BÁO vàng khi vượt ngưỡng.</span>
                </div>

                {/* 2. Temp Critical */}
                <div className="space-y-2 bg-slate-950/20 p-4 border border-slate-900 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      <span>{t.tempErr}</span>
                    </span>
                    <span className="font-mono text-red-500 font-bold">{tempErrorVal} °C</span>
                  </div>
                  <input
                    type="range"
                    min="66"
                    max="95"
                    value={tempErrorVal}
                    onChange={(e) => setTempErrorVal(parseInt(e.target.value) || 75)}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <span className="text-[9px] text-slate-500 block">Báo động đỏ khẩn, ghi nhận nhật ký lỗi hệ thống PLC và kích hoạt còi sirens cơ học nhà xưởng.</span>
                </div>

                {/* 3. Vibration warning */}
                <div className="space-y-2 bg-slate-950/20 p-4 border border-slate-900 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.vibWarn}</span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{vibWarningVal.toFixed(1)} mm/s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="29"
                    step="1"
                    value={Math.round(vibWarningVal * 10)}
                    onChange={(e) => setVibWarningVal(parseInt(e.target.value) / 10 || 2.2)}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 4. Vibration critical */}
                <div className="space-y-2 bg-slate-950/20 p-4 border border-slate-900 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <span>{t.vibErr}</span>
                    </span>
                    <span className="font-mono text-red-500 font-bold">{vibErrorVal.toFixed(1)} mm/s</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="60"
                    step="1"
                    value={Math.round(vibErrorVal * 10)}
                    onChange={(e) => setVibErrorVal(parseInt(e.target.value) / 10 || 3.5)}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

              </div>

              {/* Action buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyLimits}
                  className="p-2.5 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all active:scale-98"
                >
                  {t.btnApplyLimits}
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: ALERTS & SIRENS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6" id="settings-tab-alerts">
              <div className="border-b border-slate-800/50 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <BellRing className="w-4.5 h-4.5 text-amber-500" />
                  <span>{t.alertTitle}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.alertSub}</p>
              </div>

              {/* Toggles lists */}
              <div className="space-y-4 pt-2">
                
                {/* Siren mechanical Toggle */}
                <label className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900/60 p-4 rounded-lg flex items-center justify-between cursor-pointer select-none transition-colors">
                  <div className="space-y-1 pr-6">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-amber-500" />
                      <span>{t.optSirens}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Kích hoạt rơ le còi công nghiệp và đèn flash quay lắp ở đỉnh xưởng khi gặp sự vụ ERROR trạm máy.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sirensEnabled}
                    onChange={(e) => setSirensEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer w-4 h-4 bg-slate-950 border-slate-800"
                  />
                </label>

                {/* Telegram notifications dispatch Toggle */}
                <label className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900/60 p-4 rounded-lg flex items-center justify-between cursor-pointer select-none transition-colors">
                  <div className="space-y-1 pr-6">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-blue-400" />
                      <span>{t.optTelegram}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Prapare Bot API tokens gửi trực tiếp log và bản chụp thiết bị tới phòng trực kỹ sư khi có gãy vỡ cơ học.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={telegramEnabled}
                    onChange={(e) => setTelegramEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer w-4 h-4 bg-slate-950 border-slate-800"
                  />
                </label>

                {/* Email dispatch Toggle */}
                <label className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900/60 p-4 rounded-lg flex items-center justify-between cursor-pointer select-none transition-colors">
                  <div className="space-y-1 pr-6">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-purple-400" />
                      <span>{t.optEmail}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Gửi thư điện tử báo cáo OEE và phiếu sự cố tự động hằng ngày về địa chỉ của văn phòng quản đốc sản xuất.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer w-4 h-4 bg-slate-950 border-slate-800"
                  />
                </label>

                {/* Browser Beep Audio toggle */}
                <label className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900/60 p-4 rounded-lg flex items-center justify-between cursor-pointer select-none transition-colors">
                  <div className="space-y-1 pr-6">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {ambientSound ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-red-500" />}
                      <span>{t.optSound}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Sử dụng chuông cảnh báo tương tác qua loa tai nghe máy trạm vận hành viên ngay khi có tin nhắn lỗi mới xuất hiện.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ambientSound}
                    onChange={(e) => setAmbientSound(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer w-4 h-4 bg-slate-950 border-slate-800"
                  />
                </label>

              </div>

              {/* Confirm alerts options config */}
              <div className="pt-2">
                <button
                  onClick={() => triggerToast(t.toastAlertsSaved)}
                  className="p-2.5 px-5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all active:scale-98"
                >
                  {t.btnSaveAlerts}
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: OPERATORS crew alignment list table */}
          {activeTab === 'operators' && (
            <div className="space-y-6" id="settings-tab-operators">
              <div className="border-b border-slate-800/50 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4.5 h-4.5 text-purple-500" />
                  <span>{t.opTitle}</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.opSub}</p>
              </div>

              {/* Station allocations tables scrollable list */}
              <div className="max-h-[300px] overflow-y-auto border border-slate-900/80 rounded-lg customize-scrollbar" id="settings-ops-allocation-table">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-[10px] font-mono text-slate-500 border-b border-slate-900">
                      <th className="p-2.5 pl-3">{t.tableStation}</th>
                      <th className="p-2.5 pr-3">{t.tableOpName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step) => (
                      <tr key={step.id} className="border-b border-slate-900 hover:bg-slate-900/10 transition-colors">
                        <td className="p-2.5 pl-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono">{step.id}:</span>
                            <span className="text-slate-200 font-bold max-w-[150px] truncate">
                              {commonT[step.labelKey] as string}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 pr-3">
                          <input
                            type="text"
                            value={localOperators[step.id] || ''}
                            onChange={(e) => handleOperatorChange(step.id, e.target.value)}
                            className="bg-slate-950 hover:bg-slate-950/80 px-2.5 py-1 border border-slate-900 focus:border-purple-500 text-xs rounded text-slate-300 w-full font-sans max-w-[200px]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save crew configurations */}
              <div className="pt-2">
                <button
                  onClick={handleApplyOperators}
                  className="p-2.5 px-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all active:scale-98"
                >
                  {t.btnSaveOps}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
