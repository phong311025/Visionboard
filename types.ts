
export type Status = 'Pending' | 'In Progress' | 'Completed' | 'Scheduled' | 'Missed';
export type Priority = 'High' | 'Medium' | 'Low';
export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'One-time';

export interface Step {
  id: string;
  description: string;
  deadline: string;
  priority: Priority;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  areaId: string;
  title: string;
  description: string;
  deadline: string;
  isCompleted: boolean;
  whyImportant: string;
  successCriteria: string;
  frequency?: Frequency; // Thêm trường này
  steps: Step[];
}

export interface AreaOfLife {
  id: string;
  name: string; // e.g., Career, Finance, Health
  icon: string;
  vision: string;
  currentStatus: string;
  rating: number; // 1-10 for Wheel of Life
  color: string;
}

export interface Task {
  id: string;
  goalId: string;
  areaId: string;
  title: string;
  status: Status;
  deadline: string;
  frequency: Frequency;
  completedDate?: string;
  discipline: 'On-time' | 'Late' | 'Pending';
}

export interface VisionBoardData {
  year: string;
  theme: string;
  visionStatement: string;
  images: string[]; // Array of 4 URLs
  themeId: string; // 'ocean', 'sakura', ... or 'custom'
  customColors?: {
    primary: string; // Màu chủ đạo (Hex)
    text: string;    // Màu chữ chính (Hex)
  };
}

// Data Context Interface
export interface PlannerState {
  areas: AreaOfLife[];
  goals: Goal[];
  tasks: Task[];
  toggleTaskCompletion: (taskId: string) => void;
  toggleStepCompletion: (goalId: string, stepId: string) => void;
}
