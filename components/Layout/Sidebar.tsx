import React from 'react';
import { 
  LayoutDashboard, 
  Hammer, 
  Disc, 
  Scissors, 
  Filter, 
  Microscope, 
  Package, 
  Users, 
  Zap,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  { id: 'overview', label: '工廠總覽 (Overview)', icon: LayoutDashboard },
  { id: 'heading', label: '打頭機 (Heading)', icon: Hammer },
  { id: 'threading', label: '搓牙機 (Threading)', icon: Disc },
  { id: 'pointing', label: '夾尾機 (Pointing)', icon: Scissors },
  { id: 'sorting', label: '篩選機 (Sorting)', icon: Filter },
  { id: 'qc', label: 'QC 抽檢 (Quality)', icon: Microscope },
  { id: 'packaging', label: '包裝機 (Packaging)', icon: Package },
  { id: 'personnel', label: '人員管理 (HR)', icon: Users },
  { id: 'energy', label: '耗能管理 (Energy)', icon: Zap },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700 text-slate-100 z-30 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 h-16">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 min-w-[2rem] bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white">
              Z
            </div>
            <span className="font-bold text-sm tracking-wide truncate" title="志盈金屬企業股份有限公司">
              志盈金屬企業股份有限公司
            </span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${currentView === item.id 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-8 px-4">
             <p className="text-xs text-slate-500 uppercase font-semibold mb-2">系統狀態 (System Status)</p>
             <div className="flex items-center space-x-2 text-xs text-green-400">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span>系統連線中 (System Online)</span>
             </div>
             <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
               <span>最後同步 (Last Sync): {new Date().toLocaleTimeString()}</span>
             </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;