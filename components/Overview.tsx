import React from 'react';
import { DashboardData } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Zap, Activity, Users, Package } from 'lucide-react';

interface OverviewProps {
  data: DashboardData;
}

const Overview: React.FC<OverviewProps> = ({ data }) => {
  const { overview, personnel } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-500/20 rounded-lg text-brand-400">
              <Activity size={24} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">+2.5%</span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">整體設備效率 (Overall OEE)</h3>
          <p className="text-3xl font-bold text-white mt-1">{overview.totalOEE}%</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">單日總產量 (Daily Output)</h3>
          <p className="text-3xl font-bold text-white mt-1">{overview.dailyOutput.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
              <Zap size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">運作中機台 (Active Machines)</h3>
          <p className="text-3xl font-bold text-white mt-1">
            {overview.activeMachines} <span className="text-lg text-slate-500 font-normal">/ {overview.totalMachines}</span>
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium">現場人員 (Personnel On-site)</h3>
          <p className="text-3xl font-bold text-white mt-1">
            {personnel.reduce((acc, curr) => acc + curr.present, 0)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-6">即時生產趨勢 (Real-time Production Output)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview.productionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line 
                  name="產量"
                  type="monotone" 
                  dataKey="output" 
                  stroke="#0ea5e9" 
                  strokeWidth={3} 
                  dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-6">每週 OEE 趨勢 (Weekly OEE Trend)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.oeeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                   cursor={{fill: '#334155', opacity: 0.4}}
                   labelStyle={{ color: '#94a3b8' }}
                />
                <Bar name="效率" dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;