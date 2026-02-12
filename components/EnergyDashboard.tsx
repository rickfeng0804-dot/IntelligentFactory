import React from 'react';
import { EnergyBlock } from '../types';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap } from 'lucide-react';

interface EnergyDashboardProps {
  blocks: EnergyBlock[];
}

const EnergyDashboard: React.FC<EnergyDashboardProps> = ({ blocks }) => {
  const totalConsumption = blocks.reduce((acc, b) => acc + b.dailyConsumption, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Energy Management (耗能管理)</h2>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-3">
          <Zap className="text-yellow-400" size={20} />
          <div>
            <p className="text-xs text-slate-400">Total Daily Consumption</p>
            <p className="text-xl font-bold text-white">{totalConsumption.toLocaleString()} kWh</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {blocks.map((block) => (
          <div key={block.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white truncate w-2/3">{block.name}</h3>
              <span className="text-sm font-mono text-yellow-400">{block.dailyConsumption} kWh</span>
            </div>
            
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={block.trend}>
                  <defs>
                    <linearGradient id={`gradient-${block.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#eab308' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#eab308" 
                    fillOpacity={1} 
                    fill={`url(#gradient-${block.id})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">24h Trend</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyDashboard;