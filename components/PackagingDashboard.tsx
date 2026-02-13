import React from 'react';
import { PackagingMachine, MachineStatus } from '../types';
import { Package, Gauge } from 'lucide-react';

interface PackagingDashboardProps {
  machines: PackagingMachine[];
}

const PackagingDashboard: React.FC<PackagingDashboardProps> = ({ machines }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">包裝機監控 (Packaging Machines)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {machines.map((machine) => (
           <div key={machine.id} className="bg-slate-800 rounded-xl border border-slate-700 p-8">
              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-600 rounded-xl text-white shadow-lg shadow-brand-900/50">
                       <Package size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-white">{machine.name}</h3>
                       <p className="text-slate-400">{machine.workOrder}</p>
                    </div>
                 </div>
                 <span className={`px-4 py-1 rounded-full text-sm font-bold ${machine.status === MachineStatus.Running ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {machine.status}
                 </span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="bg-slate-900/50 rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                       <Gauge size={20} />
                       <span>速度 (Speed)</span>
                    </div>
                    <p className="text-4xl font-bold text-white">{machine.speed}</p>
                    <p className="text-xs text-slate-500 mt-1">包/分 (Packs / Min)</p>
                 </div>
                 
                 <div className="bg-slate-900/50 rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                       <Package size={20} />
                       <span>累計產量 (Accumulated)</span>
                    </div>
                    <p className="text-4xl font-bold text-brand-400">{machine.totalProduction}</p>
                    <p className="text-xs text-slate-500 mt-1">總包數 (Total Packs)</p>
                 </div>
              </div>
              
              <div className="mt-8 bg-slate-700/30 rounded-lg p-4">
                 <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">效率 (Efficiency)</span>
                    <span className="text-white font-bold">92%</span>
                 </div>
                 <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-600 to-brand-400 h-full w-[92%]"></div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default PackagingDashboard;