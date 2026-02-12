import React, { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentUrl: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentUrl }) => {
  const [url, setUrl] = useState(currentUrl);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl, isOpen]);

  const handleSave = () => {
    onSave(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-600/20 rounded-lg text-brand-400">
                <LinkIcon size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Data Connection Settings</h2>
                <p className="text-sm text-slate-400">Configure Google Sheet Web App URL</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Google Apps Script Web App URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setIsDirty(true);
              }}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Paste the "Web App URL" from your Google Apps Script deployment.
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
             <div className="flex items-center gap-2 mb-3 text-slate-300 font-semibold text-sm">
               <AlertCircle size={16} />
               <span>Sheet Mapping Configuration</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 1</span>
                   <span className="text-brand-400 font-mono">?sheet=1 (Overview)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 2</span>
                   <span className="text-brand-400 font-mono">?sheet=2 (Heading)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 3</span>
                   <span className="text-brand-400 font-mono">?sheet=3 (Threading)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 4</span>
                   <span className="text-brand-400 font-mono">?sheet=4 (Pointing)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 5</span>
                   <span className="text-brand-400 font-mono">?sheet=5 (Sorting)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 6</span>
                   <span className="text-brand-400 font-mono">?sheet=6 (QC)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 7</span>
                   <span className="text-brand-400 font-mono">?sheet=7 (Packaging)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 8</span>
                   <span className="text-brand-400 font-mono">?sheet=8 (Personnel)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                   <span className="text-slate-500">Sheet 9</span>
                   <span className="text-brand-400 font-mono">?sheet=9 (Energy)</span>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors shadow-lg shadow-brand-900/50"
          >
            <Save size={18} />
            Update & Connect
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;