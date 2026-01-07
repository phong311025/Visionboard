
import { AreaOfLife, Goal, Task, VisionBoardData } from './types';

export const DEFAULT_VISION_DATA: VisionBoardData = {
  year: '2025',
  theme: '',
  visionStatement: '',
  images: [
    'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=300&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=300&auto=format&fit=crop', 
    'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=300&auto=format&fit=crop', 
  ],
  themeId: 'ocean' // Mặc định là màu xanh dương
};

// Định nghĩa các bảng màu Aesthetic
export const THEMES = [
  {
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      50: '#F0F5FA',
      100: '#E1EBF5',
      200: '#C3D9ED',
      300: '#92BCE3',
      400: '#5FA0D9',
      500: '#3B76B8',
      600: '#2C5282',
    }
  },
  {
    id: 'sakura',
    name: 'Sakura Pink',
    colors: {
      50: '#FDF2F8',
      100: '#FCE7F3',
      200: '#FBCFE8',
      300: '#F9A8D4',
      400: '#F472B6',
      500: '#EC4899',
      600: '#DB2777',
    }
  },
  {
    id: 'sage',
    name: 'Sage Green',
    colors: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
    }
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
    }
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    colors: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
      600: '#EA580C',
    }
  },
  {
    id: 'slate',
    name: 'Minimal Slate',
    colors: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
    }
  }
];

// Giữ lại Areas để làm khung sườn cho ứng dụng (Categories)
export const AREAS: AreaOfLife[] = [
  { id: '1', name: 'Sự nghiệp', icon: 'briefcase', vision: '', currentStatus: '', rating: 5, color: '#2C5282' }, 
  { id: '2', name: 'Tài chính', icon: 'dollar-sign', vision: '', currentStatus: '', rating: 5, color: '#3B76B8' }, 
  { id: '3', name: 'Sức khỏe', icon: 'heart', vision: '', currentStatus: '', rating: 5, color: '#4299E1' }, 
  { id: '4', name: 'Mối quan hệ', icon: 'users', vision: '', currentStatus: '', rating: 5, color: '#63B3ED' }, 
  { id: '5', name: 'Phát triển bản thân', icon: 'book', vision: '', currentStatus: '', rating: 5, color: '#4A5568' }, 
  { id: '6', name: 'Học tập', icon: 'graduation-cap', vision: '', currentStatus: '', rating: 5, color: '#805AD5' }, 
  { id: '7', name: 'Vui chơi & Giải trí', icon: 'music', vision: '', currentStatus: '', rating: 5, color: '#90CDF4' }, 
  { id: '8', name: 'Tâm linh', icon: 'sun', vision: '', currentStatus: '', rating: 5, color: '#A0AEC0' }, 
];

// Danh sách mục tiêu rỗng
export const GOALS: Goal[] = [];

// Danh sách nhiệm vụ rỗng
export const TASKS: Task[] = [];
