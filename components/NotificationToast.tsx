import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  // Auto-dismiss logic could be added here if desired, but for critical errors manual dismissal is often safer
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            pointer-events-auto
            flex items-start gap-3 p-4 rounded-lg shadow-xl border-l-4
            animate-in slide-in-from-right duration-500 fade-in
            ${notification.type === 'error' ? 'bg-slate-800 border-red-500 text-white shadow-red-900/20' : ''}
            ${notification.type === 'warning' ? 'bg-slate-800 border-yellow-500 text-white shadow-yellow-900/20' : ''}
            ${notification.type === 'success' ? 'bg-slate-800 border-green-500 text-white shadow-green-900/20' : ''}
            ${notification.type === 'info' ? 'bg-slate-800 border-blue-500 text-white shadow-blue-900/20' : ''}
          `}
          role="alert"
        >
            <div className="shrink-0 pt-0.5">
                {notification.type === 'error' && <AlertCircle className="text-red-400" size={20} />}
                {notification.type === 'warning' && <AlertTriangle className="text-yellow-400" size={20} />}
                {notification.type === 'success' && <CheckCircle className="text-green-400" size={20} />}
                {notification.type === 'info' && <Info className="text-blue-400" size={20} />}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm tracking-wide">{notification.title}</h4>
                <p className="text-sm text-slate-300 mt-1 break-words">{notification.message}</p>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
            </div>
            <button 
                onClick={() => onDismiss(notification.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            >
                <X size={16} />
            </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
