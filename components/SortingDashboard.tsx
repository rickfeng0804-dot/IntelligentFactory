import React from 'react';
import { SortingMachine, MachineStatus } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface SortingDashboardProps {
  machines: SortingMachine[];
}

const SortingDashboard: React.FC<SortingDashboardProps> = ({ machines }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">篩選機監控 (Sorting Machines)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <div key={machine.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-brand-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {machine.name}
                  {machine.status === MachineStatus.Running ? 
                    <CheckCircle size={16} className="text-green-500" /> : 
                    <AlertTriangle size={16} className="text-red-500" />
                  }
                </h3>
                <p className="text-sm text-slate-400">{machine.workOrder}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">良率 (Yield)</p>
                <p className={`text-xl font-bold ${machine.yieldRate > 98 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {machine.yieldRate.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">總產出</p>
                <p className="text-lg font-mono text-white">{machine.totalProduction.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs text-slate-500">狀態</p>
                <p className={`text-lg font-medium ${machine.status === 'Running' ? 'text-green-400' : 'text-red-400'}`}>
                  {machine.status === 'Running' ? '運作中' : machine.status === 'Stopped' ? '停機' : '異常'}
                </p>
              </div>
            </div>

            <div className="h-24 w-full bg-slate-900/30 rounded-lg p-2">
              <p className="text-xs text-slate-500 mb-1">尺寸量測趨勢</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={machine.measurements}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortingDashboard;