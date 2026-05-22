import { FlowStep, AlertItem, FaultyDeviceItem, DefectItem, TaskStatusItem } from './types';

export const initialSteps: FlowStep[] = [
  // Main flow
  {
    id: 's1',
    num: 1,
    labelKey: 'stepCircuit',
    status: 'running',
    temp: 34.2,
    vibration: 1.1,
    oee: 92.5,
    operator: 'Alex Nguyen',
    iconType: 'board',
    branch: 'main',
  },
  {
    id: 's2',
    num: 2,
    labelKey: 'stepConveyor',
    status: 'running',
    temp: 45.8,
    vibration: 2.3,
    oee: 89.0,
    operator: 'Tran Minh',
    iconType: 'conveyor',
    branch: 'main',
  },
  {
    id: 's3',
    num: 3,
    labelKey: 'stepJumper',
    status: 'running',
    temp: 29.5,
    vibration: 0.5,
    oee: 98.2,
    operator: 'Sarah Pham',
    iconType: 'plug',
    branch: 'main',
  },
  {
    id: 's4',
    num: 4,
    labelKey: 'stepMcb',
    status: 'running',
    temp: 38.6,
    vibration: 1.8,
    oee: 91.4,
    operator: 'Wang Lei',
    iconType: 'arm',
    branch: 'main',
  },
  {
    id: 's5',
    num: 5,
    labelKey: 'stepHeatsinkScrewing',
    status: 'warning',
    temp: 68.2, // Hot
    vibration: 4.1, // Shaking
    oee: 72.1,
    operator: 'Nguyen Van A',
    iconType: 'screw_small',
    branch: 'main',
  },
  {
    id: 's6',
    num: 6,
    labelKey: 'stepBigHeatsinkScrewing',
    status: 'error',
    temp: 85.4, // Overheating
    vibration: 6.8, // Critical shaking
    oee: 45.0,
    operator: 'Chen Qiang',
    iconType: 'screw_large',
    branch: 'main',
  },
  {
    id: 's7',
    num: 7,
    labelKey: 'stepSmbAssembly',
    status: 'stopped',
    temp: 18.0, // Cold (stopped)
    vibration: 0.0,
    oee: 0.0,
    operator: 'Le Hoang',
    iconType: 'factory',
    branch: 'main',
  },
  {
    id: 's8',
    num: 8,
    labelKey: 'stepChassisCombination',
    status: 'running',
    temp: 36.4,
    vibration: 1.2,
    oee: 93.8,
    operator: 'Hoang Nam',
    iconType: 'box',
    branch: 'main',
  },
  {
    id: 's9',
    num: 9,
    labelKey: 'stepFinalAssembly',
    status: 'running',
    temp: 31.1,
    vibration: 0.8,
    oee: 96.5,
    operator: 'Mai Chi',
    iconType: 'check',
    branch: 'main',
  },

  // Casing flow (shown on the bottom-branch in the diagram)
  {
    id: 'sc1',
    num: 10, // Visual position
    labelKey: 'stepCasing',
    status: 'running',
    temp: 26.5,
    vibration: 0.3,
    oee: 99.1,
    operator: 'Vu Long',
    iconType: 'casing',
    branch: 'casing',
  },
  {
    id: 'sc2',
    num: 11,
    labelKey: 'stepAutoScrewing',
    status: 'running',
    temp: 42.1,
    vibration: 2.1,
    oee: 88.4,
    operator: 'Phan Tuan',
    iconType: 'robot_screw',
    branch: 'casing',
  },
  {
    id: 'sc3',
    num: 12,
    labelKey: 'stepMaterialLoading',
    status: 'running',
    temp: 39.7,
    vibration: 1.9,
    oee: 90.2,
    operator: 'Zhao Lin',
    iconType: 'robot_load',
    branch: 'casing',
  },
];

export const initialAlerts: AlertItem[] = [
  {
    id: 'a1',
    titleKey: 'alertServoError',
    subKey: 'alertServoErrorSub',
    status: 'error',
    time: '07:25',
    isResolved: false,
  },
  {
    id: 'a2',
    titleKey: 'alertTempError',
    subKey: 'alertTempErrorSub',
    status: 'warning',
    time: '07:18',
    isResolved: false,
  },
  {
    id: 'a3',
    titleKey: 'alertMaterialShortage',
    subKey: 'alertMaterialShortageSub',
    status: 'warning',
    time: '07:10',
    isResolved: false,
  },
  {
    id: 'a4',
    titleKey: 'alertMaintenance',
    subKey: 'alertMaintenanceSub', // maps to a normal notification
    status: 'info',
    time: '06:50',
    isResolved: false,
  },
];

export const initialHourlyPerformance = [
  { time: '07:00', value: 72.5, target: 75.0 },
  { time: '09:00', value: 75.8, target: 75.0 },
  { time: '11:00', value: 73.2, target: 75.0 },
  { time: '13:00', value: 78.4, target: 75.0 },
  { time: '15:00', value: 79.1, target: 75.0 },
  { time: '17:00', value: 78.6, target: 75.0 },
];

export const initialFaultyDevices: FaultyDeviceItem[] = [
  { rank: 1, nameKey: 'stepHeatsinkScrewing', count: 5 },
  { rank: 2, nameKey: 'stepMaterialLoading', count: 3 },
  { rank: 3, nameKey: 'stepConveyor', count: 2 },
  { rank: 4, nameKey: 'stepJumper', count: 2 },
  { rank: 5, nameKey: 'stepBigHeatsinkScrewing', count: 1 },
];

export const initialCommonErrors: DefectItem[] = [
  { nameKey: 'errServo', percentage: 33.3, count: 4, color: '#3b82f6' }, // Blue
  { nameKey: 'errHighTemp', percentage: 25.0, count: 3, color: '#60a5fa' }, // Light Blue
  { nameKey: 'errLackMaterial', percentage: 16.7, count: 2, color: '#fbbf24' }, // Amber/Yellow
  { nameKey: 'errMechanicalJam', percentage: 16.7, count: 2, color: '#ec4899' }, // Magenta/Pink
  { nameKey: 'errOther', percentage: 8.3, count: 1, color: '#8b5cf6' }, // Purple
];

export const initialTaskStatuses: TaskStatusItem[] = [
  { nameKey: 'taskPending', count: 8, percentage: 33.3, color: '#6b7280' }, // Grey
  { nameKey: 'taskProcessing', count: 10, percentage: 41.7, color: '#3b82f6' }, // Blue
  { nameKey: 'taskAwaitingConfirm', count: 4, percentage: 16.7, color: '#f59e0b' }, // Yellow/Orange
  { nameKey: 'taskCompleted', count: 2, percentage: 8.3, color: '#10b981' }, // Green
];
