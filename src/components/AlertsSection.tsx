import React from 'react';
import { Language, TranslationSchema, AlertItem } from '../types';
import { translations } from '../translations';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  Check,
  Plus,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AlertsSectionProps {
  currentLanguage: Language;
  alerts: AlertItem[];
  onResolveAlert: (id: string) => void;
  onSimulateAlert: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({
  currentLanguage,
  alerts,
  onResolveAlert,
  onSimulateAlert,
  isMuted,
  onToggleMute,
}) => {
  const t: TranslationSchema = translations[currentLanguage];

  const getAlertIcon = (status: 'error' | 'warning' | 'info') => {
    switch (status) {
      case 'error':
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBg = (status: 'error' | 'warning' | 'info') => {
    switch (status) {
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full" id="alerts-panel-card">
      <div>
        {/* Header content */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-red-500 animate-swing" />
            <h3 className="text-slate-100 text-sm font-semibold tracking-wide">
              {t.latestAlerts}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Tone Toggle */}
            <button
              id="alert-mute-toggle-btn"
              onClick={onToggleMute}
              className={`p-1.5 rounded-md border transition-all ${
                isMuted
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
              title={t.alertMuted}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Stimulate trigger */}
            <button
              id="alert-simulate-trigger-btn"
              onClick={onSimulateAlert}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate</span>
            </button>

            <span className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors" id="alerts-view-all-link">
              {t.viewAll}
            </span>
          </div>
        </div>

        {/* List of alert blocks */}
        <div className="space-y-3 max-h-[294px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              No active warnings. System running safely.
            </div>
          ) : (
            alerts.map((item) => {
              const bgClass = getAlertBg(item.status);
              const isResolved = item.isResolved;

              return (
                <div
                  key={item.id}
                  id={`alert-item-container-${item.id}`}
                  className={`border rounded-lg p-3 transition-all duration-200 flex items-center justify-between gap-3 ${
                    isResolved
                      ? 'border-slate-800/40 bg-slate-900/20 opacity-40'
                      : bgClass
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      {getAlertIcon(item.status)}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold text-slate-200 truncate ${isResolved ? 'line-through text-slate-500' : ''}`}>
                        {t[item.titleKey] ? (t[item.titleKey] as string) : item.titleKey}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {t[item.subKey] ? (t[item.subKey] as string) : item.subKey}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Timestamps */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {item.time}
                    </span>

                    {!isResolved && (
                      <button
                        id={`btn-resolve-alert-${item.id}`}
                        onClick={() => onResolveAlert(item.id)}
                        className="p-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all cursor-pointer"
                        title="Resolve alert"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
