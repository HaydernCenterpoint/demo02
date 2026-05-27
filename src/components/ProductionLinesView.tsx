import React, { useState } from 'react';
import { Language, FlowStep, StatusType, TranslationSchema } from '../types';
import { translations } from '../translations';
import {
  Play,
  Square,
  AlertOctagon,
  TrendingUp,
  Cpu,
  Thermometer,
  Settings2,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  Wrench,
  Gauge,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface ProductionLinesViewProps {
  currentLanguage: Language;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  triggerToast: (msg: string) => void;
  simulationActive: boolean;
  setSimulationActive: (active: boolean) => void;
}
const localProductionTranslations = {
  vi: {
    title: 'Điều Khiển & Cấu Hình Dây Chuyền',
    subtitle: 'Giám sát điều tốc, cấu hình ngưỡng bảo vệ cảm biến cho từng trạm làm việc.',
    speedLabel: 'Tốc độ dây chuyền: ',
    btnStart: 'MỞ DÂY CHUYỀN',
    btnStandby: 'CHẾ ĐỘ CHỜ',
    btnStop: 'DỪNG KHẨN CẤP',
    tabAll: 'Toàn bộ xưởng',
    tabMain: 'Dây chuyền Chính',
    tabCasing: 'Nhánh Casing vỏ',
    mainLineArea: 'Vùng dây chuyền chính',
    tuneLimits: 'Sửa Giới Hạn Bảo Vệ',
    maxTemp: 'Cảnh báo Nhiệt độ max:',
    maxVib: 'Cảnh báo Rung lắc max:',
    saveSecure: 'Lưu & Khóa Cấu Hình',
    smartRepair: 'CLICK KHẮC PHỤC',
    doneMaintenance: 'XONG BẢO TRÌ',
    routineMaintenance: 'BẢO TRÌ ĐỊNH KỲ',
    btnTurnOn: 'BẬT MÁY',
    btnTurnOff: 'OŇOFF DỪNG',
    troubleTitle: 'Yêu cầu Phản Hồi Vận Hành',
    troubleSub: 'Phát hiện rơ-le nhiệt ngắt dòng hoặc kẹt khay nạp mâm rung:',
    troubleItem1: 'Bơm dầu xi-lanh trục nâng khí nén',
    troubleItem2: 'Khởi động lại mạch driver nguồn DC 24V',
    troubleItem3: 'Sàng lọc phôi kim loại lỗi kẹt',
    troubleAuto: 'Bắn lệnh Khắc Phục Auto',
    troubleIgnore: 'Bỏ qua',
    overBoth: 'Vượt nhiệt độ & độ rung!',
    overTemp: 'Quá nhiệt an toàn!',
    overVib: 'Rung lắc cưỡng bức!',
    relayActive: 'Kích hoạt rơ-le ngắt kênh cơ khí.',
    toastBypass: 'CẢNH BÁO: Cảm biến đã được BYPASS (Bỏ qua bảo vệ)!',
    toastSpeedWarning: 'CẢNH BÁO: Tăng tốc độ quá cao có thể gây kẹt và phát nhiệt motor!',
    toastEmergencyStop: 'DỪNG KHẨN CẤP: Đã tạm dừng toàn bộ motor và đóng van hơi áp suất!',
    toastStartLine: 'Đã khởi động lại toàn bộ dây chuyền hoạt động trở lại!',
    toastStandbyLine: 'Dây chuyền đang chuyển sang chế độ CHỜ (Idle/Standby)',
    toastToggledActive: 'Đã chuyển đổi trạng thái thiết bị sang',
    toastToggledMaint: 'Đã chuyển chế độ bảo trì kỹ thuật!',
    toastSaveLimits: 'Đã cập nhật ngưỡng an toàn cho',
    toastAutoTroubleshoot: 'Sửa chữa thông minh thành công! Thiết bị đã được kết nối chạy lại.',
    vibLabel: 'Rung lắc',
    oeeLabel: 'OEE Trạm',
    paramConfig: 'Cấu hình thông số',
    bypassActive: 'BYPASS_BẬT',
    bypassOff: 'BYPASS_TĂT',
    activeLabel: 'Hoạt động:',
    faultsLabel: 'Lỗi:',
  },
  en: {
    title: 'Production Lines Command & Sync',
    subtitle: 'Central variable frequency tuning, temperature & vibration thresholding.',
    speedLabel: 'Line Speed Regulator: ',
    btnStart: 'START WORKS',
    btnStandby: 'STANDBY IDLE',
    btnStop: 'EMERGENCY STOP',
    tabAll: 'All Workshop Channels',
    tabMain: 'Main SMT Splicing Line',
    tabCasing: 'Casing Assembly Section',
    mainLineArea: 'Main Line Area',
    tuneLimits: 'Tune Safety Limits',
    maxTemp: 'Max Allowed Temp:',
    maxVib: 'Max Allowed Vibration:',
    saveSecure: 'Save & Secure',
    smartRepair: 'SMART REPAIR',
    doneMaintenance: 'DONE MAINTENANCE',
    routineMaintenance: 'ROUTINE MAINTENANCE',
    btnTurnOn: 'TURN ON',
    btnTurnOff: 'TURN OFF',
    troubleTitle: 'Operational Response Query',
    troubleSub: 'Detected thermal relay trip or vibration hopper blockage:',
    troubleItem1: 'Lubricate pneumatic cylinder spindle',
    troubleItem2: 'Reboot DC 24V servo driver circuit',
    troubleItem3: 'Clear jammed custom metal workpieces',
    troubleAuto: 'Inject Auto Troubleshoot',
    troubleIgnore: 'Ignore',
    overBoth: 'Temperature & vibration exceeded!',
    overTemp: 'Critical over-temperature!',
    overVib: 'Critical spindle vibration!',
    relayActive: 'Mechanical disconnect relay engaged.',
    toastBypass: 'CRITICAL: Safety sensors successfully bypassed for testing!',
    toastSpeedWarning: 'WARNING: Overclocking line speed increases mechanical wear and thermal alarms!',
    toastEmergencyStop: 'EMERGENCY STOP: All actuators and solenoid valves halted!',
    toastStartLine: 'All equipment successfully resumed to system cycle running!',
    toastStandbyLine: 'Line synchronized to low-idle standby mode',
    toastToggledActive: 'Toggled machine status to',
    toastToggledMaint: 'Toggled maintenance mode status!',
    toastSaveLimits: 'Safety parameters saved for',
    toastAutoTroubleshoot: 'Smart diagnostic & auto-repair workflow execution success!',
    vibLabel: 'Vibration',
    oeeLabel: 'Station OEE',
    paramConfig: 'Parameter Configuration',
    bypassActive: 'BYPASS_ACTIVE',
    bypassOff: 'BYPASS_OFF',
    activeLabel: 'Active:',
    faultsLabel: 'Faults:',
  },
  zh: {
    title: '工段流程控制与中控面板',
    subtitle: '集中式变频调速，配置工位独立热成像与加速度振动过载阈值。',
    speedLabel: '主线调频转速 Speed: ',
    btnStart: '全线循环启动',
    btnStandby: '闲置整备',
    btnStop: '紧急避险停机',
    tabAll: '总览所有工段',
    tabMain: '主SMT封装链',
    tabCasing: '外壳并行加工链',
    mainLineArea: '主线工区',
    tuneLimits: '编辑传感器报警界限',
    maxTemp: '温度报警上限:',
    maxVib: '振动报警上限:',
    saveSecure: '确认保存参数',
    smartRepair: '自动缺陷排查',
    doneMaintenance: '恢复运行',
    routineMaintenance: '一键离线保修',
    btnTurnOn: '开启设备',
    btnTurnOff: '切离断电',
    troubleTitle: '运行反馈诊断决策',
    troubleSub: '检测到过载继电器脱扣或振动盘送料受阻:',
    troubleItem1: '气动顶升轴气缸加注密封油',
    troubleItem2: '重启直流 DC 24V 伺服驱动主板',
    troubleItem3: '清理卡阻的异形金属工件/飞边',
    troubleAuto: '下发智能一键自愈',
    troubleIgnore: '忽略',
    overBoth: '温度与偏振双重超载！',
    overTemp: '温控传感器越限！',
    overVib: '轴承剧烈偏振！',
    relayActive: '正在执行机械脱扣保护切断。',
    toastBypass: '警告：传感器已成功旁路隔离保护！',
    toastSpeedWarning: '警告：过度调高频率可能导致主轴卡阻和过载升温！',
    toastEmergencyStop: '紧急停止：全部驱动轴及气阀已切断保护！',
    toastStartLine: '流水线全段已进入自动循环启动状态！',
    toastStandbyLine: '流水线正调度至低耗闲置挂起模式',
    toastToggledActive: '已切换设备运行状态至',
    toastToggledMaint: '已更改设备维保模式状态！',
    toastSaveLimits: '已成功保存安全参数阈值于',
    toastAutoTroubleshoot: '智能故障诊断与自动修复工作流执行成功！设备已恢复运行。',
    vibLabel: '振动偏离度',
    oeeLabel: '工位 OEE',
    paramConfig: '传感器限额参数配置',
    bypassActive: '旁路启用(警告)',
    bypassOff: '旁路关闭',
    activeLabel: '运行中:',
    faultsLabel: '故障:',
  }
};

export const ProductionLinesView: React.FC<ProductionLinesViewProps> = ({
  currentLanguage,
  steps,
  setSteps,
  triggerToast,
  simulationActive,
  setSimulationActive,
}) => {
  const t: TranslationSchema = translations[currentLanguage];
  const localT = localProductionTranslations[currentLanguage];

  // Active Line Branch Filter
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'main' | 'casing'>('all');

  // Interactive Line Speed Factor Simulation State
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(100);

  // Accordion Expand/Collapse for thresholds editing
  const [expandedStepConfigId, setExpandedStepConfigId] = useState<string | null>(null);

  // Steps local Safety Limits thresholds store
  const [thresholds, setThresholds] = useState<Record<string, { maxTemp: number; maxVib: number; isBypassed: boolean }>>(
    steps.reduce((acc, step) => {
      acc[step.id] = {
        maxTemp: step.branch === 'casing' ? 55 : 65,
        maxVib: step.branch === 'casing' ? 3.5 : 4.5,
        isBypassed: false,
      };
      return acc;
    }, {} as Record<string, { maxTemp: number; maxVib: number; isBypassed: boolean }>)
  );

  // Active troubleshooting card ID
  const [activeTroubleshootingId, setActiveTroubleshootingId] = useState<string | null>(null);

  // Filter steps based on current tab selection
  const filteredSteps = steps.filter((step) => {
    if (selectedBranch === 'all') return true;
    if (selectedBranch === 'main') return step.branch !== 'casing';
    return step.branch === 'casing';
  });

  // Bulk operation: Stop All / Emergency Stop
  const handleEmergencyStop = () => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'stopped',
        temp: 18.0,
        vibration: 0.0,
        oee: 0,
      }))
    );
    setSimulationActive(false);
    triggerToast(localT.toastEmergencyStop);
  };

  // Bulk operation: Start Entire Line
  const handleStartEntireLine = () => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'running',
        temp: s.branch === 'casing' ? 32.5 : 38.0,
        vibration: s.branch === 'casing' ? 1.0 : 1.5,
        oee: s.branch === 'casing' ? 88.0 : 92.0,
      }))
    );
    setSimulationActive(true);
    triggerToast(localT.toastStartLine);
  };

  // Bulk operation: Pause/Standby line
  const handleStandbyLine = () => {
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'warning',
        vibration: 0.2, // idle vibration
        oee: 45.0,
      }))
    );
    triggerToast(localT.toastStandbyLine);
  };

  // Turn single step off/on
  const toggleStepActivation = (stepId: string, currentStatus: StatusType) => {
    const targetStatus: StatusType = currentStatus === 'stopped' ? 'running' : 'stopped';
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          return {
            ...s,
            status: targetStatus,
            temp: targetStatus === 'stopped' ? 18.0 : 36.5,
            vibration: targetStatus === 'stopped' ? 0.0 : 1.2,
            oee: targetStatus === 'stopped' ? 0.0 : 90.0,
          };
        }
        return s;
      })
    );
    triggerToast(
      `${localT.toastToggledActive} ${
        targetStatus === 'running'
          ? currentLanguage === 'vi'
            ? 'ĐANG CHẠY'
            : currentLanguage === 'zh'
            ? '运行中'
            : 'RUNNING'
          : currentLanguage === 'vi'
          ? 'DỪNG ONOFF'
          : currentLanguage === 'zh'
          ? '已停止'
          : 'STOPPED'
      }`
    );
  };

  // Single step maintenance mode toggle
  const toggleStepMaintenance = (stepId: string, currentStatus: StatusType) => {
    const targetStatus: StatusType = currentStatus === 'maintenance' ? 'running' : 'maintenance';
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          return {
            ...s,
            status: targetStatus,
            temp: targetStatus === 'maintenance' ? 22.0 : 36.5,
            vibration: targetStatus === 'maintenance' ? 0.1 : 1.2,
            oee: targetStatus === 'maintenance' ? 0.0 : 91.0,
          };
        }
        return s;
      })
    );
    triggerToast(
      currentLanguage === 'vi'
        ? `Đã ${targetStatus === 'maintenance' ? 'đưa vào' : 'hủy bỏ'} chế độ bảo trì kỹ thuật!`
        : currentLanguage === 'zh'
        ? `${targetStatus === 'maintenance' ? '已将设备切入' : '已从设备撤销'}技术维保模式！`
        : `${targetStatus === 'maintenance' ? 'Entered' : 'Exited'} maintenance mode status!`
    );
  };

  // Adjust threshold values
  const handleUpdateLimit = (stepId: string, field: 'maxTemp' | 'maxVib', val: number) => {
    setThresholds((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: val,
      },
    }));
  };

  // Toggle Bypass sensor
  const toggleBypassSensor = (stepId: string) => {
    setThresholds((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        isBypassed: !prev[stepId].isBypassed,
      },
    }));
    triggerToast(localT.toastBypass);
  };

  // Apply configs action
  const handleSaveThresholds = (stepId: string, stepLabel: string) => {
    triggerToast(`${localT.toastSaveLimits} [${stepLabel}]!`);
    setExpandedStepConfigId(null);

    // If current sensor values already exceed newly configured low thresholds, update state to WARNING automatically to demonstrate interactivity!
    const targetStep = steps.find((s) => s.id === stepId);
    if (targetStep && !thresholds[stepId].isBypassed) {
      if (targetStep.temp > thresholds[stepId].maxTemp) {
        setSteps((prev) =>
          prev.map((s) => (s.id === stepId ? { ...s, status: 'error' } : s))
        );
      } else if (targetStep.vibration > thresholds[stepId].maxVib) {
        setSteps((prev) =>
          prev.map((s) => (s.id === stepId ? { ...s, status: 'warning' } : s))
        );
      }
    }
  };

  // Trigger quick repair simulation details
  const handleAutoTroubleshoot = (stepId: string) => {
    // Return step to active status running smoothly
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          return {
            ...s,
            status: 'running',
            temp: s.branch === 'casing' ? 32 : 36.5,
            vibration: s.branch === 'casing' ? 0.9 : 1.1,
            oee: 92.5,
          };
        }
        return s;
      })
    );
    setActiveTroubleshootingId(null);
    triggerToast(localT.toastAutoTroubleshoot);
  };

  // Calculations for stats
  const totalActiveStations = steps.filter((s) => s.status === 'running').length;
  const totalAlertingStations = steps.filter((s) => s.status === 'error' || s.status === 'warning').length;
  const averageOee = Math.round(steps.reduce((acc, curr) => acc + curr.oee, 0) / steps.length);
  const throughputPerHour = Math.round(360 * (speedMultiplier / 100));

  return (
    <div className="space-y-6" id="production-lines-view-panel">
      {/* 1. MAIN CONTROL HUD HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d1421] to-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden" id="lines-control-hud">
        {/* Decorative ambient background grid or orb */}
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Section Titles */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-blue-500 animate-spin-slow" />
              {localT.title}
            </h2>
            <p className="text-xs text-slate-400">
              {localT.subtitle}
            </p>

            {/* Micro Stats inside Header */}
            <div className="flex flex-wrap gap-4 pt-3 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-800/40 py-1 px-2.5 rounded-md border border-slate-700/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active: {totalActiveStations}/{steps.length}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/40 py-1 px-2.5 rounded-md border border-slate-700/30">
                <span className={`w-2 h-2 rounded-full ${totalAlertingStations > 0 ? 'bg-amber-500 animate-ping' : 'bg-slate-500'}`}></span>
                <span>Faults: {totalAlertingStations}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/40 py-1 px-2.5 rounded-md border border-slate-700/30">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span>OEE: {averageOee}%</span>
              </div>
            </div>
          </div>

          {/* Core Speed Regulator / Slider */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                {localT.speedLabel}
                <strong className="text-blue-400 font-mono font-bold">{speedMultiplier}%</strong>
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                {throughputPerHour} {t.units}/h
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={speedMultiplier}
              onChange={(e) => {
                const numericVal = parseInt(e.target.value);
                setSpeedMultiplier(numericVal);
                if (numericVal > 150) {
                  triggerToast(localT.toastSpeedWarning);
                }
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>{currentLanguage === 'vi' ? '10% (Tiết kiệm điện)' : currentLanguage === 'zh' ? '10% (低能耗模式)' : '10% (Low Energy)'}</span>
              <span>{currentLanguage === 'vi' ? '100% (Tiêu chuẩn)' : currentLanguage === 'zh' ? '100% (标准转速)' : '100% (Standard)'}</span>
              <span>{currentLanguage === 'vi' ? '200% (Tối đa/Overclock)' : currentLanguage === 'zh' ? '200% (最大超频)' : '200% (Maximum Overclock)'}</span>
            </div>
          </div>

          {/* Master Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-end">
            <button
              onClick={handleStartEntireLine}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all border border-emerald-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{localT.btnStart}</span>
            </button>

            <button
              onClick={handleStandbyLine}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-slate-100 text-slate-300 font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-700/60 active:scale-95"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{localT.btnStandby}</span>
            </button>

            <button
              onClick={handleEmergencyStop}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50 animate-pulse border border-red-500 cursor-pointer transition-all active:scale-95"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{localT.btnStop}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TABBED FILTER WORKSPACE SELECTOR */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3" id="branch-tab-bar">
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-900">
          <button
            onClick={() => setSelectedBranch('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedBranch === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {currentLanguage === 'vi' ? 'Toàn bộ xưởng' : currentLanguage === 'zh' ? '总览所有工段' : 'All Workshop Channels'}
          </button>
          <button
            onClick={() => setSelectedBranch('main')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedBranch === 'main'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {currentLanguage === 'vi' ? 'Dây chuyền Chính' : currentLanguage === 'zh' ? '主SMT封装链' : 'Main SMT Splicing Line'}
          </button>
          <button
            onClick={() => setSelectedBranch('casing')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedBranch === 'casing'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {currentLanguage === 'vi' ? 'Nhánh Casing vỏ' : currentLanguage === 'zh' ? '外壳并行加工链' : 'Casing Assembly Section'}
          </button>
        </div>

        {/* Informative Label */}
        <div className="text-[11px] text-slate-500 font-medium">
          {currentLanguage === 'vi'
            ? `Hiển thị ${filteredSteps.length} trạm của phân xưởng`
            : `Showing ${filteredSteps.length} machine units`}
        </div>
      </div>

      {/* 3. CORE SUBSTATIONS CONFIGURATION CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="stations-grid-list">
        {filteredSteps.map((step) => {
          const isConfigExpanded = expandedStepConfigId === step.id;
          const stepLabel = t[step.labelKey] ? (t[step.labelKey] as string) : step.id;
          const stepConfig = thresholds[step.id] || { maxTemp: 60, maxVib: 4.5, isBypassed: false };

          // Determine dynamic violation alerts based on live values vs current customized thresholds
          const isTempWarning = !stepConfig.isBypassed && step.temp > stepConfig.maxTemp;
          const isVibWarning = !stepConfig.isBypassed && step.vibration > stepConfig.maxVib;
          const hasOverThresholdAlert = isTempWarning || isVibWarning;

          return (
            <div
              key={step.id}
              id={`station-config-card-${step.id}`}
              className={`bg-[#111827]/60 border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 relative ${
                hasOverThresholdAlert
                  ? 'border-red-500/60 shadow-lg shadow-red-950/20 bg-red-950/5'
                  : step.status === 'stopped'
                  ? 'border-slate-800/60 opacity-75'
                  : step.status === 'maintenance'
                  ? 'border-purple-500/40 shadow-sm shadow-purple-950/10'
                  : step.status === 'warning'
                  ? 'border-amber-500/40 shadow-sm shadow-amber-950/10'
                  : 'border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Dynamic Warning Indicator Ribbon */}
              {hasOverThresholdAlert && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-t-xl animate-pulse"></div>
              )}

              {/* Station Label & Top Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold border transition-colors ${
                        step.status === 'error' || hasOverThresholdAlert
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : step.status === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : step.status === 'maintenance'
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          : step.status === 'stopped'
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}
                    >
                      {step.num}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-slate-100 text-sm font-semibold truncate tracking-tight">{stepLabel}</h4>
                      <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                        {step.branch === 'casing' ? t.casingBranch : 'Main Line Area'}
                      </span>
                    </div>
                  </div>

                  {/* Pulsing Core Working Dot Badge */}
                  <div className="flex flex-col items-end">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-bold font-mono tracking-wide ${
                        step.status === 'running'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : step.status === 'stopped'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : step.status === 'maintenance'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                          : step.status === 'warning'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          step.status === 'running'
                            ? 'bg-emerald-400 animate-pulse'
                            : step.status === 'stopped'
                            ? 'bg-slate-400'
                            : step.status === 'maintenance'
                            ? 'bg-purple-400 animate-pulse'
                            : step.status === 'warning'
                            ? 'bg-amber-400 animate-ping'
                            : 'bg-red-400 animate-ping'
                        }`}
                      />
                      {step.status === 'running'
                        ? t.statusRunning
                        : step.status === 'stopped'
                        ? t.statusStopped
                        : step.status === 'maintenance'
                        ? t.statusMaintenance
                        : step.status === 'warning'
                        ? t.statusWarning
                        : t.statusError}
                    </span>
                  </div>
                </div>

                {/* Over-Threshold Warning Banners */}
                {hasOverThresholdAlert && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center space-x-2 text-[11px] text-red-400 animate-pulse">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <div>
                      <span className="font-bold">
                        {isTempWarning && isVibWarning
                          ? 'Vượt nhiệt độ & độ rung!'
                          : isTempWarning
                          ? 'Quá nhiệt an toàn!'
                          : 'Rung lắc cưỡng bức!'}
                      </span>
                      <span className="ml-1 opacity-90">Kích hoạt rơ-le ngắt kênh cơ khí.</span>
                    </div>
                  </div>
                )}

                {/* Core Live Sensor Values Displays */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {/* LIVE TEMPERATURE */}
                  <div className="bg-slate-900/60 border border-slate-800/40 rounded-lg p-1.5 text-center relative">
                    <span className="text-[9.5px] uppercase text-slate-500 font-semibold block">{t.sensorTemp}</span>
                    <strong
                      className={`text-sm font-mono font-bold block mt-1 ${
                        isTempWarning ? 'text-red-400 animate-pulse' : 'text-slate-200'
                      }`}
                    >
                      {step.temp.toFixed(1)}°C
                    </strong>
                    {/* Tiny micro progress bar for temperature */}
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isTempWarning ? 'bg-red-500' : step.temp > 50 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((step.temp / stepConfig.maxTemp) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* LIVE VIBRATION SPEED */}
                  <div className="bg-slate-900/60 border border-slate-800/40 rounded-lg p-1.5 text-center">
                    <span className="text-[9.5px] uppercase text-slate-500 font-semibold block">Rung lắc</span>
                    <strong
                      className={`text-sm font-mono font-bold block mt-1 ${
                        isVibWarning ? 'text-red-400 animate-pulse' : 'text-slate-200'
                      }`}
                    >
                      {step.vibration.toFixed(2)} <span className="text-[8px] text-slate-500">mm/s</span>
                    </strong>
                    {/* Slide progress bar for vibration */}
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isVibWarning ? 'bg-red-500' : step.vibration > 3.0 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min((step.vibration / stepConfig.maxVib) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* OEE STATION */}
                  <div className="bg-slate-900/60 border border-slate-800/40 rounded-lg p-1.5 text-center">
                    <span className="text-[9.5px] uppercase text-slate-500 font-semibold block">OEE Trạm</span>
                    <strong className="text-sm font-mono font-bold text-slate-200 block mt-1">
                      {step.oee.toFixed(0)}%
                    </strong>
                    {/* Linear color for OEE */}
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          step.oee > 85 ? 'bg-emerald-500' : step.oee > 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${step.oee}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Operator info label */}
                <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.operatorName}:</span>
                  </span>
                  <span className="font-semibold text-slate-300">{step.operator}</span>
                </div>
              </div>

              {/* Collapsed / Expanded Safety Limit Slider Tuning Form */}
              <div className="mt-4 border-t border-slate-800/60 pt-3">
                <button
                  onClick={() => setExpandedStepConfigId(isConfigExpanded ? null : step.id)}
                  className="w-full flex items-center justify-between py-1 px-2.5 bg-slate-900/50 hover:bg-slate-950 border border-slate-800/80 rounded-lg text-[11px] text-slate-300 transition-colors"
                >
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Settings2 className="w-3.5 h-3.5 text-blue-400" />
                    {currentLanguage === 'vi' ? 'Sửa Giới Hạn Bảo Vệ' : 'Tune Safety Limits'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isConfigExpanded ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>

                {isConfigExpanded && (
                  <div className="mt-3 bg-slate-950/80 border border-slate-900 rounded-lg p-3 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-900">
                      <span className="text-[11px] font-bold text-blue-400">Parameter Configuration</span>
                      {/* Bypass sensor switcher */}
                      <button
                        onClick={() => toggleBypassSensor(step.id)}
                        className={`py-0.5 px-2 text-[9px] font-mono font-bold rounded transition-colors ${
                          stepConfig.isBypassed
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {stepConfig.isBypassed ? 'BYPASS_ACTIVE' : 'BYPASS_OFF'}
                      </button>
                    </div>

                    {/* LIMIT TEMPERATURE SLIDER */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Thermometer className="w-3 text-red-400" />
                          {currentLanguage === 'vi' ? 'Cảnh báo Nhiệt độ max:' : 'Max Allowed Temp:'}
                        </span>
                        <span className="font-mono font-bold text-slate-200">{stepConfig.maxTemp}°C</span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="95"
                        value={stepConfig.maxTemp}
                        onChange={(e) => handleUpdateLimit(step.id, 'maxTemp', parseInt(e.target.value))}
                        disabled={stepConfig.isBypassed}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
                      />
                    </div>

                    {/* LIMIT VIBRATION SLIDER */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Gauge className="w-3 text-indigo-400" />
                          {currentLanguage === 'vi' ? 'Cảnh báo Rung lắc max:' : 'Max Allowed Vibration:'}
                        </span>
                        <span className="font-mono font-bold text-slate-200">
                          {stepConfig.maxVib.toFixed(1)} mm/s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="10.0"
                        step="0.5"
                        value={stepConfig.maxVib}
                        onChange={(e) => handleUpdateLimit(step.id, 'maxVib', parseFloat(e.target.value))}
                        disabled={stepConfig.isBypassed}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
                      />
                    </div>

                    {/* Save Config actions */}
                    <button
                      onClick={() => handleSaveThresholds(step.id, stepLabel)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-md flex items-center justify-center gap-1 cursor-pointer transition-colors active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{currentLanguage === 'vi' ? 'Lưu & Khóa Cấu Hình' : 'Save & Secure'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. STATION ON-OFF & MAINTENANCE CONTROLS */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/40 flex items-center justify-between gap-2.5">
                {/* Auto Troubleshoot advice dropdown */}
                {(step.status === 'error' || step.status === 'warning') ? (
                  <button
                    onClick={() =>
                      setActiveTroubleshootingId(activeTroubleshootingId === step.id ? null : step.id)
                    }
                    className="flex-1 py-1.5 px-3 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 font-bold text-[10px] rounded-lg tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <HelpCircle className="w-3.5 h-3.5 animate-bounce" />
                    <span>{currentLanguage === 'vi' ? 'CLICK KHẮC PHỤC' : 'SMART REPAIR'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => toggleStepMaintenance(step.id, step.status)}
                    className={`flex-1 py-1.5 px-3 border font-semibold text-[10px] rounded-lg tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      step.status === 'maintenance'
                        ? 'bg-purple-600 text-white border-purple-500 hover:bg-purple-500'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{step.status === 'maintenance' ? 'XONG BẢO TRÌ' : 'BẢO TRÌ ĐỊNH KỲ'}</span>
                  </button>
                )}

                {/* On-Off Activate Toggle */}
                <button
                  onClick={() => toggleStepActivation(step.id, step.status)}
                  className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-lg border transition-all cursor-pointer ${
                    step.status === 'stopped'
                      ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 active:scale-95'
                      : 'bg-red-950/40 border-red-900/40 text-red-400 hover:bg-red-950/80'
                  }`}
                >
                  {step.status === 'stopped' ? 'BẬT MÁY' : 'OŇOFF DỪNG'}
                </button>
              </div>

              {/* Troubleshooting Drawer Modal inside card */}
              {activeTroubleshootingId === step.id && (
                <div className="absolute inset-0 bg-[#0c101c]/95 border border-red-500 p-4 rounded-xl flex flex-col justify-between z-10 animate-scaleUp">
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-red-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                      Yêu cầu Phản Hồi Vận Hành
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Phát hiện rơ-le nhiệt ngắt dòng hoặc kẹt khay nạp mâm rung:
                    </p>
                    <ul className="text-[10px] text-slate-300 list-disc list-inside space-y-1">
                      <li>Bơm dầu xi-lanh trục nâng khí nén</li>
                      <li>Khởi động lại mạch driver nguồn DC 24V</li>
                      <li>Sàng lọc phôi kim loại lỗi kẹt</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAutoTroubleshoot(step.id)}
                      className="flex-1 py-1 px-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded border border-blue-400 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Bắn lệnh Khắc Phục Auto
                    </button>
                    <button
                      onClick={() => setActiveTroubleshootingId(null)}
                      className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded cursor-pointer"
                    >
                      Bỏ qua
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
