import React from 'react';
import { QCMachine } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface QCDashboardProps {
  machines: QCMachine[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

const QCDashboard: React.FC<QCDashboardProps> = ({ machines }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">品質管理 (Quality Control)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {machines.map((machine, idx) => (
          <div key={machine.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
               <div>
                 <h3 className="text-xl font-bold text-white">{machine.name}</h3>
                 <p className="text-sm text-slate-400">當前批號 (Current Lot): <span className="text-brand-400 font-mono">{machine.currentLot}</span></p>
               </div>
               <div className="text-right">
                 <span className="text-sm text-slate-400 block">批次良率 (Lot Yield)</span>
                 <span className="text-3xl font-bold text-green-400">{machine.sampleYield.toFixed(2)}%</span>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-sm font-semibold text-slate-300 mb-4">缺陷分佈 (Defect Distribution)</h4>
                   <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={machine.defects}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           fill="#8884d8"
                           paddingAngle={5}
                           dataKey="count"
                         >
                           {machine.defects.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                         />
                         <Legend />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-300">缺陷計數 (Detailed Defect Counts)</h4>
                  {machine.defects.map((defect, i) => (
                    <div key={defect.type} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                       <div className="flex items-center space-x-3">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                         <span className="text-slate-300">{defect.type}</span>
                       </div>
                       <span className="font-mono font-bold text-white">{defect.count}</span>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400 font-semibold uppercase">需採取行動 (Action Required)</p>
                    <p className="text-sm text-slate-300 mt-1">檢查批號 {machine.currentLot} 的尺寸偏移 (Check dimensions for Lot {machine.currentLot}).</p>
                  </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QCDashboard;