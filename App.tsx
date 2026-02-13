import React, { useState, useEffect, useRef } from 'react';
import { Menu, Settings, Bell } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import Overview from './components/Overview';
import MachineGrid from './components/MachineGrid';
import SortingDashboard from './components/SortingDashboard';
import QCDashboard from './components/QCDashboard';
import PackagingDashboard from './components/PackagingDashboard';
import PersonnelDashboard from './components/PersonnelDashboard';
import EnergyDashboard from './components/EnergyDashboard';
import SettingsModal from './components/SettingsModal';
import NotificationToast from './components/NotificationToast';
import { fetchFactoryData, DEFAULT_GOOGLE_SCRIPT_URL } from './services/api';
import { DashboardData, AppNotification, MachineStatus, StandardMachine, SortingMachine, QCMachine, PackagingMachine } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevErrorIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('factory_api_url') || DEFAULT_GOOGLE_SCRIPT_URL;
  });

  const checkForNewErrors = (newData: DashboardData) => {
    const currentErrors = new Set<string>();
    const newNotifications: AppNotification[] = [];

    // Helper to check standard machines
    const checkMachines = (machines: (StandardMachine | SortingMachine | PackagingMachine)[], typeName: string) => {
      machines.forEach(m => {
        if (m.status === MachineStatus.Error) {
          currentErrors.add(m.id);
          // If this ID wasn't in the previous error set, and it's not the first load
          if (!prevErrorIdsRef.current.has(m.id) && !isFirstLoad.current) {
            newNotifications.push({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: '機台異常警報',
              message: `${typeName} ${m.name} (${m.id}) 發生故障: ${('errorMessage' in m) ? m.errorMessage : '系統偵測到異常'}`,
              type: 'error',
              timestamp: Date.now()
            });
          }
        }
      });
    };

    // Helper for QC machines (slightly different structure)
    const checkQC = (machines: QCMachine[]) => {
      machines.forEach(m => {
        if (m.status === MachineStatus.Error) {
          currentErrors.add(m.id);
          if (!prevErrorIdsRef.current.has(m.id) && !isFirstLoad.current) {
             newNotifications.push({
              id: `${Date.now()}-${Math.random()}`,
              title: 'QC 設備警報',
              message: `檢測機 ${m.name} 狀態異常`,
              type: 'error',
              timestamp: Date.now()
            });
          }
        }
      });
    };

    checkMachines(newData.headingMachines, '打頭機');
    checkMachines(newData.threadingMachines, '搓牙機');
    checkMachines(newData.pointingMachines, '夾尾機');
    checkMachines(newData.sortingMachines, '篩選機');
    checkMachines(newData.packagingMachines, '包裝機');
    checkQC(newData.qcMachines);

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 5)); // Keep most recent 5 on screen
      setUnreadCount(prev => prev + newNotifications.length);
    }

    // Update refs
    prevErrorIdsRef.current = currentErrors;
    isFirstLoad.current = false;
  };

  const loadData = async (url: string) => {
    setLoading(true);
    const result = await fetchFactoryData(url);
    if (result) {
      checkForNewErrors(result);
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(apiUrl);

    const interval = setInterval(() => {
      fetchFactoryData(apiUrl).then(result => {
        if (result) {
          checkForNewErrors(result);
          setData(result);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleSettingsUpdate = (newUrl: string) => {
    setApiUrl(newUrl);
    localStorage.setItem('factory_api_url', newUrl);
    loadData(newUrl); // Trigger immediate reload
  };

  const handleManualDataUpdate = (newData: DashboardData) => {
    checkForNewErrors(newData);
    setData(newData);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearUnread = () => {
    setUnreadCount(0);
    // Optionally clear notifications list or keep them visible but "read"
    // For now we just reset the badge
  };

  const renderContent = () => {
    if (loading || !data) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
           <p>正在連接工廠數據...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'overview':
        return <Overview data={data} />;
      case 'heading':
        return <MachineGrid title="打頭機 (Heading Machines)" machines={data.headingMachines} />;
      case 'threading':
        return <MachineGrid title="搓牙機 (Threading Machines)" machines={data.threadingMachines} />;
      case 'pointing':
        return <MachineGrid title="夾尾機 (Pointing Machines)" machines={data.pointingMachines} />;
      case 'sorting':
        return <SortingDashboard machines={data.sortingMachines} />;
      case 'qc':
        return <QCDashboard machines={data.qcMachines} />;
      case 'packaging':
        return <PackagingDashboard machines={data.packagingMachines} />;
      case 'personnel':
        return <PersonnelDashboard data={data.personnel} />;
      case 'energy':
        return <EnergyDashboard blocks={data.energy} />;
      default:
        return <Overview data={data} />;
    }
  };

  const getHeaderTitle = (view: string) => {
    switch(view) {
      case 'overview': return '智慧工廠管理系統-分享版';
      case 'heading': return '打頭機監控';
      case 'threading': return '搓牙機監控';
      case 'pointing': return '夾尾機監控';
      case 'sorting': return '篩選機監控';
      case 'qc': return '品質管理看板';
      case 'packaging': return '包裝機監控';
      case 'personnel': return '人員管理';
      case 'energy': return '耗能管理';
      default: return '看板';
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex flex-col h-full lg:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 px-4">
             <h1 className="text-xl font-bold text-white hidden md:block">
               {getHeaderTitle(currentView)}
             </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button 
              onClick={clearUnread}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              )}
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="Connection Settings"
            >
              <Settings size={20} />
            </button>

            <div className="hidden md:flex flex-col items-end mr-2 ml-2">
              <span className="text-sm font-bold text-slate-200">管理員</span>
              <span className="text-xs text-slate-500">廠務經理</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-brand-500 flex items-center justify-center">
              <span className="font-bold text-sm">AU</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900 relative">
          <div className="max-w-7xl mx-auto min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      <NotificationToast 
        notifications={notifications} 
        onDismiss={dismissNotification} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsUpdate}
        currentUrl={apiUrl}
        currentData={data}
        onDataUpdate={handleManualDataUpdate}
      />
    </div>
  );
};

export default App;
