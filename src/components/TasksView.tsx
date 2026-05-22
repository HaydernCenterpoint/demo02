import React, { useState, useMemo } from 'react';
import { Language, FlowStep, StatusType, TranslationSchema } from '../types';
import { translations } from '../translations';
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  CheckSquare,
  Sparkles,
  ArrowRight,
  UserPlus,
  Compass,
  FileCheck2,
  Trash2,
  BarChart3,
  Flame,
  Check,
  Zap,
} from 'lucide-react';

interface TasksViewProps {
  currentLanguage: Language;
  steps: FlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<FlowStep[]>>;
  triggerToast: (msg: string) => void;
  simulationActive: boolean;
}

export interface Task {
  id: string;
  titleVi: string;
  titleEn: string;
  titleZh: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionZh: string;
  status: 'pending' | 'processing' | 'awaiting' | 'completed'; // matches taskPending, taskProcessing, taskAwaitingConfirm, taskCompleted
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  stationId: string; // s1-s9, sc1-sc3
  createdAt: string;
  dueDate: string;
}

// Local translation block for Tasks Screen to align beautifully with current Vietnamese preference
const localTasksTranslations = {
  vi: {
    title: 'Trung tâm Chỉ huy & Giao nhiệm vụ Vận hành',
    subtitle: 'Quản lý yêu cầu bảo trì, lệnh nạp nén vật liệu, và khắc phục sai số kỹ thuật cho lực lượng kỹ sư trực ca.',
    statsTotal: 'Tổng số nhiệm vụ',
    statsPending: 'Chờ phân ca',
    statsProcessing: 'Đang xử lý',
    statsAwaiting: 'Chờ nghiệm thu',
    statsCompleted: 'Đạt yêu cầu',
    createTitle: 'Tạo Lệnh Vận Hành Mới',
    inputTitleVi: 'Tiêu đề (Tiếng Việt)',
    inputTitleEn: 'Tiêu đề (Tiếng Anh)',
    inputDescVi: 'Nội dung chi tiết chỉ dẫn kỹ thuật',
    inputStation: 'Trạm máy liên đới',
    inputOperator: 'Kỹ sư chịu trách nhiệm',
    inputPriority: 'Mức độ khẩn cấp',
    inputCreateBtn: 'Phát lệnh vận hành',
    filterPriority: 'Độ ưu tiên',
    filterStatus: 'Theo trạng thái',
    filterOperator: 'Nhân sự trực',
    searchPlaceholder: 'Tìm kiếm công việc, mã lệnh, vị trí...',
    priorityHigh: 'Khẩn cấp',
    priorityMedium: 'Trung bình',
    priorityLow: 'Thường lệ',
    quickTemplateTitle: 'Lệnh mẫu nhanh (Giảm ách tắc)',
    quickTemplateBtn1: 'Khắc phục vật liệu s7',
    quickTemplateBtn1Desc: 'Bơm nguyên liệu và đưa trạng thái Trạm 7 từ dừng về Đang chạy',
    quickTemplateBtn2: 'Hiệu chuẩn s5 & s6',
    quickTemplateBtn2Desc: 'Cân bằng servo trục vít và nạp nguội nhiệt độ trục máy s6',
    deleteBtn: 'Xoá lệnh',
    advanceBtnPending: 'Bắt đầu xử lý',
    advanceBtnProcessing: 'Gửi nghiệm thu',
    advanceBtnAwaiting: 'Duyệt hoàn thành',
    noTasks: 'Tuyệt hảo! Toàn bộ hạng mục công việc đã ở trạng thái tối ưu.',
    emptyList: 'Không tìm thấy nhiệm vụ nào khớp bộ lọc!',
    historyAction: 'Nhật ký chỉ huy vận hành',
    toastCreateSuccess: 'Đã bổ sung lệnh làm việc mới vào hàng đợi hệ thống ERP!',
    toastStatusChange: 'Nhiệm vụ đã được chuyển trạng thái sang:',
    toastDeleted: 'Đã huỷ bỏ lệnh vận hành.',
    toastQuickS7: 'Lệnh khẩn: Đang nạp tiếp liệu cho Trạm 7. Băng tải đã chạy trở lại!',
    toastQuickS6: 'Lệnh khẩn: Trục động cơ s5 và s6 đã được hiệu chuẩn và giảm tải nóng!'
  },
  en: {
    title: 'Operational Task & Dispatch Command',
    subtitle: 'Monitor maintenance assignments, material refill requests, and calibration work orders for the on-duty brigade.',
    statsTotal: 'Total Dispatch Entries',
    statsPending: 'Awaiting Crew',
    statsProcessing: 'In Progress',
    statsAwaiting: 'Awaiting QC',
    statsCompleted: 'Closed Tasks',
    createTitle: 'Dispatch New Manufacturing Order',
    inputTitleVi: 'Title (Vietnamese)',
    inputTitleEn: 'Title (English)',
    inputDescVi: 'Operational & safety instructions content',
    inputStation: 'Target Workstation',
    inputOperator: 'Assigned Specialist',
    inputPriority: 'Severity Limit',
    inputCreateBtn: 'Transmit Workorder',
    filterPriority: 'Priority Level',
    filterStatus: 'Stage',
    filterOperator: 'Operator Shift',
    searchPlaceholder: 'Search tasks description, ID, workstation...',
    priorityHigh: 'Urgent',
    priorityMedium: 'Standard',
    priorityLow: 'Routine',
    quickTemplateTitle: 'Quick Dispatch Scenarios (Mitigate Bottlenecks)',
    quickTemplateBtn1: 'Refill s7 Hopper',
    quickTemplateBtn1Desc: 'Resolve material shortage on Station 7 to resume conveyor loops',
    quickTemplateBtn2: 'Calibrate Spindles s5 & s6',
    quickTemplateBtn2Desc: 'Cool down s6 screwdriver motor thermal indices to ideal state',
    deleteBtn: 'Discard order',
    advanceBtnPending: 'Start Task',
    advanceBtnProcessing: 'Submit to QC',
    advanceBtnAwaiting: 'Approve & Close',
    noTasks: 'Outstanding! All industrial workgroups have achieved 100% resolution.',
    emptyList: 'No matching work orders found.',
    historyAction: 'Command Log Feed',
    toastCreateSuccess: 'New workspace dispatch order broadcasted on Modbus TCP queue!',
    toastStatusChange: 'Task stage updated to:',
    toastDeleted: 'Operational dispatch order discarded.',
    toastQuickS7: 'Emergency order: Refilling s7. Main line conveyor resumed!',
    toastQuickS6: 'Emergency order: Z-axis screwing components aligned and temperature normalized!'
  },
  zh: {
    title: '生产排班与工艺派单指挥台',
    subtitle: '管理设备缺陷整改工单、储料罐补料指令、以及工艺参数校准等班组作业计划。',
    statsTotal: '任务总数',
    statsPending: '待接单',
    statsProcessing: '处理中',
    statsAwaiting: '质检中',
    statsCompleted: '已闭环',
    createTitle: '下发新规工艺指令',
    inputTitleVi: '任务标题 (越南语)',
    inputTitleEn: '任务标题 (英语)',
    inputDescVi: '工时技术规格及安全注意事项',
    inputStation: '受影响设备站',
    inputOperator: '责任担当工程师',
    inputPriority: '紧急程度',
    inputCreateBtn: '广播执行命令',
    filterPriority: '优先级',
    filterStatus: '阶段过滤',
    filterOperator: '网格班组人员',
    searchPlaceholder: '模糊查询任务名、工作站编号...',
    priorityHigh: '极高紧急',
    priorityMedium: '普通指令',
    priorityLow: '日常维保',
    quickTemplateTitle: '快捷场景调度 (快速消除限速)',
    quickTemplateBtn1: '补充 7号站 物料',
    quickTemplateBtn1Desc: '补充料仓原料并将第7号站切换为“运行中”',
    quickTemplateBtn2: '校准 s5 与 s6 拧紧轴',
    quickTemplateBtn2Desc: '快速校准拧螺丝轴偏振并对s6进行强制水循环降温',
    deleteBtn: '作废工单',
    advanceBtnPending: '接单处理',
    advanceBtnProcessing: '提请验证',
    advanceBtnAwaiting: '确认归档',
    noTasks: '完好！目前无任何挂起异常问题。',
    emptyList: '无符合筛选条件的排班。',
    historyAction: '工艺指挥系统日志',
    toastCreateSuccess: '新的工艺运行任务已注册到企业局域网!',
    toastStatusChange: '指令阶段已被更新为:',
    toastDeleted: '工单已被作废回收。',
    toastQuickS7: '紧急广播：7号站物料灌装。自动化输送网带已再次启动！',
    toastQuickS6: '紧急广播：s5与s6打螺丝主轴偏正重置，升温警告消失。'
  }
};

export const DevicesListOptions = [
  { id: 's1', labelVi: 'Trạm 1 - Phễu nạp mạch', labelEn: 'Station 1 - Vacuum Feeder' },
  { id: 's2', labelVi: 'Trạm 2 - Băng tải gốc', labelEn: 'Station 2 - Conveyor Motor' },
  { id: 's3', labelVi: 'Trạm 3 - Lắp jumper', labelEn: 'Station 3 - Jumper Inserter' },
  { id: 's4', labelVi: 'Trạm 4 - Lắp bản MCB', labelEn: 'Station 4 - MCB Arm' },
  { id: 's5', labelVi: 'Trạm 5 - Bắn vít tản nhiệt', labelEn: 'Station 5 - Heatsink Screw' },
  { id: 's6', labelVi: 'Trạm 6 - Vặn ốc tản nhiệt lớn', labelEn: 'Station 6 - Large Screw Spindle' },
  { id: 's7', labelVi: 'Trạm 7 - Lắp SMB', labelEn: 'Station 7 - SMB Assembly' },
  { id: 's8', labelVi: 'Trạm 8 - Tổ hợp Chasis SMB', labelEn: 'Station 8 - Chassis Assy' },
  { id: 's9', labelVi: 'Trạm 9 - Hoàn thiện', labelEn: 'Station 9 - QA Finish' },
  { id: 'sc1', labelVi: 'Trạm 10 - Vỏ bảo vệ', labelEn: 'Station 10 - Protective Casing' },
  { id: 'sc2', labelVi: 'Trạm 11 - Máy bắn vít tự động', labelEn: 'Station 11 - Auto Screwing' },
  { id: 'sc3', labelVi: 'Trạm 12 - Robot lên liệu', labelEn: 'Station 12 - Loader Robot' },
];

export const OperatorsList = [
  'Alex Nguyen', 'Tran Minh', 'Sarah Pham', 'Wang Lei', 'Nguyen Van A', 'Chen Qiang', 'Le Hoang', 'Hoang Nam', 'Mai Chi', 'Vu Long', 'Phan Tuan', 'Zhao Lin'
];

export const TasksView: React.FC<TasksViewProps> = ({
  currentLanguage,
  steps,
  setSteps,
  triggerToast,
  simulationActive,
}) => {
  const localT = localTasksTranslations[currentLanguage];
  const t = translations[currentLanguage];

  // Primary tasks state seeded with highly contextual operational checklist
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'TASK-1102',
      titleVi: 'Khắc phục sự cố quá nhiệt động cơ s6',
      titleEn: 'Resolve thermal overheating on motor s6',
      titleZh: '排除s6工位底板拧螺丝电机过热故障',
      descriptionVi: 'Đầu bắn vít tản nhiệt s6 tăng nhiệt độ tới 85 độ. Cần dừng trục động cơ, thêm dầu bôi trơn và chạy tuần hoàn làm mát.',
      descriptionEn: 'Heatsink Screwing temperature reached 85C on s6. Oil lubrication check and cooling fluid cycles must be activated immediately.',
      descriptionZh: 's6散热片拧螺丝热力系统达到报警临界，需要添加润滑阻阻润，并测试回水循环。',
      status: 'processing',
      priority: 'high',
      assignedTo: 'Chen Qiang',
      stationId: 's6',
      createdAt: '07:22',
      dueDate: '10:30',
    },
    {
      id: 'TASK-1104',
      titleVi: 'Bổ sung khay nguyên liệu SMB Trạm s7',
      titleEn: 'Load SMB material trays for Station s7',
      titleZh: 's7安装工段缺料托盘补满仓位',
      descriptionVi: 'Mạch SMB đã cạn nguồn cấp liệu khiến cảm biến sợi quang ra lệnh khóa dừng băng tải. Cần kỹ sư gạt tay nạp nén khay liệu mới.',
      descriptionEn: 'SMB assembly has run out of materials causing conveyor lock trigger, operator override and load a new container sequence.',
      descriptionZh: 'SMB线路板缺料引发总控停。通知上料小组补充整盘进气底托元件。',
      status: 'pending',
      priority: 'high',
      assignedTo: 'Le Hoang',
      stationId: 's7',
      createdAt: '07:15',
      dueDate: '08:00',
    },
    {
      id: 'TASK-1089',
      titleVi: 'Hiệu chuẩn lệch mốc định vị phễu hút s1',
      titleEn: 'Vacuum feeder misalignment calibration s1',
      titleZh: 's1吸真空嘴定位偏差常数标定',
      descriptionVi: 'Sai lệch quang học dải biên vượt ngưỡng +/- 0.5mm. Kích hoạt hiệu chỉnh bias laser tự động từ tủ PLC điều phối.',
      descriptionEn: 'Bias delta on vacuum feeder exceeded +/- 0.5mm limit. Run self-compensating laser utility program via central PLC.',
      descriptionZh: '吸嘴中心坐标和图像重合相比存在0.5mm死位漂移，需要启动零点回归效准程序。',
      status: 'awaiting',
      priority: 'medium',
      assignedTo: 'Alex Nguyen',
      stationId: 's1',
      createdAt: '06:40',
      dueDate: '09:00',
    },
    {
      id: 'TASK-1011',
      titleVi: 'Bảo dưỡng định kỳ mỡ bôi trơn robot sc3',
      titleEn: 'Scheduled axis lubrication Loader Robot sc3',
      titleZh: 'sc3多联四轴机械手周期注脂保养',
      descriptionVi: 'Thay dầu nhờn khớp xoay trục số 3 và kiểm nghiệm rơ le áp suất âm của hệ thống hút nén.',
      descriptionEn: 'Lubricate mechanical joint 3 and test passive vacuum pressure sensors limit under simulated stress blocks.',
      descriptionZh: '3轴和4轴旋转轴部进行标准高温黄油填补，测定负压真空吸嘴最大承重。',
      status: 'completed',
      priority: 'low',
      assignedTo: 'Zhao Lin',
      stationId: 'sc3',
      createdAt: '05:30',
      dueDate: '07:30',
    },
  ]);

  // Command Action logs to show in panel
  const [logs, setLogs] = useState<string[]>([
    '07:22 - TASK-1102 [Khẩn cấp] khởi tạo tự động theo bit lỗi Modbus.',
    '07:15 - TASK-1104 [Khẩn cấp] chỉ định cho kỹ sư Le Hoang.',
    '07:10 - TASK-1089 được chuyển sang Chờ nghiệm thu chất lượng.',
    '07:05 - Bảo dưỡng định kỳ TASK-1011 nghiệm thu 100% ĐẠT.',
  ]);

  // Form states for creating a custom dispatch workorder
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newTitleVi, setNewTitleVi] = useState<string>('');
  const [newTitleEn, setNewTitleEn] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newStation, setNewStation] = useState<string>('s1');
  const [newOperator, setNewOperator] = useState<string>(OperatorsList[0]);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Search and analytical filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'awaiting' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');

  // Derive Statistics values
  const stats = useMemo(() => {
    let pend = 0;
    let proc = 0;
    let awaitQC = 0;
    let comp = 0;

    tasks.forEach((t) => {
      if (t.status === 'pending') pend++;
      if (t.status === 'processing') proc++;
      if (t.status === 'awaiting') awaitQC++;
      if (t.status === 'completed') comp++;
    });

    return {
      total: tasks.length,
      pending: pend,
      processing: proc,
      awaiting: awaitQC,
      completed: comp,
    };
  }, [tasks]);

  // Handle step progression on task life states (State Machine)
  const handleAdvanceTask = (taskId: string) => {
    let nextStatus: Task['status'] = 'pending';
    let label = '';

    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === taskId) {
          if (item.status === 'pending') {
            nextStatus = 'processing';
            label = currentLanguage === 'vi' ? 'ĐANG XỬ LÝ (Processing)' : 'IN PROGRESS';
          } else if (item.status === 'processing') {
            nextStatus = 'awaiting';
            label = currentLanguage === 'vi' ? 'CHỜ NGHIỆM THU (Quality QC Check)' : 'AWAITING APPROVAL';
          } else if (item.status === 'awaiting') {
            nextStatus = 'completed';
            label = currentLanguage === 'vi' ? 'HOÀN THÀNH (Completed & Closed)' : 'COMPLETED';

            // Automatic side-effect! If task is resolved, update physical station flow step logic
            setSteps((prevSteps) =>
              prevSteps.map((step) => {
                if (step.id === item.stationId) {
                  // Normalize step entirely!
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
          } else {
            nextStatus = 'completed';
          }
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );

    const matchTask = tasks.find((t) => t.id === taskId);
    const titleText = currentLanguage === 'vi' ? matchTask?.titleVi : matchTask?.titleEn;

    // Log action to operational feed
    const nowText = new Date().toTimeString().slice(0, 5);
    setLogs((prev) => [`${nowText} - Lệnh ${taskId} cập nhật -> ${nextStatus.toUpperCase()}`, ...prev]);

    triggerToast(`${localT.toastStatusChange} ${label}`);
  };

  // Dispatch a Custom Task
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleVi.trim() && !newTitleEn.trim()) return;

    const codeId = `TASK-${1100 + tasks.length + 1}`;
    const nowText = new Date().toTimeString().slice(0, 5);

    const newTask: Task = {
      id: codeId,
      titleVi: newTitleVi || newTitleEn,
      titleEn: newTitleEn || newTitleVi,
      titleZh: newTitleEn || newTitleVi,
      descriptionVi: newDesc || 'Không có chỉ dẫn thêm.',
      descriptionEn: newDesc || 'No complementary safety notes.',
      descriptionZh: newDesc || '常规定位作业。',
      status: 'pending',
      priority: newPriority,
      assignedTo: newOperator,
      stationId: newStation,
      createdAt: nowText,
      dueDate: '17:30',
    };

    setTasks((prev) => [newTask, ...prev]);
    setLogs((prev) => [`${nowText} - Lệnh mới ${codeId} được bàn giao cho ${newOperator}`, ...prev]);
    
    // Clear states
    setNewTitleVi('');
    setNewTitleEn('');
    setNewDesc('');
    setShowForm(false);
    triggerToast(localT.toastCreateSuccess);
  };

  // Task deletion
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setLogs((prev) => [`${new Date().toTimeString().slice(0, 5)} - Huỷ bỏ mã lệnh ${id}`, ...prev]);
    triggerToast(localT.toastDeleted);
  };

  // Preformed quick macros triggers
  const handleQuickMacroS7 = () => {
    triggerToast(localT.toastQuickS7);
    
    // 1. Instantly advance s7 related tasks to completed
    setTasks((prev) =>
      prev.map((item) =>
        item.stationId === 's7' ? { ...item, status: 'completed' as const } : item
      )
    );

    // 2. Clear s7 stopped alarm and start conveyors
    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        if (step.id === 's7') {
          return {
            ...step,
            status: 'running',
            temp: 34.0,
            vibration: 1.0,
            oee: 92.0,
          };
        }
        return step;
      })
    );

    setLogs((prev) => [`${new Date().toTimeString().slice(0, 5)} - Giao nhận khẩn Trạm 7 hoàn thành. Động cơ bật.`].concat(prev));
  };

  const handleQuickMacroS6 = () => {
    triggerToast(localT.toastQuickS6);

    // 1. Complete Z-axis thermal tasks
    setTasks((prev) =>
      prev.map((item) =>
        item.stationId === 's6' || item.stationId === 's5' ? { ...item, status: 'completed' as const } : item
      )
    );

    // 2. Cool down motors on s5 & s6
    setSteps((prevStep) =>
      prevStep.map((s) => {
        if (s.id === 's6' || s.id === 's5') {
          return {
            ...s,
            status: 'running',
            temp: 36.5,
            vibration: 1.1,
            oee: 93.0,
          };
        }
        return s;
      })
    );

    setLogs((prev) => [`${new Date().toTimeString().slice(0, 5)} - Hiệu chuẩn siết ốc s5 & s6 hoàn tất. Nhiệt lượng xả tủ.`].concat(prev));
  };

  // Filter processes
  const filteredTasks = tasks.filter((t) => {
    const textVi = t.titleVi + t.descriptionVi + t.id;
    const textEn = t.titleEn + t.descriptionEn;
    const blockText = `${textVi} ${textEn}`.toLowerCase();

    const matchesSearch = blockText.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesOperator = operatorFilter === 'all' || t.assignedTo === operatorFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesOperator;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="tasks-main-dashboard">
      
      {/* 1. TOP STATS OVERVIEW HEADER */}
      <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5" id="tasks-introduction-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-5.5 h-5.5 text-blue-500 animate-pulse" />
              <span>{localT.title}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-4xl leading-normal">
              {localT.subtitle}
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            id="control-btn-add-task-toggle"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-500/20 shadow-md shadow-blue-600/10 self-start sm:self-center"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{localT.createTitle}</span>
          </button>
        </div>

        {/* STATS COUNT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mt-5">
          {/* Total tasks */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{localT.statsTotal}</span>
              <h4 className="text-lg font-mono font-bold text-white">{stats.total}</h4>
            </div>
            <BarChart3 className="w-6 h-6 text-slate-600" />
          </div>

          {/* Pending */}
          <div className="bg-slate-950/45 p-3.5 border border-slate-900 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{localT.statsPending}</span>
              <h4 className="text-lg font-mono font-bold text-slate-400">{stats.pending}</h4>
            </div>
            <Clock className="w-6 h-6 text-slate-600" />
          </div>

          {/* Processing */}
          <div className="bg-blue-500/5 p-3.5 border border-blue-500/15 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-blue-400 font-bold uppercase">{localT.statsProcessing}</span>
              <h4 className="text-lg font-mono font-bold text-blue-400">{stats.processing}</h4>
            </div>
            <PlayCircle className="w-6 h-6 text-blue-500/30" />
          </div>

          {/* Awaiting Quality approval */}
          <div className="bg-amber-500/5 p-3.5 border border-amber-500/15 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-amber-400 font-bold uppercase">{localT.statsAwaiting}</span>
              <h4 className="text-lg font-mono font-bold text-amber-400">{stats.awaiting}</h4>
            </div>
            <Compass className="w-6 h-6 text-amber-500/30 animate-pulse" />
          </div>

          {/* Completed */}
          <div className="bg-emerald-500/5 p-3.5 border border-emerald-500/15 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">{localT.statsCompleted}</span>
              <h4 className="text-lg font-mono font-bold text-emerald-400">{stats.completed}</h4>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500/30" />
          </div>
        </div>
      </div>

      {/* 2. TASK CREATION FORM INNER BOX Toggle */}
      {showForm && (
        <form
          onSubmit={handleCreateTaskSubmit}
          className="bg-[#111827]/75 border border-blue-500/30 rounded-xl p-5 space-y-4 animate-slideDown"
          id="task-dispatch-creation-form"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>{localT.createTitle}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider"
            >
              {t.closeButton}
            </button>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title Vietnamese */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">{localT.inputTitleVi}</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Hiệu chỉnh gối dỡ băng tải"
                value={newTitleVi}
                onChange={(e) => setNewTitleVi(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg p-2.5 text-white text-xs outline-none"
              />
            </div>

            {/* Title English */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">{localT.inputTitleEn}</label>
              <input
                type="text"
                required
                placeholder="Example: Re-align conveyor bearing tension"
                value={newTitleEn}
                onChange={(e) => setNewTitleEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg p-2.5 text-white text-xs outline-none"
              />
            </div>

            {/* Target device / Station select */}
            <div className="space-y-1.55">
              <label className="text-[11px] text-slate-400 font-semibold">{localT.inputStation}</label>
              <select
                value={newStation}
                onChange={(e) => setNewStation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg p-2.5 text-white text-xs outline-none cursor-pointer"
              >
                {DevicesListOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {currentLanguage === 'vi' ? opt.labelVi : opt.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigner Specialists select */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">{localT.inputOperator}</label>
              <select
                value={newOperator}
                onChange={(e) => setNewOperator(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg p-2.5 text-white text-xs outline-none cursor-pointer"
              >
                {OperatorsList.map((op) => (
                  <option key={op} value={op}>
                    👤 {op}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Priority selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold">{localT.inputPriority}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const isActive = newPriority === p;
                  const borderCol = p === 'high' ? 'border-red-500/30' : p === 'medium' ? 'border-amber-500/30' : 'border-slate-800';
                  const activeBg = p === 'high' ? 'bg-red-500/15 text-red-400 border-red-500' : p === 'medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500' : 'bg-blue-500/10 text-blue-400 border-blue-500';

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-2 px-3 border rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                        isActive ? activeBg : `bg-slate-950/60 ${borderCol} text-slate-400`
                      }`}
                    >
                      {p === 'high' ? localT.priorityHigh : p === 'medium' ? localT.priorityMedium : localT.priorityLow}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Instructions Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] text-slate-400 font-semibold">{localT.inputDescVi}</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="Hướng dẫn bổ sung dọn rác cơ cấu xả khí nén hoặc bù hụt..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg p-2.5 text-white text-xs outline-none resize-none"
              />
            </div>

          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 font-bold hover:shadow-indigo-500/20 text-white text-xs rounded-lg cursor-pointer transition-all active:scale-98 shadow shadow-md ml-auto block border border-indigo-500/20"
          >
            {localT.inputCreateBtn}
          </button>
        </form>
      )}

      {/* 3. SCENARIO BOTTLENECK QUICK CLEARING SHORTCUTS */}
      <div className="bg-slate-900/35 border border-slate-950 rounded-xl p-5">
        <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>{localT.quickTemplateTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Clear Trạm s7 Stopped */}
          <button
            onClick={handleQuickMacroS7}
            className="flex items-center text-left p-3.5 bg-[#0e1726]/80 hover:bg-[#112038] border border-blue-900/30 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3.5 space-y-0.5">
              <h5 className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                {localT.quickTemplateBtn1}
              </h5>
              <p className="text-[10.5px] text-slate-400 font-semibold leading-normal">
                {localT.quickTemplateBtn1Desc}
              </p>
            </div>
          </button>

          {/* Quick Clear Overheating Screwing */}
          <button
            onClick={handleQuickMacroS6}
            className="flex items-center text-left p-3.5 bg-[#1a111a]/80 hover:bg-[#251225] border border-pink-950/30 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="p-3 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
            <div className="ml-3.5 space-y-0.5">
              <h5 className="text-xs font-bold text-slate-100 group-hover:text-pink-300 transition-colors">
                {localT.quickTemplateBtn2}
              </h5>
              <p className="text-[10.5px] text-slate-400 font-semibold leading-normal">
                {localT.quickTemplateBtn2Desc}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. MAIN TASK COMPARTMENTS DISPLAYED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="tasks-core-interactive-area">
        
        {/* LEFT/MIDDLE: SUBTASK CARDS COLUMN (2 Span) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5">
            
            {/* Filters layout */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/40">
              
              {/* Search input field */}
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder={localT.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 text-white text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-900 focus:border-blue-500/80 outline-none"
                />
              </div>

              {/* Tag selectors dropdown filters */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* Status selector */}
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 text-slate-300 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">📁 {localT.filterStatus}: {localT.all}</option>
                  <option value="pending">⏳ {t.taskPending}</option>
                  <option value="processing">⚙️ {t.taskProcessing}</option>
                  <option value="awaiting">🔍 {t.taskAwaitingConfirm}</option>
                  <option value="completed">✅ {t.taskCompleted}</option>
                </select>

                {/* Priority Selector */}
                <select
                  value={priorityFilter}
                  onChange={(e: any) => setPriorityFilter(e.target.value)}
                  className="bg-slate-950 text-slate-300 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">⚡ {localT.filterPriority}: {localT.all}</option>
                  <option value="high">🔴 {localT.priorityHigh}</option>
                  <option value="medium">🟡 {localT.priorityMedium}</option>
                  <option value="low">🟢 {localT.priorityLow}</option>
                </select>

                {/* Operator Selector */}
                <select
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="bg-slate-950 text-slate-300 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">👤 {localT.filterOperator}: {localT.all}</option>
                  {OperatorsList.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cards Lists */}
            <div className="mt-4 space-y-4 max-h-[550px] overflow-y-auto pr-1 customize-scrollbar flex flex-col">
              {filteredTasks.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <ClipboardList className="w-10 h-10 text-slate-700/65" />
                  <span>{localT.emptyList}</span>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const title = currentLanguage === 'vi' ? task.titleVi : currentLanguage === 'zh' ? task.titleZh : task.titleEn;
                  const desc = currentLanguage === 'vi' ? task.descriptionVi : currentLanguage === 'zh' ? task.descriptionZh : task.descriptionEn;

                  // Highlighting priority colors
                  const priorityColor = task.priority === 'high'
                    ? 'text-red-400 bg-red-500/10 border-red-500/30'
                    : task.priority === 'medium'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-blue-400 bg-blue-500/10 border-blue-500/30';

                  const priorityLabel = task.priority === 'high' ? localT.priorityHigh : task.priority === 'medium' ? localT.priorityMedium : localT.priorityLow;

                  // Finding associated workstation label Key
                  const relatedStep = steps.find((s) => s.id === task.stationId);
                  const stepLabel = relatedStep ? (t[relatedStep.labelKey] as string) : task.stationId;

                  // Advance status color config
                  let statusBadgeStyle = 'text-slate-400 bg-slate-800 border-slate-700';
                  let statusButtonLabel = localT.advanceBtnPending;
                  let statusColor = 'border-slate-800 bg-slate-950/30';

                  if (task.status === 'processing') {
                    statusBadgeStyle = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                    statusButtonLabel = localT.advanceBtnProcessing;
                    statusColor = 'border-blue-500/30 bg-blue-500/5';
                  } else if (task.status === 'awaiting') {
                    statusBadgeStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/25';
                    statusButtonLabel = localT.advanceBtnAwaiting;
                    statusColor = 'border-amber-500/30 bg-amber-500/5 animate-pulse';
                  } else if (task.status === 'completed') {
                    statusBadgeStyle = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30 font-bold';
                    statusColor = 'border-slate-900 bg-slate-950/10 opacity-60';
                  }

                  const statusTitle = task.status === 'pending'
                    ? t.taskPending
                    : task.status === 'processing'
                    ? t.taskProcessing
                    : task.status === 'awaiting'
                    ? t.taskAwaitingConfirm
                    : t.taskCompleted;

                  return (
                    <div
                      key={task.id}
                      id={`operational-task-node-${task.id}`}
                      className={`border rounded-xl p-4 transition-all duration-150 relative ${statusColor}`}
                    >
                      {/* Priority label top banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Task Code Badge */}
                            <span className="text-[11px] font-mono font-bold text-slate-400 bg-[#070b13] px-2 py-0.5 rounded border border-slate-800">
                              {task.id}
                            </span>

                            {/* Priority */}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${priorityColor}`}>
                              {priorityLabel}
                            </span>

                            {/* Linked Work Station */}
                            <span className="text-[10.5px] font-mono text-blue-400 underline font-semibold">
                              📍 {stepLabel}
                            </span>
                          </div>

                          <h4 className="text-slate-100 font-bold text-xs pt-1">
                            {title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5 max-w-2xl">
                            {desc}
                          </p>

                          {/* Operator assignment info footer inside card */}
                          <div className="flex items-center gap-4 text-[10.5px] text-slate-500 pt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              Operator: <strong className="text-slate-300">{task.assignedTo}</strong>
                            </span>
                            <span>•</span>
                            <span>Due Today: <strong className="text-slate-400">{task.dueDate}</strong></span>
                          </div>
                        </div>

                        {/* Interactive state actions */}
                        <div className="flex flex-row items-center sm:flex-col items-end gap-3 self-end sm:self-center shrink-0">
                          {/* Current stage indicator */}
                          <span className={`text-[10.5px] px-2.5 py-1 rounded-md border ${statusBadgeStyle}`}>
                            {statusTitle}
                          </span>

                          {/* Quick Advance Button or Trash Button */}
                          <div className="flex items-center gap-2 pt-1">
                            {task.status !== 'completed' ? (
                              <button
                                onClick={() => handleAdvanceTask(task.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 active:scale-95 shadow"
                              >
                                <span>{statusButtonLabel}</span>
                                <ArrowRight className="w-3 h-3 text-white" />
                              </button>
                            ) : (
                              <span className="text-[11.5px] text-emerald-400 font-bold flex items-center gap-1 pr-1">
                                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                                Acknowledged
                              </span>
                            )}

                            {/* Allow deleting tasks */}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              title={localT.deleteBtn}
                              className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: ACTION DISPATCH FEED (1 Span) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111827]/40 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-805 pb-3 mb-4">
                <FileCheck2 className="w-4.5 h-4.5 text-blue-400" />
                <h3 className="text-slate-200 text-xs font-bold uppercase tracking-wider">
                  {localT.historyAction}
                </h3>
              </div>

              {/* Feed lists */}
              <div className="space-y-3 font-mono text-[11.5px] select-text">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-slate-400 leading-normal hover:text-slate-300 transition-colors"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Info footer guidelines instructions */}
            <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <div className="flex items-center gap-1 mb-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                <span className="font-bold text-slate-200">
                  {currentLanguage === 'vi' ? 'Quy chuẩn vận hành PLC' : 'PLC Modbus Dispatch Protocol'}
                </span>
              </div>
              {currentLanguage === 'vi'
                ? 'Mỗi khi kỹ sư duyệt hoàn thành (Duyệt nghiệm thu) một công việc, hệ thống truyền dẫn SCADA sẽ tự động phát tín hiệu búa lấp Modbus TCP để khôi phục chỉ số OEE và khởi động lại băng tải của trạm máy ở trạng thái lỗi.'
                : 'Closing work orders through the Command validation loop transmits automated corrective bytes directly to on-line PLC actuators. This updates general OEE scoreboards and clears physical line stoppages.'}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
