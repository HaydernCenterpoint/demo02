import React, { useState, useMemo } from 'react';
import { Language, TranslationSchema, AlertItem, FlowStep, StatusType } from '../types';
import { translations } from '../translations';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Trash2,
  CheckCheck,
  FileText,
  Sparkles,
  Cpu,
  Clock,
  PlayCircle,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

interface AlertsViewProps {
  currentLanguage: Language;
  alerts: AlertItem[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  triggerToast: (msg: string) => void;
  onSimulateAlert: () => void;
  defectCounter: number;
  setDefectCounter: React.Dispatch<React.SetStateAction<number>>;
  isMuted: boolean;
  onToggleMute: () => void;
}

// Localized helper strings to maintain pristine translations inside this dedicated module
const localTranslations = {
  vi: {
    title: 'Trung tâm Quản lý Cảnh báo & Sự cố',
    subtitle: 'Theo dõi trực tiếp tín hiệu PLC lập trình, xử lý sự cố lỗi trạm máy, hiệu chuẩn và khôi phục nhịp độ sản xuất.',
    activeAlarms: 'Cảnh báo Đang kích hoạt',
    resolvedAlarms: 'Lịch sử đã khắc phục',
    totalAlarms: 'Tổng số cảnh báo',
    criticalCount: 'Sức khỏe Nghiêm trọng',
    warningCount: 'Mức Cảnh báo',
    infoCount: 'Mức Thông tin',
    searchPlaceholder: 'Tìm cảnh báo theo mã code, trạm máy hoặc diễn giải...',
    severityFilter: 'Độ nghiêm trọng',
    statusFilter: 'Trạng thái',
    all: 'Tất cả',
    error: 'Lỗi nặng (Error)',
    warning: 'Cảnh báo (Warning)',
    info: 'Thông tin (Info)',
    unresolved: 'Đang mở',
    resolved: 'Đã đóng',
    resolveBtn: 'Khắc phục',
    resolveAllBtn: 'Khắc phục toàn bộ',
    simulateBtn: 'Giả lập sự cố ngẫu nhiên',
    simulateToast: 'Hệ thống vừa bơm một tín hiệu cảnh báo giả lập!',
    inspectStep: 'Đến trạm cơ khí',
    noAlerts: 'Tuyệt vời! Không có cảnh báo nào đang hoạt động.',
    plcHeader: 'Thanh ghi lỗi truyền thông PLC Modbus TCP',
    plcSub: 'Giá trị nhị phân thời gian thực đọc từ vi điều khiển trung tâm.',
    plcReg: 'Thanh ghi',
    plcVal: 'Mã hex',
    plcDesc: 'Trạng thái giải mã',
    exportBtn: 'Xuất Báo Cáo Nhật Ký',
    exportSuccess: 'Đã sao chép báo cáo chi tiết sự cố gửi về hệ thống ERP thành công!',
    alarmCode: 'Mã số',
    assignedStation: 'Trạm liên đới',
    resolvedTime: 'Đã khắc phục lúc',
    alertCleared: 'Mô-đun cảnh báo đã được reset thành công!',
    toastResolveAll: 'Dọn dẹp thành công! Toàn bộ cảnh báo sự cố đã được đóng xác nhận.',
    diagTitle: 'Chẩn đoán thông minh AI:',
    diagText: 'Khi phát hiện mã lỗi hex trong Holding Register (như 0x05F2), hệ thống liên lạc thông qua giao thức Modbus TCP sẽ lập tức kích hoạt lỗi đỏ trạm số 6. Việc giải quyết cảnh báo phía bên trái sẽ xóa ghi đè tín hiệu và đồng bộ hóa lại tốc độ dây chuyền!'
  },
  en: {
    title: 'Alarm Desk & Incident Command Center',
    subtitle: 'Real-time telemetry streams from central PLCs, machine errors handling, sensor clearing, and factory loops realignment.',
    activeAlarms: 'Active Alarms',
    resolvedAlarms: 'Resolution History',
    totalAlarms: 'Total Logs',
    criticalCount: 'Critical Errors',
    warningCount: 'Medium Warnings',
    infoCount: 'Info Warnings',
    searchPlaceholder: 'Filter alarms by error codes, stations description...',
    severityFilter: 'Severity Level',
    statusFilter: 'Resolution Status',
    all: 'All',
    error: 'Error (Critical)',
    warning: 'Warning (Medium)',
    info: 'Info (Low)',
    unresolved: 'Active',
    resolved: 'Resolved',
    resolveBtn: 'Acknowledge',
    resolveAllBtn: 'Acknowledge All',
    simulateBtn: 'Simulate Random Failure',
    simulateToast: 'Simulated diagnostic warning successfully injected into the line!',
    inspectStep: 'Inspect Station',
    noAlerts: 'Perfect! All systems are running within ideal parameters.',
    plcHeader: 'PLC Modbus TCP Fault Holding Registers',
    plcSub: 'Real-time binary buffers scanned directly from microcontroller master node.',
    plcReg: 'Register',
    plcVal: 'Hex Value',
    plcDesc: 'Decoded Telemetry Label',
    exportBtn: 'Export Incident Reports',
    exportSuccess: 'Detailed incident log reported and copied to corporate ERP integration buffer!',
    alarmCode: 'Alarm ID',
    assignedStation: 'Affected Unit',
    resolvedTime: 'Resolved at',
    alertCleared: 'Alarm cleared successfully, status normalized!',
    toastResolveAll: 'All Active alerts acknowledged. Manufacturing states restored.',
    diagTitle: 'AI Diagnostic Note:',
    diagText: 'Holding registers scan telemetry bits dynamically. Clearing pending alerts on the left automatically updates Modbus flags, restoring normal clock speeds across physical PLC slaves.'
  },
  zh: {
    title: '警报与故障诊断指挥中心',
    subtitle: '集中式PLC故障代码监控，处理生产线停机事件，执行传感器校准并正常恢复生产速度。',
    activeAlarms: '当前活动警报',
    resolvedAlarms: '历史已解决警报',
    totalAlarms: '警报日志总数',
    criticalCount: '关键严重错误',
    warningCount: '中度黄色警告',
    infoCount: '一般信息提示',
    searchPlaceholder: '搜索警报代码，受影响的工作站描述...',
    severityFilter: '严重程度',
    statusFilter: '处理状态',
    all: '全部',
    error: '红色严重级别',
    warning: '黄色一般警告',
    info: '蓝色信息反馈',
    unresolved: '活动中',
    resolved: '已解除',
    resolveBtn: '确认解决',
    resolveAllBtn: '批量处理全部',
    simulateBtn: '模拟故障注入',
    simulateToast: '一条故障注入指令已发往自动化检测端!',
    inspectStep: '观察工作站',
    noAlerts: '运行完美！全部自动化设备参数工作正常。',
    plcHeader: 'PLC核心寄存器 Modbus TCP 故障缓冲区',
    plcSub: '从核心工业控制卡中直接高速轮询读取的机器控制寄存器值。',
    plcReg: '寄存器地址',
    plcVal: '十六进制码',
    plcDesc: '解码系统状态',
    exportBtn: '导出事件报告',
    exportSuccess: '事件详细报告已准备完毕，复制并发布到企业管理ERP系统！',
    alarmCode: '报警代码',
    assignedStation: '事件引发单元',
    resolvedTime: '已于此时间解除',
    alertCleared: '警报已解除，设备指标恢复正常!',
    toastResolveAll: '清除成功！全部活动警报已被确认关闭，生产状态已恢复正常。',
    diagTitle: 'AI 智能诊断:',
    diagText: '当保持寄存器检测到十六进制错误代码（如0x05F2）时，系统会立即通过Modbus TCP协议在6号站触发红色故障。解除左侧的警报可清除信号覆盖并重新同步流水线速度！'
  }
};

export const AlertsView: React.FC<AlertsViewProps> = ({
  currentLanguage,
  alerts,
  setAlerts,
  steps,
  setSteps,
  triggerToast,
  onSimulateAlert,
  defectCounter,
  setDefectCounter,
  isMuted,
  onToggleMute,
}) => {
  const t: TranslationSchema = translations[currentLanguage];
  const localT = localTranslations[currentLanguage];

  // Filters & State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  // Interactive local list state for mock Modbus registry
  const plcRegisters = [
    { reg: 'Reg 40012', val: '0x05F2', descVi: 'Quá tải Ampe động cơ trục Z s6', descEn: 'High load Ampere on Z-axis spindle s6', descZh: 's6轴Z轴拧紧伺服电机电流超载', status: 'error' },
    { reg: 'Reg 40015', val: '0x00E4', descVi: 'Hồng ngoại nhiệt đới chạm mốc lý thuyết s9', descEn: 'Infrared temperature reaching thermal bound s9', descZh: 's9红外传感器测定值超越标定指标', status: 'warning' },
    { reg: 'Reg 40020', val: '0x000F', descVi: 'Lệch biên vị trí bám phễu nạp mạch s1', descEn: 'Optical feeder offset beyond threshold s1', descZh: 's1真空吸盘位置偏移达到差值上限', status: 'warning' },
    { reg: 'Reg 40045', val: '0x0000', descVi: 'Van áp suất s5: Trạng thái đóng kín', descEn: 'Pneumatic clamp s5: Hermetically closed', descZh: 's5气动夹具：完全抱死正常锁紧', status: 'info' },
    { reg: 'Reg 40061', val: '0x00A1', descVi: 'Đầu đọc mã vạch Cognex AI s3: Đã kích hoạt', descEn: 'Cognex QR reader s3: Decoded frame OK', descZh: 's3 Cognex 智能相机成功摄取有效画面', status: 'info' },
  ];

  // Calculations for severity categories based of current alerts array
  const counts = useMemo(() => {
    let errs = 0;
    let warns = 0;
    let infos = 0;

    alerts.forEach((a) => {
      if (!a.isResolved) {
        if (a.status === 'error') errs++;
        if (a.status === 'warning') warns++;
        if (a.status === 'info') infos++;
      }
    });

    return {
      error: errs,
      warning: warns,
      info: infos,
      total: alerts.length,
      active: alerts.filter(a => !a.isResolved).length,
    };
  }, [alerts]);

  // Handle resolving a single alert inside this panel
  const handleResolveSingle = (id: string, titleStr: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isResolved: true } : a))
    );
    setDefectCounter((prev) => Math.max(0, prev - 1));
    
    // Automatically normalized s6 temperature if that was the main trigger!
    // Since s6 triggers mock 88.5 deg error when simulating, solving alerts must recover it.
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === 's6' && step.status === 'error') {
          return {
            ...step,
            status: 'running',
            temp: 36.5,
            vibration: 1.1,
            oee: 92.5,
          };
        }
        return step;
      })
    );

    triggerToast(`${localT.alertCleared} [${titleStr}]`);
  };

  // Resolve all currently active alerts
  const handleResolveAll = () => {
    const activeOnes = alerts.filter(a => !a.isResolved);
    if (activeOnes.length === 0) return;

    setAlerts((prev) =>
      prev.map((a) => ({ ...a, isResolved: true }))
    );
    setDefectCounter(0);

    // Normalize all steps back to running beautifully
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.status === 'error' || step.status === 'warning') {
          return {
            ...step,
            status: 'running',
            temp: step.branch === 'casing' ? 33 : 36.5,
            vibration: step.branch === 'casing' ? 1.0 : 1.2,
            oee: 90.0
          };
        }
        return step;
      })
    );

    triggerToast(localT.toastResolveAll);
  };

  // Export incident diagnostics to clipboard or simulation
  const handleExportIncidentReport = () => {
    const details = alerts
      .map((a) => {
        const title = t[a.titleKey] ? (t[a.titleKey] as string) : a.titleKey;
        const sub = t[a.subKey] ? (t[a.subKey] as string) : a.subKey;
        return `[${a.time}] [${a.status.toUpperCase()}] ${title} - ${sub} (${a.isResolved ? 'Acked' : 'Active'})`;
      })
      .join('\n');

    const header = `=== FACTORY TELEMETRY REPORT: ${new Date().toISOString()} ===\n`;
    navigator.clipboard.writeText(header + details).then(() => {
      triggerToast(localT.exportSuccess);
    }).catch(() => {
      // Falback if no navigator
      triggerToast(localT.exportSuccess);
    });
  };

  // Map elements nicely
  const filteredAlerts = alerts.filter((a) => {
    const titleVal = t[a.titleKey] ? (t[a.titleKey] as string) : a.titleKey;
    const subVal = t[a.subKey] ? (t[a.subKey] as string) : a.subKey;
    const fullText = `${titleVal} ${subVal} ${a.id} ${a.time}`.toLowerCase();

    const matchesSearch = fullText.includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || a.status === severityFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'unresolved') matchesStatus = !a.isResolved;
    if (statusFilter === 'resolved') matchesStatus = !!a.isResolved;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="alerts-view-dashboard">
      
      {/* 1. SECTION INTRO HEADER */}
      <div className="bg-[#111827]/30 border border-slate-800/60 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5.5 h-5.5 text-red-500 animate-swing" />
            <span>{localT.title}</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            {localT.subtitle}
          </p>
        </div>

        {/* Rapid Actions row buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Simulation Trigger */}
          <button
            onClick={() => {
              onSimulateAlert();
              triggerToast(localT.simulateToast);
            }}
            id="control-btn-simulate-alert"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 border border-blue-500/20 shadow-md shadow-blue-600/10"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{localT.simulateBtn}</span>
          </button>

          {/* Export button */}
          <button
            onClick={handleExportIncidentReport}
            id="control-btn-export-report"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{localT.exportBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="alerts-metric-grid">
        {/* Total stats */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{localT.totalAlarms}</span>
            <h3 className="text-xl font-mono font-bold text-slate-200 mt-1">{counts.total}</h3>
            <p className="text-[10px] text-slate-500">{localT.activeAlarms}: {counts.active}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800/50 text-slate-400 flex items-center justify-center border border-slate-700/60">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Reds Count - Error */}
        <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-400 font-semibold uppercase">{localT.criticalCount}</span>
            <h3 className="text-xl font-mono font-bold text-red-500 mt-1">{counts.error}</h3>
            <p className="text-[10px] text-red-400/80">PLC Fault bit triggers</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
            <AlertOctagon className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Yellows Count - Warning */}
        <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-semibold uppercase">{localT.warningCount}</span>
            <h3 className="text-xl font-mono font-bold text-amber-500 mt-1">{counts.warning}</h3>
            <p className="text-[10px] text-amber-400/80">Hardware deviations</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Blues Count - Info */}
        <div className="bg-blue-950/10 border border-blue-900/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-blue-400 font-semibold uppercase">{localT.infoCount}</span>
            <h3 className="text-xl font-mono font-bold text-blue-400 mt-1">{counts.info}</h3>
            <p className="text-[10px] text-blue-300/80">Diagnostic notifications</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Info className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* 3. ALARM CONTROLS AND INTERACTIVE REGISTRY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="alerts-split-blocks">
        
        {/* LEFT COLUMN: ACTIVE INCIDENTS MANAGEMENT (2 span) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg">
            
            {/* Inner filters row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/40">
              
              {/* Search bar */}
              <div className="relative w-full sm:w-72">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder={localT.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-900 focus:border-blue-500/80 outline-none"
                />
              </div>

              {/* Status filtering */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto">
                {/* Severity select dropdown */}
                <select
                  value={severityFilter}
                  onChange={(e: any) => setSeverityFilter(e.target.value)}
                  className="bg-slate-950 text-slate-300 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">⚡ {localT.severityFilter}: {localT.all}</option>
                  <option value="error">🛑 {localT.error}</option>
                  <option value="warning">⚠️ {localT.warning}</option>
                  <option value="info">ℹ️ {localT.info}</option>
                </select>

                {/* Status select dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 text-slate-300 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">🔍 {localT.statusFilter}: {localT.all}</option>
                  <option value="unresolved">🔴 {localT.unresolved}</option>
                  <option value="resolved">🟢 {localT.resolved}</option>
                </select>

                {/* Quick resolve all button */}
                {counts.active > 0 && (
                  <button
                    onClick={handleResolveAll}
                    id="btn-mass-resolve-alerts"
                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{localT.resolveAllBtn}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Alarm logs listings */}
            <div className="mt-4 space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto pr-1 customize-scrollbar flex flex-col">
              {filteredAlerts.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-500/20 animate-pulse" />
                  <span>{localT.noAlerts}</span>
                </div>
              ) : (
                filteredAlerts.map((item) => {
                  const title = t[item.titleKey] ? (t[item.titleKey] as string) : item.titleKey;
                  const sub = t[item.subKey] ? (t[item.subKey] as string) : item.subKey;
                  const isResolved = item.isResolved;

                  // Render sev symbols
                  const sevColor = item.status === 'error'
                    ? 'border-red-500/25 bg-red-500/5 text-red-400'
                    : item.status === 'warning'
                    ? 'border-amber-500/25 bg-amber-500/5 text-amber-400'
                    : 'border-blue-500/25 bg-blue-500/5 text-blue-400';

                  const sevIcon = item.status === 'error'
                    ? <AlertOctagon className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                    : item.status === 'warning'
                    ? <AlertTriangle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
                    : <Info className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />;

                  const estimatedStationNum = item.titleKey.includes('Temp') || item.titleKey.includes('Servo')
                    ? (currentLanguage === 'vi'
                      ? 'Trạm 6 (Lắp ráp cơ khí)'
                      : currentLanguage === 'zh'
                      ? '6号工位 (机械装配线)'
                      : 'Station 6 (Mechanical Assembly)')
                    : (currentLanguage === 'vi'
                      ? 'Trạm 1 (Phễu hút chân không)'
                      : currentLanguage === 'zh'
                      ? '1号工位 (真空供料头)'
                      : 'Station 1 (Vacuum Feeder)');

                  return (
                    <div
                      key={item.id}
                      id={`alerts-panel-item-${item.id}`}
                      className={`border rounded-xl p-4 transition-all duration-150 relative ${
                        isResolved
                          ? 'border-slate-900 bg-slate-950/10 opacity-55'
                          : `${sevColor} shadow-md`
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="pt-0.5">
                            {sevIcon}
                          </div>
                          
                          <div className="min-w-0">
                            {/* Alert title and sub-texts */}
                            <h4 className={`text-xs font-bold text-slate-100 ${isResolved ? 'line-through text-slate-400' : ''}`}>
                              {title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              {sub}
                            </p>

                            {/* Additional metadata label tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[9.5px] text-slate-500">
                              <span>{localT.alarmCode}: <strong className="text-slate-400">{item.id.replace('sim-a-', 'INC_')}</strong></span>
                              <span className="text-slate-700">•</span>
                              <span>{localT.assignedStation}: <strong className="text-slate-400">{estimatedStationNum}</strong></span>
                              <span className="text-slate-700">•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {item.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Acknowledge and resolve action handles */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isResolved ? (
                            <span className="text-[10.5px] text-emerald-400 font-bold bg-emerald-950/15 border border-emerald-900/35 py-1 px-2 rounded-md flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{localT.resolved}</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleResolveSingle(item.id, title)}
                                id={`btn-resolve-alert-view-${item.id}`}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 cursor-pointer transition-colors"
                              >
                                {localT.resolveBtn}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: PLC MODBUS HEALTH REGISTERS MONITOR (1 span) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                <h3 className="text-slate-200 text-sm font-bold uppercase tracking-wider">
                  {localT.plcHeader}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                {localT.plcSub}
              </p>

              {/* Registry Rows */}
              <div className="space-y-2.5">
                {plcRegisters.map((reg) => {
                  let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  if (reg.status === 'error') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/25';
                  if (reg.status === 'warning') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/25';

                  const decodedDesc = currentLanguage === 'vi' ? reg.descVi : currentLanguage === 'zh' ? reg.descZh : reg.descEn;

                  return (
                    <div
                      key={reg.reg}
                      className="p-3 rounded-lg bg-slate-950/50 border border-slate-900 flex flex-col gap-1.5 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">{reg.reg}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badgeColor} font-bold`}>
                          {reg.val}
                        </span>
                      </div>
                      
                      <div className="text-[10.5px] text-slate-400 font-semibold tracking-tight leading-normal">
                        {decodedDesc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart assistance indicator box */}
            <div className="mt-5 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-[10.5px] text-slate-400 font-sans leading-normal flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300">
                  {localT.diagTitle}
                </span>{' '}
                {localT.diagText}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
