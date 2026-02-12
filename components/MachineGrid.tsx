import React, { useMemo, useState } from 'react';
import { StandardMachine, MachineStatus } from '../types';
import { AlertTriangle, CheckCircle, PauseCircle, Activity } from 'lucide-react';

interface MachineGridProps {
  title: string;
  machines: StandardMachine[];
}

const MachineGrid: React.FC<MachineGridProps> = ({ title, machines }) => {
  const [filter, setFilter] = useState<MachineStatus | 'All'>('All');

  const stats = useMemo(() => {
    return {
      running: machines.filter(m => m.status === MachineStatus.Running).length,
      stopped: machines.filter(m => m.status === MachineStatus.Stopped).length,
      error: machines.filter(m => m.status === MachineStatus.Error).length,
    };
  }, [machines]);

  const filteredMachines = useMemo(() => {
    if (filter === 'All') return machines;
    return machines.filter(m => m.status === filter);
  }, [machines, filter]);

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.Running: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case MachineStatus.Stopped: return 'bg-slate-700/50 text-slate-400 border-slate-600';
      case MachineStatus.Error: return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Total Machines</h3>
            <Activity size={18} className="text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{machines.length}</p>
        </div>
        <div 
          onClick={() => setFilter('All')}
          className={`bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${filter === 'All' ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Running</h3>
            <CheckCircle size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400 mt-2">{stats.running}</p>
        </div>
        <div 
           onClick={() => setFilter(MachineStatus.Stopped)}
           className={`bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${filter === MachineStatus.Stopped ? 'border-slate-500 ring-1 ring-slate-500' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Stopped</h3>
            <PauseCircle size={18} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-400 mt-2">{stats.stopped}</p>
        </div>
        <div 
           onClick={() => setFilter(MachineStatus.Error)}
           className={`bg-slate-800 p-4 rounded-xl border cursor-pointer transition-all ${filter === MachineStatus.Error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700 hover:border-slate-600'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Errors</h3>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mt-2">{stats.error}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-bold text-white">{title} List</h2>
           <span className="text-xs text-slate-500">Showing {filteredMachines.length} machines</span>
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
                {machine.status === MachineStatus.Error && <AlertTriangle size={14} className="animate-pulse" />}
              </div>
              
              <div className="space-y-1">
                <div className="text-xs opacity-80 truncate" title={machine.workOrder}>
                  {machine.workOrder}
                </div>
                <div className="flex justify-between text-xs font-mono mt-1">
                  <span className="opacity-70">Cur:</span>
                  <span className="font-bold">{machine.currentMoldProduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="opacity-70">Tot:</span>
                  <span className="font-bold">{machine.totalProduction.toLocaleString()}</span>
                </div>
              </div>

              {machine.errorMessage && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg p-2 text-center">
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