export type Language = 'en' | 'vi' | 'zh';

export interface TranslationSchema {
  // Navigation & Core Labels
  appName: string;
  systemOverview: string;
  systemOverviewSub: string;
  searchPlaceholder: string;
  factorySelector: string;
  adminRole: string;
  version: string;
  viewAll: string;
  today: string;

  // Sidebar Menu Items
  menuOverview: string;
  menuProductionLines: string;
  menuDevices: string;
  menuAlerts: string;
  menuTasks: string;
  menuMaintenance: string;
  menuReports: string;
  menuEnergy: string;
  menuSettings: string;
  menuCollapse: string;

  // Status & Counts
  lineStatusHeader: string;
  statusRunning: string;
  statusStopped: string;
  statusWarning: string;
  statusError: string;
  statusMaintenance: string;

  // Metric Cards
  oeeRate: string;
  productionYield: string;
  defectRate: string;
  downtime: string;
  openTasks: string;
  vsYesterday: string;
  units: string;

  // Production steps & layout
  productionLineStatusFlow: string;
  casingBranch: string;
  stepCircuit: string;
  stepConveyor: string;
  stepJumper: string;
  stepMcb: string;
  stepHeatsinkScrewing: string;
  stepBigHeatsinkScrewing: string;
  stepSmbAssembly: string;
  stepChassisCombination: string;
  stepFinalAssembly: string;
  stepCasing: string;
  stepAutoScrewing: string;
  stepMaterialLoading: string;

  // Recent Alerts
  latestAlerts: string;
  alertServoError: string;
  alertServoErrorSub: string;
  alertTempError: string;
  alertTempErrorSub: string;
  alertMaterialShortage: string;
  alertMaterialShortageSub: string;
  alertMaintenance: string;
  alertMaintenanceSub: string;

  // Charts & Widgets
  hourlyPerformance: string;
  performancePercent: string;
  targetPercent: string;
  topFaultyDevices: string;
  topCommonErrors: string;
  totalErrorsLabel: string;
  tasksByStatus: string;
  taskTotalLabel: string;

  // Error names in charts
  errServo: string;
  errHighTemp: string;
  errLackMaterial: string;
  errMechanicalJam: string;
  errOther: string;

  // Task Status names in charts
  taskPending: string;
  taskProcessing: string;
  taskAwaitingConfirm: string;
  taskCompleted: string;

  // Footer status
  systemStatusLabel: string;
  systemRunningWell: string;
  plcConnected: string;
  deviceConnected: string;

  // Interactivity / Popups / Tooltips
  simulationLabel: string;
  simulationActive: string;
  simulationPaused: string;
  stepDetailsTitle: string;
  currentStatus: string;
  oeeScore: string;
  sensorTemp: string;
  vibrationLevel: string;
  operatorName: string;
  closeButton: string;
  addAlertToast: string;
  alertMuted: string;
  alertResolved: string;
}

export type StatusType = 'running' | 'stopped' | 'warning' | 'error' | 'maintenance';

export interface FlowStep {
  id: string;
  num: number;
  labelKey: keyof TranslationSchema;
  status: StatusType;
  temp: number; // in Celsius
  vibration: number; // in mm/s
  oee: number; // percentage
  operator: string;
  iconType: 'board' | 'conveyor' | 'plug' | 'arm' | 'screw_small' | 'screw_large' | 'factory' | 'box' | 'check' | 'casing' | 'robot_screw' | 'robot_load';
  branch?: 'main' | 'casing';
}

export interface AlertItem {
  id: string;
  titleKey: keyof TranslationSchema;
  subKey: keyof TranslationSchema;
  status: 'error' | 'warning' | 'info';
  time: string;
  isResolved?: boolean;
}

export interface DefectItem {
  nameKey: keyof TranslationSchema;
  percentage: number;
  count: number;
  color: string;
}

export interface TaskStatusItem {
  nameKey: keyof TranslationSchema;
  count: number;
  percentage: number;
  color: string;
}

export interface FaultyDeviceItem {
  rank: number;
  nameKey: keyof TranslationSchema;
  count: number;
}
