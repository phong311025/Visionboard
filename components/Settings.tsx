import React, { useRef } from 'react';
import { VisionBoardData, Goal, Task } from '../types';
import { THEMES, AREAS } from '../constants';
import { Palette, Check, Settings as SettingsIcon, RefreshCw, Save, Image, Type, Upload, Download, FileJson, Sparkles } from 'lucide-react';

interface SettingsProps {
  visionData: VisionBoardData;
  setVisionData: React.Dispatch<React.SetStateAction<VisionBoardData>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onResetData: () => void;
}

// Danh sách các key mà ứng dụng sử dụng trong LocalStorage
const APP_STORAGE_KEYS = [
    'aesthetic_planner_vision',
    'aesthetic_planner_goals',
    'aesthetic_planner_tasks',
    'aesthetic_planner_month',
    'aesthetic_planner_tab',
    'aesthetic_planner_chat_history',
    'aesthetic_planner_expanded_goals'
];

const Settings: React.FC<SettingsProps> = ({ 
    visionData, setVisionData, 
    goals, setGoals, 
    tasks, setTasks, 
    onResetData 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleCustomColorChange = (type: 'primary' | 'text', color: string) => {
      setVisionData(prev => ({
          ...prev,
          themeId: 'custom',
          customColors: {
              primary: type === 'primary' ? color : (prev.customColors?.primary || '#3B76B8'),
              text: type === 'text' ? color : (prev.customColors?.text || '#1f2937')
          }
      }));
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          if (event.target?.result) {
              const newImages = [...visionData.images];
              newImages[index] = event.target.result as string;
              setVisionData({ ...visionData, images: newImages });
          }
      };
      reader.readAsDataURL(file);
  };

  // --- GENERATE RANDOM DATA ---
  const handleGenerateRandomData = () => {
      if (!window.confirm("Hành động này sẽ thêm dữ liệu mẫu ngẫu nhiên vào dữ liệu hiện tại của bạn. Bạn có muốn tiếp tục?")) return;

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonthStr = String(today.getMonth() + 1).padStart(2, '0');
      const nextMonthStr = String((today.getMonth() + 2) % 12 || 12).padStart(2, '0'); // Simple wrap logic

      // 1. Generate Goals
      const sampleGoals: Goal[] = [
          {
              id: `g-${Date.now()}-1`,
              areaId: '1', // Sự nghiệp
              title: 'Thăng chức lên Senior Manager',
              description: 'Đạt được vị trí quản lý cấp cao',
              deadline: `${currentYear}-${currentMonthStr}-28`,
              isCompleted: false,
              whyImportant: 'Để khẳng định năng lực và tăng thu nhập',
              successCriteria: 'Được sếp phê duyệt promotion letter',
              steps: [
                  { id: `s-${Date.now()}-1`, description: 'Hoàn thành chứng chỉ PMP', deadline: `${currentYear}-${currentMonthStr}-15`, priority: 'High', isCompleted: true },
                  { id: `s-${Date.now()}-2`, description: 'Lead thành công dự án Q3', deadline: `${currentYear}-${currentMonthStr}-25`, priority: 'High', isCompleted: false },
                  { id: `s-${Date.now()}-3`, description: 'Mentoring cho 2 nhân sự mới', deadline: `${currentYear}-${currentMonthStr}-20`, priority: 'Medium', isCompleted: false },
              ]
          },
          {
              id: `g-${Date.now()}-2`,
              areaId: '2', // Tài chính
              title: 'Tiết kiệm 200 triệu cho quỹ khẩn cấp',
              description: 'Xây dựng quỹ dự phòng',
              deadline: `${currentYear}-${nextMonthStr}-30`,
              isCompleted: false,
              whyImportant: 'An tâm tài chính trước biến động',
              successCriteria: 'Số dư tài khoản tiết kiệm đạt 200tr',
              steps: [
                  { id: `s-${Date.now()}-4`, description: 'Trích 30% lương tháng này', deadline: `${currentYear}-${currentMonthStr}-05`, priority: 'High', isCompleted: true },
                  { id: `s-${Date.now()}-5`, description: 'Cắt giảm chi phí ăn ngoài', deadline: `${currentYear}-${currentMonthStr}-30`, priority: 'Medium', isCompleted: false },
              ]
          },
          {
              id: `g-${Date.now()}-3`,
              areaId: '3', // Sức khỏe
              title: 'Chạy bộ Half-Marathon (21km)',
              description: 'Cải thiện thể lực',
              deadline: `${currentYear}-${currentMonthStr}-30`,
              isCompleted: true,
              whyImportant: 'Sức khỏe dẻo dai và vóc dáng đẹp',
              successCriteria: 'Hoàn thành cự ly 21km dưới 2h30p',
              steps: [
                  { id: `s-${Date.now()}-6`, description: 'Chạy 5km mỗi sáng thứ 3-5-7', deadline: `${currentYear}-${currentMonthStr}-30`, priority: 'Medium', isCompleted: true },
                  { id: `s-${Date.now()}-7`, description: 'Long run 15km cuối tuần', deadline: `${currentYear}-${currentMonthStr}-28`, priority: 'High', isCompleted: true },
              ]
          },
          {
              id: `g-${Date.now()}-4`,
              areaId: '5', // Phát triển bản thân
              title: 'Đọc 10 cuốn sách về Kinh doanh',
              description: 'Nâng cao tư duy',
              deadline: `${currentYear}-12-31`,
              isCompleted: false,
              whyImportant: 'Mở rộng kiến thức',
              successCriteria: 'Viết review cho 10 cuốn sách',
              steps: [
                  { id: `s-${Date.now()}-8`, description: 'Đọc xong cuốn "Zero to One"', deadline: `${currentYear}-${currentMonthStr}-10`, priority: 'Low', isCompleted: false },
              ]
          }
      ];

      // 2. Generate Tasks
      const sampleTasks: Task[] = [
          { id: `t-${Date.now()}-1`, goalId: sampleGoals[0].id, areaId: '1', title: 'Gửi báo cáo tuần cho sếp', status: 'Pending', deadline: `${currentYear}-${currentMonthStr}-12`, frequency: 'Weekly', discipline: 'Pending' },
          { id: `t-${Date.now()}-2`, goalId: '', areaId: '3', title: 'Uống đủ 2 lít nước', status: 'Completed', deadline: `${currentYear}-${currentMonthStr}-12`, frequency: 'Daily', discipline: 'On-time' },
          { id: `t-${Date.now()}-3`, goalId: sampleGoals[1].id, areaId: '2', title: 'Chuyển 5 triệu vào sổ tiết kiệm', status: 'Completed', deadline: `${currentYear}-${currentMonthStr}-05`, frequency: 'Monthly', discipline: 'On-time' },
          { id: `t-${Date.now()}-4`, goalId: '', areaId: '4', title: 'Gọi điện cho bố mẹ', status: 'Pending', deadline: `${currentYear}-${currentMonthStr}-13`, frequency: 'Weekly', discipline: 'Pending' },
          { id: `t-${Date.now()}-5`, goalId: sampleGoals[3].id, areaId: '5', title: 'Đọc sách 30 phút trước khi ngủ', status: 'Missed', deadline: `${currentYear}-${currentMonthStr}-11`, frequency: 'Daily', discipline: 'Late' },
          { id: `t-${Date.now()}-6`, goalId: '', areaId: '7', title: 'Xem phim thư giãn cuối tuần', status: 'Scheduled', deadline: `${currentYear}-${currentMonthStr}-14`, frequency: 'Weekly', discipline: 'Pending' },
      ];

      setGoals(prev => [...prev, ...sampleGoals]);
      setTasks(prev => [...prev, ...sampleTasks]);
      
      alert("Đã thêm dữ liệu mẫu thành công! Hãy kiểm tra Dashboard và Kế hoạch hành động.");
  };

  // --- EXPORT DATA (SNAPSHOT LOCALSTORAGE) ---
  const handleExportData = () => {
      // 1. Thu thập toàn bộ dữ liệu hiện tại từ LocalStorage
      const storageSnapshot: Record<string, any> = {};
      
      APP_STORAGE_KEYS.forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
              try {
                  storageSnapshot[key] = JSON.parse(item);
              } catch (e) {
                  storageSnapshot[key] = item;
              }
          }
      });

      const backupPackage = {
          meta: {
              version: '2.0',
              timestamp: new Date().toISOString(),
              appName: "Vision Board 2026",
              description: "Full System Snapshot"
          },
          data: storageSnapshot
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPackage, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `aesthetic_planner_full_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  // --- IMPORT DATA (UNIVERSAL RESTORE) ---
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      
      reader.onload = (event) => {
          try {
              if (event.target?.result && typeof event.target.result === 'string') {
                  const json = JSON.parse(event.target.result);
                  
                  // --- UNIVERSAL DATA EXTRACTION STRATEGY ---
                  // Tự động phát hiện định dạng file (V1 hay V2) và trích xuất dữ liệu
                  
                  let foundVision = null;
                  let foundGoals = null;
                  let foundTasks = null;
                  let foundOtherData: Record<string, any> = {};

                  // Case 1: Snapshot V2 (Có trường .data chứa các key aesthetic_planner_...)
                  if (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
                      console.log("Detected V2 Backup Format");
                      foundVision = json.data['aesthetic_planner_vision'];
                      foundGoals = json.data['aesthetic_planner_goals'];
                      foundTasks = json.data['aesthetic_planner_tasks'];
                      
                      // Lấy các dữ liệu phụ (Month, Tab, Chat...)
                      Object.keys(json.data).forEach(k => {
                          if (k !== 'aesthetic_planner_vision' && k !== 'aesthetic_planner_goals' && k !== 'aesthetic_planner_tasks') {
                              foundOtherData[k] = json.data[k];
                          }
                      });
                  } 
                  // Case 2: Legacy V1 (Dữ liệu nằm trực tiếp ở root hoặc tên biến cũ)
                  else {
                      console.log("Detected V1 Legacy Format");
                      foundVision = json.visionData || json.vision; // Support cả 2 tên
                      foundGoals = json.goals;
                      foundTasks = json.tasks;
                  }

                  // Kiểm tra tính hợp lệ tối thiểu
                  const hasCoreData = foundVision || (Array.isArray(foundGoals) && foundGoals.length > 0) || (Array.isArray(foundTasks) && foundTasks.length > 0);

                  if (!hasCoreData) {
                      alert("Lỗi: File không chứa dữ liệu hợp lệ (Vision Board, Mục tiêu hoặc Nhiệm vụ). Vui lòng kiểm tra lại file.");
                      return;
                  }

                  const statsMsg = `Tìm thấy bản sao lưu:\n- Vision Data: ${foundVision ? 'Có' : 'Không'}\n- Mục tiêu: ${Array.isArray(foundGoals) ? foundGoals.length : 0}\n- Nhiệm vụ: ${Array.isArray(foundTasks) ? foundTasks.length : 0}\n\nBạn có muốn khôi phục không? Dữ liệu hiện tại sẽ bị thay thế.`;

                  if (window.confirm(statsMsg)) {
                      
                      // 1. Clear LocalStorage để tránh xung đột
                      APP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

                      // 2. Ghi đè dữ liệu cốt lõi (Core Data)
                      if (foundVision) localStorage.setItem('aesthetic_planner_vision', JSON.stringify(foundVision));
                      if (foundGoals) localStorage.setItem('aesthetic_planner_goals', JSON.stringify(foundGoals));
                      if (foundTasks) localStorage.setItem('aesthetic_planner_tasks', JSON.stringify(foundTasks));

                      // 3. Ghi đè dữ liệu phụ (nếu có từ bản V2)
                      Object.entries(foundOtherData).forEach(([key, value]) => {
                           // Chỉ restore những key an toàn thuộc về app
                           if (key.startsWith('aesthetic_planner_')) {
                               localStorage.setItem(key, JSON.stringify(value));
                           }
                      });

                      // 4. Force Reload để App nhận diện dữ liệu mới
                      // Sử dụng setTimeout để đảm bảo IO LocalStorage hoàn tất
                      setTimeout(() => {
                          alert("Khôi phục thành công! Ứng dụng sẽ tự động tải lại.");
                          window.location.reload();
                      }, 200);
                  }
              }
          } catch (error) {
              console.error("Import error details:", error);
              alert("Lỗi nghiêm trọng khi đọc file: Định dạng JSON không hợp lệ.");
          } finally {
              if (fileInputRef.current) {
                  fileInputRef.current.value = '';
              }
          }
      };
      
      reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-8 pb-10">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-rose-500 mb-2 font-serif">Cài đặt & Tùy chỉnh</h2>
            <p className="text-gray-500">Cá nhân hóa giao diện và thiết lập tầm nhìn của bạn.</p>
        </div>
        
        {/* SECTION 1: INTERFACE & THEME */}
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-rose-50 pb-4">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-500">
                    <Palette className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Giao diện ứng dụng</h3>
                    <p className="text-xs text-gray-400">Chọn màu sắc chủ đạo thể hiện cá tính của bạn</p>
                </div>
            </div>

            {/* Theme Presets */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Bộ màu có sẵn</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {THEMES.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => setVisionData(prev => ({...prev, themeId: theme.id}))}
                            className={`
                                group flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300
                                ${visionData.themeId === theme.id 
                                    ? 'border-rose-400 bg-rose-50 shadow-md transform scale-105' 
                                    : 'border-transparent hover:bg-gray-50'}
                            `}
                        >
                            <div 
                                className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-white transition-transform group-hover:scale-110"
                                style={{backgroundColor: theme.colors[500]}}
                            >
                                {visionData.themeId === theme.id && <Check className="w-5 h-5" />}
                            </div>
                            <span className={`text-[10px] font-bold ${visionData.themeId === theme.id ? 'text-rose-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {theme.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <div className="pt-4 border-t border-dashed border-rose-100">
                <label className="text-xs font-bold text-rose-400 uppercase flex items-center gap-2 mb-4">
                    <SettingsIcon className="w-3 h-3" /> Tùy chỉnh nâng cao
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-2xl border transition-all ${visionData.themeId === 'custom' ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className="relative overflow-hidden w-12 h-12 rounded-full shadow-md border-2 border-white ring-1 ring-gray-100">
                                <input 
                                    type="color" 
                                    value={visionData.customColors?.primary || '#3B76B8'}
                                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700">Màu chủ đạo</h4>
                                <p className="text-[10px] text-gray-400">Thanh điều hướng, nút bấm, điểm nhấn</p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${visionData.themeId === 'custom' ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className="relative overflow-hidden w-12 h-12 rounded-full shadow-md border-2 border-white ring-1 ring-gray-100">
                                <input 
                                    type="color" 
                                    value={visionData.customColors?.text || '#1f2937'}
                                    onChange={(e) => handleCustomColorChange('text', e.target.value)}
                                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-0"
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700">Màu văn bản</h4>
                                <p className="text-[10px] text-gray-400">Tiêu đề, nội dung chính</p>
                            </div>
                        </div>
                    </div>
                </div>
                {visionData.themeId === 'custom' && (
                     <div className="mt-3 text-center text-xs text-rose-500 font-medium animate-pulse">
                         ✨ Đang sử dụng chế độ màu tùy chỉnh
                     </div>
                )}
            </div>
        </div>

        {/* SECTION 2: VISION SETUP */}
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-rose-50 pb-4">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-500">
                    <Type className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Thông tin Tầm nhìn</h3>
                    <p className="text-xs text-gray-400">Định hình năm của bạn</p>
                </div>
            </div>

            {/* Year & Theme */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Năm</label>
                    <input 
                        type="text" 
                        value={visionData.year} 
                        onChange={(e) => setVisionData({...visionData, year: e.target.value})}
                        className="w-full p-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 font-bold text-center text-rose-500"
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                     <label className="text-xs font-bold text-gray-500 uppercase">Chủ đề của năm</label>
                     <input 
                        type="text" 
                        value={visionData.theme} 
                        onChange={(e) => setVisionData({...visionData, theme: e.target.value})}
                        className="w-full p-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                </div>
            </div>

            {/* Vision Statement */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Tuyên bố tầm nhìn</label>
                <textarea 
                    rows={4}
                    value={visionData.visionStatement}
                    onChange={(e) => setVisionData({...visionData, visionStatement: e.target.value})}
                    className="w-full p-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm leading-relaxed"
                />
            </div>

            {/* Images */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Image className="w-4 h-4" /> Hình ảnh Vision Board
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {visionData.images.map((url, idx) => (
                         <div key={idx} className="space-y-2 group">
                             <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    value={url.length > 50 ? '' : url} // Don't show long base64 strings
                                    placeholder={url.length > 50 ? 'Đã tải ảnh lên (Base64)' : `Nhập URL ảnh ${idx + 1}`}
                                    onChange={(e) => {
                                        const newImages = [...visionData.images];
                                        newImages[idx] = e.target.value;
                                        setVisionData({...visionData, images: newImages});
                                    }}
                                    className="flex-1 p-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-rose-300"
                                 />
                                 
                                 <input 
                                    type="file"
                                    id={`file-upload-${idx}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(idx, e)}
                                 />
                                 <label 
                                    htmlFor={`file-upload-${idx}`}
                                    className="flex items-center justify-center p-2 bg-rose-50 text-rose-500 rounded-lg cursor-pointer hover:bg-rose-100 transition-colors border border-rose-100"
                                    title="Tải ảnh từ máy tính"
                                 >
                                    <Upload className="w-4 h-4" />
                                 </label>
                             </div>
                             
                             <div className="h-40 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative shadow-sm group-hover:shadow-md transition-all">
                                 <img 
                                    src={url} 
                                    alt={`Preview ${idx}`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')} 
                                 />
                                 {url.length > 50 && (
                                     <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                                         Local Image
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))}
                </div>
                <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
                    * Bạn có thể dán link ảnh hoặc tải ảnh trực tiếp từ máy tính.
                </p>
            </div>
        </div>

        {/* SECTION 3: DATA MANAGEMENT */}
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-rose-50 pb-4">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-500">
                    <FileJson className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Quản lý dữ liệu</h3>
                    <p className="text-xs text-gray-400">Sao lưu, khôi phục hoặc tạo dữ liệu mẫu</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                {/* Random Data Button */}
                <button
                    onClick={handleGenerateRandomData}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition-colors"
                >
                    <Sparkles className="w-5 h-5" />
                    Tạo dữ liệu mẫu (Random Data)
                </button>

                <div className="flex flex-col md:flex-row gap-4">
                    <button 
                        onClick={handleExportData}
                        className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Tải về bản sao lưu đầy đủ
                    </button>
                    
                    <div className="flex-1 relative">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImportData}
                            accept=".json"
                            className="hidden"
                            id="import-json"
                        />
                        <label 
                            htmlFor="import-json"
                            className="flex items-center justify-center gap-2 p-4 rounded-xl border border-rose-200 bg-white text-gray-600 font-bold hover:bg-gray-50 transition-colors cursor-pointer w-full h-full"
                        >
                            <Upload className="w-5 h-5" />
                            Khôi phục từ file (Ghi đè)
                        </label>
                    </div>
                </div>
            </div>

            {/* Reset Actions */}
            <div className="pt-6 border-t border-rose-50 flex justify-between items-center">
                <button 
                    onClick={onResetData}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold uppercase flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                    <RefreshCw className="w-4 h-4" /> Reset Data (Xóa trắng)
                </button>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-bold">
                    <Save className="w-3 h-3" /> Auto-saved
                </div>
            </div>
        </div>
    </div>
  );
};

export default Settings;