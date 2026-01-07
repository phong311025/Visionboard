import React, { useState } from 'react';
import { AreaOfLife, Goal, VisionBoardData, Frequency } from '../types';
import { Calendar, Sun, CheckCircle, Circle, Plus, X, Trash2 } from 'lucide-react';

interface VisionGoalsProps {
  areas: AreaOfLife[];
  goals: Goal[];
  visionData: VisionBoardData;
  selectedMonth: number;
  onAddGoal: (goal: Goal) => void;
  toggleGoalCompletion: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

const VisionGoals: React.FC<VisionGoalsProps> = ({ areas, goals, visionData, selectedMonth, onAddGoal, toggleGoalCompletion, onDeleteGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    areaId: areas[0]?.id || '1',
    whyImportant: '',
    deadline: `${visionData.year}-${String(selectedMonth + 1).padStart(2, '0')}-28`, // Default to end of selected month
    successCriteria: '',
    frequency: 'One-time' // Default frequency
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.areaId || !newGoal.deadline) return;

    const goalToAdd: Goal = {
      id: `g-${Date.now()}`,
      areaId: newGoal.areaId,
      title: newGoal.title,
      description: newGoal.title, // using title as desc for simplicity
      deadline: newGoal.deadline,
      isCompleted: false,
      whyImportant: newGoal.whyImportant || '',
      successCriteria: newGoal.successCriteria || '',
      frequency: newGoal.frequency as Frequency,
      steps: []
    };

    onAddGoal(goalToAdd);
    setIsModalOpen(false);
    setNewGoal({
        title: '',
        areaId: areas[0]?.id || '1',
        whyImportant: '',
        deadline: `${visionData.year}-${String(selectedMonth + 1).padStart(2, '0')}-28`,
        successCriteria: '',
        frequency: 'One-time'
    });
  };

  const isGoalActiveInMonth = (goal: Goal) => {
    if (!goal.deadline) return false;
    const parts = goal.deadline.split('-');
    if (parts.length < 2) return false;
    const month = parseInt(parts[1], 10) - 1; 
    
    if (month === selectedMonth) return true;
    
    return goal.steps.some(s => {
        if (!s.deadline) return false;
        const sParts = s.deadline.split('-');
        if (sParts.length < 2) return false;
        const sMonth = parseInt(sParts[1], 10) - 1;
        return sMonth === selectedMonth;
    });
  };
    
  const achieved = goals.filter(g => g.isCompleted).length;
  const totalGoals = goals.length;
  
  const displayDate = new Date(parseInt(visionData.year), selectedMonth, 15);
  const dateString = displayDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Widgets */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 text-center">
                <h2 className="text-3xl font-bold text-rose-500 font-serif mb-1">Bảng tầm nhìn</h2>
                <div className="text-5xl font-light text-gray-800 my-4 tracking-tighter">
                   Tháng <span className="text-rose-500 font-bold">{selectedMonth + 1}</span>
                </div>
                <div className="text-sm text-gray-500 font-medium capitalize">{dateString}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-50 flex flex-col items-center justify-center">
                    <Sun className="w-8 h-8 text-yellow-400 mb-2" />
                    <span className="text-lg font-bold text-gray-700">24°C</span>
                    <span className="text-xs text-gray-400">Thời tiết tháng {selectedMonth + 1}</span>
                 </div>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-50 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400 mb-1 text-center">Mục tiêu đạt được</span>
                    <span className="text-2xl font-bold text-green-500">{achieved}/{totalGoals}</span>
                 </div>
            </div>

             <div className="bg-white p-5 rounded-3xl shadow-sm border border-rose-100">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3 font-serif">Các khía cạnh cuộc sống</h4>
                <div className="space-y-3">
                    {areas.slice(0, 5).map(area => (
                        <div key={area.id} className="flex items-center text-sm">
                            <div className={`w-2 h-2 rounded-full mr-2`} style={{backgroundColor: area.color}}></div>
                            <span className="flex-1 text-gray-600 truncate">{area.name}</span>
                            <div className="w-16 h-2 bg-gray-100 rounded-full ml-2 overflow-hidden">
                                <div className="h-full bg-rose-300" style={{width: `${area.rating * 10}%`}}></div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        {/* Center/Right: Vision Collage */}
        <div className="lg:col-span-3 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gradient-to-r from-rose-50 to-white p-6 rounded-3xl border border-rose-100 flex flex-col justify-center items-center text-center">
                      <span className="text-sm text-rose-400 font-handwriting italic mb-2">Chủ đề của năm {visionData.year}</span>
                      <h3 className="text-3xl font-bold text-rose-500 flex items-center gap-2 text-center font-serif">
                         {visionData.theme}
                      </h3>
                      <div className="mt-4 flex gap-4 text-rose-300">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                      </div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-rose-100 relative overflow-hidden">
                      <h3 className="text-xl font-bold text-gray-700 mb-2 z-10 relative font-serif">Tầm nhìn {visionData.year} của tôi</h3>
                      <p className="text-sm text-gray-500 z-10 relative leading-relaxed whitespace-pre-line">
                          {visionData.visionStatement}
                      </p>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
                 </div>
             </div>

             <div className="grid grid-cols-3 md:grid-cols-4 gap-4 h-96">
                  <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden shadow-sm relative group bg-rose-50">
                      <img src={visionData.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Vision 1" />
                      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700">Mục tiêu lớn</div>
                  </div>
                  <div className="col-span-1 row-span-1 rounded-3xl overflow-hidden shadow-sm relative group bg-rose-50">
                      <img src={visionData.images[1]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Vision 2" />
                  </div>
                   <div className="col-span-1 row-span-2 rounded-3xl overflow-hidden shadow-sm relative group bg-rose-50">
                      <img src={visionData.images[2]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Vision 3" />
                      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700">Phong cách</div>
                  </div>
                   <div className="col-span-1 row-span-1 rounded-3xl overflow-hidden shadow-sm relative group bg-rose-50">
                      <img src={visionData.images[3]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Vision 4" />
                  </div>
             </div>
        </div>
      </div>

      {/* Overview Cards by Area + Add Button */}
      <div>
        <div className="flex items-center justify-between my-8 px-4">
            <h2 className="text-2xl font-bold text-rose-500 font-serif italic bg-rose-50 px-8 py-2 rounded-full mx-auto">
                Tổng quan Mục tiêu (Tháng {selectedMonth + 1})
            </h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-rose-500 text-white p-3 rounded-full shadow-lg hover:bg-rose-600 transition-transform transform hover:scale-110"
                title="Thêm mục tiêu mới"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {areas.map((area, idx) => {
                // Show ALL goals for the month, including completed ones
                const areaGoals = goals.filter(g => g.areaId === area.id && isGoalActiveInMonth(g));
                return (
                    <div key={area.id} className="bg-white rounded-3xl shadow-sm border border-rose-50 overflow-hidden flex flex-col">
                        <div className="h-2 bg-gradient-to-r from-rose-200 to-rose-400"></div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md" style={{backgroundColor: area.color}}>
                                    {idx + 1}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 font-serif">{area.name}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-rose-50 p-4 rounded-2xl">
                                    <h5 className="text-xs font-bold text-rose-400 uppercase mb-1">Tầm nhìn</h5>
                                    <p className="text-sm text-gray-600 italic">"{area.vision}"</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-1">Trạng thái</h5>
                                    <p className="text-sm text-gray-600">{area.currentStatus}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-rose-400" /> Mục tiêu trọng tâm tháng {selectedMonth + 1}
                                </h5>
                                {areaGoals.length > 0 ? (
                                    <ul className="space-y-2">
                                        {areaGoals.map(g => (
                                            <li 
                                                key={g.id} 
                                                className={`flex items-start gap-3 text-sm group relative pr-8 animate-fade-in transition-all duration-300 ${g.isCompleted ? 'opacity-60 grayscale' : ''}`}
                                            >
                                                <button 
                                                    onClick={() => toggleGoalCompletion(g.id)}
                                                    className="mt-0.5 focus:outline-none"
                                                    title={g.isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                                                >
                                                    {g.isCompleted ? 
                                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 hover:text-green-600" /> : 
                                                        <Circle className="w-5 h-5 text-gray-300 shrink-0 group-hover:text-rose-400 transition-colors" />
                                                    }
                                                </button>
                                                <div className="flex-1 cursor-pointer" onClick={() => toggleGoalCompletion(g.id)}>
                                                    <p className={`font-medium transition-all ${g.isCompleted ? 'line-through text-gray-400 decoration-gray-400' : 'text-gray-700'}`}>
                                                        {g.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                                        <span>{g.deadline}</span>
                                                        {g.frequency && g.frequency !== 'One-time' && (
                                                            <span className="bg-rose-50 text-rose-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border border-rose-100">{g.frequency}</span>
                                                        )}
                                                    </p>
                                                </div>
                                                
                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteGoal(g.id);
                                                    }}
                                                    className="absolute right-0 top-1 text-gray-300 hover:text-red-500 transition-all p-2 z-20 hover:bg-red-50 rounded-full"
                                                    title="Xoá mục tiêu"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Không có mục tiêu chính nào trong tháng này.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>

      {/* ADD GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-fade-in-up">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-2xl font-bold text-rose-500 mb-6 text-center font-serif">Thêm mục tiêu chiến lược</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên mục tiêu</label>
                        <input 
                            type="text" 
                            required
                            value={newGoal.title}
                            onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            placeholder="VD: Tiết kiệm 100 triệu"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lĩnh vực</label>
                            <select 
                                value={newGoal.areaId}
                                onChange={e => setNewGoal({...newGoal, areaId: e.target.value})}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                            >
                                {areas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hạn chót</label>
                            <input 
                                type="date" 
                                required
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tần suất</label>
                        <select 
                            value={newGoal.frequency}
                            onChange={e => setNewGoal({...newGoal, frequency: e.target.value as Frequency})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                        >
                            <option value="One-time">Một lần</option>
                            <option value="Daily">Hàng ngày</option>
                            <option value="Weekly">Hàng tuần</option>
                            <option value="Monthly">Hàng tháng</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tại sao quan trọng?</label>
                        <textarea 
                            value={newGoal.whyImportant}
                            onChange={e => setNewGoal({...newGoal, whyImportant: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            placeholder="Lý do..."
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiêu chí thành công</label>
                        <textarea 
                            value={newGoal.successCriteria}
                            onChange={e => setNewGoal({...newGoal, successCriteria: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            placeholder="Kết quả mong muốn..."
                            rows={2}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-rose-600 transition-colors mt-2"
                    >
                        Tạo Mục Tiêu
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default VisionGoals;