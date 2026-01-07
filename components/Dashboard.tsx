import React from 'react';
import { AreaOfLife, Task } from '../types';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line, Cell
} from 'recharts';

interface DashboardProps {
  areas: AreaOfLife[];
  tasks: Task[];
  selectedMonth: number;
  year: string; // Thêm prop year
}

const Dashboard: React.FC<DashboardProps> = ({ areas, tasks, selectedMonth, year }) => {
  // Helper to check date match
  const isTaskInMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === selectedMonth;
  };

  // Prepare data for Wheel of Life
  const radarData = areas.map(area => ({
    subject: area.name,
    A: area.rating,
    fullMark: 10,
  }));

  // Filter Tasks for KPI Cards based on selected Month
  const monthlyTasks = tasks.filter(t => isTaskInMonth(t.deadline));
  const totalTasks = monthlyTasks.length;
  const completedTasks = monthlyTasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = monthlyTasks.filter(t => t.status === 'Pending').length;

  // Prepare data for Task Management Chart (Yearly Overview, but highlight selected month)
  // We will generate data for all 12 months from the `tasks` prop
  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  
  const monthlyData = monthNames.map((name, index) => {
    const tasksInMonth = tasks.filter(t => {
       const d = new Date(t.deadline);
       return d.getMonth() === index;
    });
    return {
        name,
        total: tasksInMonth.length,
        completed: tasksInMonth.filter(t => t.status === 'Completed').length
    };
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-rose-500 font-serif">Bảng tin {year}</h1>
          <p className="text-gray-400 mt-1">Tiến độ phát triển cá nhân - Tháng {selectedMonth + 1}</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
           {/* Decorative Images like the storyboard */}
           <img src="https://images.unsplash.com/photo-1599818552393-3d44203dcff8?q=80&w=100&auto=format&fit=crop" className="w-16 h-16 rounded-lg object-cover transform -rotate-6 shadow-md border-2 border-white" alt="dec" />
           <img src="https://images.unsplash.com/photo-1542640244-7e672d6bd4e8?q=80&w=100&auto=format&fit=crop" className="w-16 h-16 rounded-lg object-cover transform rotate-3 shadow-md border-2 border-white" alt="dec" />
        </div>
      </div>

      {/* KPI Cards (Filtered by Month) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-32 relative overflow-hidden">
          <span className="text-gray-500 font-medium z-10">Tổng nhiệm vụ (T{selectedMonth + 1})</span>
          <span className="text-4xl font-bold text-gray-800 mt-2 z-10">{totalTasks}</span>
          <div className="absolute -bottom-4 -right-4 text-9xl text-gray-50 opacity-10 font-serif">{selectedMonth + 1}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center h-32 ring-2 ring-rose-50">
          <span className="text-rose-500 font-medium">Đã hoàn thành</span>
          <span className="text-4xl font-bold text-rose-500 mt-2">{completedTasks}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100 flex flex-col items-center justify-center h-32">
          <span className="text-yellow-500 font-medium">Đang chờ</span>
          <span className="text-4xl font-bold text-yellow-500 mt-2">{pendingTasks}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wheel of Life */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
          <h3 className="text-lg font-bold text-rose-400 tracking-widest uppercase mb-4 font-serif">Bánh xe cuộc đời</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#C3D9ED" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4A5568', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#92BCE3" />
                <Radar
                  name="Đánh giá"
                  dataKey="A"
                  stroke="#3B76B8"
                  fill="#3B76B8"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Management Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
          <h3 className="text-lg font-bold text-rose-400 tracking-widest uppercase mb-4 font-serif">Quản lý công việc</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#718096'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#718096'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E1EBF5' }}
                  itemStyle={{ color: '#3B76B8' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="total" barSize={30} radius={[4, 4, 0, 0]} name="Tổng nhiệm vụ">
                    {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === selectedMonth ? '#3B76B8' : '#C3D9ED'} />
                    ))}
                </Bar>
                <Line type="monotone" dataKey="completed" stroke="#2C5282" strokeWidth={3} dot={{r: 4, fill: '#2C5282'}} name="Hoàn thành" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Ratings Table */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 overflow-x-auto">
        <h3 className="text-lg font-bold text-rose-400 tracking-widest uppercase mb-4 font-serif">Đánh giá của bạn</h3>
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-rose-500 uppercase bg-rose-50">
                <tr>
                    <th scope="col" className="px-4 py-3 rounded-l-lg">Lĩnh vực</th>
                    <th scope="col" className="px-4 py-3">Ban đầu</th>
                    {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((m, idx) => (
                         <th key={m} scope="col" className={`px-2 py-3 text-center ${idx === selectedMonth ? 'bg-rose-100 text-rose-600 font-bold' : ''}`}>{m}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {areas.map((area) => (
                    <tr key={area.id} className="bg-white border-b hover:bg-rose-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                             <span className="w-3 h-3 rounded-full" style={{backgroundColor: area.color}}></span>
                             {area.name}
                        </td>
                        <td className="px-4 py-3 font-semibold">{area.rating - 1}</td>
                        {/* Simulating variation */}
                        {Array.from({length: 12}).map((_, i) => (
                             <td key={i} className={`px-2 py-3 text-center ${i === selectedMonth ? 'bg-rose-50 font-bold text-rose-500' : ''}`}>
                                 {Math.min(10, Math.max(1, area.rating + Math.floor(Math.random() * 3) - 1))}
                             </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;