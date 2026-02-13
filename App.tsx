import React, { useState, useEffect } from 'react';
import { Menu, Settings, RefreshCw } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import Overview from './components/Overview';
import MachineGrid from './components/MachineGrid';
import SortingDashboard from './components/SortingDashboard';
import QCDashboard from './components/QCDashboard';
import PackagingDashboard from './components/PackagingDashboard';
import PersonnelDashboard from './components/PersonnelDashboard';
import EnergyDashboard from './components/EnergyDashboard';
import SettingsModal from './components/SettingsModal';
import { fetchFactoryData, DEFAULT_CSV_PATH } from './services/api';
import { DashboardData } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dataPath, setDataPath] = useState<string>(() => {
    return localStorage.getItem('factory_data_path') || DEFAULT_CSV_PATH;
  });
  const [updateInterval, setUpdateInterval] = useState<number>(() => {
    const saved = localStorage.getItem('factory_update_interval');
    return saved ? parseInt(saved, 10) : 60;
  });

  const loadData = async (path: string) => {
    setLoading(true);
    const result = await fetchFactoryData(path);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData(dataPath);

    const intervalId = setInterval(() => {
      fetchFactoryData(dataPath).then(result => setData(result));
    }, updateInterval * 1000);

    return () => clearInterval(intervalId);
  }, [dataPath, updateInterval]);

  const handleSettingsUpdate = (newPath: string, newInterval: number) => {
    setDataPath(newPath);
    setUpdateInterval(newInterval);
    localStorage.setItem('factory_data_path', newPath);
    localStorage.setItem('factory_update_interval', newInterval.toString());
    loadData(newPath); // Trigger immediate reload
  };

  const handleManualRefresh = () => {
    loadData(dataPath);
  };

  const handleManualDataUpdate = (newData: DashboardData) => {
    setData(newData);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    if (loading || !data) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mb-4"></div>
           <p>正在讀取工廠數據...</p>
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
            {/* Manual Update Button */}
            <button 
              onClick={handleManualRefresh}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2"
              title="立即更新數據"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="系統設定"
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

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsUpdate}
        currentUrl={dataPath}
        currentInterval={updateInterval}
        currentData={data}
        onDataUpdate={handleManualDataUpdate}
      />
    </div>
  );
};

export default App;
