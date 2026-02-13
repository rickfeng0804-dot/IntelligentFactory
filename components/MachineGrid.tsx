import React, { useMemo, useState } from 'react';
import { StandardMachine, MachineStatus } from '../types';
import { AlertTriangle, CheckCircle, PauseCircle, Activity, Wrench } from 'lucide-react';

interface MachineGridProps {
  title: string;
  machines: StandardMachine[];
}

const MachineGrid: React.FC<MachineGridProps> = ({ title, machines }) => {
  const [filter, setFilter] = useState<MachineStatus | 'All'>('All');

  const stats = useMemo(() => {
    return {
      running: machines.filter(m => m.status === MachineStatus.Running || m.status?.toLowerCase() === 'running').length,
      stopped: machines.filter(m => m.status === MachineStatus.Stopped || m.status?.toLowerCase() === 'stopped').length,
      error: machines.filter(m => m.status === MachineStatus.Error || m.status?.toLowerCase() === 'error').length,
      maintenance: machines.filter(m => m.status === MachineStatus.Maintenance || m.status?.toLowerCase() === 'maintenance').length,
    };
  }, [machines]);

  const filteredMachines = useMemo(() => {
    if (filter === 'All') return machines;
    // Case insensitive filter match
    return machines.filter(m => m.status.toLowerCase() === filter.toLowerCase());
  }, [machines, filter]);

  const getStatusColor = (status: MachineStatus | string) => {
    const s = status.toLowerCase();
    if (s === 'running') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (s === 'stopped') return 'bg-slate-700/50 text-slate-400 border-slate-600';
    if (s === 'error') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (s === 'maintenance') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs font-medium">機台總數 (Total)</h3>
            <Activity size={18} className="text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{machines.length}</p>
        </div>
        <div 
          onClick={() => setFilter('All')}
          className={`bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${filter === 'All' ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs font-medium">運轉中 (Running)</h3>
            <CheckCircle size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400 mt-2">{stats.running}</p>
        </div>
        <div 
           onClick={() => setFilter(MachineStatus.Stopped)}
           className={`bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${filter === MachineStatus.Stopped ? 'border-slate-500 ring-1 ring-slate-500' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs font-medium">停機 (Stopped)</h3>
            <PauseCircle size={18} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-400 mt-2">{stats.stopped}</p>
        </div>
        <div 
           onClick={() => setFilter(MachineStatus.Error)}
           className={`bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${filter === MachineStatus.Error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs font-medium">異常 (Errors)</h3>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mt-2">{stats.error}</p>
        </div>
        <div 
           onClick={() => setFilter(MachineStatus.Maintenance)}
           className={`bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${filter === MachineStatus.Maintenance ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs font-medium">維修中 (Maint.)</h3>
            <Wrench size={18} className="text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400 mt-2">{stats.maintenance}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-bold text-white">{title} 列表 (List)</h2>
           <span className="text-xs text-slate-500">顯示 (Showing) {filteredMachines.length} 機台 (machines)</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filteredMachines.map((machine) => (
            <div 
              key={machine.id} 
              className={`
                relative p-3 rounded-lg border flex flex-col justify-between h-32 transition-transform hover:scale-105
                ${getStatusColor(machine.status)}
              `}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm truncate">{machine.id}</span>
                {machine.status.toLowerCase() === 'error' && <AlertTriangle size={14} className="animate-pulse" />}
                {machine.status.toLowerCase() === 'maintenance' && <Wrench size={14} />}
              </div>
              
              <div className="space-y-1">
                <div className="text-xs opacity-80 truncate" title={machine.workOrder}>
                  {machine.workOrder}
                </div>
                <div className="flex justify-between text-xs font-mono mt-1">
                  <span className="opacity-70">當前 (Cur):</span>
                  <span className="font-bold">{machine.currentMoldProduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="opacity-70">累計 (Tot):</span>
                  <span className="font-bold">{machine.totalProduction.toLocaleString()}</span>
                </div>
              </div>

              {machine.errorMessage && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg p-2 text-center z-10">
                  <span className="text-xs text-red-400 font-bold">{machine.errorMessage}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MachineGrid;