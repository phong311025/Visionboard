import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import VisionGoals from './components/VisionGoals';
import ActionPlan from './components/ActionPlan';
import AllTasks from './components/AllTasks';
import Settings from './components/Settings';
import ChatBot from './components/ChatBot';
import { AREAS, GOALS, TASKS, DEFAULT_VISION_DATA, THEMES } from './constants';
import { Goal, Task, VisionBoardData, Step } from './types';

type Tab = 'setup' | 'dashboard' | 'vision' | 'action' | 'tasks';
type ClipboardItem = { type: 'goal', data: Goal } | { type: 'step', data: Step } | null;

// --- COLOR UTILS ---
const hexToRgb = (hex: string) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const mixColors = (color1: {r:number, g:number, b:number}, color2: {r:number, g:number, b:number}, weight: number) => {
  const w = weight; 
  const w1 = 1 - w;
  const r = Math.round(color1.r * w1 + color2.r * w);
  const g = Math.round(color1.g * w1 + color2.g * w);
  const b = Math.round(color1.b * w1 + color2.b * w);
  return rgbToHex(r, g, b);
}

const generatePalette = (baseColorHex: string) => {
  const base = hexToRgb(baseColorHex);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 20, g: 20, b: 35 }; 

  return {
    50: mixColors(base, white, 0.96),
    100: mixColors(base, white, 0.90),
    200: mixColors(base, white, 0.75),
    300: mixColors(base, white, 0.50),
    400: mixColors(base, white, 0.30),
    500: baseColorHex, // Base
    600: mixColors(base, black, 0.20),
  };
}

const generateTextPalette = (baseColorHex: string) => {
  const base = hexToRgb(baseColorHex);
  const white = { r: 255, g: 255, b: 255 };
  
  // Text needs to be dark, so base usually corresponds to 800 or 700
  return {
    400: mixColors(base, white, 0.60), // Muted
    500: mixColors(base, white, 0.40),
    600: mixColors(base, white, 0.20),
    700: mixColors(base, white, 0.10), // Main Body
    800: baseColorHex, // Headings
  };
}

const App: React.FC = () => {
  // State quản lý Tab - Lưu vào LS
  const [currentTab, setCurrentTab] = useState<Tab>(() => {
    const savedTab = localStorage.getItem('aesthetic_planner_tab');
    // Validate tab exists
    if (savedTab && ['setup', 'dashboard', 'vision', 'action', 'tasks'].includes(savedTab)) {
        return savedTab as Tab;
    }
    return 'dashboard';
  });
  
  // State quản lý tháng (0 = Tháng 1, 11 = Tháng 12) - Lưu vào LS
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const savedMonth = localStorage.getItem('aesthetic_planner_month');
    if (savedMonth) {
        const m = parseInt(savedMonth, 10);
        if (!isNaN(m) && m >= 0 && m <= 11) return m;
    }
    return new Date().getMonth();
  });

  // App State - Sử dụng lazy initialization để đọc từ LocalStorage
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
        const savedGoals = localStorage.getItem('aesthetic_planner_goals');
        return savedGoals ? JSON.parse(savedGoals) : GOALS;
    } catch (e) {
        console.error("Error parsing goals", e);
        return GOALS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
        const savedTasks = localStorage.getItem('aesthetic_planner_tasks');
        return savedTasks ? JSON.parse(savedTasks) : TASKS;
    } catch (e) {
        console.error("Error parsing tasks", e);
        return TASKS;
    }
  });

  // --- UNDO/REDO HISTORY STATE ---
  // Lưu ý: Để đơn giản, history hiện tại chỉ lưu state của Goals. 
  // Với tính năng đồng bộ Tasks, lý tưởng là lưu cả Tasks, nhưng để tránh phức tạp, ta sẽ tập trung vào Goals.
  const [goalHistory, setGoalHistory] = useState<Goal[][]>([]);
  const [goalRedoStack, setGoalRedoStack] = useState<Goal[][]>([]);
  
  // --- CLIPBOARD STATE ---
  const [clipboard, setClipboard] = useState<ClipboardItem>(null);

  // Helper to save history before mutation
  const saveHistory = useCallback(() => {
    setGoalHistory(prev => [...prev, goals]);
    setGoalRedoStack([]); // Clear redo stack on new action
  }, [goals]);

  const handleUndo = () => {
    if (goalHistory.length === 0) return;
    const previousState = goalHistory[goalHistory.length - 1];
    const newHistory = goalHistory.slice(0, -1);
    
    setGoalRedoStack(prev => [goals, ...prev]); // Push current to redo
    setGoals(previousState);
    setGoalHistory(newHistory);
  };

  const handleRedo = () => {
    if (goalRedoStack.length === 0) return;
    const nextState = goalRedoStack[0];
    const newRedoStack = goalRedoStack.slice(1);

    setGoalHistory(prev => [...prev, goals]); // Push current to history
    setGoals(nextState);
    setGoalRedoStack(newRedoStack);
  };

  // --- CLIPBOARD HANDLERS ---
  const handleCopy = (type: 'goal' | 'step', data: Goal | Step) => {
    setClipboard({ type, data: data as any }); // Cast to avoid TS complexity for now
  };

  const handlePasteGoal = () => {
    if (clipboard?.type !== 'goal') return;
    saveHistory();
    const sourceGoal = clipboard.data as Goal;
    const newGoalId = `g-${Date.now()}`;
    
    const newGoal: Goal = {
        ...sourceGoal,
        id: newGoalId,
        title: `${sourceGoal.title} (Copy)`,
        isCompleted: false, // Reset completion status on copy
        frequency: sourceGoal.frequency || 'One-time',
        steps: sourceGoal.steps.map((s, idx) => ({
            ...s,
            id: `s-${Date.now()}-${idx}`,
            isCompleted: false // Reset step completion
        }))
    };
    
    setGoals(prev => [...prev, newGoal]);

    // SYNC: Create Tasks for all steps in the pasted goal
    const newTasksFromSteps = newGoal.steps.map(step => ({
        id: step.id, // SYNC ID: Step ID = Task ID
        goalId: newGoalId,
        areaId: newGoal.areaId,
        title: step.description,
        status: 'Pending' as const,
        deadline: step.deadline,
        frequency: newGoal.frequency || 'One-time',
        discipline: 'Pending' as const
    }));
    setTasks(prev => [...prev, ...newTasksFromSteps]);
  };

  const handlePasteStep = (targetGoalId: string) => {
      if (clipboard?.type !== 'step') return;
      saveHistory();
      const sourceStep = clipboard.data as Step;
      const targetGoal = goals.find(g => g.id === targetGoalId);
      
      const newStep: Step = {
          ...sourceStep,
          id: `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: `${sourceStep.description} (Copy)`,
          isCompleted: false
      };

      setGoals(prev => prev.map(g => {
          if (g.id === targetGoalId) {
              return { ...g, steps: [...g.steps, newStep] };
          }
          return g;
      }));

      // SYNC: Add Task
      if (targetGoal) {
          const newTask: Task = {
              id: newStep.id,
              goalId: targetGoalId,
              areaId: targetGoal.areaId,
              title: newStep.description,
              status: 'Pending',
              deadline: newStep.deadline,
              frequency: targetGoal.frequency || 'One-time',
              discipline: 'Pending'
          };
          setTasks(prev => [...prev, newTask]);
      }
  };

  const [visionData, setVisionData] = useState<VisionBoardData>(() => {
    try {
        const savedVision = localStorage.getItem('aesthetic_planner_vision');
        if (savedVision) {
            const parsed = JSON.parse(savedVision);
            // Merge with DEFAULT_VISION_DATA to ensure all fields exist (robustness against schema changes)
            return { ...DEFAULT_VISION_DATA, ...parsed };
        }
        return DEFAULT_VISION_DATA;
    } catch (e) {
        console.error("Error parsing vision data", e);
        return DEFAULT_VISION_DATA;
    }
  });

  // --- THEME ENGINE ---
  useEffect(() => {
    const root = document.documentElement;
    let palette;

    if (visionData.themeId === 'custom' && visionData.customColors) {
        // Generate Dynamic Palette
        palette = generatePalette(visionData.customColors.primary);
        
        // Generate Text Palette
        const textPalette = generateTextPalette(visionData.customColors.text || '#1f2937');
        root.style.setProperty('--text-400', textPalette[400]);
        root.style.setProperty('--text-500', textPalette[500]);
        root.style.setProperty('--text-600', textPalette[600]);
        root.style.setProperty('--text-700', textPalette[700]);
        root.style.setProperty('--text-800', textPalette[800]);

    } else {
        // Use Preset
        const theme = THEMES.find(t => t.id === (visionData.themeId || 'ocean')) || THEMES[0];
        palette = theme.colors;
        
        // Reset Text to Default Gray
        root.style.setProperty('--text-400', '#9ca3af');
        root.style.setProperty('--text-500', '#6b7280');
        root.style.setProperty('--text-600', '#4b5563');
        root.style.setProperty('--text-700', '#374151');
        root.style.setProperty('--text-800', '#1f2937');
    }

    // Apply Theme Colors
    if (palette) {
        root.style.setProperty('--theme-50', palette[50]);
        root.style.setProperty('--theme-100', palette[100]);
        root.style.setProperty('--theme-200', palette[200]);
        root.style.setProperty('--theme-300', palette[300]);
        root.style.setProperty('--theme-400', palette[400]);
        root.style.setProperty('--theme-500', palette[500]);
        root.style.setProperty('--theme-600', palette[600]);
    }

  }, [visionData.themeId, visionData.customColors]);

  // Effects để tự động lưu vào LocalStorage
  useEffect(() => {
    localStorage.setItem('aesthetic_planner_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('aesthetic_planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aesthetic_planner_vision', JSON.stringify(visionData));
  }, [visionData]);

  useEffect(() => {
    localStorage.setItem('aesthetic_planner_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('aesthetic_planner_month', selectedMonth.toString());
  }, [selectedMonth]);

  // --- HANDLERS ---
  
  // 1. Toggle Task Completion (Syncs to Goal Steps)
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));

    // SYNC: Update Step completion in Goals if the ID matches
    setGoals(prev => prev.map(g => {
        // Check if this goal has a step with the same ID
        const stepExists = g.steps.some(s => s.id === taskId);
        if (stepExists) {
            return {
                ...g,
                steps: g.steps.map(s => s.id === taskId ? { ...s, isCompleted: !s.isCompleted } : s)
            };
        }
        return g;
    }));
  };

  // 2. Toggle Step Completion (Syncs to Tasks)
  const toggleStepCompletion = (goalId: string, stepId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const updatedSteps = g.steps.map(s => 
        s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
      );
      return { ...g, steps: updatedSteps };
    }));

    // SYNC: Update Task Status
    setTasks(prev => prev.map(t => 
        t.id === stepId ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t
    ));
  };

  const toggleGoalCompletion = (goalId: string) => {
    saveHistory();
    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, isCompleted: !g.isCompleted } : g
    ));
  };

  const handleAddGoal = (newGoal: Goal) => {
    saveHistory();
    
    // TỰ ĐỘNG TẠO BƯỚC ĐẦU TIÊN TƯƠNG ỨNG VỚI MỤC TIÊU
    // Để mục tiêu hiện ngay trong danh sách nhiệm vụ
    const initialStep: Step = {
        id: `s-${Date.now()}-init`,
        description: newGoal.title, // Bước 1 chính là hoàn thành mục tiêu này
        deadline: newGoal.deadline,
        priority: 'High',
        isCompleted: false
    };

    const goalWithStep = {
        ...newGoal,
        steps: [initialStep]
    };
    
    setGoals(prev => [...prev, goalWithStep]);

    // SYNC: Tự động tạo Task
    const newTask: Task = {
        id: initialStep.id,
        goalId: newGoal.id,
        areaId: newGoal.areaId,
        title: newGoal.title,
        status: 'Pending',
        deadline: newGoal.deadline,
        frequency: newGoal.frequency || 'One-time',
        discipline: 'Pending'
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá mục tiêu này? Hành động này sẽ xoá luôn các bước hành động và nhiệm vụ liên quan.")) {
        saveHistory();
        setGoals(prev => prev.filter(g => g.id !== goalId));
        
        // SYNC: Delete all tasks associated with this goal
        setTasks(prev => prev.filter(t => t.goalId !== goalId));
    }
  };

  // 3. Add Step (Syncs: Creates a Task)
  const handleAddStep = (goalId: string, newStep: Step) => {
    saveHistory();
    // Update Goals
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, steps: [...g.steps, newStep] };
      }
      return g;
    }));

    // SYNC: Add Task
    // Need to find the goal to get areaId and frequency
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        const newTask: Task = {
            id: newStep.id, // ID Synchronization is key
            goalId: goalId,
            areaId: goal.areaId,
            title: newStep.description,
            status: newStep.isCompleted ? 'Completed' : 'Pending',
            deadline: newStep.deadline,
            frequency: goal.frequency || 'One-time', // Inherit frequency from Goal
            discipline: 'Pending'
        };
        setTasks(prev => [...prev, newTask]);
    }
  };

  // 4. Update Step (Syncs: Updates Task)
  const handleUpdateStep = (goalId: string, updatedStep: Step) => {
    saveHistory();
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        steps: g.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
      };
    }));

    // SYNC: Update Task
    setTasks(prev => prev.map(t => {
        if (t.id === updatedStep.id) {
            return {
                ...t,
                title: updatedStep.description,
                deadline: updatedStep.deadline,
                // Optional: Sync priority mapping if needed, but currently Task has no priority field displayed same way
            };
        }
        return t;
    }));
  };

  // 5. Delete Step (Syncs: Deletes Task)
  const handleDeleteStep = (goalId: string, stepId: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xoá bước hành động này?")) {
          saveHistory();
          setGoals(prev => prev.map(g => {
              if (g.id !== goalId) return g;
              return { ...g, steps: g.steps.filter(s => s.id !== stepId) };
          }));

          // SYNC: Delete Task
          setTasks(prev => prev.filter(t => t.id !== stepId));
      }
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleResetData = () => {
    if (window.confirm('CẢNH BÁO: Hành động này sẽ XÓA SẠCH toàn bộ dữ liệu bạn đã nhập và đưa về trạng thái mặc định. Ứng dụng sẽ tự động tải lại. Bạn có chắc chắn không?')) {
      // 1. Reset State (để đảm bảo nếu reload thất bại thì UI cũng đã được clear)
      setGoals(GOALS);
      setTasks(TASKS);
      setVisionData(DEFAULT_VISION_DATA);
      setSelectedMonth(new Date().getMonth());
      setCurrentTab('dashboard');
      
      // 2. Clear LocalStorage keys
      localStorage.removeItem('aesthetic_planner_goals');
      localStorage.removeItem('aesthetic_planner_tasks');
      localStorage.removeItem('aesthetic_planner_vision');
      localStorage.removeItem('aesthetic_planner_month');
      localStorage.removeItem('aesthetic_planner_tab');
      // Xóa thêm các key phụ của ActionPlan và ChatBot
      localStorage.removeItem('aesthetic_planner_expanded_goals');
      localStorage.removeItem('aesthetic_planner_chat_history');

      // 3. Force Reload trang để reset toàn bộ state (đặc biệt là các component con có state riêng)
      window.location.reload();
    }
  };

  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <div className="min-h-screen bg-rose-50 text-gray-800 font-sans selection:bg-rose-500 selection:text-white transition-colors duration-500">
      <Navigation currentTab={currentTab} setTab={setCurrentTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Month Selector */}
        <div className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                {months.map((m, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedMonth(idx)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all
                            ${selectedMonth === idx 
                                ? 'bg-rose-500 text-white shadow-lg transform scale-105' 
                                : 'bg-white text-gray-400 hover:bg-rose-100 hover:text-rose-500 border border-rose-50'}
                        `}
                    >
                        {m}
                    </button>
                ))}
            </div>
            <div className="text-center md:text-left text-rose-300 text-xs font-bold uppercase tracking-widest pl-1">
                Đang xem dữ liệu: {months[selectedMonth]} {visionData.year}
            </div>
        </div>

        {currentTab === 'setup' && (
          <Settings 
            visionData={visionData} 
            setVisionData={setVisionData} 
            goals={goals}
            setGoals={setGoals}
            tasks={tasks}
            setTasks={setTasks}
            onResetData={handleResetData}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard 
            areas={AREAS} 
            tasks={tasks} 
            selectedMonth={selectedMonth} 
            year={visionData.year} 
          />
        )}

        {currentTab === 'vision' && (
          <VisionGoals 
            areas={AREAS} 
            goals={goals} 
            visionData={visionData} 
            selectedMonth={selectedMonth} 
            onAddGoal={handleAddGoal} 
            toggleGoalCompletion={toggleGoalCompletion}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {currentTab === 'action' && (
          <ActionPlan 
            areas={AREAS} 
            goals={goals} 
            toggleStepCompletion={toggleStepCompletion} 
            selectedMonth={selectedMonth} 
            year={visionData.year} 
            onAddStep={handleAddStep} 
            onUpdateStep={handleUpdateStep}
            onDeleteStep={handleDeleteStep}
            onDeleteGoal={handleDeleteGoal}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={goalHistory.length > 0}
            canRedo={goalRedoStack.length > 0}
            onCopy={handleCopy}
            onPasteGoal={handlePasteGoal}
            onPasteStep={handlePasteStep}
            clipboardType={clipboard?.type}
          />
        )}

        {currentTab === 'tasks' && (
          <AllTasks 
            areas={AREAS} 
            goals={goals} 
            tasks={tasks} 
            toggleTaskCompletion={toggleTaskCompletion} 
            selectedMonth={selectedMonth} 
            year={visionData.year} 
            onAddTask={handleAddTask}
          />
        )}
        
      </main>
      
      {/* Global Components */}
      <ChatBot />

      {/* Aesthetic Footer */}
      <footer className="text-center pb-8 pt-4 text-rose-300 text-xs font-medium uppercase tracking-widest opacity-60">
        ✨ Được thiết kế cho phiên bản tốt nhất của bạn • {visionData.year} ✨
      </footer>
    </div>
  );
};

export default App;