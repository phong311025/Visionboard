import React, { useState, useEffect } from 'react';
import { AreaOfLife, Goal, PlannerState, Step, Priority } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckSquare, Plus, X, Trash2, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Clock, Undo2, Redo2, Copy, ClipboardPaste, Pencil } from 'lucide-react';

interface ActionPlanProps {
  areas: AreaOfLife[];
  goals: Goal[];
  toggleStepCompletion: PlannerState['toggleStepCompletion'];
  selectedMonth: number;
  year: string;
  onAddStep: (goalId: string, step: Step) => void;
  onUpdateStep?: (goalId: string, step: Step) => void;
  onDeleteStep: (goalId: string, stepId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  // Undo/Redo Props
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Copy/Paste Props
  onCopy?: (type: 'goal' | 'step', data: Goal | Step) => void;
  onPasteGoal?: () => void;
  onPasteStep?: (targetGoalId: string) => void;
  clipboardType?: 'goal' | 'step' | undefined;
}

const PRIORITY_MAP = {
    High: 'Cao',
    Medium: 'TB',
    Low: 'Thấp'
};

const ActionPlan: React.FC<ActionPlanProps> = ({ 
    areas, goals, toggleStepCompletion, selectedMonth, year, 
    onAddStep, onUpdateStep, onDeleteStep, onDeleteGoal,
    onUndo, onRedo, canUndo, canRedo,
    onCopy, onPasteGoal, onPasteStep, clipboardType
}) => {
  const [modalOpenGoalId, setModalOpenGoalId] = useState<string | null>(null);
  const [editingStepId, setEditingStepId] = useState<string | null>(null); // Track ID if editing
  
  const [newStep, setNewStep] = useState<Partial<Step>>({
      description: '',
      priority: 'Medium',
      deadline: ''
  });

  // State để quản lý các mục tiêu đã hoàn thành đang được mở rộng xem lại
  const [expandedCompletedGoals, setExpandedCompletedGoals] = useState<Set<string>>(() => {
    try {
        const saved = localStorage.getItem('aesthetic_planner_expanded_goals');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
        return new Set();
    }
  });

  // State mới: Quản lý việc thu gọn phần chi tiết của các mục tiêu đang hiển thị
  // Mặc định cho phép hiển thị, nhưng user có thể thu gọn.
  const [minimizedGoals, setMinimizedGoals] = useState<Set<string>>(new Set());

  // Effect để lưu trạng thái mở rộng mỗi khi thay đổi
  useEffect(() => {
      localStorage.setItem('aesthetic_planner_expanded_goals', JSON.stringify(Array.from(expandedCompletedGoals)));
  }, [expandedCompletedGoals]);

  const toggleGoalExpansion = (goalId: string) => {
    const newSet = new Set(expandedCompletedGoals);
    if (newSet.has(goalId)) {
        newSet.delete(goalId);
    } else {
        newSet.add(goalId);
    }
    setExpandedCompletedGoals(newSet);
  };

  const toggleGoalMinimize = (goalId: string) => {
    const newSet = new Set(minimizedGoals);
    if (newSet.has(goalId)) {
        newSet.delete(goalId); // Xóa khỏi danh sách thu gọn -> Hiển thị
    } else {
        newSet.add(goalId); // Thêm vào danh sách thu gọn -> Ẩn
    }
    setMinimizedGoals(newSet);
  };

  const handleOpenModal = (goalId: string) => {
      setModalOpenGoalId(goalId);
      setEditingStepId(null); // Ensure we are in "Add" mode
      setNewStep({
          description: '',
          priority: 'Medium',
          deadline: `${year}-${String(selectedMonth + 1).padStart(2, '0')}-28`
      });
  };

  const handleEditClick = (goalId: string, step: Step) => {
      setModalOpenGoalId(goalId);
      setEditingStepId(step.id);
      setNewStep({
          description: step.description,
          priority: step.priority,
          deadline: step.deadline
      });
  };

  const handleStepSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!modalOpenGoalId || !newStep.description || !newStep.deadline) return;

      if (editingStepId && onUpdateStep) {
          // UPDATE MODE
          // Need to reconstruct the full step object
          // We can find the old step to preserve fields if needed, but here we replace mostly
          const updatedStep: Step = {
              id: editingStepId,
              description: newStep.description,
              deadline: newStep.deadline,
              priority: newStep.priority as Priority,
              isCompleted: false // Keep logic simple, or find original step to keep isCompleted
          };
          
          // Better logic: find original step to preserve completion status
          const goal = goals.find(g => g.id === modalOpenGoalId);
          const originalStep = goal?.steps.find(s => s.id === editingStepId);
          if (originalStep) {
               updatedStep.isCompleted = originalStep.isCompleted;
          }

          onUpdateStep(modalOpenGoalId, updatedStep);

      } else {
          // ADD MODE
          const stepToAdd: Step = {
              id: `s-${Date.now()}`,
              description: newStep.description,
              deadline: newStep.deadline,
              priority: newStep.priority as Priority,
              isCompleted: false
          };
          onAddStep(modalOpenGoalId, stepToAdd);
      }

      setModalOpenGoalId(null);
      setEditingStepId(null);
  };

  // Helper function to check urgency
  const getStepStatusStyle = (step: Step) => {
      if (step.isCompleted) return 'opacity-50 grayscale bg-gray-50';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(step.deadline);
      deadline.setHours(0, 0, 0, 0);
      
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Quá hạn -> Đỏ
      if (diffDays < 0) return 'bg-red-50 border-l-4 border-l-red-400';
      
      // Sắp đến hạn (trong vòng 3 ngày) -> Vàng
      if (diffDays >= 0 && diffDays <= 3) return 'bg-yellow-50 border-l-4 border-l-yellow-400';

      return 'hover:bg-rose-50/30 border-l-4 border-l-transparent';
  };

  const getStepUrgencyIcon = (step: Step) => {
      if (step.isCompleted) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(step.deadline);
      deadline.setHours(0, 0, 0, 0);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return <span className="flex items-center text-red-500 text-[10px] font-bold gap-1 mt-1"><AlertCircle className="w-3 h-3" /> Trễ hạn</span>;
      if (diffDays >= 0 && diffDays <= 3) return <span className="flex items-center text-yellow-600 text-[10px] font-bold gap-1 mt-1"><Clock className="w-3 h-3" /> Sắp tới</span>;
      return null;
  }

  // Lọc Goals
  const relevantGoals = goals.filter(g => {
      const d = new Date(g.deadline);
      const hasMonthlySteps = g.steps.some(s => new Date(s.deadline).getMonth() === selectedMonth);
      return d.getMonth() === selectedMonth || hasMonthlySteps;
  }).map(g => {
       const monthlySteps = g.steps.filter(s => new Date(s.deadline).getMonth() === selectedMonth);
       return { ...g, steps: monthlySteps };
  });

  // Stats
  const totalSteps = relevantGoals.reduce((acc, goal) => acc + goal.steps.length, 0);
  const completedSteps = relevantGoals.reduce((acc, goal) => acc + goal.steps.filter(s => s.isCompleted).length, 0);
  const progressPercentage = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const pieData = [
    { name: 'Hoàn thành', value: completedSteps },
    { name: 'Còn lại', value: totalSteps - completedSteps },
  ];
  const COLORS = ['#3B76B8', '#C3D9ED'];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Donut */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex items-center justify-between relative overflow-hidden">
             <div className="z-10">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tiến độ tháng {selectedMonth + 1}</h3>
                 <span className="text-5xl font-bold text-rose-500">{progressPercentage}%</span>
                 <p className="text-xs text-rose-300 mt-2 font-medium">Hoàn thành kế hoạch</p>
             </div>
             <div className="w-32 h-32 absolute -right-4 top-2 opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
             </div>
        </div>

        {/* Priority Rankings */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 md:col-span-2">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-3 font-serif">Mức độ ưu tiên</h3>
            <div className="space-y-3">
                 {areas.slice(0, 3).map((area, idx) => (
                     <div key={area.id} className="flex items-center">
                         <span className="w-6 text-gray-400 font-bold">{idx+1}</span>
                         <span className="flex-1 font-medium text-gray-700">{area.name}</span>
                         <div className="w-1/2 bg-gray-100 rounded-full h-2.5">
                             <div className="bg-rose-300 h-2.5 rounded-full" style={{width: `${100 - (idx * 15)}%`}}></div>
                         </div>
                         <span className="ml-3 text-xs font-bold text-rose-400">{100 - (idx * 15)}%</span>
                     </div>
                 ))}
            </div>
        </div>
      </div>

      <div className="bg-rose-100/50 p-4 rounded-xl text-center border border-rose-200">
          <p className="text-rose-600 italic font-medium font-serif">"Hành động nhỏ trong tháng này kiến tạo thành công lớn cho cả năm."</p>
      </div>

      {/* Header with Undo/Redo & Paste Goal */}
      <div className="flex flex-col md:flex-row items-center justify-between my-6 relative">
          <div className="hidden md:flex w-32 items-center gap-2">
             {/* PASTE GOAL BUTTON (If clipboard has a goal) */}
             {clipboardType === 'goal' && onPasteGoal && (
                 <button
                    onClick={onPasteGoal}
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors animate-pulse border border-indigo-200"
                    title="Dán mục tiêu đã sao chép"
                 >
                    <ClipboardPaste className="w-4 h-4" /> Dán Mục Tiêu
                 </button>
             )}
          </div>
          
          <h2 className="text-3xl font-serif text-center text-rose-500 italic">Kế hoạch hành động Tháng {selectedMonth + 1}</h2>
          
          {/* UNDO / REDO CONTROLS */}
          <div className="flex items-center gap-2 mt-4 md:mt-0 w-32 justify-end">
             <button 
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-2 rounded-full transition-all ${canUndo ? 'text-gray-600 hover:bg-rose-100 hover:text-rose-600' : 'text-gray-300 cursor-not-allowed'}`}
                title="Hoàn tác (Undo)"
             >
                 <Undo2 className="w-6 h-6" />
             </button>
             <button 
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-2 rounded-full transition-all ${canRedo ? 'text-gray-600 hover:bg-rose-100 hover:text-rose-600' : 'text-gray-300 cursor-not-allowed'}`}
                title="Làm lại (Redo)"
             >
                 <Redo2 className="w-6 h-6" />
             </button>
          </div>
      </div>

      {relevantGoals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-rose-100 border-dashed">
              <p className="text-gray-400 italic">Không có mục tiêu nào hoạt động trong tháng này.</p>
          </div>
      ) : (
        /* Goal Cards Detail */
        <div className="space-y-8">
            {relevantGoals.map((goal, index) => {
            const area = areas.find(a => a.id === goal.areaId);
            const goalProgress = goal.steps.length > 0 
                ? Math.round((goal.steps.filter(s => s.isCompleted).length / goal.steps.length) * 100) 
                : 0;

            const isExpanded = expandedCompletedGoals.has(goal.id);
            const isMinimized = minimizedGoals.has(goal.id);
            
            // --- CONDENSED CARD FOR COMPLETED GOALS (COLLAPSED) ---
            if (goal.isCompleted && !isExpanded) {
                return (
                     <div 
                        key={goal.id} 
                        onClick={() => toggleGoalExpansion(goal.id)}
                        className="bg-white rounded-2xl shadow-sm border border-green-200 p-5 flex items-center justify-between transition-all hover:shadow-md cursor-pointer group"
                        title="Nhấn để xem lại kế hoạch"
                     >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-50 text-green-600 p-3 rounded-full shrink-0 border border-green-100 group-hover:bg-green-100 transition-colors">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-700 line-through decoration-gray-400/60 font-serif opacity-90">{goal.title}</h3>
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                    {area?.name} • <span className="text-green-600">Mục tiêu đã hoàn thành</span>
                                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 ml-2 group-hover:bg-green-100 flex items-center gap-1">
                                        Xem chi tiết <ChevronDown className="w-3 h-3" />
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-green-600 font-bold text-xl tracking-widest border-2 border-green-600 px-3 py-1 rounded-lg transform -rotate-12 opacity-90">
                                DONE
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteGoal(goal.id);
                                }}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="Xoá mục tiêu"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                     </div>
                )
            }

            // --- MAIN CARD (Active OR Completed & Expanded) ---
            const cardBorder = goal.isCompleted ? 'border-green-200' : 'border-rose-100';
            const headerBg = goal.isCompleted ? 'bg-green-50' : 'bg-rose-50';
            const headerBorder = goal.isCompleted ? 'border-green-100' : 'border-rose-100';
            const badgeBg = goal.isCompleted ? 'bg-green-500' : 'bg-rose-400';
            const progressColor = goal.isCompleted ? 'text-green-600' : 'text-rose-500';
            const strategicBg = goal.isCompleted ? 'bg-green-500' : 'bg-rose-400';
            const barBg = goal.isCompleted ? 'bg-green-300' : 'bg-rose-300';
            const barContainerBorder = goal.isCompleted ? 'border-green-100' : 'border-rose-100';

            return (
                <div key={goal.id} className={`bg-white rounded-3xl shadow-sm border ${cardBorder} overflow-hidden relative transition-colors duration-500`}>
                    {/* Header: Always Visible & Clickable */}
                    <div 
                        onClick={() => toggleGoalMinimize(goal.id)}
                        className={`${headerBg} p-4 flex justify-between items-center border-b ${headerBorder} cursor-pointer hover:bg-opacity-80 transition-colors select-none group`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="transition-transform duration-300 transform group-hover:scale-110">
                                {isMinimized ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
                            </div>
                            <span className={`${badgeBg} text-white px-3 py-1 rounded-full text-sm font-bold`}>#{index + 1}</span>
                            
                            {/* Updated Header Logic: Emphasize Goal Title when Minimized */}
                            <div className="flex flex-col">
                                {isMinimized ? (
                                    <>
                                        <h3 className="text-2xl font-black text-rose-500 font-serif leading-tight drop-shadow-sm mb-0.5 animate-fade-in">
                                            {goal.title}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{area?.name}</p>
                                    </>
                                ) : (
                                    <h3 className="text-xl font-bold text-gray-800 font-serif leading-tight">{area?.name}</h3>
                                )}
                            </div>

                            {goal.isCompleted && (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-white px-2 py-1 rounded-full border border-green-200">
                                    <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Hide percentage in header if maximized, show in footer. Show here if minimized for quick view */}
                            {isMinimized && <span className={`${progressColor} font-bold text-lg`}>{goalProgress}%</span>}
                            
                            {/* Actions - Stop propagation to prevent toggle */}
                            
                            {/* Copy Goal Button */}
                            {onCopy && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCopy('goal', goal);
                                    }}
                                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all"
                                    title="Sao chép mục tiêu"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteGoal(goal.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="Xoá mục tiêu"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            
                            {/* Close details button for completed goals */}
                            {goal.isCompleted && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleGoalExpansion(goal.id);
                                    }}
                                    className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                                    title="Đóng lại"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* BODY: Collapsible Content (Details + Action Steps) */}
                    {!isMinimized && (
                    <div className="p-6 animate-fade-in-up">
                        {/* Detail Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Left: Strategic Goal Name */}
                            <div className={`${strategicBg} text-white p-8 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[240px] shadow-inner`}>
                                {/* Darker overlay for better text contrast */}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-0"></div>
                                
                                <h4 className="text-xs font-bold text-white/90 uppercase tracking-[0.3em] mb-4 relative z-10 border-b border-white/40 pb-2">
                                    Mục tiêu chiến lược
                                </h4>
                                
                                <p className="text-3xl md:text-4xl font-black leading-snug relative z-10 font-serif drop-shadow-xl transform transition-all duration-500 group-hover:-translate-y-1">
                                    {goal.title}
                                </p>
                                
                                {/* Decorative elements */}
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl z-0"></div>
                                <div className="absolute top-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl z-0"></div>

                                <img 
                                src={`https://picsum.photos/seed/${goal.id}/400/300`} 
                                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" 
                                alt="Goal bg" 
                                />
                            </div>

                            {/* Right: Why & Criteria */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`border ${headerBorder} rounded-2xl p-5 hover:shadow-md transition-shadow`}>
                                    <h5 className={`font-bold text-sm mb-2 ${goal.isCompleted ? 'text-green-500' : 'text-rose-400'}`}>Tại sao quan trọng?</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">{goal.whyImportant}</p>
                                </div>
                                <div className={`border ${headerBorder} rounded-2xl p-5 hover:shadow-md transition-shadow`}>
                                    <h5 className={`font-bold text-sm mb-2 ${goal.isCompleted ? 'text-green-500' : 'text-rose-400'}`}>Tiêu chí thành công</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">{goal.successCriteria}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Plan Table */}
                        <div className="overflow-x-auto relative">
                            <div className="flex justify-between items-center mb-2 px-2">
                                <h5 className="text-sm font-bold text-gray-700">Các bước hành động</h5>
                                <div className="flex gap-2">
                                    {/* PASTE STEP BUTTON */}
                                    {clipboardType === 'step' && onPasteStep && (
                                        <button 
                                            onClick={() => onPasteStep(goal.id)}
                                            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors font-bold bg-indigo-100 text-indigo-600 hover:bg-indigo-200 animate-pulse border border-indigo-200"
                                            title="Dán bước hành động"
                                        >
                                            <ClipboardPaste className="w-3 h-3" /> Dán bước
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleOpenModal(goal.id)}
                                        className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors font-bold ${
                                            goal.isCompleted 
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                            : 'bg-rose-100 text-rose-500 hover:bg-rose-200'
                                        }`}
                                    >
                                        <Plus className="w-3 h-3" /> Thêm bước
                                    </button>
                                </div>
                            </div>
                            
                            {goal.steps.length === 0 ? (
                                <div className="text-center py-4 text-sm text-gray-400 italic bg-gray-50 rounded-lg">
                                    Chưa có bước hành động nào cho tháng này.
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className={`text-xs uppercase border-b ${goal.isCompleted ? 'text-green-600 bg-green-50 border-green-100' : 'text-rose-500 bg-rose-50 border-rose-100'}`}>
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">Bước</th>
                                            <th className="px-4 py-3">Hành động</th>
                                            <th className="px-4 py-3">Hạn chót</th>
                                            <th className="px-4 py-3 text-center">Ưu tiên</th>
                                            <th className="px-4 py-3 text-center">Trạng thái</th>
                                            <th className="px-4 py-3 text-center rounded-tr-lg">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${goal.isCompleted ? 'divide-green-50' : 'divide-rose-50'}`}>
                                        {goal.steps.map((step, sIdx) => {
                                            const rowStyle = getStepStatusStyle(step);
                                            const urgencyIcon = getStepUrgencyIcon(step);

                                            return (
                                                <tr key={step.id} className={`transition-all duration-300 ${rowStyle}`}>
                                                    <td className="px-4 py-3 font-medium text-gray-500">{sIdx + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                        {step.description}
                                                        {urgencyIcon}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">{step.deadline}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex flex-col items-center">
                                                            {step.priority === 'High' && <span className="text-xl">🔥</span>}
                                                            {step.priority === 'Medium' && <span className="text-xl">🍑</span>}
                                                            {step.priority === 'Low' && <span className="text-xl">🍵</span>}
                                                            <span className="text-[10px] text-gray-400 uppercase">{PRIORITY_MAP[step.priority]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button 
                                                            onClick={() => toggleStepCompletion(goal.id, step.id)}
                                                            className={`p-1 rounded transition-colors ${step.isCompleted ? 'text-rose-500' : 'text-gray-300 hover:text-rose-300'}`}
                                                        >
                                                            {step.isCompleted ? <CheckSquare className="w-6 h-6" /> : <div className="w-6 h-6 border-2 border-current rounded" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                                                        
                                                        {/* Edit Step Button */}
                                                        {onUpdateStep && (
                                                             <button 
                                                                onClick={() => handleEditClick(goal.id, step)}
                                                                className="p-2 text-gray-300 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50"
                                                                title="Chỉnh sửa bước"
                                                             >
                                                                 <Pencil className="w-4 h-4" />
                                                             </button>
                                                        )}

                                                        {/* Copy Step Button */}
                                                        {onCopy && (
                                                            <button 
                                                                onClick={() => onCopy('step', step)}
                                                                className="p-2 text-gray-300 hover:text-indigo-500 transition-colors rounded-full hover:bg-indigo-50"
                                                                title="Sao chép bước"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button 
                                                            onClick={() => onDeleteStep(goal.id, step.id)}
                                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                                            title="Xoá bước này"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    )}
                    
                    {/* Progress Bar Footer: Always Visible */}
                    <div className={`${headerBg} px-6 py-3 flex items-center gap-4 border-t ${headerBorder}`}>
                        <span className={`text-xs font-bold uppercase ${goal.isCompleted ? 'text-green-500' : 'text-rose-400'}`}>Tiến độ tháng</span>
                        <div className={`flex-1 bg-white rounded-full h-4 border ${barContainerBorder}`}>
                            <div 
                                className={`${barBg} h-full rounded-full transition-all duration-700 ease-out`}
                                style={{width: `${goalProgress}%`}}
                            ></div>
                        </div>
                        <span className={`text-xs font-bold ${progressColor}`}>{goalProgress}%</span>
                    </div>
                </div>
            ) 
            })}
        </div>
      )}

      {/* ADD/EDIT STEP MODAL */}
      {modalOpenGoalId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in-up">
                <button 
                    onClick={() => {
                        setModalOpenGoalId(null);
                        setEditingStepId(null);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-rose-500 mb-6 text-center font-serif">
                    {editingStepId ? 'Cập nhật hành động' : 'Thêm bước hành động'}
                </h3>
                
                <form onSubmit={handleStepSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mô tả hành động</label>
                        <input 
                            type="text" 
                            required
                            value={newStep.description}
                            onChange={e => setNewStep({...newStep, description: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            placeholder="VD: Đăng ký khóa học..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hạn chót</label>
                            <input 
                                type="date" 
                                required
                                value={newStep.deadline}
                                onChange={e => setNewStep({...newStep, deadline: e.target.value})}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Độ ưu tiên</label>
                            <select 
                                value={newStep.priority}
                                onChange={e => setNewStep({...newStep, priority: e.target.value as Priority})}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                            >
                                <option value="High">Cao (High)</option>
                                <option value="Medium">Trung bình (Medium)</option>
                                <option value="Low">Thấp (Low)</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-rose-600 transition-colors mt-2"
                    >
                        {editingStepId ? 'Lưu thay đổi' : 'Thêm Bước'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default ActionPlan;