import React, { useState, useEffect, useRef } from 'react';
import { Task, AreaOfLife, Goal, PlannerState, Frequency } from '../types';
import { Calendar, Filter, CheckCircle2, Circle, AlertTriangle, Plus, X, Layers, List as ListIcon, ChevronDown, ChevronRight, Target, CalendarDays, Sun, Clock, Star } from 'lucide-react';

interface AllTasksProps {
  tasks: Task[];
  areas: AreaOfLife[];
  goals: Goal[];
  toggleTaskCompletion: PlannerState['toggleTaskCompletion'];
  selectedMonth: number;
  year: string;
  onAddTask: (task: Task) => void;
}

const STATUS_MAP: Record<string, string> = {
    'Pending': 'Đang chờ',
    'In Progress': 'Đang làm',
    'Completed': 'Hoàn thành',
    'Scheduled': 'Đã lên lịch',
    'Missed': 'Bỏ lỡ'
};

const DISCIPLINE_MAP: Record<string, string> = {
    'On-time': 'Đúng hạn',
    'Late': 'Trễ',
    'Pending': 'Chờ'
};

const FREQUENCY_MAP: Record<string, string> = {
    'Daily': 'Hàng ngày',
    'Weekly': 'Hàng tuần',
    'Monthly': 'Hàng tháng',
    'One-time': 'Một lần'
};

const AllTasks: React.FC<AllTasksProps> = ({ tasks, areas, goals, toggleTaskCompletion, selectedMonth, year, onAddTask }) => {
  const [filterArea, setFilterArea] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'group'>('group'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- DAILY CHECKLIST LOGIC ---
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const dayListRef = useRef<HTMLDivElement>(null);

  // Update selected day if month changes
  useEffect(() => {
      const today = new Date();
      if (selectedMonth === today.getMonth() && parseInt(year) === today.getFullYear()) {
          setSelectedDay(today.getDate());
      } else {
          setSelectedDay(1);
      }
  }, [selectedMonth, year]);

  // Scroll to selected day on mount/change
  useEffect(() => {
    if (dayListRef.current) {
        const selectedEl = dayListRef.current.querySelector(`[data-day="${selectedDay}"]`);
        if (selectedEl) {
            selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [selectedDay]);

  const [newTask, setNewTask] = useState<Partial<Task>>({
      title: '',
      areaId: areas[0]?.id || '1',
      goalId: '', 
      deadline: `${year}-${String(selectedMonth + 1).padStart(2, '0')}-28`,
      frequency: 'One-time'
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTask.title || !newTask.areaId || !newTask.deadline) return;

      const taskToAdd: Task = {
          id: `t-${Date.now()}`,
          title: newTask.title,
          areaId: newTask.areaId,
          goalId: newTask.goalId || '', 
          deadline: newTask.deadline,
          status: 'Pending',
          frequency: newTask.frequency as Frequency,
          discipline: 'Pending'
      };

      onAddTask(taskToAdd);
      setIsModalOpen(false);
      setNewTask({
          title: '',
          areaId: areas[0]?.id || '1',
          goalId: '',
          deadline: `${year}-${String(selectedMonth + 1).padStart(2, '0')}-28`,
          frequency: 'One-time'
      });
  };

  // Filter tasks by Month for Main View
  const monthlyTasks = tasks.filter(t => {
      const d = new Date(t.deadline);
      return d.getMonth() === selectedMonth && d.getFullYear() === parseInt(year);
  });

  // Filter for Main View (Category Filter)
  const filteredTasks = filterArea === 'All' 
    ? monthlyTasks 
    : monthlyTasks.filter(t => t.areaId === filterArea);

  // --- DAILY TASKS FILTER (Checklist Panel) ---
  const targetDateStr = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  
  const dailyTasks = tasks.filter(t => {
      return t.deadline === targetDateStr;
  });

  // Stats for Main View
  const completedCount = filteredTasks.filter(t => t.status === 'Completed').length;
  const pendingCount = filteredTasks.filter(t => t.status === 'Pending').length;
  const scheduledCount = filteredTasks.filter(t => t.status === 'Scheduled').length;

  const availableGoals = goals.filter(g => g.areaId === newTask.areaId);

  // Generate Days for the Month
  const daysInMonth = new Date(parseInt(year), selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

  // --- GROUPING LOGIC FOR MAIN VIEW ---
  const groupedTasks: Record<string, Task[]> = {};
  const standaloneTasks: Task[] = [];

  filteredTasks.forEach(task => {
      if (task.goalId) {
          if (!groupedTasks[task.goalId]) groupedTasks[task.goalId] = [];
          groupedTasks[task.goalId].push(task);
      } else {
          standaloneTasks.push(task);
      }
  });

  // --- FREQUENCY GROUPING LOGIC (New Section) ---
  const dailyRoutine = filteredTasks.filter(t => t.frequency === 'Daily');
  const weeklyRoutine = filteredTasks.filter(t => t.frequency === 'Weekly');
  // Combine Monthly and One-time (Yearly goals usually fall here)
  const monthlyYearlyRoutine = filteredTasks.filter(t => t.frequency === 'Monthly' || t.frequency === 'One-time');

  const renderRoutineCard = (title: string, icon: React.ReactNode, tasks: Task[], colorClass: string, progressColor: string) => {
      const completed = tasks.filter(t => t.status === 'Completed').length;
      const total = tasks.length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return (
          <div className={`rounded-2xl border p-4 flex flex-col h-full ${colorClass}`}>
              <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                      {icon}
                      <h4 className="font-bold text-gray-700">{title}</h4>
                  </div>
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded-full shadow-sm text-gray-500">
                      {completed}/{total}
                  </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/50 rounded-full mb-4">
                  <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{width: `${percent}%`}}></div>
              </div>

              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 max-h-[200px]">
                  {tasks.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">Chưa có nhiệm vụ.</p>
                  ) : (
                      tasks.map(t => (
                          <div key={t.id} className="flex items-center gap-2 bg-white/60 p-2 rounded-xl hover:bg-white transition-colors">
                              <button onClick={() => toggleTaskCompletion(t.id)} className="shrink-0 text-gray-400 hover:text-green-500 transition-colors">
                                  {t.status === 'Completed' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                              </button>
                              <span className={`text-xs font-medium truncate flex-1 ${t.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                  {t.title}
                              </span>
                          </div>
                      ))
                  )}
              </div>
          </div>
      );
  };

  // Helper for Day Name
  const getDayName = (day: number) => {
      const date = new Date(parseInt(year), selectedMonth, day);
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in pb-10 h-full min-h-screen">
      
      {/* Sidebar: Daily Checklist Panel */}
      <div className="lg:w-1/4 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 flex flex-col h-[600px]">
           {/* Header */}
           <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500">
                      <CalendarDays className="w-5 h-5" />
                   </div>
                   <div>
                       <h2 className="text-lg font-bold text-gray-800 leading-none">Mỗi ngày</h2>
                       <p className="text-xs text-gray-400">Checklist</p>
                   </div>
               </div>
               <div className="text-right">
                   <span className="text-2xl font-bold text-rose-500">{selectedDay}</span>
                   <span className="text-xs text-gray-400 uppercase font-medium ml-1">/ {selectedMonth + 1}</span>
               </div>
           </div>

           {/* Date Strip Selector */}
           <div 
                ref={dayListRef}
                className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar border-b border-rose-50"
           >
               {daysArray.map(d => {
                   const isSelected = d === selectedDay;
                   const dateStr = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                   const hasTasks = tasks.some(t => t.deadline === dateStr);
                   const isCompletedDay = hasTasks && tasks.filter(t => t.deadline === dateStr).every(t => t.status === 'Completed');

                   return (
                       <button
                           key={d}
                           data-day={d}
                           onClick={() => setSelectedDay(d)}
                           className={`
                               flex flex-col items-center justify-center min-w-[45px] h-[60px] rounded-2xl transition-all duration-300 relative
                               ${isSelected 
                                   ? 'bg-rose-500 text-white shadow-lg scale-105' 
                                   : 'bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-400'}
                           `}
                       >
                           <span className="text-[10px] font-medium opacity-80">{getDayName(d)}</span>
                           <span className="text-sm font-bold">{d}</span>
                           
                           {/* Indicators */}
                           <div className="absolute bottom-1.5 flex gap-0.5">
                               {hasTasks && !isCompletedDay && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-400'}`}></div>}
                               {isCompletedDay && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-green-200' : 'bg-green-400'}`}></div>}
                           </div>
                       </button>
                   )
               })}
           </div>
           
           {/* Daily Tasks List */}
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
               <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nhiệm vụ hôm nay</span>
                   <span className="text-xs font-bold bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">
                       {dailyTasks.filter(t => t.status === 'Completed').length}/{dailyTasks.length}
                   </span>
               </div>

               {dailyTasks.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center p-4">
                       <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                           <span className="text-2xl">☕️</span>
                       </div>
                       <p className="text-sm text-gray-500 font-medium">Thảnh thơi!</p>
                       <p className="text-xs text-gray-400 mt-1">Không có nhiệm vụ nào vào ngày {selectedDay}/{selectedMonth + 1}.</p>
                       <button 
                            onClick={() => {
                                setNewTask(prev => ({...prev, deadline: targetDateStr}));
                                setIsModalOpen(true);
                            }}
                            className="mt-4 text-xs font-bold text-rose-500 hover:underline"
                       >
                           + Thêm nhiệm vụ
                       </button>
                   </div>
               ) : (
                dailyTasks.map(task => {
                   const area = areas.find(a => a.id === task.areaId);
                   return (
                       <div key={task.id} className={`p-3 rounded-xl border transition-all duration-300 group ${task.status === 'Completed' ? 'bg-green-50/50 border-green-100' : 'bg-white border-rose-100 hover:shadow-sm'}`}>
                           <div className="flex items-start gap-3">
                               <button 
                                    onClick={() => toggleTaskCompletion(task.id)} 
                                    className={`mt-0.5 transition-transform active:scale-90 ${task.status === 'Completed' ? 'text-green-500' : 'text-gray-300 group-hover:text-rose-400'}`}
                                >
                                   {task.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                               </button>
                               <div className="flex-1 min-w-0">
                                   <p className={`text-sm font-bold leading-tight truncate ${task.status === 'Completed' ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'}`}>
                                       {task.title}
                                   </p>
                                   <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-500 border border-gray-100 truncate max-w-[80px]" style={{color: area?.color}}>
                                          {area?.name}
                                      </span>
                                      {task.frequency !== 'One-time' && (
                                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                              <Target className="w-3 h-3" /> {FREQUENCY_MAP[task.frequency]}
                                          </span>
                                      )}
                                   </div>
                               </div>
                           </div>
                       </div>
                   )
               })
               )}
           </div>

           {/* Quick Add for Selected Day */}
           <button 
                onClick={() => {
                    setNewTask(prev => ({...prev, deadline: targetDateStr}));
                    setIsModalOpen(true);
                }}
                className="mt-4 w-full py-2 rounded-xl border-2 border-dashed border-rose-200 text-rose-400 text-xs font-bold hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center justify-center gap-1"
           >
               <Plus className="w-3 h-3" /> Thêm vào ngày {selectedDay}/{selectedMonth+1}
           </button>
        </div>

        {/* Slice Filter Widget */}
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Lọc theo lĩnh vực
            </h3>
            <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterArea('All')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterArea === 'All' ? 'bg-rose-400 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-rose-100'}`}
                >
                    Tất cả
                </button>
                {areas.map(area => (
                     <button 
                        key={area.id}
                        onClick={() => setFilterArea(area.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterArea === area.id ? 'bg-rose-400 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-rose-100'}`}
                    >
                        {area.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Main Content: Task Library & Routine */}
      <div className="lg:w-3/4 space-y-6">
           
           {/* Top Stats Bar */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-rose-100 text-center">
                    <div className="text-xs text-gray-400 uppercase">Tổng (T{selectedMonth + 1})</div>
                    <div className="text-2xl font-bold text-gray-700">{filteredTasks.length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 text-center relative overflow-hidden">
                    <div className="text-xs text-rose-400 uppercase font-bold">Đã lên lịch</div>
                    <div className="text-2xl font-bold text-rose-500">{scheduledCount}</div>
                    <div className="absolute top-0 right-0 w-2 h-full bg-rose-400 opacity-20"></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 text-center relative overflow-hidden">
                    <div className="text-xs text-yellow-500 uppercase font-bold">Đang chờ</div>
                    <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                    <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400 opacity-20"></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 text-center relative overflow-hidden">
                    <div className="text-xs text-green-500 uppercase font-bold">Hoàn thành</div>
                    <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                    <div className="absolute top-0 right-0 w-2 h-full bg-green-400 opacity-20"></div>
                </div>
           </div>

           {/* Task Library */}
           <div className="bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-4 bg-rose-50 border-b border-rose-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-rose-500 font-bold flex items-center gap-2">
                            <span className="text-xl">📚</span> Thư viện nhiệm vụ
                        </h3>
                        <div className="flex bg-white rounded-lg p-1 border border-rose-200">
                             <button 
                                onClick={() => setViewMode('group')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'group' ? 'bg-rose-100 text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Nhóm theo Mục tiêu"
                             >
                                 <Layers className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-rose-100 text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Danh sách"
                             >
                                 <ListIcon className="w-4 h-4" />
                             </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <span className="text-xs text-gray-400 italic mr-2 hidden md:inline">Tháng {selectedMonth + 1}</span>
                         <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-rose-600 flex items-center gap-1 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                         >
                            <Plus className="w-3 h-3" /> Thêm nhanh
                         </button>
                    </div>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar p-4 max-h-[400px]">
                    {filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 italic gap-2">
                            <span className="text-2xl">🍃</span>
                            Chưa có nhiệm vụ nào cho tháng này.
                        </div>
                    ) : (
                        <>
                            {/* --- VIEW MODE: GROUP (COMPACT) --- */}
                            {viewMode === 'group' && (
                                <div className="space-y-6">
                                    {/* Render Grouped Tasks by Goal */}
                                    {Object.entries(groupedTasks).map(([goalId, groupTasks]) => {
                                        const goal = goals.find(g => g.id === goalId);
                                        if (!goal) return null;
                                        const area = areas.find(a => a.id === goal.areaId);
                                        const completedInGroup = groupTasks.filter(t => t.status === 'Completed').length;
                                        const progress = Math.round((completedInGroup / groupTasks.length) * 100);

                                        return (
                                            <div key={goalId} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                                                {/* Compact Header */}
                                                <div className="bg-gray-50/50 p-3 flex items-center justify-between border-b border-gray-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{backgroundColor: area?.color}}>
                                                            <Target className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-700 leading-tight">{goal.title}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{area?.name}</span>
                                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                                <span className="text-[10px] text-rose-400 font-medium">{completedInGroup}/{groupTasks.length} hoàn thành</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                         {/* Mini Progress Bar */}
                                                         <div className="w-16 h-1.5 bg-gray-200 rounded-full hidden md:block">
                                                             <div className="h-full bg-green-400 rounded-full transition-all" style={{width: `${progress}%`}}></div>
                                                         </div>
                                                         <span className={`text-xs font-bold ${progress === 100 ? 'text-green-500' : 'text-gray-400'}`}>{progress}%</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Task List (Compact) */}
                                                <div className="divide-y divide-gray-50">
                                                    {groupTasks.map(task => (
                                                        <div key={task.id} className="group flex items-center justify-between p-3 hover:bg-rose-50/30 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={() => toggleTaskCompletion(task.id)} className="transition-transform active:scale-90">
                                                                    {task.status === 'Completed' ? (
                                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                    ) : (
                                                                        <Circle className="w-5 h-5 text-gray-300 group-hover:text-rose-400" />
                                                                    )}
                                                                </button>
                                                                <span className={`text-sm font-medium transition-all ${task.status === 'Completed' ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'}`}>
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                                                                    {task.deadline.split('-').slice(1).reverse().join('/')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Render Standalone Tasks */}
                                    {standaloneTasks.length > 0 && (
                                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                            <div className="bg-gray-50/50 p-3 border-b border-gray-50">
                                                <h4 className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                    Nhiệm vụ khác (Không thuộc mục tiêu)
                                                </h4>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {standaloneTasks.map(task => {
                                                     const area = areas.find(a => a.id === task.areaId);
                                                     return (
                                                        <div key={task.id} className="group flex items-center justify-between p-3 hover:bg-rose-50/30 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={() => toggleTaskCompletion(task.id)} className="transition-transform active:scale-90">
                                                                    {task.status === 'Completed' ? (
                                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                    ) : (
                                                                        <Circle className="w-5 h-5 text-gray-300 group-hover:text-rose-400" />
                                                                    )}
                                                                </button>
                                                                <div className="flex flex-col">
                                                                     <span className={`text-sm font-medium transition-all ${task.status === 'Completed' ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'}`}>
                                                                        {task.title}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 md:hidden">{area?.name}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="hidden md:inline-block text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded">{area?.name}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                                                                    {task.deadline.split('-').slice(1).reverse().join('/')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                     )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- VIEW MODE: LIST (LEGACY) --- */}
                            {viewMode === 'list' && (
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3">Lĩnh vực</th>
                                            <th className="px-4 py-3">Nhiệm vụ</th>
                                            <th className="px-4 py-3">Tần suất</th>
                                            <th className="px-4 py-3">Hạn chót</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTasks.map(task => {
                                            const area = areas.find(a => a.id === task.areaId);
                                            return (
                                                <tr key={task.id} className="hover:bg-rose-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => toggleTaskCompletion(task.id)} className="flex items-center gap-2">
                                                            {task.status === 'Completed' ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-gray-300 hover:text-rose-400" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600" style={{borderLeft: `3px solid ${area?.color}`}}>
                                                            {area?.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                            {task.title}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">{FREQUENCY_MAP[task.frequency] || task.frequency}</td>
                                                    <td className="px-4 py-3 text-gray-500">{task.deadline}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
           </div>

           {/* FREQUENCY OVERVIEW (Routine Board) */}
           <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-rose-500">Nhịp điệu cuộc sống</h3>
                        <p className="text-xs text-gray-400">Phân loại theo tần suất thực hiện</p>
                    </div>
                    <div className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-xs font-bold border border-rose-100 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Cảnh báo rủi ro tần suất
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[300px]">
                    {/* Daily Routine */}
                    {renderRoutineCard(
                        'Hàng ngày', 
                        <Sun className="w-5 h-5 text-orange-500" />, 
                        dailyRoutine, 
                        'bg-orange-50/50 border-orange-100',
                        'bg-orange-400'
                    )}

                    {/* Weekly Routine */}
                    {renderRoutineCard(
                        'Hàng tuần', 
                        <Clock className="w-5 h-5 text-blue-500" />, 
                        weeklyRoutine, 
                        'bg-blue-50/50 border-blue-100',
                        'bg-blue-400'
                    )}

                    {/* Monthly & Yearly/One-time */}
                    {renderRoutineCard(
                        'Tháng & Năm', 
                        <Star className="w-5 h-5 text-purple-500" />, 
                        monthlyYearlyRoutine, 
                        'bg-purple-50/50 border-purple-100',
                        'bg-purple-400'
                    )}
                </div>
           </div>

      </div>

      {/* ADD TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in-up">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-rose-500 mb-6 text-center">Thêm nhiệm vụ mới</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên nhiệm vụ</label>
                        <input 
                            type="text" 
                            required
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            placeholder="VD: Mua sách..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lĩnh vực</label>
                            <select 
                                value={newTask.areaId}
                                onChange={e => setNewTask({...newTask, areaId: e.target.value, goalId: ''})} // Reset Goal khi đổi Area
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                            >
                                {areas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mục tiêu (Tùy chọn)</label>
                            <select 
                                value={newTask.goalId}
                                onChange={e => setNewTask({...newTask, goalId: e.target.value})}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                            >
                                <option value="">-- Không liên kết --</option>
                                {availableGoals.map(g => (
                                    <option key={g.id} value={g.id}>{g.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hạn chót</label>
                            <input 
                                type="date" 
                                required
                                value={newTask.deadline}
                                onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tần suất</label>
                            <select 
                                value={newTask.frequency}
                                onChange={e => setNewTask({...newTask, frequency: e.target.value as Frequency})}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                            >
                                <option value="One-time">Một lần</option>
                                <option value="Daily">Hàng ngày</option>
                                <option value="Weekly">Hàng tuần</option>
                                <option value="Monthly">Hàng tháng</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-rose-600 transition-colors mt-2"
                    >
                        Thêm Nhiệm Vụ
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AllTasks;