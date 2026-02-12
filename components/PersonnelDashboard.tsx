import React from 'react';
import { PersonnelData } from '../types';
import { Users, UserCheck, Clock } from 'lucide-react';

interface PersonnelDashboardProps {
  data: PersonnelData[];
}

const PersonnelDashboard: React.FC<PersonnelDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Personnel Management (人員管理)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((dept, index) => (
          <div key={index} className="bg-slate-800 rounded-xl border border-slate-700 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={64} className="text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">{dept.department}</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                   <Users size={16} />
                   <span>Headcount</span>
                </div>
                <span className="text-white font-mono font-bold">{dept.headcount}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400">
                   <UserCheck size={16} />
                   <span>Present</span>
                </div>
                <span className="text-green-400 font-mono font-bold">{dept.present}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                 <div className="flex justify-between items-end mb-1">
                   <span className="text-sm text-slate-400">Attendance</span>
                   <span className={`text-2xl font-bold ${dept.attendanceRate >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                     {dept.attendanceRate}%
                   </span>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-2">
                   <div 
                      className={`h-2 rounded-full ${dept.attendanceRate >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                      style={{ width: `${dept.attendanceRate}%` }}
                   ></div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
         <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-brand-400" />
              Shift Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                 <span className="text-slate-300">Day Shift</span>
                 <span className="text-white font-mono">08:00 - 17:00</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                 <span className="text-slate-300">Night Shift</span>
                 <span className="text-white font-mono">20:00 - 05:00</span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PersonnelDashboard;