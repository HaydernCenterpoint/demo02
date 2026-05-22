import React from 'react';
import { Language, TranslationSchema, FlowStep, StatusType } from '../types';
import { translations } from '../translations';
import {
  Cpu,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  GitCommit,
  Wrench,
  Hammer,
  Layers,
  Settings,
  Package,
  CheckCircle,
  Activity,
  AlertTriangle,
  Flame,
  User,
  X,
} from 'lucide-react';

interface FlowDiagramProps {
  currentLanguage: Language;
  steps: FlowStep[];
  onStepClick: (step: FlowStep) => void;
  selectedStep: FlowStep | null;
  onCloseStepDetails: () => void;
  onUpdateStepStatus: (stepId: string, newStatus: StatusType) => void;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  currentLanguage,
  steps,
  onStepClick,
  selectedStep,
  onCloseStepDetails,
  onUpdateStepStatus,
}) => {
  const t: TranslationSchema = translations[currentLanguage];

  // Helper for status classes
  const getStatusColorClasses = (status: StatusType) => {
    switch (status) {
      case 'running':
        return {
          border: 'border-emerald-500/80',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          shadow: 'shadow-emerald-500/20 bg-emerald-500',
        };
      case 'stopped':
        return {
          border: 'border-blue-500/80',
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          shadow: 'shadow-blue-500/20 bg-blue-500',
        };
      case 'warning':
        return {
          border: 'border-amber-500/80',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          shadow: 'shadow-amber-500/20 bg-amber-500',
        };
      case 'error':
        return {
          border: 'border-red-500/80',
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          shadow: 'shadow-red-500/20 bg-red-500',
        };
      case 'maintenance':
        return {
          border: 'border-purple-500/80',
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          shadow: 'shadow-purple-500/20 bg-purple-500',
        };
    }
  };

  // Icon switcher helper
  const renderStepIcon = (iconType: string, status: StatusType) => {
    const defaultColorVec = getStatusColorClasses(status).text;
    const size = 'w-5 h-5 ' + defaultColorVec;

    switch (iconType) {
      case 'board':
        return <Cpu className={size} />;
      case 'conveyor':
        return <GitCommit className={size} />;
      case 'plug':
        return <Layers className={size} />;
      case 'arm':
        return <Wrench className={size} />;
      case 'screw_small':
        return <Settings className={`${size} animate-spin-slow`} />;
      case 'screw_large':
        return <Settings className={`${size} animate-spin-slow text-red-400`} />;
      case 'factory':
        return <Layers className={size} />;
      case 'box':
        return <Package className={size} />;
      case 'check':
        return <CheckCircle className={size} />;
      case 'casing':
        return <FolderOpen className={size} />;
      case 'robot_screw':
        return <Hammer className={size} />;
      case 'robot_load':
        return <RefreshCw className={size} />;
      default:
        return <Cpu className={size} />;
    }
  };

  // Group steps
  const mainSteps = steps.filter((s) => s.branch === 'main');
  const casingSteps = steps.filter((s) => s.branch === 'casing');

  return (
    <div className="bg-[#111827]/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative" id="flow-diagram-panel">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          {t.productionLineStatusFlow}
        </h3>

        {/* Mini Legend */}
        <div className="flex items-center space-x-4 text-xs font-medium text-slate-400" id="flow-diagram-legend">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
            <span>{t.statusRunning}</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
            <span>{t.statusStopped}</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
            <span>{t.statusWarning}</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
            <span>{t.statusError}</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5" />
            <span>{t.statusMaintenance}</span>
          </div>
        </div>
      </div>

      {/* Main flow-scroll-wrapper to guarantee responsive viewport protection */}
      <div className="overflow-x-auto pb-4 max-w-full" style={{ scrollbarWidth: 'thin' }}>
        <div className="min-w-[1020px] py-2 relative flex flex-col gap-10">
          {/* TOP Main conveyor flow */}
          <div className="flex items-center gap-2">
            {mainSteps.map((step, idx) => {
              const statusColors = getStatusColorClasses(step.status);
              const isActive = selectedStep?.id === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div
                    id={`flow-step-${step.id}`}
                    onClick={() => onStepClick(step)}
                    className={`w-28 flex flex-col justify-between items-center rounded-lg border p-2.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? `${statusColors.border} ring-2 ring-blue-500/40 translate-y-[-2px] bg-slate-900`
                        : `${statusColors.border} bg-[#0b0f19]/60 hover:bg-slate-900/80`
                    }`}
                  >
                    {/* Icon and status indicator */}
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-1.5 rounded-lg ${statusColors.bg}`}>
                        {renderStepIcon(step.iconType, step.status)}
                      </div>
                      <span className={`w-2 h-2 rounded-full shadow-sm animate-pulse ${statusColors.shadow}`} />
                    </div>

                    {/* Step label / Translated */}
                    <span className="text-[11px] font-medium text-slate-200 tracking-tight text-center truncate w-full">
                      {t[step.labelKey] as string}
                    </span>
                  </div>

                  {/* Connecting Arrow between Main Steps */}
                  {idx < mainSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Connected SUB branching flow diagram */}
          <div className="flex items-center pl-[210px] gap-2">
            {/* Nhánh Vỏ annotation */}
            <div className="flex items-center mr-4 text-xs font-semibold text-slate-400 bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800/80 gap-2 flex-shrink-0 animate-pulse">
              <span>{t.casingBranch}</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </div>

            {casingSteps.map((step, idx) => {
              const statusColors = getStatusColorClasses(step.status);
              const isActive = selectedStep?.id === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div
                    id={`flow-step-${step.id}`}
                    onClick={() => onStepClick(step)}
                    className={`w-36 flex flex-col justify-between items-center rounded-lg border p-2.5 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? `${statusColors.border} ring-2 ring-blue-500/40 translate-y-[-2px] bg-slate-900`
                        : `${statusColors.border} bg-[#0b0f19]/60 hover:bg-slate-900/80`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-1.5 rounded-lg ${statusColors.bg}`}>
                        {renderStepIcon(step.iconType, step.status)}
                      </div>
                      <span className={`w-2 h-2 rounded-full shadow-sm animate-pulse ${statusColors.shadow}`} />
                    </div>

                    <span className="text-[11px] font-medium text-slate-200 tracking-tight text-center truncate w-full">
                      {t[step.labelKey] as string}
                    </span>
                  </div>

                  {/* Connecting Arrow between Casing Steps */}
                  {idx < casingSteps.length - 1 ? (
                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  ) : (
                    /* Final connection branch upwards to SMB Chassis Combination (Main step index 7, id 's8') */
                    <div className="relative w-16 h-10 flex-shrink-0">
                      <svg className="w-full h-16 absolute -top-16 left-0 overflow-visible" fill="none">
                        {/* A curve line upwards to 's8' (Tổ hợp Chasis SMB) */}
                        <path
                          d="M 0,55 C 20,55 30,5 50,5"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray="4 3"
                        />
                        <polygon points="53,5 47,2 47,8" fill="#3b82f6" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* POPUP DETAIL DIALOG: Inline expand-over block that renders beautiful sensor telemetry when step is selected */}
      {selectedStep && (
        <div
          id="step-details-modal"
          className="absolute inset-x-5 bottom-5 top-5 bg-[#0e131f]/95 border border-slate-700/80 rounded-xl p-5 md:p-6 flex flex-col justify-between z-10 animate-fade-in"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-slate-800 ${getStatusColorClasses(selectedStep.status).bg}`}>
                {renderStepIcon(selectedStep.iconType, selectedStep.status)}
              </div>
              <div>
                <h4 className="text-white font-semibold text-base">
                  {t[selectedStep.labelKey] as string} <span className="text-xs text-slate-500">({selectedStep.branch === 'main' ? 'Main' : 'Casing'})</span>
                </h4>
                <p className="text-xs text-slate-400">
                  ID: {selectedStep.id.toUpperCase()} — {t.stepDetailsTitle}
                </p>
              </div>
            </div>

            <button
              id="close-step-details-btn"
              onClick={onCloseStepDetails}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid content representing sensors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
            {/* Sensor Status */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                {t.currentStatus}
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusColorClasses(selectedStep.status).shadow}`} />
                <span className="text-sm font-semibold capitalize text-slate-200">
                  {selectedStep.status === 'running' && t.statusRunning}
                  {selectedStep.status === 'stopped' && t.statusStopped}
                  {selectedStep.status === 'warning' && t.statusWarning}
                  {selectedStep.status === 'error' && t.statusError}
                  {selectedStep.status === 'maintenance' && t.statusMaintenance}
                </span>
              </div>
            </div>

            {/* Sensor Temperature */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                {t.sensorTemp}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold font-mono ${selectedStep.temp > 60 ? 'text-red-400' : 'text-slate-200'}`}>
                  {selectedStep.temp.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">°C</span>
                {selectedStep.temp > 60 && <Flame className="w-4 h-4 text-red-500 flex-shrink-0 inline ml-1 animate-bounce" />}
              </div>
            </div>

            {/* Vibration Sensor */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                {t.vibrationLevel}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-slate-200">
                  {selectedStep.vibration.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">mm/s</span>
              </div>
            </div>

            {/* OEE Score */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                {t.oeeScore}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold font-mono ${selectedStep.oee < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedStep.oee.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive controls: Change device status in real-time */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-800/50">
            {/* Assigned person info */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User className="w-4 h-4 text-blue-400" />
              <span>{t.operatorName}: <strong className="text-slate-200 font-medium">{selectedStep.operator}</strong></span>
            </div>

            {/* Control buttons */}
            <div className="flex flex-wrap items-center gap-2" id="step-details-controls">
              {(['running', 'stopped', 'warning', 'error', 'maintenance'] as StatusType[]).map((st) => (
                <button
                  key={st}
                  id={`status-control-${st}`}
                  onClick={() => onUpdateStepStatus(selectedStep.id, st)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase cursor-pointer tracking-wider transition-all duration-150 ${
                    selectedStep.status === st
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {st === 'running' && t.statusRunning}
                  {st === 'stopped' && t.statusStopped}
                  {st === 'warning' && t.statusWarning}
                  {st === 'error' && t.statusError}
                  {st === 'maintenance' && t.statusMaintenance}
                </button>
              ))}

              <button
                id="btn-close-modal-bottom"
                onClick={onCloseStepDetails}
                className="ml-auto px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold cursor-pointer"
              >
                {t.closeButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
