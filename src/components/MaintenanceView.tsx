import React, { useState, useMemo } from 'react';
import { Language, FlowStep, StatusType, TranslationSchema } from '../types';
import { translations } from '../translations';
import {
  Wrench,
  Cpu,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Settings2,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Thermometer,
  ShieldAlert,
  Gauge,
  History,
  Activity,
  Droplet,
  Settings,
  Flame,
  Search
} from 'lucide-react';

interface MaintenanceViewProps {
  currentLanguage: Language;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  triggerToast: (msg: string) => void;
  simulationActive: boolean;
}

interface MaintenanceTicket {
  id: string;
  stationId: string;
  technician: string;
  type: 'lubrication' | 'calibration' | 'hardware' | 'seal_replacement';
  time: string;
  status: 'scheduled' | 'active' | 'certified';
}

const localMaintenanceTranslations = {
  vi: {
    title: 'Hệ thống Quản lý & Bảo trì Dự phòng',
    subtitle: 'Chẩn đoán độ hao mòn cơ khí tủ PLC, hiệu chuẩn bạc đạn, châm dầu mỡ bôi trơn trục vít s6-s12 và khôi phục hoạt động thiết bị.',
    metricHealth: 'Chỉ số Sức khỏe Cơ học',
    metricLubricant: 'Bôi trơn & Áp nén lạnh',
    metricCalibration: 'Độ lệch trục x,y',
    metricActiveJobs: 'Công việc Đang tiến hành',
    stationSelectorTitle: 'Bảng Điều khiển & Tách trạm Bảo trì',
    stationSelectorSub: 'Chọn bất kỳ trạm máy để phát lệnh tắt tạm thời, chuyển sang trạng thái Bảo trì hoặc hiệu năng hóa lại.',
    btnStartMaint: 'Bắt đầu Bảo trì',
    btnCompleteMaint: 'Khôi phục vận hành',
    toastStartMaint: 'Đã dừng trạm và bắt đầu quy trình kỹ thuật cho:',
    toastFinishMaint: 'Trạm máy đã bảo trì xong, chỉ số OEE phục hồi về 95% cho:',
    bearingWear: 'Mức mòn vòng bi trục xoay',
    greaseLife: 'Mỡ bôi trơn ổ nạp nén',
    calibrationBias: 'Hiệu chuẩn lệch laser',
    filterPriority: 'Mức độ',
    quickMaintBtn: 'Gạt nhanh lube tản nhiệt s6',
    quickMaintSub: 'Gia cố mỡ làm mát móng trượt trạm 6 tự động.',
    quickCalibrator: 'Hồi phục phễu quang s1',
    quickCalibratorSub: 'Reset mốc zero laser cho cụm quang nâng hạ vật liệu s1.',
    recentWorkLogs: 'Nhật ký Kỹ thuật Bảo trì Kỹ sư trực ca',
    assignedTech: 'Kỹ sư thụ lý',
    regCode: 'Mã số phiếu',
    createMaintTicket: 'Mở phiếu sửa chữa đột xuất',
    btnCreateTicket: 'Kích hoạt phiếu',
    lblSelectDevice: 'Thiết bị cần bảo trì',
    lblSelectTech: 'Nhân sự chỉ định',
    lblSelectType: 'Nghiệp vụ kỹ thuật',
    typeLubrication: 'Thay dầu & Châm mỡ bôi trơn',
    typeCalibration: 'Hiệu chuẩn & Cân chỉnh đồng trục',
    typeHardware: 'Thay thế phụ tùng cơ khí',
    typeSeal: 'Kiểm tra làm kín & Gioăng cao su',
    statusScheduled: 'Đang xếp ca',
    statusActive: 'Đang sửa chữa',
    statusCertified: 'Đã kiểm nghiệm đạt',
    toastCreateSuccess: 'Đã tạo và thông báo phiếu bảo trì đột xuất qua loa dải PLC!'
  },
  en: {
    title: 'Predictive & Preventive Maintenance Hub',
    subtitle: 'Monitor spindle vibration coefficients, calibrate pneumatic vacuum bearings, flush gear grease on s6-s12, or cycle active repair routines.',
    metricHealth: 'Mechanical Integrity Scope',
    metricLubricant: 'Grease & Coolant Index',
    metricCalibration: 'Axis Offset Bias',
    metricActiveJobs: 'Unresolved Routine Maintenance',
    stationSelectorTitle: 'Mechanical Stoppage & Station Decoupled Command',
    stationSelectorSub: 'Select an active machinery cell to isolate, trigger maintenance status mode, and perform remote mechanical adjustments.',
    btnStartMaint: 'Initiate Maintenance',
    btnCompleteMaint: 'Certify & Normalize',
    toastStartMaint: 'Isolated station power and started maintenance procedure on:',
    toastFinishMaint: 'Maintenance completed. Realigned step to Running with restored OEE for:',
    bearingWear: 'Spindle Bearing wear-and-tear bound',
    greaseLife: 'Pneumatic actuator grease level',
    calibrationBias: 'Laser calibration axis skew offset',
    filterPriority: 'Priority',
    quickMaintBtn: 'Flush s6 Spindle Lube',
    quickMaintSub: 'Heat dissipating paste and bearing grease injection loop on s6.',
    quickCalibrator: 'Re-zero optical feeder s1',
    quickCalibratorSub: 'Reset delta-bias values on optical sensors for Station 1.',
    recentWorkLogs: 'Engineering Maintenance Dispatch Feed',
    assignedTech: 'Assigned specialist',
    regCode: 'Ticket ID',
    createMaintTicket: 'Dispatch Unscheduled Work Order',
    btnCreateTicket: 'Issue Work order',
    lblSelectDevice: 'Target Workstation Unit',
    lblSelectTech: 'Assigned Crew Member',
    lblSelectType: 'Instruction Protocol Category',
    typeLubrication: 'Grease Replacement & Flushing',
    typeCalibration: 'Symmetric Axis Re-alignment',
    typeHardware: 'Gear & Actuator Part Swapping',
    typeSeal: 'Pneumatic pressure & tight seal inspection',
    statusScheduled: 'Scheduled (Awaiting)',
    statusActive: 'Active (Repairing)',
    statusCertified: 'Certified (Closed)',
    toastCreateSuccess: 'Custom emergency maintenance token registered in Scada database!'
  },
  zh: {
    title: '预测性与预防性设备维保终端',
    subtitle: 'PLC轴振动幅度监控，真空吸嘴气密性校准，s6-s12丝杠主轴油脂填补以及紧急故障隔离操作。',
    metricHealth: '机械完好度评分',
    metricLubricant: '主轴轴承润滑指数',
    metricCalibration: '主轴同轴中心偏差',
    metricActiveJobs: '当前处理中维保项',
    stationSelectorTitle: '设备停机隔离与维保调度中心',
    stationSelectorSub: '选择下方12个设备站的任意一个，可以一键将其安全停机切换到“维保模式”进行深度调整，或维保完毕后恢复正常运转。',
    btnStartMaint: '一键安全断电保修',
    btnCompleteMaint: '工艺验收恢复运行',
    toastStartMaint: '机器已被安全降级脱机，进入设备保修状态：',
    toastFinishMaint: '维保整改验收完毕！主传送重新联机运行并复原OEE指标：',
    bearingWear: '高载轴套磨损状态极限',
    greaseLife: '摩擦面耐受高温油脂阻尼',
    calibrationBias: '零点激光测距补偿零偏',
    filterPriority: '限值',
    quickMaintBtn: '一键补充s6导轨油脂',
    quickMaintSub: '对6号打螺丝工位执行冷却导轨油脂喷涂宏命令。',
    quickCalibrator: '一键校准1号真空吸盘',
    quickCalibratorSub: '对s1真空供料头进行原点纠偏重置。',
    recentWorkLogs: '大班长维保调度执行日志',
    assignedTech: '维保执行工程师',
    regCode: '工单凭条',
    createMaintTicket: '下发额外非计划性维保命令',
    btnCreateTicket: '核发设备维保任务',
    lblSelectDevice: '维保目标工作站',
    lblSelectTech: '维保工程班组指定人',
    lblSelectType: '计划作业工艺类型',
    typeLubrication: '全套清洁注脂保养',
    typeCalibration: '红外定位校准纠偏',
    typeHardware: '高损耗紧固硬件更换',
    typeSeal: '电磁阀组及风刀管路气密检查',
    statusScheduled: '排队审核中',
    statusActive: '正在维修在线',
    statusCertified: '技术总工程师认证闭环',
    toastCreateSuccess: '新的维护派发信息已被打入车间操作显示器!'
  }
};

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  currentLanguage,
  steps,
  setSteps,
  triggerToast,
  simulationActive
}) => {
  const localT = localMaintenanceTranslations[currentLanguage];
  const t = translations[currentLanguage];

  // Currently managed selected station in detail controller
  const [targetStationId, setTargetStationId] = useState<string>('s6');

  // Hardcoded initial dynamic maintenance logs with premium fidelity
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    { id: 'MAINT-8914', stationId: 's6', technician: 'Chen Qiang', type: 'lubrication', time: '07:30', status: 'active' },
    { id: 'MAINT-8910', stationId: 's1', technician: 'Alex Nguyen', type: 'calibration', time: '06:15', status: 'certified' },
    { id: 'MAINT-8898', stationId: 'sc1', technician: 'Wang Lei', type: 'hardware', time: 'May 21', status: 'certified' },
    { id: 'MAINT-8920', stationId: 'sc3', technician: 'Zhao Lin', type: 'seal_replacement', time: '14:00', status: 'scheduled' },
  ]);

  // Search filter for maintenance tickets
  const [maintSearch, setMaintSearch] = useState<string>('');

  // Ticket Creator forms
  const [maccStep, setMaccStep] = useState<string>('s6');
  const [maccTech, setMaccTech] = useState<string>('Chen Qiang');
  const [maccType, setMaccType] = useState<MaintenanceTicket['type']>('lubrication');

  // Retrieve details of the currently focused station
  const focusedStep = useMemo(() => {
    return steps.find((s) => s.id === targetStationId) || steps[0];
  }, [steps, targetStationId]);

  // Compute calculated values for diagnostic dials
  const wearScores = useMemo(() => {
    // Generates a mock derived mechanical wear-and-tear score based lockstep on status
    const wearMap: Record<string, { wear: number, grease: number, skew: number }> = {};
    
    steps.forEach((s) => {
      let baseWear = 45;
      let baseGrease = 80;
      let baseSkew = 0.12;

      if (s.status === 'error') {
        baseWear = 88;
        baseGrease = 15;
        baseSkew = 0.89;
      } else if (s.status === 'warning') {
        baseWear = 69;
        baseGrease = 38;
        baseSkew = 0.45;
      } else if (s.status === 'maintenance') {
        baseWear = 20;
        baseGrease = 95;
        baseSkew = 0.02;
      }

      // Add a slight fluctuation dependent on step temperatures
      const noise = (s.temp - 30) / 20; // higher temp, slightly more wear
      wearMap[s.id] = {
        wear: Math.min(99, Math.max(5, Math.round(baseWear + noise))),
        grease: Math.min(100, Math.max(0, Math.round(baseGrease - noise * 2))),
        skew: parseFloat(Math.max(0, baseSkew + (s.vibration - 1.2) * 0.1).toFixed(3)),
      };
    });

    return wearMap;
  }, [steps]);

  // Global counts for health summary
  const integrityScores = useMemo(() => {
    let totScore = 0;
    steps.forEach((s) => {
      // 100 max minus wear levels
      const wear = wearScores[s.id]?.wear || 40;
      totScore += (100 - wear);
    });

    const averageIntegrity = Math.round(totScore / steps.length);
    const lowGreaseAlerts = Object.keys(wearScores).filter((k) => wearScores[k].grease < 40).length;

    return {
      integrity: averageIntegrity,
      lowGrease: lowGreaseAlerts,
      activeTickets: tickets.filter(t => t.status === 'active').length,
    };
  }, [steps, wearScores, tickets]);

  // Handle setting a step into "maintenance" (Bảo trì) mode
  const handleToggleStateToMaint = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            status: 'maintenance',
            temp: 24.5, // cooldown
            vibration: 0.1, // still
            oee: 40.0, // temporarily zero impact OEE or calibrated limit
          };
        }
        return step;
      })
    );

    // Create a corresponding active maintenance ticket automatically
    const codeId = `MAINT-${8915 + tickets.length}`;
    const nowText = new Date().toTimeString().slice(0, 5);
    const newTicket: MaintenanceTicket = {
      id: codeId,
      stationId: stepId,
      technician: 'Kỹ sư trực ca SCADA',
      type: 'hardware',
      time: nowText,
      status: 'active',
    };

    setTickets((prev) => [newTicket, ...prev]);

    const resolvedLabel = currentLanguage === 'vi' ? translations.vi.statusMaintenance : translations.en.statusMaintenance;
    const nameLabel = translations[currentLanguage][focusedStep.labelKey] as string;
    triggerToast(`${localT.toastStartMaint} ${nameLabel}`);
  };

  // Restore step from maintenance back to normal "running"
  const handleRestoreFromMaint = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id === stepId) {
          return {
            ...step,
            status: 'running',
            temp: step.branch === 'casing' ? 32.0 : 36.5,
            vibration: step.branch === 'casing' ? 0.9 : 1.1,
            oee: 96.5, // fully restored
          };
        }
        return step;
      })
    );

    // Mark active maintenance tickets associated with this station as "certified" (Closed)
    setTickets((prev) =>
      prev.map((tic) =>
        tic.stationId === stepId && tic.status !== 'certified'
          ? { ...tic, status: 'certified' as const }
          : tic
      )
    );

    const nameLabel = translations[currentLanguage][focusedStep.labelKey] as string;
    triggerToast(`${localT.toastFinishMaint} ${nameLabel}`);
  };

  // Dispatch custom manual maintenance order
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codeId = `MAINT-${Math.floor(Math.random() * 2000) + 8000}`;
    const nowText = new Date().toTimeString().slice(0, 5);

    const newTick: MaintenanceTicket = {
      id: codeId,
      stationId: maccStep,
      technician: maccTech,
      type: maccType,
      time: nowText,
      status: 'scheduled',
    };

    setTickets((prev) => [newTick, ...prev]);
    triggerToast(localT.toastCreateSuccess);

    // If active check, make sure it applies
    if (maccType === 'lubrication') {
      // Partially refill grease on step!
    }
  };

  // Quick maintenance macros
  const handleQuickFlushS6 = () => {
    triggerToast(
      currentLanguage === 'vi'
        ? 'Bạc đạn trượt s6 đã được bôi mỡ nhiệt độ cao tự động! Sát số chao đảo hạ từ 1.8mm xuống 1.0mm.'
        : 'Spindle s6 auto grease cycle injected! Mechanical friction bias stabilized.'
    );

    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === 's6') {
          return {
            ...s,
            status: 'running',
            temp: 35.8,
            vibration: 0.95,
          };
        }
        return s;
      })
    );
  };

  const handleQuickRezeroS1 = () => {
    triggerToast(
      currentLanguage === 'vi'
        ? 'Phễu nạp s1 đã hiệu chuẩn mốc gốc laser quang học hoàn hảo!'
        : 'Vacuum picker s1 optoelectronic zero-point calibration verified.'
    );

    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === 's1') {
          return {
            ...s,
            status: 'running',
            vibration: 0.65,
          };
        }
        return s;
      })
    );
  };

  // Filtered tickets list
  const filteredTickets = tickets.filter((tic) => {
    const linkedStep = steps.find((s) => s.id === tic.stationId);
    const stepLabel = linkedStep ? (translations[currentLanguage][linkedStep.labelKey] as string) : '';
    const contentText = `${tic.id} ${tic.stationId} ${tic.work_order_id ?? ''} ${tic.technician} ${stepLabel} ${tic.type}`.toLowerCase();

    return contentText.includes(maintSearch.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="maintenance-view-dashboard">
      
      {/* 1. INTRO BANNER AND METRIC SUMMARIES */}
      <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5" id="maint-banner-head">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5.5 h-5.5 text-blue-500 animate-pulse" />
            <span>{localT.title}</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-4xl leading-normal">
            {localT.subtitle}
          </p>
        </div>

        {/* METRICS HEADER CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5" id="maintenance-summary-row">
          
          {/* Mechanical Integrity */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{localT.metricHealth}</span>
              <h4 className="text-lg font-mono font-bold text-emerald-400 mt-1">{integrityScores.integrity}%</h4>
              <p className="text-[9.5px] text-slate-500">Mức vĩ mô 12 trạm máy</p>
            </div>
            <Activity className="w-6 h-6 text-emerald-500/20" />
          </div>

          {/* Lubricants levels alert */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{localT.bearingWear}</span>
              <h4 className="text-lg font-mono font-bold text-amber-500 mt-1">{steps.filter(s => s.status === 'warning').length} trạm</h4>
              <p className="text-[9.5px] text-slate-500">Đang vượt ngưỡng rung</p>
            </div>
            <Gauge className="w-6 h-6 text-amber-500/20" />
          </div>

          {/* Critical lubrication spots */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{localT.metricLubricant}</span>
              <h4 className="text-lg font-mono font-bold text-blue-400 mt-1">{integrityScores.lowGrease} / 12</h4>
              <p className="text-[9.5px] text-slate-500">Cần bổ sung mỡ nạp</p>
            </div>
            <Droplet className="w-6 h-6 text-blue-500/20" />
          </div>

          {/* Pending workorders */}
          <div className="bg-blue-500/5 p-3.5 border border-blue-500/15 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-400 font-bold uppercase">{localT.metricActiveJobs}</span>
              <h4 className="text-lg font-mono font-bold text-white">{integrityScores.activeTickets} ca trực</h4>
              <p className="text-[9.5px] text-blue-400">Đang thao tác thiết bị</p>
            </div>
            <Wrench className="w-6 h-6 text-blue-500/40 animate-swing" />
          </div>

        </div>
      </div>

      {/* 2. RAPID PREVENTATIVE AUTO CALIBRATION SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="maint-shortcuts-grid">
        {/* Lube s6 */}
        <button
          onClick={handleQuickFlushS6}
          className="flex items-center text-left p-3.5 bg-slate-900/30 hover:bg-slate-900/55 border border-slate-800 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Droplet className="w-5 h-5 text-blue-400" />
          </div>
          <div className="ml-3.5">
            <h5 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
              ⚡ {localT.quickMaintBtn}
            </h5>
            <p className="text-[10.5px] text-slate-400 font-semibold leading-normal pt-0.5">
              {localT.quickMaintSub}
            </p>
          </div>
        </button>

        {/* Calibrate s1 */}
        <button
          onClick={handleQuickRezeroS1}
          className="flex items-center text-left p-3.5 bg-slate-900/30 hover:bg-slate-900/55 border border-slate-800 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="p-3 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Compass className="w-5 h-5 text-teal-400" />
          </div>
          <div className="ml-3.5">
            <h5 className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
              ⚡ {localT.quickCalibrator}
            </h5>
            <p className="text-[10.5px] text-slate-400 font-semibold leading-normal pt-0.5">
              {localT.quickCalibratorSub}
            </p>
          </div>
        </button>
      </div>

      {/* 3. CORE DUAL PANEL SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="maint-core-control-grid">
        
        {/* LEFT COLUMN: ACTIVE DEVICE ISOLATION AND WORKORDERS (2 SPAN) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg">
            
            {/* Split layout: Selector List with focused device dials */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/40 pb-4 mb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-blue-400" />
                  <span>{localT.stationSelectorTitle}</span>
                </h3>
                <p className="text-[10.5px] text-slate-400 max-w-xl">
                  {localT.stationSelectorSub}
                </p>
              </div>

              {/* Quick Dropdown selector */}
              <select
                value={targetStationId}
                onChange={(e) => setTargetStationId(e.target.value)}
                className="bg-slate-950 text-slate-200 text-xs font-bold py-2 px-3 rounded-lg border border-slate-800 outline-none cursor-pointer w-full md:w-56"
              >
                {steps.map((s) => (
                  <option key={s.id} value={s.id}>
                    🔧 {translations[currentLanguage][s.labelKey] as string}
                  </option>
                ))}
              </select>
            </div>

            {/* DETAILED DIAGNOSTIC AREA & TRIGGER COMMANDS FOR THE FOCUSED DEVICE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950/20 p-5 border border-slate-800/40 rounded-xl">
              
              {/* Box 1: Device State overview */}
              <div className="space-y-3 md:border-r border-slate-800/40 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-mono font-bold text-blue-400 bg-blue-505/10 bg-slate-950/60 p-1 px-1.5 rounded border border-slate-800 uppercase">
                    {focusedStep.id}
                  </span>
                  <h4 className="text-xs font-bold text-slate-100 truncate">
                    {translations[currentLanguage][focusedStep.labelKey] as string}
                  </h4>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-900">
                    <span className="text-slate-400 text-[10.5px]">{localT.assignedTech}:</span>
                    <span className="font-semibold text-slate-200">{focusedStep.operator || 'Unspecified'}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-900">
                    <span className="text-slate-400 text-[10.5px]">{t.currentStatus}:</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      focusedStep.status === 'running'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : focusedStep.status === 'maintenance'
                        ? 'bg-purple-500/10 text-purple-400'
                        : focusedStep.status === 'error'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {focusedStep.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-900">
                    <span className="text-slate-400 text-[10.5px]">OEE Base:</span>
                    <span className="font-mono font-bold text-slate-200">{focusedStep.oee}%</span>
                  </div>
                </div>

                {/* Primary Action Button Toggle */}
                {focusedStep.status !== 'maintenance' ? (
                  <button
                    onClick={() => handleToggleStateToMaint(focusedStep.id)}
                    className="w-full mt-3 py-2 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-purple-300 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{localT.btnStartMaint}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestoreFromMaint(focusedStep.id)}
                    className="w-full mt-3 py-2 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold rounded-lg text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{localT.btnCompleteMaint}</span>
                  </button>
                )}
              </div>

              {/* Box 2 & 3: Health Gauges */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Gauge 1: Spindle wearing */}
                  <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-lg text-center space-y-1.5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight block">
                      {localT.bearingWear}
                    </span>
                    <div className="py-2">
                      <div className="text-lg font-mono font-bold text-slate-200">
                        {wearScores[focusedStep.id]?.wear || 35}%
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1 max-w-[80px] mx-auto">
                        <div
                          className={`h-full rounded-full ${
                            (wearScores[focusedStep.id]?.wear || 35) > 75 ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${wearScores[focusedStep.id]?.wear || 35}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500">Mức mài mòn cơ</span>
                  </div>

                  {/* Gauge 2: Grease state */}
                  <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-lg text-center space-y-1.5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight block">
                      {localT.greaseLife}
                    </span>
                    <div className="py-2">
                      <div className="text-lg font-mono font-bold text-blue-400">
                        {wearScores[focusedStep.id]?.grease || 85}%
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1 max-w-[80px] mx-auto">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${wearScores[focusedStep.id]?.grease || 85}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500">Trạng thái dung dịch</span>
                  </div>

                  {/* Gauge 3: Calibration offset bias */}
                  <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-lg text-center space-y-1.5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight block">
                      {localT.calibrationBias}
                    </span>
                    <div className="py-2">
                      <div className="text-lg font-mono font-bold text-amber-500">
                        {wearScores[focusedStep.id]?.skew || 0.05} mm
                      </div>
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1 max-w-[80px] mx-auto">
                        <div
                          className={`h-full rounded-full ${
                            (wearScores[focusedStep.id]?.skew || 0.05) > 0.4 ? 'bg-amber-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${Math.min(100, (wearScores[focusedStep.id]?.skew || 0.05) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500">Dải sai lệch tâm</span>
                  </div>

                </div>

                {/* Intelligent diagnostic banner */}
                <div className="bg-indigo-950/15 border border-indigo-900/25 p-3 rounded-lg flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[10.5px] text-slate-400 leading-normal leading-relaxed">
                    <strong>Chẩn đoán PLC SCADA:</strong>{' '}
                    {currentLanguage === 'vi'
                      ? 'Nhiệt độ hiện tải đạt ' + focusedStep.temp.toFixed(1) + ' °C với mức rung biên động ' + focusedStep.vibration.toFixed(2) + ' mm/s. Bảng kỹ thuật đề xuất kiểm tra gioăng bôi trơn định kỳ sau mỗi 400 giờ chu kỳ sản xuất liên tục.'
                      : 'Active temperature metrics are stabilized at ' + focusedStep.temp.toFixed(1) + 'C. Scada recommends schedule flushing on gaskets and rotary seals before wear values reach 85% upper threshold bound.'}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* TABLE LOGS LIST */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/40 pb-3 mb-4">
              <h3 className="text-slate-100 text-sm font-bold flex items-center gap-1.5">
                <History className="w-4.5 h-4.5 text-blue-400" />
                <span>{localT.recentWorkLogs}</span>
              </h3>

              {/* Filter tickets */}
              <div className="relative w-full sm:w-60">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Lọc nhật ký, kỹ sư..."
                  value={maintSearch}
                  onChange={(e) => setMaintSearch(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-900 outline-none focus:border-blue-500/60"
                />
              </div>
            </div>

            {/* List with table format */}
            <div className="overflow-x-auto min-h-[150px] max-h-[300px] overflow-y-auto customize-scrollbar">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/40 font-mono text-[10px] text-slate-500 tracking-wider">
                    <th className="p-2.5">{localT.regCode}</th>
                    <th className="p-2.5">Trạm máy</th>
                    <th className="p-2.5">{localT.assignedTech}</th>
                    <th className="p-2.5">Loại xử lý</th>
                    <th className="p-2.5">Mốc trễ</th>
                    <th className="p-2.5">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((tic) => {
                    const matchedStep = steps.find((s) => s.id === tic.stationId);
                    const nameLabel = matchedStep ? (translations[currentLanguage][matchedStep.labelKey] as string) : tic.stationId;

                    let typeLabel = localT.typeLubrication;
                    if (tic.type === 'calibration') typeLabel = localT.typeCalibration;
                    if (tic.type === 'hardware') typeLabel = localT.typeHardware;
                    if (tic.type === 'seal_replacement') typeLabel = localT.typeSeal;

                    return (
                      <tr key={tic.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-colors">
                        <td className="p-2.5 font-mono font-medium text-slate-300">{tic.id}</td>
                        <td className="p-2.5 font-bold text-blue-400">{nameLabel}</td>
                        <td className="p-2.5 font-sans font-medium text-slate-300">{tic.technician}</td>
                        <td className="p-2.5 text-[11px] text-slate-400">{typeLabel}</td>
                        <td className="p-2.5 font-mono text-slate-500">{tic.time}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            tic.status === 'certified'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : tic.status === 'active'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {tic.status === 'certified' ? localT.statusCertified : tic.status === 'active' ? localT.statusActive : localT.statusScheduled}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: MANUAL UNSCHEDULED WORKORDER FORM (1 SPAN) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
            
            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800/50 pb-3">
                <Wrench className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider">
                  {localT.createMaintTicket}
                </h3>
              </div>

              {/* Station select */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold">{localT.lblSelectDevice}</label>
                <select
                  value={maccStep}
                  onChange={(e) => setMaccStep(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-lg border border-slate-800 outline-none cursor-pointer"
                >
                  {steps.map((st) => (
                    <option key={st.id} value={st.id}>
                      📍 {translations[currentLanguage][st.labelKey] as string}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technician select */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold">{localT.lblSelectTech}</label>
                <select
                  value={maccTech}
                  onChange={(e) => setMaccTech(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-lg border border-slate-800 outline-none cursor-pointer"
                >
                  <option value="Alex Nguyen">Alex Nguyen</option>
                  <option value="Chen Qiang">Chen Qiang</option>
                  <option value="Sarah Pham">Sarah Pham</option>
                  <option value="Wang Lei">Wang Lei</option>
                  <option value="Zhao Lin">Zhao Lin</option>
                </select>
              </div>

              {/* Type Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-semibold">{localT.lblSelectType}</label>
                <select
                  value={maccType}
                  onChange={(e: any) => setMaccType(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-lg border border-slate-800 outline-none cursor-pointer"
                >
                  <option value="lubrication">💧 {localT.typeLubrication}</option>
                  <option value="calibration">📐 {localT.typeCalibration}</option>
                  <option value="hardware">⚙️ {localT.typeHardware}</option>
                  <option value="seal_replacement">🛡️ {localT.typeSeal}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold hover:shadow-blue-500/10 text-white text-xs rounded-lg cursor-pointer transition-all active:scale-98 shadow flex items-center justify-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>{localT.btnCreateTicket}</span>
              </button>
            </form>

            {/* Micro alert instruction */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-900 text-[10.5px] text-slate-400 leading-relaxed font-sans">
              <span className="font-bold text-slate-200">ℹ️ Quy chuẩn số: 1018-DVT:</span> Mỗi khi trạm máy hoạt động ở trạng thái Bảo trì, hệ thống máy chủ phụ sẽ cách ly hoàn toàn dữ liệu lỗi giả lập của cảm biến để kỹ sư tháo lắp và tra dầu không làm sai số tổng thể.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
