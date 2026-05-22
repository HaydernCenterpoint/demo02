import React, { useState, useMemo, useEffect } from 'react';
import { Language, FlowStep } from '../types';
import { translations } from '../translations';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  CheckCircle,
  AlertOctagon,
  TrendingUp,
  Cpu,
  Clock,
  Settings,
  Sparkles,
  BarChart4,
  RefreshCw,
  Search,
  Filter,
  Check,
  FileCheck,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';

interface ReportsViewProps {
  currentLanguage: Language;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  triggerToast: (msg: string) => void;
  simulationActive: boolean;
}

interface ReportOutputRow {
  time: string;
  station: string;
  target: number;
  actual: number;
  yieldRate: number;
  oee: number;
  tempPeak: number;
  vibePeak: number;
  operator: string;
}

const localReportsTranslations = {
  vi: {
    title: 'Hệ thống Báo cáo & Phân tích Vận hành',
    subtitle: 'Tổng hợp phân tích OEE thiết bị trực quan, thống kê tỷ lệ khấu hao lỗi phế phẩm, lịch trình dừng lò PLC và xuất dữ liệu giao ca số của kỹ thuật viên.',
    filterPeriod: 'Thời gian báo cáo',
    filterLine: 'Phạm vi thiết bị',
    filterType: 'Loại phân tích',
    incSensor: 'Bao gồm chi tiết cảm biến',
    incAlarms: 'Đính kèm lịch sử cảnh báo',
    incOperator: 'Ghi kèm ghi chú vận hành viên',
    btnGenerate: 'Kết xuất báo cáo mới',
    btnExport: 'Tải báo cáo (.CSV / .PDF)',
    searchLabel: 'Tìm dòng sự vụ...',
    noResult: 'Không tìm thấy dòng tương ứng',
    colTime: 'Thời gian/Ca',
    colStation: 'Thiết bị/Trạm',
    colTarget: 'Định mức',
    colActual: 'Thực tế',
    colYield: 'Đạt chuẩn',
    colOEE: 'OEE (%)',
    colPeakTemp: 'Nhiệt độ đỉnh',
    colOperator: 'Kỹ sư trực ca',
    statTotal: 'Tổng sản phẩm',
    statScrap: 'Sản phẩm lỗi',
    statAvgOee: 'OEE Trung bình',
    statDowntime: 'Tổng dừng máy ca',
    optOee: 'Báo cáo OEE & Hiệu suất năng lượng',
    optErrors: 'Phân tích nhiệt độ & Dung số cơ cấu',
    optShift: 'Sổ giao ban kỹ thuật phân xưởng',
    periodToday: 'Hôm nay (Ca làm việc hiện tại)',
    periodWeek: '7 ngày qua (Tuần giao ca thứ 21)',
    periodMonth: '30 ngày qua (Quý II sản xuất)',
    lineAll: 'Tất cả các trạm máy (12 trạm PLC)',
    lineMain: 'Nhánh lắp ráp mạch chính (s1 - s9)',
    lineCasing: 'Nhánh dập vỏ thiết bị (sc1 - sc3)',
    autoInsights: 'Đề xuất phân tích thông minh từ SCADA AI',
    statusGenReady: 'Dữ liệu báo cáo sẵn sàng',
    toastProgress1: 'Đang kết xuất hệ thống dữ liệu...',
    toastProgress2: 'Tổng hợp biểu đồ OEE và nhiệt độ cơ khí...',
    toastProgress3: 'Chứng thực mã chữ ký vận hành CA...',
    toastSuccess: 'Xuất tệp báo cáo hoàn tất! Tải về máy thành công.',
    customNotes: 'Ghi chú bổ sung của quản lý ca trực',
    customNotesPlaceholder: 'Nhập ý kiến chỉ đạo, khắc phục sự cố, vật tư thay thế...',
    btnSaveNotes: 'Lưu ghi chú',
    toastSaveNotes: 'Đã lưu ghi chú chỉ đạo ca trực vào nhật ký SCADA!',
    chartYieldTitle: 'Định mức vs Sản lượng thực lãnh',
    chartOeeTitle: 'Xu hướng biên độ OEE từng bước (%)',
    exportingTitle: 'Đang chuẩn bị tệp tin báo cáo',
    exportingStep1: 'Bước 1: Truy xuất lịch sử cảm biến PLC...',
    exportingStep2: 'Bước 2: Đối chiếu OEE và tiêu thụ Watts năng lượng...',
    exportingStep3: 'Bước 3: Tổng hợp chữ ký số kỹ sư trực ban...',
    exportingStep4: 'Bước 4: Nén dữ liệu và ghi luồng nhị phân...',
    chartTarget: 'Mục tiêu thiết kế',
    chartActual: 'Thực tế sản xuất',
  },
  en: {
    title: 'Operational Reports & Performance Analytics',
    subtitle: 'Aggregate device-level OEE indices, calculate structural shift output variances, extract SCADA diagnostic telemetry trends, and compile PDF logbooks.',
    filterPeriod: 'Report Timeframe',
    filterLine: 'Equipment Boundary',
    filterType: 'Analytical Report Type',
    incSensor: 'Include detailed sensor logs',
    incAlarms: 'Attach SCADA alarms history',
    incOperator: 'Append Operator shift notes',
    btnGenerate: 'Compile New Dataset',
    btnExport: 'Export Report (.CSV / .PDF)',
    searchLabel: 'Search report logs...',
    noResult: 'No matching entries found',
    colTime: 'Time/Shift',
    colStation: 'Workstation Unit',
    colTarget: 'Quota Target',
    colActual: 'Actual Output',
    colYield: 'Quality Yield',
    colOEE: 'OEE (%)',
    colPeakTemp: 'Peak Temp',
    colOperator: 'Primary Specialist',
    statTotal: 'Acquired Volume',
    statScrap: 'Component Scrap',
    statAvgOee: 'Average OEE Index',
    statDowntime: 'Aggregated Downtime',
    optOee: 'OEE Performance & Power Footprint',
    optErrors: 'Thermal Stress & Structural Skew',
    optShift: 'Workshop Journal & Crew Transfer Log',
    periodToday: 'Today (Active Routine Shift)',
    periodWeek: 'Last 7 Days (Shift Week 21)',
    periodMonth: 'Last 30 Days (Production Q2)',
    lineAll: 'All Stations (12 Active Nodes)',
    lineMain: 'Main Core Assembly Line (s1 - s9)',
    lineCasing: 'Casing Assembly Branch (sc1 - sc3)',
    autoInsights: 'Scada AI Predictive Recommendations',
    statusGenReady: 'Reporting matrices compiled',
    toastProgress1: 'Initializing master database query...',
    toastProgress2: 'Translating OEE curves and thermal trends...',
    toastProgress3: 'Validating cryptographic operator signatures...',
    toastSuccess: 'Report compilation successful! File downloaded.',
    customNotes: 'Supplementary Shift Director Notes',
    customNotesPlaceholder: 'Identify critical bottlenecks, replacement parts, or process corrections...',
    btnSaveNotes: 'Pin Notes',
    toastSaveNotes: 'Analytical directives saved in industrial database!',
    chartYieldTitle: 'Target Quota vs Executed Output',
    chartOeeTitle: 'Aggregate OEE Trend by Process Step (%)',
    exportingTitle: 'Preparing Document Layout',
    exportingStep1: 'Step 1: Pulling raw PLC sensor registry...',
    exportingStep2: 'Step 2: Calibrating OEE score against watts indices...',
    exportingStep3: 'Step 3: Certifying token signature credentials...',
    exportingStep4: 'Step 4: Compressing structural bytes and writing blocks...',
    chartTarget: 'Design Target',
    chartActual: 'Actual Output',
  },
  zh: {
    title: '设备运营报告与数据分析中心',
    subtitle: '统计多级OEE百分比，分析不合格率劣化趋势，汇总SCADA系统停机报警，导出车间数字化交接班机组报告。',
    filterPeriod: '报告统计时段',
    filterLine: '设备覆盖边界',
    filterType: '分析业务类别',
    incSensor: '包含传感器瞬时日志',
    incAlarms: '附带SCADA报警事件',
    incOperator: '加注值班主管交班日志',
    btnGenerate: '重新生成分析数据',
    btnExport: '下载分析文档 (.CSV / .PDF)',
    searchLabel: '搜索报告细节...',
    noResult: '未查找到符合条件的历史数据',
    colTime: '时间段/班次',
    colStation: '工艺工作站',
    colTarget: '产线设计指标',
    colActual: '实际产出数量',
    colYield: '合格率 (%)',
    colOEE: '局部OEE (%)',
    colPeakTemp: '主轴最高温度',
    colOperator: '值班负责人',
    statTotal: '总合格件累计',
    statScrap: '废品损耗损耗',
    statAvgOee: '综合平均OEE',
    statDowntime: '非计划停机累计',
    optOee: 'OEE综合稼动率及能耗效率分析',
    optErrors: '热振应力与轴承机械零偏诊断',
    optShift: '车间生产交接班记录提要',
    periodToday: '今天 (当前正在生产的班组)',
    periodWeek: '最近7天 (生产执行第21周)',
    periodMonth: '最近30天 (第二季度生产大盘)',
    lineAll: '全部12个主PLC控制器',
    lineMain: '核心传感器主流水线 (s1 - s9)',
    lineCasing: '外壳及自动注螺栓副线 (sc1 - sc3)',
    autoInsights: 'Scada AI 工业智能诊断预测',
    statusGenReady: '报告基准数据集构建完成',
    toastProgress1: '正在对PLC底层数据库执行读写寻址...',
    toastProgress2: '正在建立OEE效率及热态参数多线性映射轴...',
    toastProgress3: '正在加载大班长安全认证哈希签章...',
    toastSuccess: '报告归档文件打包完毕，客户端下载已激活。',
    customNotes: '生产指挥调度补充批注意见',
    customNotesPlaceholder: '在此处下达关于工艺流程改进，设备更换或工装换型指引...',
    btnSaveNotes: '保存附加批注',
    toastSaveNotes: '主管运营纠偏指令已经注入SCADA后台数据库日志！',
    chartYieldTitle: '设计配额与实际产量对照',
    chartOeeTitle: '各工艺环节OEE变化曲线 (%)',
    exportingTitle: '正在打包导出高维分析数据',
    exportingStep1: '步骤 1: 正在拉取底层PLC寄存器原始报文...',
    exportingStep2: '步骤 2: 耦合折算设备运转能耗与物理负载系数...',
    exportingStep3: '步骤 3: 附加大班组长及当班工程师电子安全钥匙校验...',
    exportingStep4: '步骤 4: 文件高压压缩打包并开启前端浏览器安全导出...',
    chartTarget: '设计产能基线',
    chartActual: '实际生产体积',
  }
};

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentLanguage,
  steps,
  setSteps,
  triggerToast,
  simulationActive
}) => {
  const t = localReportsTranslations[currentLanguage];
  const commonT = translations[currentLanguage];

  // UI Interactive States
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [lineFilter, setLineFilter] = useState<'all' | 'main' | 'casing'>('all');
  const [reportType, setReportType] = useState<'oee' | 'errors' | 'shift'>('oee');

  // Checklist configs
  const [includeSensor, setIncludeSensor] = useState<boolean>(true);
  const [includeAlarms, setIncludeAlarms] = useState<boolean>(true);
  const [includeOperator, setIncludeOperator] = useState<boolean>(true);

  // Search input
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Manager custom notes
  const [managerInput, setManagerInput] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  // Export Modal simulation progress
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStepText, setExportStepText] = useState<string>('');

  // Re-run animation/shake to fetch custom report indicator
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Trigger manual dataset regeneration
  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      triggerToast(t.statusGenReady);
    }, 900);
  };

  // Save customized memo
  const handleSaveNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerInput.trim()) return;
    setSavedNotes((prev) => [managerInput.trim(), ...prev]);
    setManagerInput('');
    triggerToast(t.toastSaveNotes);
  };

  // Simulating an exporting procedure with realistic state machine progress
  const handleExportTrigger = () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportStepText(t.exportingStep1);

    const timeouts = [
      setTimeout(() => {
        setExportProgress(40);
        setExportStepText(t.exportingStep2);
      }, 700),
      setTimeout(() => {
        setExportProgress(75);
        setExportStepText(t.exportingStep3);
      }, 1500),
      setTimeout(() => {
        setExportProgress(95);
        setExportStepText(t.exportingStep4);
      }, 2300),
      setTimeout(() => {
        setExportProgress(100);
        setIsExporting(false);
        triggerToast(t.toastSuccess);
      }, 3000)
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  // Raw mock logs driven by steps state for ultra-cohesion
  const reportsDatabase = useMemo<ReportOutputRow[]>(() => {
    const output: ReportOutputRow[] = [];
    
    // Generates virtual shift reports that are linked to actual UI component states
    steps.forEach((step, idx) => {
      // Line mapping logic based on branch
      const isMain = step.branch !== 'casing';
      
      // Target capacities based on design limits
      const designTarget = step.id.startsWith('sc') ? 2200 : 3500;
      
      // Calculate output dependent on step status
      let efficiencyRatio = 1.0;
      if (step.status === 'stopped') efficiencyRatio = 0.0;
      else if (step.status === 'error') efficiencyRatio = 0.25;
      else if (step.status === 'warning') efficiencyRatio = 0.78;
      else if (step.status === 'maintenance') efficiencyRatio = 0.40;

      const actualOut = Math.round(designTarget * (step.oee / 100) * efficiencyRatio);
      const scrapFactor = step.status === 'error' ? 0.912 : step.status === 'warning' ? 0.965 : 0.994;
      const yielded = Math.round(actualOut * scrapFactor);
      
      // Peak metrics
      const tempP = Math.max(step.temp, step.temp + (step.status === 'error' ? 12 : 2.5));
      const vibeP = parseFloat((step.vibration + (step.status === 'warning' ? 0.65 : 0.08)).toFixed(2));

      // Append items 
      output.push({
        time: idx % 2 === 0 ? '06:00 - 14:00 (Ca Sáng)' : '14:00 - 22:00 (Ca Chiều)',
        station: commonT[step.labelKey] as string,
        target: designTarget,
        actual: actualOut,
        yieldRate: actualOut > 0 ? parseFloat(((yielded / actualOut) * 100).toFixed(1)) : 0.0,
        oee: step.oee,
        tempPeak: tempP,
        vibePeak: vibeP,
        operator: step.operator || 'Kỹ sư SCADA'
      });
    });

    return output;
  }, [steps, commonT]);

  // Derived dashboard sums from calculated entries
  const sums = useMemo(() => {
    let totTarget = 0;
    let totActual = 0;
    let totYield = 0;
    let totOee = 0;
    let count = 0;

    reportsDatabase.forEach((r) => {
      // Filters driven by UI selection
      const isCasing = r.station.toLowerCase().includes('vỏ') || r.station.toLowerCase().includes('casing') || r.station.toLowerCase().includes('bolt');
      
      if (lineFilter === 'main' && isCasing) return;
      if (lineFilter === 'casing' && !isCasing) return;

      totTarget += r.target;
      totActual += r.actual;
      totYield += Math.round(r.actual * (r.yieldRate / 100));
      totOee += r.oee;
      count++;
    });

    if (count === 0) count = 1;

    // Apply different multipliers for Week & Month to show higher sums
    const factor = period === 'week' ? 7 : period === 'month' ? 30 : 1;

    const avgOee = Math.round(totOee / count);
    const scrapCount = Math.round((totActual - totYield) * factor);
    const downtimeHours = steps.filter(s => s.status !== 'running').length * 1.5 * factor;

    return {
      totalOutput: totActual * factor,
      scrap: scrapCount,
      avgOee: steps.length > 0 ? Math.round(steps.reduce((acc, s) => acc + s.oee, 0) / steps.length) : avgOee,
      downtime: downtimeHours
    };
  }, [reportsDatabase, lineFilter, period, steps]);

  // Filtering reports list on search input
  const filteredRows = useMemo(() => {
    return reportsDatabase.filter((row) => {
      // Matches both time, station, and operator names
      const matchText = `${row.time} ${row.station} ${row.operator}`.toLowerCase();
      
      // Filter out elements based on Line layout
      const isCasing = row.station.toLowerCase().includes('vỏ') || row.station.toLowerCase().includes('casing') || row.station.toLowerCase().includes('bolt');
      if (lineFilter === 'main' && isCasing) return false;
      if (lineFilter === 'casing' && !isCasing) return false;

      return matchText.includes(searchQuery.toLowerCase());
    });
  }, [reportsDatabase, searchQuery, lineFilter]);

  // SVG Chart points calculations
  const yieldChartPoints = useMemo(() => {
    // Return coordinate points for target vs actual comparing
    const maxEntries = 6;
    const slices = filteredRows.slice(0, maxEntries);
    const chartW = 420;
    const chartH = 150;
    const pad = 30;

    return slices.map((row, idx) => {
      const x = pad + (idx / (maxEntries - 1)) * (chartW - 2 * pad);
      // Normalized to percentage of 4000 target units 
      const yTarget = chartH - pad - (row.target / 4000) * (chartH - 2 * pad);
      const yActual = chartH - pad - (row.actual / 4000) * (chartH - 2 * pad);

      return {
        x,
        targetY: Math.max(pad, Math.min(chartH - pad, yTarget)),
        actualY: Math.max(pad, Math.min(chartH - pad, yActual)),
        label: row.station.substring(0, 8) + '..'
      };
    });
  }, [filteredRows]);

  // AI Recommendation Insights block
  const aiDiagnosticsText = useMemo(() => {
    const errorStepsCount = steps.filter(s => s.status === 'error').length;
    const warnStepsCount = steps.filter(s => s.status === 'warning').length;

    if (currentLanguage === 'vi') {
      if (errorStepsCount > 0) {
        return `Phát hiện ${errorStepsCount} trạm đang ghi nhận mã lỗi đột ngột. SCADA đề xuất ưu tiên xả van áp suất khí nén và giảm tốc băng tải phụ xuống 12% để bảo vệ kết cấu cơ học trước khi truy xuất phiếu biên bản.`;
      }
      if (warnStepsCount > 0) {
        return `Hệ thống ghi nhận dấu hiệu trễ dung sai ở trạm phụ s6. Cường độ rung đạt ngưỡng ${steps[5]?.vibration.toFixed(2)} mm/s. Khuyến nghị bơm mỡ móng trượt trạm 6 tự động trước giờ giao ca tiếp theo.`;
      }
      return 'Chỉ số OEE đồng đều đạt trung bình trên 92%. Dòng tải lưới điện biến thiên nhẹ ở mức 14.5 Amps (Ổn định). Chưa phát hiện bất thường cơ học nào cần bóc lách báo cáo.';
    } else if (currentLanguage === 'zh') {
      if (errorStepsCount > 0) {
        return `监测到当前有 ${errorStepsCount} 个设备正处于报警离线状态。SCADA AI智能系统建议降低整条传送带的循环速度（推荐降速12%），进行局部限载，以防温度应力进一步扩散。`;
      }
      return '当前12个智能PLC控制点处于平滑运转模式。系统各项物理指标正常，综合能耗指标在绿色区间，无需进行工艺规程纠偏拦截。';
    } else {
      if (errorStepsCount > 0) {
        return `Thermal stresses spiked on ${errorStepsCount} units during this active log shift lifecycle. Recommend pneumatic vacuum checks and reducing feeder cycle limits by 12% immediately.`;
      }
      return 'All monitored gear drives are running within certified physical boundaries. Overall line OEE remains solid at ' + sums.avgOee + '%. No emergency maintenance schedules are recommended.';
    }
  }, [steps, currentLanguage, sums.avgOee]);

  return (
    <div className="space-y-6 animate-fadeIn" id="reports-view-root">
      
      {/* 1. HEADER LOGO BLOCK */}
      <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5" id="reports-banner-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5.5 h-5.5 text-blue-500" />
              <span>{t.title}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-4xl leading-normal">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            {/* Generate dataset button */}
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className={`p-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-lg cursor-pointer hover:bg-slate-850/80 transition-all flex items-center gap-2 ${
                isRegenerating ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{t.btnGenerate}</span>
            </button>

            {/* Export action */}
            <button
              onClick={handleExportTrigger}
              className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all hover:shadow-blue-500/10 active:scale-98 flex items-center gap-2 shadow"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>{t.btnExport}</span>
            </button>
          </div>
        </div>

        {/* CONTROLLER FILTERS RULER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800/40" id="reports-filters-row">
          
          {/* Period Filter */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.filterPeriod}</span>
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800/80 outline-none cursor-pointer focus:border-blue-500/50"
            >
              <option value="today">📅 {t.periodToday}</option>
              <option value="week">📅 {t.periodWeek}</option>
              <option value="month">📅 {t.periodMonth}</option>
            </select>
          </div>

          {/* Line boundary filter */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.filterLine}</span>
            </label>
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value as any)}
              className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800/80 outline-none cursor-pointer focus:border-emerald-500/50"
            >
              <option value="all">🏭 {t.lineAll}</option>
              <option value="main">🏭 {t.lineMain}</option>
              <option value="casing">🏭 {t.lineCasing}</option>
            </select>
          </div>

          {/* Analysis mode */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <BarChart4 className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.filterType}</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-lg border border-slate-800/80 outline-none cursor-pointer focus:border-purple-500/50"
            >
              <option value="oee">⚡ {t.optOee}</option>
              <option value="errors">📐 {t.optErrors}</option>
              <option value="shift">📝 {t.optShift}</option>
            </select>
          </div>

        </div>

        {/* ADVANCED CHECKBOXES */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[11px] text-slate-400" id="reports-adv-toggles">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSensor}
              onChange={(e) => setIncludeSensor(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className={includeSensor ? 'text-slate-100 font-semibold' : ''}>{t.incSensor}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeAlarms}
              onChange={(e) => setIncludeAlarms(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className={includeAlarms ? 'text-slate-100 font-semibold' : ''}>{t.incAlarms}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeOperator}
              onChange={(e) => setIncludeOperator(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className={includeOperator ? 'text-slate-100 font-semibold' : ''}>{t.incOperator}</span>
          </label>
        </div>
      </div>

      {/* 2. DYNAMIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="reports-kpi-summary">
        {/* Metric 1 */}
        <div className="bg-slate-900/35 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{t.statTotal}</span>
            <h4 className="text-xl font-mono font-bold text-slate-100">{sums.totalOutput.toLocaleString()}</h4>
            <span className="text-[9px] text-slate-400">{commonT.units}</span>
          </div>
          <div className="p-2.2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/15">
            <Cpu className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/35 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{t.statScrap}</span>
            <h4 className="text-xl font-mono font-bold text-amber-500">{sums.scrap.toLocaleString()}</h4>
            <span className="text-[9px] text-slate-500">{commonT.units}</span>
          </div>
          <div className="p-2.2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/15">
            <AlertOctagon className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/35 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{t.statAvgOee}</span>
            <h4 className="text-xl font-mono font-bold text-emerald-400">{sums.avgOee}%</h4>
            <span className="text-[9px] text-emerald-500/80">OEE trung vị</span>
          </div>
          <div className="p-2.2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/35 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{t.statDowntime}</span>
            <h4 className="text-xl font-mono font-bold text-purple-400">{sums.downtime}h</h4>
            <span className="text-[9px] text-slate-400">Trễ thao tác lò rèn</span>
          </div>
          <div className="p-2.2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/15">
            <Clock className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* 3. CHART AND PREDICTIONS DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="reports-charts-and-insights">
        
        {/* Left 2 Cols: Custom SVG Charts for data representation */}
        <div className="lg:col-span-2 bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reports-inner-charts">
            
            {/* Box 1: Design vs Actual Bar comparison */}
            <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>{t.chartYieldTitle}</span>
              </h4>
              
              {/* Custom SVG Column Comparison block */}
              <div className="relative pt-2">
                <svg viewBox="0 0 420 160" className="w-full h-36 overflow-visible">
                  {/* Grid lines */}
                  <line x1="25" y1="20" x2="400" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="25" y1="70" x2="400" y2="70" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="25" y1="120" x2="400" y2="120" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

                  {/* Horizontal labels */}
                  <text x="5" y="24" className="text-[8px] font-mono fill-slate-500">4k</text>
                  <text x="5" y="74" className="text-[8px] font-mono fill-slate-500">2k</text>
                  <text x="5" y="124" className="text-[8px] font-mono fill-slate-500">0</text>

                  {/* Columns */}
                  {yieldChartPoints.map((pt, idx) => (
                    <g key={idx}>
                      {/* Target Column */}
                      <rect
                        x={pt.x - 8}
                        y={pt.targetY}
                        width="7"
                        height={120 - pt.targetY}
                        className="fill-slate-700/60 transition-all duration-300"
                        rx="1"
                      />
                      {/* Actual Column */}
                      <rect
                        x={pt.x}
                        y={pt.actualY}
                        width="7"
                        height={120 - pt.actualY}
                        className="fill-blue-500 hover:fill-blue-400 transition-all duration-300"
                        rx="1"
                      />
                      {/* Station title labels */}
                      <text
                        x={pt.x}
                        y="136"
                        textAnchor="middle"
                        className="text-[8px] font-mono fill-slate-400"
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Legends */}
                <div className="flex justify-center gap-6 mt-2 text-[9.5px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-slate-700 rounded-sm"></span>
                    <span className="text-slate-400">{t.chartTarget}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
                    <span className="text-slate-400">{t.chartActual}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Box 2: Line graph for aggregate OEE step trend */}
            <div className="space-y-3 bg-slate-950/20 p-4 rounded-xl border border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>{t.chartOeeTitle}</span>
              </h4>

              {/* Responsive SVG Line Chart */}
              <div className="relative pt-2">
                <svg viewBox="0 0 420 160" className="w-full h-36 overflow-visible">
                  {/* Levels */}
                  <line x1="25" y1="20" x2="400" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="25" y1="70" x2="400" y2="70" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="25" y1="120" x2="400" y2="120" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />

                  {/* Y Axis labels */}
                  <text x="5" y="24" className="text-[8px] font-mono fill-slate-500">100%</text>
                  <text x="5" y="74" className="text-[8px] font-mono fill-slate-500">50%</text>
                  <text x="5" y="124" className="text-[8px] font-mono fill-slate-500">0%</text>

                  {/* Area underneath line */}
                  {yieldChartPoints.length > 0 && (
                    <path
                      d={`M ${yieldChartPoints[0].x} 120
                          ${yieldChartPoints.map(pt => `L ${pt.x} ${pt.actualY - 10}`).join(' ')}
                          L ${yieldChartPoints[yieldChartPoints.length - 1].x} 120 Z`}
                      fill="url(#gold-area-gradient)"
                      opacity="0.12"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Trend Line representing OEE shifts */}
                  {yieldChartPoints.length > 0 && (
                    <path
                      d={`M ${yieldChartPoints[0].x} ${yieldChartPoints[0].actualY - 10} 
                          ${yieldChartPoints.map(pt => `L ${pt.x} ${pt.actualY - 10}`).join(' ')}`}
                      className="stroke-emerald-400 transition-all duration-300"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Dynamic Hot dots */}
                  {yieldChartPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.actualY - 10}
                      r="3.5"
                      className="fill-slate-950 stroke-emerald-400 stroke transition-transform duration-300 hover:scale-130 cursor-pointer"
                    />
                  ))}

                  {/* Labels x-axis */}
                  {yieldChartPoints.map((pt, idx) => (
                    <text
                      key={idx}
                      x={pt.x}
                      y="136"
                      textAnchor="middle"
                      className="text-[8px] font-mono fill-slate-400"
                    >
                      {pt.label}
                    </text>
                  ))}

                  {/* Definitions of Gradients */}
                  <defs>
                    <linearGradient id="gold-area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Legend index marker */}
                <div className="flex justify-center items-center gap-1.5 mt-2 text-[9.5px]">
                  <span className="w-5 h-0.5 bg-emerald-400"></span>
                  <span className="text-slate-400">OEE Trạm Máy</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Right 1 Col: AI insights recommendations and supplementary director logs form */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* AI Insights panel */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-800/40 pb-2.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {t.autoInsights}
              </h4>
            </div>

            <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-xs leading-relaxed text-slate-300">
              {aiDiagnosticsText}
            </div>

            {/* Smart tags values */}
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="bg-slate-950/80 text-blue-400 py-0.5 px-2 rounded border border-slate-900">
                #OEE_NORM
              </span>
              <span className="bg-slate-950/80 text-emerald-400 py-0.5 px-2 rounded border border-slate-900">
                #WATTS_STABILIZED
              </span>
              <span className="bg-slate-950/80 text-purple-400 py-0.5 px-2 rounded border border-slate-900">
                #PREVENTATIVE_OK
              </span>
            </div>
          </div>

          {/* Manager supplemental instructions panel */}
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4.5 h-4.5 text-blue-400" />
              <span>{t.customNotes}</span>
            </h4>

            {/* Form */}
            <form onSubmit={handleSaveNotesSubmit} className="space-y-3">
              <textarea
                value={managerInput}
                onChange={(e) => setManagerInput(e.target.value)}
                placeholder={t.customNotesPlaceholder}
                className="w-full bg-slate-950 hover:bg-slate-950/80 text-xs p-3 rounded-lg border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 min-h-[60px] max-h-[140px] resize-y"
              />

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-850 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                {t.btnSaveNotes}
              </button>
            </form>

            {/* Render list of active notes pin feed */}
            {savedNotes.length > 0 && (
              <div className="space-y-2 max-h-[120px] overflow-y-auto customize-scrollbar pt-2 border-t border-slate-900">
                {savedNotes.map((note, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-900/40 relative group">
                    <p className="text-[10.5px] text-slate-300 italic">"{note}"</p>
                    <div className="text-[9px] text-slate-500 mt-1.5 flex justify-between items-center">
                      <span>Kỹ sư SCADA</span>
                      <span>15:40</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 4. CORE SCADA REPORTS LOGS DATA TABLE */}
      <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 shadow-lg">
        
        {/* Table Head Filters bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800/40">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <FileCheck className="w-4.5 h-4.5 text-blue-400" />
              <span>
                {reportType === 'oee' ? t.optOee : reportType === 'errors' ? t.optErrors : t.optShift}
              </span>
            </h3>
            <p className="text-[10.5px] text-slate-500">
              {filteredRows.length} {commonT.units} ghi nhận trong dòng thời gian
            </p>
          </div>

          {/* Search box within reports logs */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-2.5 text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder={t.searchLabel}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-white pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-900 outline-none focus:border-blue-500/50 placeholder-slate-500"
            />
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="overflow-x-auto rounded-xl border border-slate-900/60 min-h-[170px]" id="reports-datagrid">
          <table className="w-full text-left text-xs text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/65 font-mono text-[10px] text-slate-500 tracking-wider">
                <th className="p-3">{t.colTime}</th>
                <th className="p-3">{t.colStation}</th>
                <th className="p-3 text-right">{t.colTarget}</th>
                <th className="p-3 text-right">{t.colActual}</th>
                <th className="p-3 text-right">{t.colYield}</th>
                <th className="p-3 text-right">{t.colOEE}</th>
                <th className="p-3 text-right">{t.colPeakTemp}</th>
                <th className="p-3">{t.colOperator}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors">
                    <td className="p-3 text-slate-300 font-medium whitespace-nowrap">{row.time}</td>
                    <td className="p-3 text-blue-400 font-bold max-w-[130px] truncate">{row.station}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{row.target.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-slate-300">
                      {row.actual > 0 ? row.actual.toLocaleString() : <span className="text-red-500">0</span>}
                    </td>
                    <td className="p-3 text-right font-mono">
                      <span className={row.yieldRate > 98 ? 'text-emerald-400' : 'text-amber-500'}>
                        {row.yieldRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      <span className={row.oee > 85 ? 'text-emerald-400' : 'text-red-400'}>
                        {row.oee}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {row.tempPeak.toFixed(1)} °C
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] truncate max-w-[100px]">{row.operator}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-500 italic">
                    {t.noResult}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 5. PDF & EXCEL SIMULATION EXPORTING POPUP MODAL */}
      {isExporting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="exporting-modal">
          <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scaleIn">
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/15 animate-bounce">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {t.exportingTitle}
                </h4>
                <p className="text-[10px] text-slate-500">FII Analytical Engines</p>
              </div>
            </div>

            {/* Numerical Progress bar wrapper */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-blue-400 font-semibold truncate animate-pulse">{exportStepText}</span>
                <span className="text-slate-300 font-bold">{exportProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>

            {/* Instruction footnote logs */}
            <div className="p-3 rounded bg-slate-950/40 text-[9px] text-slate-500 font-mono leading-relaxed uppercase border border-slate-900">
              [SCADA-SYSTEM]: DUMPING MEMBLOCK TO BUFFER TYPE.PDF_UTF8 <br />
              [PLC-COUPLE]: 12 NODES PACKETS RECEIVED IN 0.04S <br />
              [INTEGRITY-KEY]: SECURED WITH TLS_ECDHE_RSA_SHA256
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
