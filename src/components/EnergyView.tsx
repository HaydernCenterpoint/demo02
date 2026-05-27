import React, { useState, useMemo, useEffect } from 'react';
import { Language, FlowStep } from '../types';
import { translations } from '../translations';
import {
  Zap,
  Leaf,
  Cpu,
  TrendingDown,
  Gauge,
  Clock,
  Settings,
  Search,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  DollarSign,
  Activity,
  Flame,
  Power,
  BarChart3,
  Calendar,
  Layers,
  Thermometer
} from 'lucide-react';

interface EnergyViewProps {
  currentLanguage: Language;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  triggerToast: (msg: string) => void;
  simulationActive: boolean;
}

interface StationPowerDetail {
  id: string;
  station: string;
  powerLoadKw: number;
  voltageV: number;
  currentA: number;
  powerFactorCos: number;
  ecoMode: boolean;
  optimized: boolean;
}

const localEnergyTranslations = {
  vi: {
    title: 'Hệ thống Quản lý & Tiết kiệm Năng lượng SCADA',
    subtitle: 'Đo lường điện năng tiêu thụ tức thời kW/h, giám sát dòng biến tần động cơ truyền tải, tối ưu hóa hệ số Cosφ và kiểm soát hạn ngạch CO2 tự động.',
    metricActiveLoad: 'Tải điện hiện thời',
    metricTodayEnergy: 'Tiêu thụ trong ngày',
    metricPowerFactor: 'Hệ số Công suất Cosφ',
    metricCarbonFootprint: 'Phát thải Carbon CO2',
    peakDemandTitle: 'Dự báo phụ tải & Lịch biểu giờ cao điểm',
    peakDemandSub: 'Phân bổ phụ tải thông minh giảm thiểu chi phí theo quy hoạch dải giờ biểu giá điện lực quốc gia.',
    optimizeButton: 'Tối ưu hóa Cos-Phi',
    toastOptimizeCos: 'Đã kích hoạt tủ bù tụ điện hạ thế điều chỉnh Cosφ về mức 0.96!',
    stationLoadHeader: 'Bảng dòng phụ tải chi tiết các trạm máy PLC',
    stationLoadSub: 'Tương tác điều chỉnh chế độ ECO tiết kiệm điện, giảm hiệu năng biến tần trạm máy s1-s12.',
    thStation: 'Khu vực/Thiết bị',
    thPower: 'Công suất tải (kW)',
    thVoltage: 'Điện áp (V)',
    thCurrent: 'Cường độ dòng (A)',
    thFactor: 'Cosφ',
    thMode: 'Eco Mode',
    thAction: 'Hành động',
    statusEcoActive: 'Chế độ ECO',
    statusPowerHigh: 'Tải nặng (100%)',
    btnToggleEco: 'Bật ECO',
    btnOptimizeUnit: 'Hiệu chuẩn tụ bù',
    toastEcoOn: 'Đã hạn chế dòng biến tần và kích hoạt Eco tiết kiệm 15% điện năng cho:',
    toastEcoOff: 'Đã khôi phục công suất gốc cho:',
    quickMacros: 'Lệnh điều phối tải khẩn cấp',
    macroInverterTitle: 'Giảm 10% tần số biến tần s2-s6',
    macroInverterSub: 'Hạn chế rung lắc và hao phí lưới điện trung ca tự chọn.',
    macroHeatsinkTitle: 'Bộ tản súng nhiệt trạm 6 chế độ thấp',
    macroHeatsinkSub: 'Định lượng dòng nung chảy tối ưu, cắt giảm 2.5 kW điện dư thừa.',
    toastMacroInverter: 'Đã gửi lệnh Scada hạ 10% dòng biến tần motor s2-s6 thành công!',
    toastMacroHeatsink: 'Trạm bắn vít nhiệt trạm s6 chuyển về dải nung chảy kinh tế!',
    chartTitle: 'Biến thiên tải tiêu thụ theo giờ (kW)',
    chartPeakLoad: 'Tải thiết kế đỉnh',
    chartActualLoad: 'Tải thực tế đo',
    carbonIndexInfo: 'Hệ số ròng CO2 phân xưởng đạt chuẩn ISO 14001 xanh hóa chuỗi sản xuất.',
    gridTariffLabel: 'Biểu giá điện giờ hiện tại',
    tariffPeak: 'Giờ Cao Điểm (3,220đ/kWh)',
    tariffNormal: 'Giờ Bình Thường (1,685đ/kWh)',
    tariffOffPeak: 'Giờ Thấp Điểm (1,010đ/kWh)',
    savingsTitle: 'Hiệu quả tối ưu hóa tuần này',
    savingsCoal: 'Than đá giảm thiểu',
    savingsCost: 'Chi phí khấu hao tiết kiệm',
    searchPlaceholderDevice: 'Tìm kiếm trạm phát, điện áp...',
    normalMode: 'Chế độ Thường',
    noStations: 'Không tìm thấy trạm phù hợp...',
    telemetryAvgLoad: 'Tải Trung Bình',
    telemetryPeakLoad: 'Đỉnh Tải Ghi Nhận',
    telemetryLoadEff: 'Hiệu Suất Tải',
    aiAdvice: 'Tiết diện tụ điện phân xưởng lắp ráp đang thừa 4% hệ điện cảm. Tự động tắt máy sới s6 khi lò rèn ở trạng thái stopped giúp bù 0.05 Cosφ tức thời.',
    weeklySavingsCost: '4,850,000 đ'
  },
  en: {
    title: 'SCADA Energy Management & Smart Grid Dashboard',
    subtitle: 'Track real-time active loads (kW), analyze inverter phase outputs, optimize system power factor (Cosφ), and calculate dynamic carbon footprints.',
    metricActiveLoad: 'Instant Active Load',
    metricTodayEnergy: 'Daily Energy Used',
    metricPowerFactor: 'Power Factor Cosφ',
    metricCarbonFootprint: 'CO2 Emission Vol',
    peakDemandTitle: 'Peak Peak Demand Forecast & Shift Scheduler',
    peakDemandSub: 'Identify grid cost curves, apply active peak load-shaping, and utilize smart cap mechanisms to save on utilities.',
    optimizeButton: 'Optimize Power Factor',
    toastOptimizeCos: 'Low-voltage capacitor banks engaged. Compensating Cosφ target back to 0.96!',
    stationLoadHeader: 'Workstation Load Matrix & Phase Registry',
    stationLoadSub: 'Regulate machinery voltage, adjust inverter outputs, or toggle Eco savings cycles directly.',
    thStation: 'Workstation Unit',
    thPower: 'Power Load (kW)',
    thVoltage: 'Voltage (V)',
    thCurrent: 'Current (A)',
    thFactor: 'Cosφ Factor',
    thMode: 'Mode',
    thAction: 'Isolation/Eco Switch',
    statusEcoActive: 'Eco Active',
    statusPowerHigh: 'High Load (100%)',
    btnToggleEco: 'Toggle ECO',
    btnOptimizeUnit: 'Recalibrate Capacitor',
    toastEcoOn: 'Smart inverter limits applied. Saving 15% energy for:',
    toastEcoOff: 'Restored original full industrial torque for:',
    quickMacros: 'Fast Scada Power-Shaping Commands',
    macroInverterTitle: 'Throttle 10% frequency s2-s6',
    macroInverterSub: 'Imposes safety current threshold on main conveyor sub-grids.',
    macroHeatsinkTitle: 'Cooldown nozzle heating s6',
    macroHeatsinkSub: 'Slightly decrease peak thermal threshold to clip 2.5 kW waste.',
    toastMacroInverter: 'Dispatched Scada signal. Decreased inverter threshold of conveyor s2-s6!',
    toastMacroHeatsink: 'Screwing heater unit s6 calibrated to energy economic boundary!',
    chartTitle: 'Hourly Electrical Draw Spectrum (kW)',
    chartPeakLoad: 'Peak Rated Capacity',
    chartActualLoad: 'Monitored Active Load',
    carbonIndexInfo: 'CO2 Emission Intensity is aligned to ISO 14001 green factory credentials.',
    gridTariffLabel: 'Active Tariff Scheme Slot',
    tariffPeak: 'Peak Hours ($0.138/kWh)',
    tariffNormal: 'Regular Shift ($0.072/kWh)',
    tariffOffPeak: 'Off-Peak Midnight ($0.043/kWh)',
    savingsTitle: 'Aggregated Weekly Conservation Goals',
    savingsCoal: 'Coal Combustion Avoided',
    savingsCost: 'Accrued Cost Reductions',
    searchPlaceholderDevice: 'Search station, voltage...',
    normalMode: 'Normal mode',
    noStations: 'No matching stations found...',
    telemetryAvgLoad: 'Average Load',
    telemetryPeakLoad: 'Peak Load Recorded',
    telemetryLoadEff: 'Load Efficiency',
    aiAdvice: 'Automatic capacitor monitoring detects active capacitance. Shunt idle elements on Station 6 to automatically balance phase harmonics.',
    weeklySavingsCost: '$230.50'
  },
  zh: {
    title: 'SCADA工业智能低碳能效管理终端',
    subtitle: '即时用电负荷（kW）监测，智能防爆变频器相线测温，优化电网无功功率系统，动态计量温室气体CO2足迹。',
    metricActiveLoad: '额定有功总负荷',
    metricTodayEnergy: '今日消耗总量',
    metricPowerFactor: '电网功率因数 Cosφ',
    metricCarbonFootprint: '碳足迹排放减少',
    peakDemandTitle: '电网调峰削峰智能排程',
    peakDemandSub: '根据尖峰、高峰、平段、谷段用电电费政策，主动削峰填谷，降低全厂变压器的基本电费损耗。',
    optimizeButton: '优化全网无功因数',
    toastOptimizeCos: '低压无功补偿电容器组已投切接入！将全厂综合 Cosφ 提升至 0.96 优等。',
    stationLoadHeader: '各个智能控制及供电相电流监控矩阵',
    stationLoadSub: '在线调节各个PLC工步电机的频宽、阻尼负荷或一键启用“Eco低碳节能”模式降低热能耗。',
    thStation: '工作区域/工作站',
    thPower: '功率 (kW)',
    thVoltage: '相电压 (V)',
    thCurrent: '相电流 (A)',
    thFactor: '功率因数',
    thMode: '耗能状态',
    thAction: '低电控制开关',
    statusEcoActive: 'Eco 深度低碳',
    statusPowerHigh: '常规有功载荷 (100%)',
    btnToggleEco: '切到 ECO',
    btnOptimizeUnit: '整流微调',
    toastEcoOn: '变频节流控制已经下发！自动节电 15% 于设备：',
    toastEcoOff: '工作站电机已恢复设计扭矩满负荷运转：',
    quickMacros: '系统能级调度紧急指令集',
    macroInverterTitle: '限制 s2-s6 电机频率 10%',
    macroInverterSub: '调谐主传送带的转速与输送功率，滤除电网畸变。',
    macroHeatsinkTitle: '调低 6 号烤箱/激光电热丝靶温',
    macroHeatsinkSub: '在工艺允许范围内，削减 2.5 kW 热功耗产生。',
    toastMacroInverter: '能效控制核心已下发电机频率轻度压微指令！',
    toastMacroHeatsink: '6号恒温预热喷枪已切入微降温长寿命模式！',
    chartTitle: '电网总瞬时电功率波形（kW）',
    chartPeakLoad: '变压器容量峰值上限',
    chartActualLoad: '实际运行负荷曲线',
    carbonIndexInfo: '本工区碳盘查排放比率完全符合国家环保 ISO 14001 低碳绿色工厂标准。',
    gridTariffLabel: '当前电价阶梯时段',
    tariffPeak: '尖峰负荷时段 (最高电价)',
    tariffNormal: '常规平谷时段 (标准价格)',
    tariffOffPeak: '低负载谷段 (优惠清闲用电)',
    savingsTitle: '本周能效整改综合成绩单',
    savingsCoal: '折合标准煤消耗减少',
    savingsCost: '企业基本用电规费节支',
    searchPlaceholderDevice: '搜索配电站、电压...',
    normalMode: '常规模式',
    noStations: '没有找到匹配的配电站...',
    telemetryAvgLoad: '平均有功负载',
    telemetryPeakLoad: '录得峰值负载',
    telemetryLoadEff: '电网运行效率',
    aiAdvice: '装配车间低压电容补偿柜当前富余4%的无功阻抗。在6号打螺丝工位处于空闲/停机状态时自动将其切离电网，可立即提升约0.05的系统功率因数Cosφ。',
    weeklySavingsCost: '¥1,650.00'
  }
};

export const EnergyView: React.FC<EnergyViewProps> = ({
  currentLanguage,
  steps,
  setSteps,
  triggerToast,
  simulationActive
}) => {
  const t = localEnergyTranslations[currentLanguage];
  const commonT = translations[currentLanguage];

  // Search filter for device items
  const [searchWord, setSearchWord] = useState<string>('');

  // Cosφ power factor state, interactive calibration!
  const [powerFactor, setPowerFactor] = useState<number>(0.91);
  const [isCompensating, setIsCompensating] = useState<boolean>(false);

  // Real-time ticking clock for dynamic tariff checking
  const [localTime, setLocalTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTariff = useMemo(() => {
    const hour = localTime.getHours();
    const minute = localTime.getMinutes();
    const totalMinutes = hour * 60 + minute;

    // Peak: 09:30-11:30 (570-690) & 17:00-20:00 (1020-1200)
    const isPeak = (totalMinutes >= 570 && totalMinutes < 690) || (totalMinutes >= 1020 && totalMinutes < 1200);
    
    // Off-Peak: 22:00-06:00 (1320-1440 or 0-360)
    const isOffPeak = totalMinutes >= 1320 || totalMinutes < 360;

    if (isPeak) return 'peak';
    if (isOffPeak) return 'offPeak';
    return 'normal';
  }, [localTime]);

  // Keep a local dictionary tracking which stations are in ECO / Optimized mode
  const [stationSettings, setStationSettings] = useState<Record<string, { eco: boolean, optimized: boolean }>>({
    s1: { eco: false, optimized: false },
    s2: { eco: true, optimized: false }, // default Eco
    s3: { eco: false, optimized: false },
    s4: { eco: false, optimized: false },
    s5: { eco: false, optimized: false },
    s6: { eco: false, optimized: true },
    s7: { eco: false, optimized: false },
    s8: { eco: false, optimized: false },
    s9: { eco: false, optimized: false },
    sc1: { eco: false, optimized: false },
    sc2: { eco: false, optimized: false },
    sc3: { eco: false, optimized: false },
  });

  // Calculate detailed live values of all 12 stations
  const powerDetails = useMemo<StationPowerDetail[]>(() => {
    return steps.map((step) => {
      const settings = stationSettings[step.id] || { eco: false, optimized: false };
      
      // Compute raw power factors based on steps' vibration/temperatures
      let baseKw = 3.5;
      let voltage = 380; // standard commercial voltage
      
      // Motor, heater or conveyor specific sizing
      if (step.id === 's2') baseKw = 6.2; // Main Conveyor draw
      else if (step.id === 's5') baseKw = 8.5; // Screwing motor
      else if (step.id === 's6') baseKw = 14.2; // Thermal Screwer (heavier)
      else if (step.id === 'sc1') baseKw = 12.0; // Loading robots
      else if (step.id.startsWith('sc')) baseKw = 7.4;

      // React to machine status
      if (step.status === 'stopped') {
        baseKw = 0.2; // standby idle draw
      } else if (step.status === 'maintenance') {
        baseKw = 0.5; // lock-out tag-out draw
      } else if (step.status === 'error') {
        baseKw = 1.1; // error loop alert
      } else if (step.status === 'warning') {
        baseKw *= 1.25; // higher drag / friction, higher power draw!
      }

      // Eco reduction factor (cuts Kw by 15%)
      if (settings.eco) {
        baseKw *= 0.85;
      }

      // Calculate corresponding Ampere currents based on real electrical formulas
      // P = U * I * Cosφ * sqrt(3) -> three phase formula
      const cos = settings.optimized ? 0.98 : (0.88 + Math.min(0.08, step.vibration * 0.015));
      const amp = parseFloat((baseKw * 1000 / (voltage * cos * Math.sqrt(3))).toFixed(2));

      return {
        id: step.id,
        station: commonT[step.labelKey] as string,
        powerLoadKw: parseFloat(baseKw.toFixed(2)),
        voltageV: voltage,
        currentA: amp,
        powerFactorCos: parseFloat(cos.toFixed(2)),
        ecoMode: settings.eco,
        optimized: settings.optimized
      };
    });
  }, [steps, stationSettings, commonT]);

  // Derived KPI totals 
  const kpis = useMemo(() => {
    const totKw = powerDetails.reduce((sum, item) => sum + item.powerLoadKw, 0);
    
    // Day consumption integrates target Kw over hours
    const baseEnergyToday = 340.5;
    const dynamicOffset = (totKw - 45.0) * 0.45; // reacts slightly over active session changes
    const todayKwh = Math.max(100.2, parseFloat((baseEnergyToday + dynamicOffset).toFixed(1)));

    // Carbon conversion factor: roughly 0.5 kg CO2 per kWh
    const carbonKg = parseFloat((todayKwh * 0.54).toFixed(1));

    return {
      activeLoad: parseFloat(totKw.toFixed(1)),
      energyToday: todayKwh,
      carbon: carbonKg
    };
  }, [powerDetails]);

  // Toggling capacitor micro compensation
  const handleOptimiseCosPhi = () => {
    setIsCompensating(true);
    setTimeout(() => {
      setIsCompensating(false);
      setPowerFactor(0.96);
      
      // Mark all stations as power-factor optimized!
      setStationSettings((prev) => {
        const nextDict = { ...prev };
        Object.keys(nextDict).forEach((k) => {
          nextDict[k] = { ...nextDict[k], optimized: true };
        });
        return nextDict;
      });

      triggerToast(t.toastOptimizeCos);
    }, 1000);
  };

  // Turn ECO Mode on/off for a target Step
  const handleToggleEco = (stepId: string) => {
    let newlyEcoState = false;

    setStationSettings((prev) => {
      const existing = prev[stepId] || { eco: false, optimized: false };
      newlyEcoState = !existing.eco;
      return {
        ...prev,
        [stepId]: {
          ...existing,
          eco: newlyEcoState
        }
      };
    });

    const targetStep = steps.find(s => s.id === stepId);
    if (targetStep) {
      const stepName = commonT[targetStep.labelKey] as string;
      if (newlyEcoState) {
        triggerToast(`${t.toastEcoOn} ${stepName}`);
      } else {
        triggerToast(`${t.toastEcoOff} ${stepName}`);
      }
    }
  };

  // Trigger quick inverter shaping macro
  const handleMacroInverter = () => {
    setStationSettings((prev) => {
      const updated = { ...prev };
      // Force s2, s3, s4, s5, s6 onto Eco mode
      ['s2', 's3', 's4', 's5', 's6'].forEach((k) => {
        updated[k] = { ...updated[k], eco: true };
      });
      return updated;
    });

    triggerToast(t.toastMacroInverter);
  };

  // Trigger quick laser heating regulation macro
  const handleMacroHeatsink = () => {
    setStationSettings((prev) => ({
      ...prev,
      s6: { ...prev.s6, eco: true }
    }));

    triggerToast(t.toastMacroHeatsink);
  };

  // Dynamic filter lists for table
  const filteredRows = useMemo(() => {
    return powerDetails.filter((row) => {
      return `${row.id} ${row.station}`.toLowerCase().includes(searchWord.toLowerCase());
    });
  }, [powerDetails, searchWord]);

  // SVG electrical load graph points (historical draw throughout shifts)
  const chartPoints = useMemo(() => {
    const historicalLoads = [44.2, 48.9, 52.1, 41.0, 39.8, kpis.activeLoad, Math.min(75, kpis.activeLoad + 8.5)];
    const pad = 35;
    const chartW = 420;
    const chartH = 150;
    const maxVal = 80;

    return historicalLoads.map((load, idx) => {
      const x = pad + (idx / (historicalLoads.length - 1)) * (chartW - 2 * pad);
      const yActual = chartH - pad - (load / maxVal) * (chartH - 2 * pad);
      const yPeak = chartH - pad - (65 / maxVal) * (chartH - 2 * pad); // standard peak load line at 65kW

      return {
        x,
        y: Math.max(pad, Math.min(chartH - pad, yActual)),
        peakY: Math.max(pad, Math.min(chartH - pad, yPeak)),
        txt: `${10 + idx * 2}:00`
      };
    });
  }, [kpis.activeLoad]);

  return (
    <div className="space-y-6 animate-fadeIn" id="energy-view-root">
      
      {/* 1. HERO TITLE BANNER CONTAINER */}
      <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5" id="energy-header-block">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5.5 h-5.5 text-blue-500" />
              <span>{t.title}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-4xl leading-normal">
              {t.subtitle}
            </p>
          </div>

          {/* Quick power factor optimization button */}
          <button
            onClick={handleOptimiseCosPhi}
            disabled={isCompensating}
            className={`p-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold active:scale-98 text-white transition-all text-xs cursor-pointer flex items-center gap-1.5 shadow ${
              isCompensating ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            <Gauge className={`w-3.5 h-3.5 text-white ${isCompensating ? 'animate-spin' : ''}`} />
            <span>{t.optimizeButton}</span>
          </button>
        </div>

        {/* SUMMARY DYNAMIC METRIC GAUGES ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 animate-scaleIn" id="energy-kpis-row">
          
          {/* Active load */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">{t.metricActiveLoad}</span>
              <h4 className="text-lg font-mono font-bold text-blue-400 mt-1">{kpis.activeLoad} kW</h4>
              <p className="text-[9.5px] text-slate-500">Mức truyền tải biến tần</p>
            </div>
            <Zap className="w-6 h-6 text-blue-500/20" />
          </div>

          {/* Daily consumer accumulation */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.metricTodayEnergy}</span>
              <h4 className="text-lg font-mono font-bold text-emerald-400 mt-1">{kpis.energyToday} kWh</h4>
              <p className="text-[9.5px] text-emerald-500/70">Tích lũy từ 06:00 sáng</p>
            </div>
            <Activity className="w-6 h-6 text-emerald-500/20" />
          </div>

          {/* System power factor Cos-Phi */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.metricPowerFactor}</span>
              <h4 className="text-lg font-mono font-bold text-amber-500 mt-1">Cosφ ≈ {powerFactor.toFixed(2)}</h4>
              <p className="text-[9.5px] text-slate-500">Tiêu chuẩn bù hạ thế</p>
            </div>
            <Gauge className="w-6 h-6 text-amber-500/20" />
          </div>

          {/* Carbon emission metrics */}
          <div className="bg-green-500/5 p-3.5 border border-green-500/10 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-green-400 font-bold uppercase block flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-green-400" />
                <span>{t.metricCarbonFootprint}</span>
              </span>
              <h4 className="text-lg font-mono font-bold text-green-300 mt-1">{kpis.carbon} kg</h4>
              <p className="text-[9px] text-green-400/70">{t.carbonIndexInfo}</p>
            </div>
            <Leaf className="w-6 h-6 text-green-500/15" />
          </div>

        </div>
      </div>

      {/* 2. EMERGENCY SCADA CONTROLS & RECURRING TARIFF GRID RANGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="energy-commands-tariff-layer">
        
        {/* Left Column (2 span): Core SVG Charts & Peak demand calendars */}
        <div className="lg:col-span-2 bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            {/* Box A: Wave Load drawing */}
            <div className="bg-slate-950/20 p-4 border border-slate-800/40 rounded-xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 shrink-0">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span>{t.chartTitle}</span>
                </h4>

                {/* Custom SVG Line drawing */}
                <div className="relative pt-2 flex-1 flex flex-col justify-center min-h-[144px]">
                  <svg viewBox="0 0 420 160" className="w-full h-full max-h-[160px] overflow-visible">
                    {/* Grid layout */}
                    <line x1="25" y1="20" x2="400" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                    <line x1="25" y1="70" x2="400" y2="70" stroke="#1e293b" strokeWidth="0.5" />
                    <line x1="25" y1="120" x2="400" y2="120" stroke="#1e293b" strokeWidth="0.5" />

                    {/* Y-axis metrics */}
                    <text x="5" y="24" className="text-[8px] font-mono fill-slate-600">80kW</text>
                    <text x="5" y="74" className="text-[8px] font-mono fill-slate-600">40kW</text>
                    <text x="5" y="124" className="text-[8px] font-mono fill-slate-600">0</text>

                    {/* Shaded Energy Area */}
                    {chartPoints.length > 0 && (
                      <path
                        d={`M ${chartPoints[0].x} 120
                            ${chartPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}
                            L ${chartPoints[chartPoints.length - 1].x} 120 Z`}
                        fill="url(#area-blue-energy)"
                        opacity="0.12"
                      />
                    )}

                    {/* Theoretical Peak Threshold Limit Line */}
                    <line
                      x1="25"
                      y1={chartPoints[0].peakY}
                      x2="400"
                      y2={chartPoints[0].peakY}
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text x="320" y={chartPoints[0].peakY - 4} className="text-[7.5px] font-bold fill-red-500 tracking-wider">
                      {t.chartPeakLoad.toUpperCase()} (65kW)
                    </text>

                    {/* Actual load spectrum point-to-point */}
                    {chartPoints.length > 0 && (
                      <path
                        d={`M ${chartPoints[0].x} ${chartPoints[0].y}
                            ${chartPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                        fill="none"
                        className="stroke-blue-400"
                        strokeWidth="2"
                      />
                    )}

                    {/* Circular dots */}
                    {chartPoints.map((pt, index) => (
                      <circle
                        key={index}
                        cx={pt.x}
                        cy={pt.y}
                        r="3"
                        className="fill-slate-950 stroke-blue-400 stroke"
                      />
                    ))}

                    {/* Horiz labels */}
                    {chartPoints.map((pt, index) => (
                      <text
                        key={index}
                        x={pt.x}
                        y="136"
                        textAnchor="middle"
                        className="text-[8px] font-mono fill-slate-500"
                      >
                        {pt.txt}
                      </text>
                    ))}

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="area-blue-energy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Legends */}
                  <div className="flex justify-center items-center gap-1.5 mt-2 text-[9.5px] shrink-0">
                    <span className="w-5 h-0.5 bg-blue-400"></span>
                    <span className="text-slate-400">{t.chartActualLoad}</span>
                  </div>
                </div>
              </div>

              {/* Telemetry Stats Row to optimize space and look premium */}
              <div className="grid grid-cols-3 gap-2 pt-3 mt-1 border-t border-slate-800/30 font-mono text-[10.5px] shrink-0">
                <div className="bg-slate-950/40 p-2 border border-slate-900/60 rounded">
                  <span className="text-slate-500 text-[9px] block">{t.telemetryAvgLoad}</span>
                  <span className="font-bold text-slate-300">46.5 kW</span>
                </div>
                <div className="bg-slate-950/40 p-2 border border-slate-900/60 rounded">
                  <span className="text-slate-500 text-[9px] block">{t.telemetryPeakLoad}</span>
                  <span className="font-bold text-red-400">58.2 kW</span>
                </div>
                <div className="bg-slate-950/40 p-2 border border-slate-900/60 rounded">
                  <span className="text-slate-500 text-[9px] block">{t.telemetryLoadEff}</span>
                  <span className="font-bold text-emerald-400">79.2%</span>
                </div>
              </div>
            </div>

            {/* Box B: Peak Demand Optimization Schedule list */}
            <div className="bg-slate-950/20 p-4 border border-slate-800/40 rounded-xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3 flex-1 flex flex-col">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                  <span>{t.peakDemandTitle}</span>
                </h4>

                <p className="text-[10px] text-slate-400 leading-normal shrink-0">
                  {t.peakDemandSub}
                </p>

                {/* Rung listing tariff blocks - Rebuilt to completely avoid text squishing */}
                <div className="space-y-3 pt-2 flex-1 flex flex-col justify-center animate-scaleIn" id="energy-tariff-schedule-blocks">
                  {(() => {
                    const tariffRates = {
                      vi: {
                        peak: '3,220đ/kWh',
                        normal: '1,685đ/kWh',
                        offPeak: '1,010đ/kWh',
                        peakLabel: 'Giờ Cao Điểm',
                        normalLabel: 'Giờ Bình Thường',
                        offPeakLabel: 'Giờ Thấp Điểm',
                        aiPeak: 'Tiết giảm tải s6/s9',
                        aiNormal: 'Vận hành chuẩn',
                        aiOffPeak: 'Tối đa công suất',
                        statusActive: 'ĐANG ÁP DỤNG',
                        statusStandby: 'Chờ ca',
                      },
                      en: {
                        peak: '$0.138/kWh',
                        normal: '$0.072/kWh',
                        offPeak: '$0.043/kWh',
                        peakLabel: 'Peak Hours',
                        normalLabel: 'Regular Shift',
                        offPeakLabel: 'Off-Peak Midnight',
                        aiPeak: 'Limit s6/s9 load',
                        aiNormal: 'Normal operations',
                        aiOffPeak: 'Maximize heavy runs',
                        statusActive: 'ACTIVE',
                        statusStandby: 'Standby',
                      },
                      zh: {
                        peak: '0.92元/kWh',
                        normal: '0.48元/kWh',
                        offPeak: '0.29元/kWh',
                        peakLabel: '尖峰电价时段',
                        normalLabel: '常规电价时段',
                        offPeakLabel: '低谷优惠电价',
                        aiPeak: '限电 s6/s9',
                        aiNormal: '标定负荷运转',
                        aiOffPeak: '推荐满载运行',
                        statusActive: '正在计费',
                        statusStandby: '等待时段',
                      }
                    }[currentLanguage];

                    return (
                      <>
                        {/* 1. Peak hour */}
                        <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-2.5 ${
                          activeTariff === 'peak'
                            ? 'bg-[#ef4444]/10 border-red-500/40 text-white shadow-[0_0_15px_rgba(239,68,68,0.08)]'
                            : 'bg-slate-950/30 border-slate-900/60 opacity-60 hover:opacity-100'
                        }`}>
                          {/* Row 1: Icon, Title, Active Dot, Price */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Zap className={`w-4 h-4 ${activeTariff === 'peak' ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
                              <span className="font-bold text-xs text-slate-200">{tariffRates.peakLabel}</span>
                              {activeTariff === 'peak' && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                            </div>
                            <span className={`font-mono font-bold text-xs ${activeTariff === 'peak' ? 'text-red-400' : 'text-slate-400'}`}>{tariffRates.peak}</span>
                          </div>

                          {/* Row 2: Clock Range & Badge Actions */}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800/30">
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-600" />
                              <span>09:30 - 11:30 & 17:00 - 20:00</span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                                activeTariff === 'peak' ? 'bg-red-500/20 text-red-300' : 'bg-slate-950 text-slate-600'
                              }`}>{tariffRates.aiPeak}</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                activeTariff === 'peak'
                                  ? 'bg-red-500/25 text-red-400 border border-red-500/30 animate-pulse'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900/40'
                              }`}>
                                {activeTariff === 'peak' ? tariffRates.statusActive : tariffRates.statusStandby}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Normal hour */}
                        <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-2.5 ${
                          activeTariff === 'normal'
                            ? 'bg-[#f59e0b]/10 border-amber-500/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                            : 'bg-slate-950/30 border-slate-900/60 opacity-60 hover:opacity-100'
                        }`}>
                          {/* Row 1: Icon, Title, Active Dot, Price */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Activity className={`w-4 h-4 ${activeTariff === 'normal' ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`} />
                              <span className="font-bold text-xs text-slate-200">{tariffRates.normalLabel}</span>
                              {activeTariff === 'normal' && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                              )}
                            </div>
                            <span className={`font-mono font-bold text-xs ${activeTariff === 'normal' ? 'text-amber-400' : 'text-slate-400'}`}>{tariffRates.normal}</span>
                          </div>

                          {/* Row 2: Clock Range & Badge Actions */}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800/30">
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-600" />
                              <span>06:00-09:30 & 11:30-17:00 & 20:00-22:00</span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                                activeTariff === 'normal' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-950 text-slate-600'
                              }`}>{tariffRates.aiNormal}</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                activeTariff === 'normal'
                                  ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30 animate-pulse'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900/40'
                              }`}>
                                {activeTariff === 'normal' ? tariffRates.statusActive : tariffRates.statusStandby}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Off peak hour */}
                        <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-2.5 ${
                          activeTariff === 'offPeak'
                            ? 'bg-[#10b981]/10 border-emerald-500/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                            : 'bg-slate-950/30 border-slate-900/60 opacity-60 hover:opacity-100'
                        }`}>
                          {/* Row 1: Icon, Title, Active Dot, Price */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Leaf className={`w-4 h-4 ${activeTariff === 'offPeak' ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}`} />
                              <span className="font-bold text-xs text-slate-200">{tariffRates.offPeakLabel}</span>
                              {activeTariff === 'offPeak' && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              )}
                            </div>
                            <span className={`font-mono font-bold text-xs ${activeTariff === 'offPeak' ? 'text-emerald-400' : 'text-slate-400'}`}>{tariffRates.offPeak}</span>
                          </div>

                          {/* Row 2: Clock Range & Badge Actions */}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800/30">
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-600" />
                              <span>22:00 - 06:00 (Hôm sau)</span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                                activeTariff === 'offPeak' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-950 text-slate-600'
                              }`}>{tariffRates.aiOffPeak}</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                activeTariff === 'offPeak'
                                  ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 animate-pulse'
                                  : 'bg-slate-950 text-slate-600 border border-slate-900/40'
                              }`}>
                                {activeTariff === 'offPeak' ? tariffRates.statusActive : tariffRates.statusStandby}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Dynamic Energy Grid Standard Tag */}
              <div className="p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-900/25 flex gap-2 items-center text-[10px] text-slate-400 shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {currentLanguage === 'vi' ? 'Biểu giá tự động đồng bộ theo múi giờ hệ thống EVN.' : 'Tariff synchronized with local power utility grid time-brackets.'}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Emergency Power optimization shortcuts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800/40 pb-3">
                <Power className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider">
                  {t.quickMacros}
                </h3>
              </div>

              {/* Action item 1 */}
              <button
                onClick={handleMacroInverter}
                className="w-full text-left p-3 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 flex items-center gap-3 group cursor-pointer transition-colors"
                id="macro-inverter-action"
              >
                <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 group-hover:scale-105 transition-transform">
                  <Activity className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div>
                  <h5 className="text-[11.5px] font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {t.macroInverterTitle}
                  </h5>
                  <p className="text-[9.5px] text-slate-500 mt-0.5 leading-normal">
                    {t.macroInverterSub}
                  </p>
                </div>
              </button>

              {/* Action item 2 */}
              <button
                onClick={handleMacroHeatsink}
                className="w-full text-left p-3 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 flex items-center gap-3 group cursor-pointer transition-colors"
                id="macro-heatsink-action"
              >
                <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15 group-hover:scale-105 transition-transform">
                  <Flame className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <div>
                  <h5 className="text-[11.5px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {t.macroHeatsinkTitle}
                  </h5>
                  <p className="text-[9.5px] text-slate-500 mt-0.5 leading-normal">
                    {t.macroHeatsinkSub}
                  </p>
                </div>
              </button>

              {/* Intelligent dynamic advisor */}
              <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-lg flex items-start gap-2.5 mt-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  <strong>{currentLanguage === 'vi' ? 'Khuyến nghị tự động SCADA AI:' : currentLanguage === 'zh' ? 'SCADA AI 智能推荐:' : 'Automatic SCADA AI Advice:'}</strong> {t.aiAdvice}
                </div>
              </div>
            </div>

            {/* Savings dashboard scoreboard */}
            <div className="bg-slate-950 border border-slate-900 p-3 pt-3.5 rounded-xl text-xs space-y-2 mt-4" id="energy-weekly-report-card">
              <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">{t.savingsTitle}</span>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10.5px]">
                <div className="bg-slate-900/30 p-2 border border-slate-900/80 rounded">
                  <span className="text-slate-400 text-[10px] tracking-tight">{t.savingsCost}</span>
                  <p className="font-bold text-blue-400 pt-0.5">{t.weeklySavingsCost}</p>
                </div>
                <div className="bg-slate-900/30 p-2 border border-slate-900/80 rounded">
                  <span className="text-slate-400 text-[10px] tracking-tight">{t.savingsCoal}</span>
                  <p className="font-bold text-green-400 pt-0.5">~185 kg</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. DYNAMIC ELECTRICAL GRID LOAD MATRICES LISTS */}
      <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg">
        
        {/* Header toolbar list filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/40">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4.5 h-4.5 text-blue-400" />
              <span>{t.stationLoadHeader}</span>
            </h3>
            <p className="text-[10px] text-slate-500">
              {t.stationLoadSub}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-2.5 text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder={t.searchPlaceholderDevice}
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="w-full bg-slate-950 text-white pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-900 outline-none focus:border-blue-500/50 placeholder-slate-500"
            />
          </div>
        </div>

        {/* CONTAINER AND GRID TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-905" id="energy-dynamic-datagrid">
          <table className="w-full text-left text-xs text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/65 font-mono text-[10px] text-slate-500 tracking-wider">
                <th className="p-3">{t.thStation}</th>
                <th className="p-3 text-right">{t.thPower}</th>
                <th className="p-3 text-right">{t.thVoltage}</th>
                <th className="p-3 text-right">{t.thCurrent}</th>
                <th className="p-3 text-right">{t.thFactor}</th>
                <th className="p-3 text-center">{t.thMode}</th>
                <th className="p-3 text-center">{t.thAction}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors">
                    
                    {/* Station code + human label */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400 font-bold">
                          {row.id}
                        </span>
                        <span className="text-slate-200 font-bold text-[11.5px]">{row.station}</span>
                      </div>
                    </td>

                    {/* Active draw kW */}
                    <td className="p-3 text-right font-mono font-bold text-slate-100">
                      {row.powerLoadKw.toFixed(2)}
                    </td>

                    {/* Voltage V */}
                    <td className="p-3 text-right font-mono text-slate-500">
                      {row.voltageV} V
                    </td>

                    {/* Current A */}
                    <td className="p-3 text-right font-mono text-slate-300">
                      {row.currentA} A
                    </td>

                    {/* Power factor */}
                    <td className="p-3 text-right font-mono">
                      <span className={row.powerFactorCos > 0.95 ? 'text-emerald-400 font-semibold' : 'text-amber-500'}>
                        {row.powerFactorCos.toFixed(2)}
                      </span>
                    </td>

                    {/* Eco mode state badge */}
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.ecoMode
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-900'
                      }`}>
                        {row.ecoMode ? t.statusEcoActive : t.statusPowerHigh}
                      </span>
                    </td>

                    {/* Interactive ECO control toggle switch */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleEco(row.id)}
                          className={`p-1.5 px-3 rounded text-[10.5px] font-bold cursor-pointer transition-colors ${
                            row.ecoMode
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25'
                              : 'bg-blue-600/10 hover:bg-blue-600/25 text-blue-400 border border-blue-500/25'
                          }`}
                        >
                          {row.ecoMode ? t.normalMode : t.btnToggleEco}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-500 italic">
                    {t.noStations}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
