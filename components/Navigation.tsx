
import React from 'react';

type Tab = 'setup' | 'dashboard' | 'vision' | 'action' | 'tasks';

interface NavigationProps {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab }) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'setup', label: 'Cài đặt' },
    { id: 'dashboard', label: 'Tổng quan' },
    { id: 'vision', label: 'Tầm nhìn & Mục tiêu' },
    { id: 'action', label: 'Kế hoạch hành động' },
    { id: 'tasks', label: 'Tất cả nhiệm vụ' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-rose-500 shadow-lg border-b border-rose-600/20 backdrop-blur-xl transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 overflow-x-auto no-scrollbar">
           <div className="flex items-center space-x-1 md:space-x-8 w-full md:w-auto md:justify-center mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`
                    px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap relative
                    ${currentTab === tab.id 
                      ? 'text-white' 
                      : 'text-rose-100 hover:text-white hover:bg-white/10 rounded-lg'}
                  `}
                >
                  {tab.label}
                  {/* Active Indicator Line */}
                  {currentTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t-md shadow-sm"></span>
                  )}
                </button>
              ))}
           </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
