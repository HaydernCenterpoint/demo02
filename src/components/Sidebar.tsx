import React from 'react';
import { Language, TranslationSchema } from '../types';
import { translations } from '../translations';
import {
  LayoutDashboard,
  Workflow,
  Cpu,
  BellRing,
  ClipboardList,
  Wrench,
  BarChart3,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';

interface SidebarProps {
  currentLanguage: Language;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  runningCount: number;
  stoppedCount: number;
  warningCount: number;
  errorCount: number;
  maintenanceCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentLanguage,
  collapsed,
  onToggleCollapse,
  activeMenu,
  setActiveMenu,
  runningCount,
  stoppedCount,
  warningCount,
  errorCount,
  maintenanceCount,
}) => {
  const t: TranslationSchema = translations[currentLanguage];

  const menuItems = [
    { id: 'overview', label: t.menuOverview, icon: LayoutDashboard },
    { id: 'lines', label: t.menuProductionLines, icon: Workflow },
    { id: 'devices', label: t.menuDevices, icon: Cpu },
    { id: 'alerts', label: t.menuAlerts, icon: BellRing, badge: errorCount > 0 ? errorCount : undefined },
    { id: 'tasks', label: t.menuTasks, icon: ClipboardList },
    { id: 'maintenance', label: t.menuMaintenance, icon: Wrench },
    { id: 'reports', label: t.menuReports, icon: BarChart3 },
    { id: 'energy', label: t.menuEnergy, icon: Zap },
    { id: 'settings', label: t.menuSettings, icon: Settings },
  ];

  return (
    <aside
      id="sidebar-container"
      className={`bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out select-none flex-shrink-0 text-slate-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Brand Block */}
      <div>
        <div
          id="sidebar-brand-header"
          className="h-16 flex items-center px-4 border-b border-slate-800/50 gap-2.5 overflow-hidden"
        >
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-white/10 p-1">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <g transform="skewX(-18) translate(8, 0)">
                {/* F (Blue) */}
                <path d="M 22 75 L 30 75 L 30 53 L 45 53 L 45 45 L 30 45 L 30 33 L 52 33 L 52 25 L 34 25 C 25 25 22 28 22 38 Z" fill="#00337c" />
                {/* i (Blue) */}
                <rect x="60" y="45" width="8" height="30" fill="#00337c" rx="1.5" />
                <rect x="60" y="25" width="8" height="8" fill="#00337c" rx="1.5" />
                {/* i (Red) */}
                <rect x="76" y="45" width="8" height="30" fill="#c8102e" rx="1.5" />
                <rect x="76" y="25" width="8" height="8" fill="#c8102e" rx="1.5" />
              </g>
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left overflow-hidden select-none">
              <span className="font-bold text-[10px] leading-tight text-white uppercase tracking-normal" id="brand-name" style={{ wordSpacing: '-0.02em' }}>
                Foxconn Industrial Internet
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-wide uppercase mt-0.5 whitespace-nowrap">
                AE System Manager
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center rounded-lg py-2.5 px-3 text-sm font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'hover:bg-slate-800/40 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!collapsed && (
                  <span className="ml-3 truncate transition-opacity duration-200">
                    {item.label}
                  </span>
                )}

                {/* Badge (Alert notifications count for example) */}
                {item.badge && !collapsed && (
                  <span className="absolute right-3 top-2.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-14 bottom-1 bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom status counters & Toggle Collapse */}
      <div className="border-t border-slate-800/50 p-3 bg-slate-955 gap-4 flex flex-col">
        {/* Status overview widget */}
        {!collapsed && (
          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/40" id="sidebar-statuses-panel">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              {t.lineStatusHeader}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-500/40"></span>
                  <span className="text-slate-300">{t.statusRunning}</span>
                </div>
                <span className="font-mono font-medium text-slate-400">{runningCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm shadow-blue-500/40"></span>
                  <span className="text-slate-300">{t.statusStopped}</span>
                </div>
                <span className="font-mono font-medium text-slate-400">{stoppedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-sm shadow-amber-500/40"></span>
                  <span className="text-slate-300">{t.statusWarning}</span>
                </div>
                <span className="font-mono font-medium text-slate-400">{warningCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 shadow-sm shadow-red-500/40"></span>
                  <span className="text-slate-300">{t.statusError}</span>
                </div>
                <span className="font-mono font-medium text-slate-400">{errorCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2 shadow-sm shadow-purple-500/40"></span>
                  <span className="text-slate-300">{t.statusMaintenance}</span>
                </div>
                <span className="font-mono font-medium text-slate-400">{maintenanceCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          id="btn-sidebar-collapse-toggle"
          onClick={onToggleCollapse}
          className="w-full flex items-center py-2 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg justify-center sm:justify-start"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <div className="flex items-center space-x-2">
              <ChevronLeft className="w-4 h-4" />
              <span>{t.menuCollapse}</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
