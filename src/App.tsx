import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LanguageSelector } from './components/LanguageSelector';
import { MetricCard } from './components/MetricCard';
import { FlowDiagram } from './components/FlowDiagram';
import { AlertsSection } from './components/AlertsSection';
import { ChartsSection } from './components/ChartsSection';
import { ProductionLinesView } from './components/ProductionLinesView';
import { DevicesView } from './components/DevicesView';
import { AlertsView } from './components/AlertsView';
import { TasksView } from './components/TasksView';
import { MaintenanceView } from './components/MaintenanceView';
import { ReportsView } from './components/ReportsView';
import { EnergyView } from './components/EnergyView';
import { SettingsView } from './components/SettingsView';
import { translations } from './translations';
import {
  initialSteps,
  initialAlerts,
  initialHourlyPerformance,
  initialFaultyDevices,
  initialCommonErrors,
  initialTaskStatuses,
} from './data';
import { Language, FlowStep, StatusType, AlertItem } from './types';
import {
  Bell,
  Calendar,
  Maximize2,
  ChevronDown,
  Activity,
  TriangleAlert,
  Settings,
  Info,
  Check,
  AlertOctagon,
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('vi');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string>('overview');
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Interactive State
  const [steps, setSteps] = useState<FlowStep[]>(initialSteps);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [selectedStep, setSelectedStep] = useState<FlowStep | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live simulation variables counter
  const [yieldCounter, setYieldCounter] = useState<number>(12540);
  const [extraOeeShift, setExtraOeeShift] = useState<number>(0);
  const [defectCounter, setDefectCounter] = useState<number>(12);

  const t = translations[language];

  // Derived counts for sidebar and top bar
  const runningCount = steps.filter((s) => s.status === 'running').length;
  const stoppedCount = steps.filter((s) => s.status === 'stopped').length;
  const warningCount = steps.filter((s) => s.status === 'warning').length;
  const errorCount = steps.filter((s) => s.status === 'error').length;
  const maintenanceCount = steps.filter((s) => s.status === 'maintenance').length;

  // Active alarms count
  const activeAlarmsCount = alerts.filter((a) => !a.isResolved).length;

  // Trigger Toast function
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Real-time ticking clock hook with clean memory leak prevention
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRealTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    const hour = date.getHours();
    const minute = date.getMinutes();
    const totalMinutes = hour * 60 + minute;
    
    // Day shift limits: 07:30 (450 mins) to 19:30 (1170 mins)
    const isDayShift = totalMinutes >= 450 && totalMinutes < 1170;

    let shiftText = '';
    if (language === 'vi') {
      shiftText = isDayShift ? 'Ca ngày (07:30 - 19:30)' : 'Ca đêm (19:30 - 07:30)';
    } else if (language === 'zh') {
      shiftText = isDayShift ? '白班 (07:30 - 19:30)' : '夜班 (19:30 - 07:30)';
    } else {
      shiftText = isDayShift ? 'Day Shift (07:30 - 19:30)' : 'Night Shift (19:30 - 07:30)';
    }

    return `${formattedDateTime} - ${shiftText}`;
  };

  // Sensor drift simulation hook (Updates numbers every 3.5 seconds if active)
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      // 1. Simulate production products progress increment
      setYieldCounter((prev) => prev + Math.floor(Math.random() * 2) + 1);

      // 2. Slightly fluctuate temperature and vibration levels
      setSteps((prevSteps) => {
        return prevSteps.map((step) => {
          if (step.status === 'stopped') return step;

          // Introduce small variations
          const tempDelta = (Math.random() - 0.5) * 1.5;
          const vibDelta = (Math.random() - 0.5) * 0.3;
          let nextTemp = step.temp + tempDelta;
          let nextVib = step.vibration + vibDelta;

          // Enforce physical bounds
          if (nextTemp < 20) nextTemp = 20;
          if (nextVib < 0.1) nextVib = 0.1;

          // If over-shaking, could elevate warning triggers
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
      });

      // 3. Fluctuate global OEE slightly
      setExtraOeeShift((prev) => prev + (Math.random() - 0.5) * 0.4);
    }, 3500);

    return () => clearInterval(interval);
  }, [simulationActive]);

  // Sync selectedStep details view when list state changes
  useEffect(() => {
    if (selectedStep) {
      const currentValueState = steps.find((s) => s.id === selectedStep.id);
      if (currentValueState) {
        setSelectedStep(currentValueState);
      }
    }
  }, [steps, selectedStep?.id]);

  // Handle single-step diagnostic clicks
  const handleStepClick = (step: FlowStep) => {
    setSelectedStep(step);
  };

  const handleCloseStepDetails = () => {
    setSelectedStep(null);
  };

  // Update specific step status (running, stopped, maintenance, warns, error)
  const handleUpdateStepStatus = (stepId: string, newStatus: StatusType) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === stepId) {
          // Adjust sensors to fit status context
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
      })
    );
    triggerToast(t.addAlertToast);
  };

  // Turn off / resolve specific active alarm
  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isResolved: true } : a))
    );
    // Decrease defect category count sometimes
    setDefectCounter((prev) => Math.max(0, prev - 1));
    triggerToast(t.alertResolved);
  };

  // Resolve all active alarms at once
  const handleResolveAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isResolved: true })));
    setDefectCounter(0);
    triggerToast(language === 'vi' ? 'Đã xử lý tất cả cảnh báo thành công!' : language === 'zh' ? '已成功处理所有警报！' : 'All alerts resolved successfully!');
  };

  // Inject dynamic user-triggered simulated warning
  const handleSimulateAlert = () => {
    const hours = new Date().getHours().toString().padStart(2, '0');
    const minutes = new Date().getMinutes().toString().padStart(2, '0');
    const timeText = `${hours}:${minutes}`;

    const simOptions: { title: keyof typeof t; sub: keyof typeof t; status: 'warning' | 'error' }[] = [
      { title: 'alertTempError', sub: 'alertTempErrorSub', status: 'warning' },
      { title: 'alertServoError', sub: 'alertServoErrorSub', status: 'error' },
      { title: 'alertMaterialShortage', sub: 'alertMaterialShortageSub', status: 'warning' },
    ];

    const pick = simOptions[Math.floor(Math.random() * simOptions.length)];

    const newAlert: AlertItem = {
      id: `sim-a-${Date.now()}`,
      titleKey: pick.title as any,
      subKey: pick.sub as any,
      status: pick.status,
      time: timeText,
      isResolved: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setDefectCounter((prev) => prev + 1);

    // Turn step index 5 or 6 to hot temperatures so it aligns visually with the flow
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === 's6') {
          return { ...s, status: 'error', temp: 88.5, vibration: 7.2 };
        }
        return s;
      })
    );

    triggerToast(t.addAlertToast);
  };

  // Toggle visual fullscreen simulation in preview or browser iframe
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Derived dashboard percentages
  const liveOeeAvg = parseFloat((78.6 + extraOeeShift).toFixed(1));
  const liveDefectPercent = parseFloat((0.35 + (defectCounter - 12) * 0.02).toFixed(2));

  return (
    <div
      className="bg-[#090d16] font-sans text-slate-100 flex h-screen overflow-hidden antialiased select-none"
      id="app-main-layout"
    >
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div
          id="system-toast-hud"
          className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-blue-600 border border-blue-400 text-white py-2 px-5 rounded-full text-xs font-semibold z-50 flex items-center space-x-2 shadow-2xl cursor-pointer"
          onClick={() => setToastMessage(null)}
        >
          <Activity className="w-4 h-4 animate-spin-slow text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Embedded Left Side Panel */}
      <Sidebar
        currentLanguage={language}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        runningCount={runningCount}
        stoppedCount={stoppedCount}
        warningCount={warningCount}
        errorCount={errorCount}
        maintenanceCount={maintenanceCount}
      />

      {/* Right Side Main View Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto" id="main-content-flow">
        {/* TOP BAR / Header Navigation */}
        <header
          id="global-header-bar"
          className="h-16 border-b border-slate-800/60 bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0"
        >
          {/* Dashboard Titles column */}
          <div className="flex flex-col">
            <h1 className="text-white text-base md:text-lg font-bold tracking-tight select-none flex items-center gap-2">
              <span>{t.systemOverview}</span>
              {simulationActive && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse uppercase">
                  SIM LIVE
                </span>
              )}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium">
              {t.systemOverviewSub}
            </p>
          </div>

          {/* Action Row buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Simulation Mode controls */}
            <button
              id="btn-trigger-simulator-toggle"
              onClick={() => {
                setSimulationActive(!simulationActive);
                triggerToast(simulationActive ? t.simulationPaused : t.simulationActive);
              }}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                simulationActive
                  ? 'bg-blue-600/15 border-blue-500/35 text-blue-400 hover:bg-blue-600/20'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${simulationActive ? 'animate-pulse text-blue-400' : ''}`} />
              <span>{simulationActive ? t.simulationActive : t.simulationPaused}</span>
            </button>

            {/* Language Selection Buttons */}
            <LanguageSelector currentLanguage={language} onLanguageChange={(l) => setLanguage(l)} />

            {/* Factory Selector Dropdown Pill */}
            <div className="hidden md:flex items-center space-x-1 py-1.5 px-3 bg-[#111827] border border-slate-800 rounded-lg text-xs font-medium text-slate-300">
              <span>{t.factorySelector}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            {/* Shift hours indicator */}
            <div className="hidden lg:flex items-center space-x-2.5 py-1.5 px-3 bg-[#111827] border border-slate-800 rounded-lg text-xs font-medium text-slate-300 select-none">
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-slate-200 font-semibold tracking-wide">
                {formatRealTime(currentTime)}
              </span>
            </div>

            {/* Interactive Bell Alert Notifications with Dynamic Badge count */}
            <div className="relative" id="notification-bell-header">
              <div 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 bg-slate-900 border rounded-lg hover:border-slate-700/80 transition-all text-slate-400 hover:text-slate-200 cursor-pointer ${notificationsOpen ? 'border-blue-500 text-blue-400 bg-slate-950 shadow-md shadow-blue-500/10' : 'border-slate-800'}`}
              >
                <Bell className="w-4 h-4" />
              </div>
              {activeAlarmsCount > 0 && (
                <span 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-4 border border-[#090d16] animate-bounce cursor-pointer"
                >
                  {activeAlarmsCount}
                </span>
              )}

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-[#0f1422]/98 backdrop-blur-lg border border-slate-800/90 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn select-none cursor-default">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Bell className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-xs text-white uppercase tracking-wider">
                          {language === 'vi' ? 'Thông báo hệ thống' : language === 'zh' ? '系统通知' : 'System Notifications'}
                        </span>
                      </div>
                      {activeAlarmsCount > 0 && (
                        <button
                          onClick={handleResolveAllAlerts}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                        >
                          {language === 'vi' ? 'Xử lý tất cả' : language === 'zh' ? '处理全部' : 'Resolve All'}
                        </button>
                      )}
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar animate-fadeIn">
                      {activeAlarmsCount === 0 ? (
                        <div className="py-10 px-4 text-center flex flex-col items-center justify-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                            <Check className="w-5 h-5" />
                          </div>
                          <p className="text-xs text-slate-300 font-semibold">
                            {language === 'vi' ? 'Hệ thống an toàn' : language === 'zh' ? '系统运行安全' : 'System is Safe'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {language === 'vi' ? 'Không phát hiện lỗi hoạt động nào' : language === 'zh' ? '未监测到活动警报' : 'No active alerts detected'}
                          </p>
                        </div>
                      ) : (
                        alerts
                          .filter((item) => !item.isResolved)
                          .map((item) => {
                            const isError = item.status === 'error';
                            return (
                              <div key={item.id} className="p-3 hover:bg-slate-900/40 transition-colors flex items-start space-x-3 text-left">
                                <div className={`p-1.5 rounded-lg mt-0.5 ${isError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                                  {isError ? <AlertOctagon className="w-3.5 h-3.5" /> : <TriangleAlert className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline mb-0.5">
                                    <h5 className="font-semibold text-xs text-slate-200 truncate pr-2">
                                      {t[item.titleKey] ? (t[item.titleKey] as string) : item.titleKey}
                                    </h5>
                                    <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                                      {item.time}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {t[item.subKey] ? (t[item.subKey] as string) : item.subKey}
                                  </p>
                                  <div className="mt-2 flex justify-end">
                                    <button
                                      onClick={() => handleResolveAlert(item.id)}
                                      className="text-[9px] font-semibold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                      <span>{language === 'vi' ? 'Giải quyết' : language === 'zh' ? '消除' : 'Resolve'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>

                    {/* View all Footer link */}
                    <div 
                      onClick={() => {
                        setActiveMenu('alerts');
                        setNotificationsOpen(false);
                      }}
                      className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-850 text-center text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:bg-slate-950 transition-all cursor-pointer"
                    >
                      {language === 'vi' ? 'XEM TẤT CẢ CẢNH BÁO →' : language === 'zh' ? '查看所有实时警报 →' : 'VIEW ALL ACTIVE ALARMS →'}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Maximize screen button */}
            <button
              id="btn-header-fullscreen"
              onClick={handleToggleFullscreen}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700/80 transition-all text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* User Profile avatar component */}
            <div className="flex items-center space-x-2.5 pl-1.5 border-l border-slate-800/80">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
                alt="user avatar"
                className="w-8 h-8 rounded-full border border-slate-700/60 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-none">Admin</span>
                <span className="text-[10px] text-slate-500 font-medium">{t.adminRole}</span>
              </div>
            </div>
          </div>
        </header>

        {/* VIEW PORT CONTENT SPACE */}
        <div className="p-6 space-y-6 flex-1">
          {activeMenu === 'lines' ? (
            <ProductionLinesView
              currentLanguage={language}
              steps={steps}
              setSteps={setSteps}
              triggerToast={triggerToast}
              simulationActive={simulationActive}
              setSimulationActive={setSimulationActive}
            />
          ) : activeMenu === 'devices' ? (
            <DevicesView
              currentLanguage={language}
              steps={steps}
              setSteps={setSteps}
              triggerToast={triggerToast}
              simulationActive={simulationActive}
            />
          ) : activeMenu === 'alerts' ? (
            <AlertsView
              currentLanguage={language}
              alerts={alerts}
              setAlerts={setAlerts}
              steps={steps}
              setSteps={setSteps}
              triggerToast={triggerToast}
              onSimulateAlert={handleSimulateAlert}
              defectCounter={defectCounter}
              setDefectCounter={setDefectCounter}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
            />
          ) : activeMenu === 'tasks' ? (
            <TasksView
              currentLanguage={language}
              steps={steps}
              setSteps={setSteps}
              triggerToast={triggerToast}
              simulationActive={simulationActive}
            />
          ) : activeMenu === 'maintenance' ? (
            <MaintenanceView
              currentLanguage={language}
              steps={steps}
              setSteps={setSteps}
              triggerToast={triggerToast}
              simulationActive={simulationActive}
            />
          ) : activeMenu === 'reports' ? (
            <ReportsView
              currentLanguage={language}
              steps={steps}
              setSteps={setSteps}
              triggerToast={triggerToast}
              simulationActive={simulationActive}
            />
          ) : activeMenu === 'energy' ? (
            <EnergyView
              currentLanguage={language}
              steps={steps}
              setSteps={setSteps}
              triggerToast={triggerToast}
              simulationActive={simulationActive}
            />
          ) : activeMenu === 'settings' ? (
            <SettingsView
              currentLanguage={language}
              setLanguage={setLanguage}
              simulationActive={simulationActive}
              setSimulationActive={setSimulationActive}
              triggerToast={triggerToast}
              steps={steps}
              setSteps={setSteps}
            />
          ) : (
            <>
              {/* ROW 1: 5 Operational Metrics Cards */}
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" id="metrics-cards-grid">
                {/* 1. OEE Operating Rate */}
                <MetricCard
                  title={t.oeeRate}
                  value={`${liveOeeAvg}%`}
                  trendText={`↑ 6.2% ${t.vsYesterday}`}
                  isPositive={true}
                  sparklineColor="#3b82f6"
                  gradientId="spark-oee-grad"
                  gradientFrom="#3b82f6"
                  gradientTo="#1e3a8a"
                  historyData={[72.1, 74.5, 71.9, 75.8, 77.2, 78.6, liveOeeAvg]}
                />

                {/* 2. Production Yield */}
                <MetricCard
                  title={t.productionYield}
                  value={yieldCounter.toLocaleString()}
                  trendText={`↑ 8.7% ${t.vsYesterday}`}
                  isPositive={true}
                  sparklineColor="#10b981"
                  gradientId="spark-yield-grad"
                  gradientFrom="#10b981"
                  gradientTo="#064e3b"
                  historyData={[11200, 11500, 11800, 12100, 12300, 12500, yieldCounter]}
                />

                {/* 3. Defect Rate */}
                <MetricCard
                  title={t.defectRate}
                  value={`${liveDefectPercent}%`}
                  trendText={`↓ 0.12% ${t.vsYesterday}`}
                  isPositive={false}
                  sparklineColor="#fbbf24"
                  gradientId="spark-defect-grad"
                  gradientFrom="#fbbf24"
                  gradientTo="#78350f"
                  historyData={[0.49, 0.44, 0.38, 0.42, 0.37, 0.35, liveDefectPercent]}
                />

                {/* 4. Total Downtime hours */}
                <MetricCard
                  title={t.downtime}
                  value="2h 35m"
                  trendText={`↓ 0h 45m ${t.vsYesterday}`}
                  isPositive={false}
                  sparklineColor="#c084fc"
                  gradientId="spark-downtime-grad"
                  gradientFrom="#c084fc"
                  gradientTo="#581c87"
                  historyData={[220, 210, 195, 175, 160, 155, 155]}
                />

                {/* 5. Open tasks list scale */}
                <MetricCard
                  title={t.openTasks}
                  value={24 + activeAlarmsCount - 4} // fluctuates with simulation active alerts
                  trendText={`↓ 5 ${t.vsYesterday}`}
                  isPositive={true}
                  sparklineColor="#ef4444"
                  gradientId="spark-tasks-grad"
                  gradientFrom="#ef4444"
                  gradientTo="#7f1d1d"
                  historyData={[32, 30, 28, 27, 26, 25, 24 + activeAlarmsCount - 4]}
                />
              </section>

              {/* ROW 2: Middle interactive process flow + sidebar notifications */}
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="middle-dashboard-grid">
                {/* Left/Middle Column (2 xl span): Central Flow diagram */}
                <div className="xl:col-span-2">
                  <FlowDiagram
                    currentLanguage={language}
                    steps={steps}
                    onStepClick={handleStepClick}
                    selectedStep={selectedStep}
                    onCloseStepDetails={handleCloseStepDetails}
                    onUpdateStepStatus={handleUpdateStepStatus}
                  />
                </div>

                {/* Right Column: Latest alarm center */}
                <div className="xl:col-span-1">
                  <AlertsSection
                    currentLanguage={language}
                    alerts={alerts}
                    onResolveAlert={handleResolveAlert}
                    onSimulateAlert={handleSimulateAlert}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted(!isMuted)}
                  />
                </div>
              </section>

              {/* ROW 3: Data charting & rankings */}
              <ChartsSection
                currentLanguage={language}
                hourlyData={initialHourlyPerformance}
                faultyDevices={initialFaultyDevices}
                commonErrors={initialCommonErrors}
                taskStatuses={initialTaskStatuses}
                totalErrors={defectCounter}
                totalTasks={24}
              />
            </>
          )}
        </div>

        {/* FOOTER SYSTEM STATUS STRIP */}
        <footer
          id="global-footer"
          className="h-10 border-t border-slate-800/60 bg-[#070b13] flex items-center justify-between px-6 text-[10px] md:text-xs text-slate-500 select-none flex-shrink-0"
        >
          {/* Status indicators */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <span className="text-slate-400 font-medium mr-2">{t.systemStatusLabel}:</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-1.5 shadow-sm shadow-emerald-500/40"></span>
              <span className="text-emerald-400 font-bold">{t.systemRunningWell}</span>
            </div>

            {/* PLC connectors */}
            <div className="hidden sm:flex items-center">
              <span className="text-slate-400 font-medium mr-2">{t.plcConnected}:</span>
              <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/30">12 / 12</span>
            </div>

            {/* Connected devices */}
            <div className="hidden md:flex items-center">
              <span className="text-slate-400 font-medium mr-2">{t.deviceConnected}:</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block mr-1.5 shadow-sm shadow-amber-500/45"></span>
              <span className="font-mono text-amber-400 font-semibold bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">28 / 30</span>
            </div>
          </div>

          <div>
            <span>
              {t.version} <strong className="text-slate-400">1.0.0</strong> — Foxconn Industrial Internet
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
