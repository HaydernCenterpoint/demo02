import React, { useState, useEffect } from 'react';
import { Language, FlowStep, StatusType, TranslationSchema } from '../types';
import { translations } from '../translations';
import {
  Cpu,
  Search,
  Wrench,
  Settings2,
  Activity,
  RefreshCw,
  Zap,
  RotateCcw,
  Sliders,
  Sparkles,
  Volume2,
  CloudLightning,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  PlayCircle,
  Thermometer,
  Gauge,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface DevicesViewProps {
  currentLanguage: Language;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  triggerToast: (msg: string) => void;
  simulationActive: boolean;
}

// Sub-device contract for dynamic list
interface SubDevice {
  id: string;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  type: 'motor' | 'sensor' | 'actuator' | 'camera' | 'heater';
  voltage: number; // nominal 24V or 220V
  loadAmp: number; // load in Amperes
  firmwareVersion: string;
  health: number; // health index percentage
  isCalibrating: boolean;
  calibrationProgress: number;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  currentLanguage,
  steps,
  setSteps,
  triggerToast,
  simulationActive,
}) => {
  const t: TranslationSchema = translations[currentLanguage];

  // Selected station ID for detailed sub-device inspection
  const [selectedStationId, setSelectedStationId] = useState<string>(steps[0]?.id || 's1');

  // Search input and status filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'motor' | 'sensor' | 'actuator' | 'camera' | 'heater'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'issue' | 'stopped'>('all');

  // Calibration and update states
  const [updatingFirmwareId, setUpdatingFirmwareId] = useState<string | null>(null);
  const [firmwareProgress, setFirmwareProgress] = useState<number>(0);

  // Storing firmware versions for sub-devices dynamically to allow online updates
  const [firmwares, setFirmwares] = useState<Record<string, string>>({
    'sub-s1-1': 'v1.2.3', 'sub-s1-2': 'v2.0.1', 'sub-s1-3': 'v1.4.2',
    'sub-s2-1': 'v1.2.3', 'sub-s2-2': 'v2.0.1', 'sub-s2-3': 'v1.4.2',
    'sub-s3-1': 'v1.2.3', 'sub-s3-2': 'v2.0.1', 'sub-s3-3': 'v1.4.2',
    'sub-s4-1': 'v1.2.3', 'sub-s4-2': 'v2.0.1', 'sub-s4-3': 'v1.4.2',
    'sub-s5-1': 'v1.2.3', 'sub-s5-2': 'v2.0.1', 'sub-s5-3': 'v1.4.2',
    'sub-s6-1': 'v1.2.3', 'sub-s6-2': 'v2.0.1', 'sub-s6-3': 'v1.4.2',
    'sub-s7-1': 'v1.2.3', 'sub-s7-2': 'v2.0.1', 'sub-s7-3': 'v1.4.2',
    'sub-s8-1': 'v1.2.3', 'sub-s8-2': 'v2.0.1', 'sub-s8-3': 'v1.4.2',
    'sub-s9-1': 'v1.2.3', 'sub-s9-2': 'v2.0.1', 'sub-s9-3': 'v1.4.2',
    'sub-sc1-1': 'v1.2.3', 'sub-sc1-2': 'v2.0.1', 'sub-sc1-3': 'v1.4.2',
    'sub-sc2-1': 'v1.2.3', 'sub-sc2-2': 'v2.0.1', 'sub-sc2-3': 'v1.4.2',
    'sub-sc3-1': 'v1.2.3', 'sub-sc3-2': 'v2.0.1', 'sub-sc3-3': 'v1.4.2',
  });

  // Health indices of sub-components
  const [subDeviceHealths, setSubDeviceHealths] = useState<Record<string, number>>({});
  
  // Calibration progression states
  const [calibratingId, setCalibratingId] = useState<string | null>(null);
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);

  // Generate mapping from Station ID to Sub-devices nicely
  const getSubDevicesForStation = (stationId: string): SubDevice[] => {
    const isCasing = stationId.startsWith('sc');
    const idxStr = stationId.replace('s', '').replace('c', '');
    const baseNum = parseInt(idxStr) || 1;

    // Define consistent templates of devices based on step types
    let templates: { nameVi: string; nameEn: string; nameZh: string; type: 'motor' | 'sensor' | 'actuator' | 'camera' | 'heater'; v: number; a: number }[] = [];

    if (stationId === 's1') {
      templates = [
        { nameVi: 'Phễu nạp mạch PCB', nameEn: 'PCB Vacuum Feeder', nameZh: 'PCB 真空上料机', type: 'actuator', v: 24, a: 1.8 },
        { nameVi: 'Mô-đun rơ-le giữ khí nén', nameEn: 'Solenoid Pneumatic Valve', nameZh: '气动电磁阀', type: 'sensor', v: 24, a: 0.4 },
        { nameVi: 'Cảm biến quang sợi bám giữ', nameEn: 'Fiber Optic Position Sensor', nameZh: '光纤定位传感器', type: 'sensor', v: 12, a: 0.1 },
      ];
    } else if (stationId === 's2') {
      templates = [
        { nameVi: 'Động cơ biến tần 3 pha truyền tải', nameEn: '3-Phase Inverter Conveyor Motor', nameZh: '三相变频传送电机', type: 'motor', v: 380, a: 4.2 },
        { nameVi: 'Cảm biến tốc độ vòng quay Encoder', nameEn: 'Rotary Shaft Encoder', nameZh: '旋转轴编码器', type: 'sensor', v: 24, a: 0.25 },
        { nameVi: 'Bộ hãm điện từ tải nặng', nameEn: 'Electromagnetic Safety Brake', nameZh: '电磁安全抱闸', type: 'actuator', v: 24, a: 1.5 },
      ];
    } else if (stationId === 's5' || stationId === 's6') {
      templates = [
        { nameVi: 'Động cơ servo xi-lanh trục Z', nameEn: 'Z-Axis Screwdriver Servo Motor', nameZh: 'Z轴拧紧伺服电机', type: 'motor', v: 220, a: 3.8 },
        { nameVi: 'Cảm biến lực siết Torque Transducer', nameEn: 'Torque Feedback Sensor', nameZh: '扭矩力矩反馈传感器', type: 'sensor', v: 24, a: 0.2 },
        { nameVi: 'Ống dẫn nạp vít tự động', nameEn: 'Auto-feed Screw Jet Tube', nameZh: '自动送螺钉吹气管', type: 'actuator', v: 24, a: 0.9 },
      ];
    } else if (stationId === 'sc3') {
      templates = [
        { nameVi: 'Mô-đun khớp quay Servo 6 trục', nameEn: '6-Axis Robot Joint Servo Controller', nameZh: '六轴机器人关节伺服控制器', type: 'motor', v: 220, a: 6.5 },
        { nameVi: 'Hệ thống Camera nhận dạng Cognex AI', nameEn: 'Cognex Vision AI Camera', nameZh: 'Cognex 视觉智能相机', type: 'camera', v: 24, a: 1.2 },
        { nameVi: 'Đệm giác hút áp suất âm', nameEn: 'Negative Vacuum Suction Cup', nameZh: '真空负压吸盘', type: 'actuator', v: 24, a: 0.8 },
      ];
    } else {
      // Default template fallback dynamically generated
      templates = [
        { nameVi: `Mô tơ truyền lực chính T-${baseNum}`, nameEn: `Main Drive Actuator T-${baseNum}`, nameZh: `主传动驱动器 T-${baseNum}`, type: 'motor', v: 220, a: 2.5 },
        { nameVi: `Cảm biến nhiệt hồng ngoại S-${baseNum}`, nameEn: `Infrared Temp Sensor S-${baseNum}`, nameZh: `远红外温度测定仪 S-${baseNum}`, type: 'sensor', v: 12, a: 0.15 },
        { nameVi: `Van hơi điều phối áp suất X-${baseNum}`, nameEn: `Pressure Distributor Solenoid X-${baseNum}`, nameZh: `气压控制分电磁阀 X-${baseNum}`, type: 'actuator', v: 24, a: 0.6 },
      ];
    }

    return templates.map((tmpl, idx) => {
      const subId = `sub-${stationId}-${idx + 1}`;
      
      // Determine default base health based on station status
      const targetStep = steps.find(s => s.id === stationId);
      let baseHealth = 98;
      if (targetStep) {
        if (targetStep.status === 'error') {
          // If station is in error, one sub-device must trigger critical low health
          baseHealth = idx === 0 ? 12 : idx === 1 ? 45 : 90;
        } else if (targetStep.status === 'warning') {
          baseHealth = idx === 1 ? 55 : 82;
        } else if (targetStep.status === 'stopped') {
          baseHealth = 75; // standby health
        } else if (targetStep.status === 'maintenance') {
          baseHealth = 100; // freshly maintained
        }
      }

      // Override with user calibrated health if exists in active state memory
      const currentHealth = subDeviceHealths[subId] !== undefined ? subDeviceHealths[subId] : baseHealth;

      return {
        id: subId,
        nameVi: tmpl.nameVi,
        nameEn: tmpl.nameEn,
        nameZh: tmpl.nameZh,
        type: tmpl.type,
        voltage: tmpl.v,
        loadAmp: targetStep?.status === 'running' ? tmpl.a * (1 + (Math.sin(Date.now() / 3000) * 0.08)) : 0, // dynamic load
        firmwareVersion: firmwares[subId] || 'v1.2.0',
        health: currentHealth,
        isCalibrating: calibratingId === subId,
        calibrationProgress: calibratingId === subId ? calibrationProgress : 0,
      };
    });
  };

  // Live effect loops during firmware updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (updatingFirmwareId) {
      interval = setInterval(() => {
        setFirmwareProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setFirmwares((v) => ({
              ...v,
              [updatingFirmwareId]: 'v2.1.2_LATEST',
            }));
            const updatedDeviceName = getSubDevicesForStation(selectedStationId).find(d => d.id === updatingFirmwareId);
            const label = currentLanguage === 'vi' 
              ? updatedDeviceName?.nameVi 
              : currentLanguage === 'zh' 
              ? updatedDeviceName?.nameZh 
              : updatedDeviceName?.nameEn;
            triggerToast(
              currentLanguage === 'vi'
                ? `Cập nhật thành công Firmware v2.1.2 cho [${label}]!`
                : `Successfully flashed firmware v2.1.2 onto [${label}]!`
            );
            setUpdatingFirmwareId(null);
            return 0;
          }
          return prev + 12;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [updatingFirmwareId]);

  // Live effect loop during Calibration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (calibratingId) {
      interval = setInterval(() => {
        setCalibrationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Restore calibrated device to 100% health!
            setSubDeviceHealths((prevHealths) => ({
              ...prevHealths,
              [calibratingId]: 100,
            }));

            // Check if all sub-devices of currently selected station are healthy now
            // If they are, auto-clear warnings/errors on the main step to make dashboard synced!
            const stationSubDevices = getSubDevicesForStation(selectedStationId);
            const otherHealthy = stationSubDevices.every((sub) => {
              if (sub.id === calibratingId) return true;
              return sub.health > 70;
            });

            if (otherHealthy) {
              setSteps((prevSteps) =>
                prevSteps.map((step) => {
                  if (step.id === selectedStationId && (step.status === 'error' || step.status === 'warning')) {
                    return {
                      ...step,
                      status: 'running',
                      temp: step.branch === 'casing' ? 33.0 : 36.5,
                      vibration: step.branch === 'casing' ? 1.0 : 1.2,
                      oee: 92.5,
                    };
                  }
                  return step;
                })
              );
            }

            const calibratedName = getSubDevicesForStation(selectedStationId).find(d => d.id === calibratingId);
            const title = currentLanguage === 'vi' 
              ? calibratedName?.nameVi 
              : currentLanguage === 'zh' 
              ? calibratedName?.nameZh 
              : calibratedName?.nameEn;

            triggerToast(
              currentLanguage === 'vi'
                ? `Kết quả tốt! Đã căn chỉnh thông số cơ khí và làm sạch cảm biến cho [${title}]. health = 100%.`
                : `Perfect! Self-alignment and laser calibration finalized for [${title}]. Health restored.`
            );
            setCalibratingId(null);
            return 0;
          }
          return prev + 15;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [calibratingId]);

  // Handle single sub-device calibration start
  const handleStartCalibration = (subId: string, deviceTitle: string) => {
    if (calibratingId || updatingFirmwareId) {
      triggerToast(
        currentLanguage === 'vi'
          ? 'Hệ thống bận: Có tiến trình bảo trì kỹ thuật đang chạy!'
          : 'Middle-ware is busy executing mechanical diagnostics!'
      );
      return;
    }
    setCalibratingId(subId);
    setCalibrationProgress(0);
    triggerToast(
      currentLanguage === 'vi'
        ? `Đang bắt đầu chu trình hiệu chuẩn bù sai số quang học cho [${deviceTitle}]...`
        : `Optical bias & scale factor calibration initiated for [${deviceTitle}]`
    );
  };

  // Quick flash firmware update
  const handleUpdateFirmware = (subId: string, deviceTitle: string) => {
    if (calibratingId || updatingFirmwareId) {
      triggerToast(
        currentLanguage === 'vi'
          ? 'Hệ thống bận: Có tiến trình bảo trì kỹ thuật đang chạy!'
          : 'Middle-ware is busy executing mechanical diagnostics!'
      );
      return;
    }
    setUpdatingFirmwareId(subId);
    setFirmwareProgress(0);
    triggerToast(
      currentLanguage === 'vi'
        ? `Đang truy tải mã nhị phân và ghi đè Eprom cho [${deviceTitle}]...`
        : `Retrieving binary image and flashing EPROM sectors of [${deviceTitle}]...`
    );
  };

  // Perform massive factory diagnostics reset
  const handleMassCalibrateAll = () => {
    const stationSubs = getSubDevicesForStation(selectedStationId);
    triggerToast(
      currentLanguage === 'vi'
        ? 'Bật chu trình tự sửa chữa hàng loạt cho tất cả mô-đun trong trạm...'
        : 'Running bulk auto-compensation procedures on all station channels...'
    );

    stationSubs.forEach((sub, index) => {
      setTimeout(() => {
        setSubDeviceHealths((prev) => ({
          ...prev,
          [sub.id]: 100,
        }));
      }, index * 400);
    });

    setTimeout(() => {
      setSteps((prevSteps) =>
        prevSteps.map((step) => {
          if (step.id === selectedStationId) {
            return {
              ...step,
              status: 'running',
              temp: step.branch === 'casing' ? 32 : 36,
              vibration: step.branch === 'casing' ? 0.9 : 1.1,
              oee: 94.0,
            };
          }
          return step;
        })
      );
      triggerToast(
        currentLanguage === 'vi'
          ? 'Phân xưởng báo cáo: Toàn bộ mô-đun phục hồi 100% Khỏe Mạnh.'
          : 'Main Control: Station units validated. Clean operational loops.'
      );
    }, stationSubs.length * 400);
  };

  // Map station status to custom visual values
  const getStatusColorAndLabel = (status: StatusType) => {
    switch (status) {
      case 'running':
        return { border: 'border-emerald-500/50', text: 'text-emerald-400 bg-emerald-500/10', dot: 'bg-emerald-400' };
      case 'stopped':
        return { border: 'border-slate-800', text: 'text-slate-400 bg-slate-800/10', dot: 'bg-slate-400' };
      case 'warning':
        return { border: 'border-amber-500/50', text: 'text-amber-400 bg-amber-500/10', dot: 'bg-amber-400' };
      case 'error':
        return { border: 'border-red-500/50', text: 'text-red-400 bg-red-500/10', dot: 'bg-red-400' };
      case 'maintenance':
        return { border: 'border-purple-500/50', text: 'text-purple-400 bg-purple-500/10', dot: 'bg-purple-400' };
    }
  };

  const selectedStepData = steps.find(s => s.id === selectedStationId) || steps[0];
  const subDevicesList = getSubDevicesForStation(selectedStationId);

  // Filter sub-devices of CURRENT SELECTED station based on search and filters
  const filteredSubDevices = subDevicesList.filter((sub) => {
    const label = currentLanguage === 'vi' ? sub.nameVi : currentLanguage === 'zh' ? sub.nameZh : sub.nameEn;
    const matchesSearch = label.toLowerCase().includes(searchQuery.toLowerCase()) || sub.firmwareVersion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = deviceFilter === 'all' || sub.type === deviceFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'healthy') matchesStatus = sub.health >= 80;
    if (statusFilter === 'issue') matchesStatus = sub.health < 80;
    if (statusFilter === 'stopped') matchesStatus = selectedStepData?.status === 'stopped' || sub.loadAmp === 0;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="devices-view-dashboard">
      
      {/* 1. TOP HEADER SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="devices-quick-stats">
        {/* Total sensor health index */}
        <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">{currentLanguage === 'vi' ? 'Hiệu suất chung' : 'Equip Health Score'}</span>
            <h3 className="text-xl font-bold font-mono text-emerald-400">96.4%</h3>
            <p className="text-[10px] text-slate-500">{currentLanguage === 'vi' ? '36/38 Mô-đun ở mức TỐT' : '36/38 Active modules healthy'}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic Connected loads */}
        <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">{currentLanguage === 'vi' ? 'Dòng tải kết nối' : 'Total Electrical Load'}</span>
            <h3 className="text-xl font-bold font-mono text-blue-400">
              {simulationActive ? '4.8 KVA' : '0.2 KVA'}
            </h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>380V Main Grid AC</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
        </div>

        {/* Maintenance cycle indicator */}
        <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">{currentLanguage === 'vi' ? 'Firmware Bảo Trì' : 'Pending Upgrades'}</span>
            <h3 className="text-xl font-bold font-mono text-amber-400">3 Mô-đun</h3>
            <p className="text-[10px] text-slate-400">{currentLanguage === 'vi' ? 'Có bản cập nhật v2.1.2' : 'V2.1.2 security patch ready'}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <CloudLightning className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* PLC Health signal */}
        <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">{currentLanguage === 'vi' ? 'Giao thức truyền thông' : 'RS-485 Modbus Link'}</span>
            <h3 className="text-xl font-bold font-mono text-indigo-400">Modbus TCP</h3>
            <p className="text-[10px] text-emerald-400 font-semibold">● PLC Master Online</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Sliders className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* 2. CORE split view: Stations on Left, Sub-device details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="devices-core-split">
        
        {/* LEFT COLUMN: LIST OF STATIONS / WORK STATIONS */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-slate-900/35 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>{currentLanguage === 'vi' ? 'Danh sách Trạm Máy' : 'Select Work Station'}</span>
              <span className="text-[10px] bg-slate-800 py-0.5 px-2 rounded font-mono text-slate-400 font-semibold">12 Units</span>
            </h4>

            {/* List scroll panel */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 customize-scrollbar flex flex-col">
              {steps.map((step) => {
                const label = t[step.labelKey] ? (t[step.labelKey] as string) : step.id;
                const isSelected = selectedStationId === step.id;
                const styleDef = getStatusColorAndLabel(step.status);

                return (
                  <button
                    key={step.id}
                    id={`btn-select-station-${step.id}`}
                    onClick={() => {
                      setSelectedStationId(step.id);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow shadow-blue-900/20'
                        : 'bg-slate-950/60 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-blue-600/30 text-blue-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {step.num}
                      </div>

                      <div className="min-w-0">
                        <span className="block text-slate-100 font-semibold text-xs tracking-tight truncate">
                          {label}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide">
                          {step.branch === 'casing' ? t.casingBranch : 'Main Area'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 pl-1">
                      {/* OEE Mini badge */}
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">OEE {step.oee.toFixed(0)}%</span>
                      {/* Dynamic dot indicator */}
                      <span className={`w-2 h-2 rounded-full ${styleDef?.dot}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUB-DEVICE DRILL DOWN FOR SELECTED STATION */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Main Inspection Area Card */}
          <div className="bg-[#111827]/60 border border-slate-800/80 rounded-xl p-5 shadow-xl relative overflow-hidden" id="station-devices-inspection-detail">
            
            {/* Ambient visual background highlights */}
            <div className={`absolute top-0 right-0 w-64 h-32 opacity-10 blur-3xl rounded-full ${
              selectedStepData?.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`} />

            {/* Selected Station Title Block */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/60 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                  {currentLanguage === 'vi' ? `TRẠM CHUYÊN SÂU ${selectedStepData?.num}` : `STATION INSIGHT ${selectedStepData?.num}`}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-white">
                  {t[selectedStepData?.labelKey] as string || selectedStepData?.id}
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {currentLanguage === 'vi'
                    ? `Kiểm tra sức khỏe, hiệu chuẩn mạch đo, nạp vi mã cho từng linh kiện mô-đun trạm số ${selectedStepData?.num}.`
                    : `Telemetry stream, register diagnostics, EPROM flashing utility for individual subunits.`}
                </p>
              </div>

              {/* Station State Stats box */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-900/80 border border-slate-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    selectedStepData?.status === 'running' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <span className="text-slate-300 text-xs font-semibold capitalize font-mono">
                    {selectedStepData?.status}
                  </span>
                </div>

                <button
                  onClick={handleMassCalibrateAll}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow-md cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 border border-blue-500/20"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'vi' ? 'Bảo Trì Toàn Diện' : 'Repair All Units'}</span>
                </button>
              </div>
            </div>

            {/* Sub-device Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-1">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder={currentLanguage === 'vi' ? 'Tìm linh kiện...' : 'Filter components...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-900 focus:border-blue-500/80 outline-none"
                />
              </div>

              {/* Filtering tags */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={deviceFilter}
                  onChange={(e: any) => setDeviceFilter(e.target.value)}
                  className="bg-slate-950 text-slate-300 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">⚡ {currentLanguage === 'vi' ? 'Mọi Loại' : 'All Types'}</option>
                  <option value="motor">⚙️ {currentLanguage === 'vi' ? 'Động cơ' : 'Motors'}</option>
                  <option value="sensor">📡 {currentLanguage === 'vi' ? 'Cảm biến' : 'Sensors'}</option>
                  <option value="actuator">🔧 {currentLanguage === 'vi' ? 'Cơ cấu chấp hành' : 'Actuators'}</option>
                  <option value="camera">📷 {currentLanguage === 'vi' ? 'Đầu chụp camera' : 'Cameras'}</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 text-slate-300 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">🔍 {currentLanguage === 'vi' ? 'Mọi sức khoẻ' : 'All Health'}</option>
                  <option value="healthy">💚 {currentLanguage === 'vi' ? 'Khỏe Mạnh (>=80%)' : 'Healthy (>=80%)'}</option>
                  <option value="issue">💔 {currentLanguage === 'vi' ? 'Cần hiệu chuẩn (<80%)' : 'De-calibrated (<80%)'}</option>
                </select>
              </div>
            </div>

            {/* List of Sub-devices inside station */}
            <div className="mt-4 space-y-4">
              {filteredSubDevices.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/20 rounded-xl border border-slate-900 flex flex-col items-center justify-center gap-2">
                  <Info className="w-5 h-5 text-slate-600" />
                  <span>{currentLanguage === 'vi' ? 'Không tìm thấy mô-đun con nào phù hợp bộ lọc.' : 'No modules correspond to selected query rules.'}</span>
                </div>
              ) : (
                filteredSubDevices.map((sub) => {
                  const label = currentLanguage === 'vi' ? sub.nameVi : currentLanguage === 'zh' ? sub.nameZh : sub.nameEn;
                  
                  // Dynamic rating warning colors
                  const isHealthy = sub.health >= 80;
                  const isCritical = sub.health < 40;
                  const healthColor = isCritical 
                    ? 'text-red-400 border-red-500/20 bg-red-500/5' 
                    : isHealthy 
                    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
                    : 'text-amber-400 border-amber-500/20 bg-amber-500/5';

                  const typeEmoji = sub.type === 'motor' ? '⚙️' : sub.type === 'sensor' ? '📡' : sub.type === 'camera' ? '📷' : sub.type === 'heater' ? '♨️' : '🔧';
                  
                  return (
                    <div
                      key={sub.id}
                      className={`border rounded-xl p-4 bg-slate-950/40 relative overflow-hidden transition-all duration-150 ${
                        sub.health < 80 ? 'border-amber-500/30 bg-amber-950/5' : 'border-slate-800/80 hover:border-slate-700/80'
                      }`}
                    >
                      {/* Interactive Calibration pulse indicator overlay */}
                      {sub.isCalibrating && (
                        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>CALIBRATING OPTICAL BIAS / REALIGNING MECHANICAL MESH... {sub.calibrationProgress}%</span>
                          </div>
                          {/* Inner bar */}
                          <div className="w-56 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 progress-glow" style={{ width: `${sub.calibrationProgress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Interactive Firmware flashing overlay */}
                      {updatingFirmwareId === sub.id && (
                        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 animate-pulse">
                            <CloudLightning className="w-3.5 h-3.5 animate-bounce" />
                            <span>FLASHING DIRECT SYSTEM BINARIES: {firmwareProgress}%</span>
                          </div>
                          {/* Inner bar */}
                          <div className="w-56 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 progress-glow" style={{ width: `${firmwareProgress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Flex layout for Info */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                              <span className="text-xs">{typeEmoji}</span>
                              {label}
                            </span>
                            
                            {/* Device Type tag */}
                            <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                              {sub.type}
                            </span>
                          </div>

                          {/* Technical attributes */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-slate-400">
                            <div>
                              <span>Voltage:</span>{' '}
                              <strong className="text-slate-200">{sub.voltage} V</strong>
                            </div>
                            <div>
                              <span>Amp draw:</span>{' '}
                              <strong className="text-slate-200">{sub.loadAmp.toFixed(2)} A</strong>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Health:</span>{' '}
                              <strong className={`font-bold ${isCritical ? 'text-red-400' : isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {sub.health}%
                              </strong>
                            </div>
                            <div>
                              <span>Firmware:</span>{' '}
                              <strong className="text-slate-200">{sub.firmwareVersion}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Interactive operations button segment */}
                        <div className="flex sm:flex-col items-end gap-2 shrink-0">
                          {/* Indicator label */}
                          <div className="flex items-center gap-1.5 text-[10.5px]">
                            <span className="text-slate-500">Status:</span>
                            {sub.health < 40 ? (
                              <span className="text-red-400 bg-red-950/20 border border-red-900 px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-500" />
                                Fault
                              </span>
                            ) : sub.health < 80 ? (
                              <span className="text-amber-400 bg-amber-950/20 border border-amber-900 px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                Deviative
                              </span>
                            ) : (
                              <span className="text-emerald-400 bg-emerald-950/25 border border-emerald-900/40 px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                Ideal
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1.5">
                            {/* Calibration Trigger */}
                            <button
                              onClick={() => handleStartCalibration(sub.id, label)}
                              title={currentLanguage === 'vi' ? 'Tiến hành hiệu chuẩn thông số cơ quang' : 'Initiate micro calibration loop'}
                              className="px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RotateCcw className="w-3 h-3 text-blue-400" />
                              <span>{currentLanguage === 'vi' ? 'Hiệu Chuẩn' : 'Calibrate'}</span>
                            </button>

                            {/* Firmware Trigger */}
                            {sub.firmwareVersion !== 'v2.1.2_LATEST' && (
                              <button
                                onClick={() => handleUpdateFirmware(sub.id, label)}
                                title={currentLanguage === 'vi' ? 'Cập nhật mã Eprom hệ thống nhận dạng' : 'Flash latest safety firmware binaries'}
                                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <CloudLightning className="w-3 h-3 text-amber-400" />
                                <span>Firmware v2.1.2</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Custom interactive footer simulation guide */}
            <div className="mt-5 bg-slate-900/45 border border-slate-800/80 rounded-lg p-3 text-[11.5px] text-slate-400 leading-relaxed flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-200">
                  {currentLanguage === 'vi' ? 'Mẹo sửa chữa thông minh:' : 'Smart diagnostic guideline:'}
                </span>{' '}
                {currentLanguage === 'vi'
                  ? 'Khi một mô-đun chuyển sang màu vàng (Sức khỏe < 80%), nhấn nút "Hiệu Chuẩn" để tự động cân bằng điện áp và làm sạch quang học, khi tất cả các mô-đun bừng sáng khỏe mạnh trở lại, trạm máy sẽ tự động chuyển từ lỗi về trạng thái Đang Chạy!'
                  : 'Diagnostic nodes monitor feedback loops. Run calibrations to clear voltage deviations, sensors dirty errors, or conveyor jams. Completing calibration synchronizes healthy signals directly into the workshop view.'}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
