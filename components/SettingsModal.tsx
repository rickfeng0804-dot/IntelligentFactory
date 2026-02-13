import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Folder, Clock, RotateCcw, FileSpreadsheet, Download, Upload, Settings as SettingsIcon } from 'lucide-react';
import { DEFAULT_CSV_PATH } from '../services/api';
import { DashboardData } from '../types';
import { CSV_CONFIG, exportCategory, parseCSVImport } from '../services/csvUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (path: string, interval: number) => void;
  currentUrl: string; // repurposed as path
  currentInterval: number;
  currentData: DashboardData | null;
  onDataUpdate: (data: DashboardData) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentUrl, 
  currentInterval,
  currentData, 
  onDataUpdate 
}) => {
  const [path, setPath] = useState(currentUrl);
  const [interval, setIntervalVal] = useState(currentInterval);
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  
  // CSV Import State
  const [selectedImportCategory, setSelectedImportCategory] = useState<keyof typeof CSV_CONFIG>('heading');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    setPath(currentUrl);
    setIntervalVal(currentInterval);
  }, [currentUrl, currentInterval, isOpen]);

  const handleSave = () => {
    onSave(path, interval);
    onClose();
  };

  const handleExport = (key: keyof typeof CSV_CONFIG) => {
    if (!currentData) return;
    exportCategory(key, currentData);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentData) return;
    const file = e.target.files[0];
    setImportStatus('Parsing...');
    
    try {
      const parsedData = await parseCSVImport(selectedImportCategory, file);
      
      const newData = { ...currentData };
      switch (selectedImportCategory) {
        case 'overview':
          if (parsedData.length > 0) newData.overview = parsedData[0];
          break;
        case 'heading': newData.headingMachines = parsedData; break;
        case 'threading': newData.threadingMachines = parsedData; break;
        case 'pointing': newData.pointingMachines = parsedData; break;
        case 'sorting': newData.sortingMachines = parsedData; break;
        case 'qc': newData.qcMachines = parsedData; break;
        case 'packaging': newData.packagingMachines = parsedData; break;
        case 'personnel': newData.personnel = parsedData; break;
        case 'energy': newData.energy = parsedData; break;
      }
      
      onDataUpdate(newData);
      setImportStatus(`Success! Imported ${parsedData.length} rows.`);
      setTimeout(() => setImportStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setImportStatus('Error parsing CSV. Check format.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-600/20 rounded-lg text-brand-400">
                <SettingsIcon size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">系統設定</h2>
                <p className="text-sm text-slate-400">系統參數與資料管理</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 px-6 shrink-0 gap-4">
          <button 
            onClick={() => setActiveTab('general')}
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2"><SettingsIcon size={16}/> 一般設定</span>
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2"><FileSpreadsheet size={16}/> 資料匯入/匯出</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Path Setting */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Folder size={16} />
                  CSV 資料來源路徑 (URL 或 本機伺服器路徑)
                </label>
                <input 
                  type="text" 
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="C:\SmartFactory"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  預設: {DEFAULT_CSV_PATH}。
                  <br/>注意：瀏覽器無法直接讀取本機磁碟路徑 (如 C:\)。請確保該資料夾已透過本機 Web Server 發布，或輸入有效的 URL。若無法讀取將顯示模擬資料。
                </p>
              </div>

              {/* Interval Setting */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Clock size={16} />
                  自動更新頻率 (秒)
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    min="10"
                    max="3600"
                    value={interval}
                    onChange={(e) => setIntervalVal(Number(e.target.value))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono text-sm text-center"
                  />
                  <span className="text-slate-400 text-sm">秒</span>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700 gap-3">
                 <button 
                   onClick={() => {
                     setPath(DEFAULT_CSV_PATH);
                     setIntervalVal(60);
                   }}
                   className="px-4 py-2 text-sm text-slate-400 hover:text-white flex items-center gap-2"
                 >
                   <RotateCcw size={14} /> 重置預設
                 </button>
                 <button 
                   onClick={handleSave}
                   className="flex items-center gap-2 px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
                 >
                   <Save size={18} />
                   儲存設定
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
             <div className="space-y-6">
               {/* Export Section */}
               <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <Download size={20} className="text-brand-400" />
                     匯出 CSV 資料 (Export)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {Object.keys(CSV_CONFIG).map((key) => (
                        <button
                           key={key}
                           onClick={() => handleExport(key as keyof typeof CSV_CONFIG)}
                           className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-brand-500 transition-all text-left group"
                        >
                           <span className="text-sm font-medium text-slate-300 capitalize">{key}</span>
                           <Download size={16} className="text-slate-500 group-hover:text-brand-400" />
                        </button>
                     ))}
                  </div>
               </div>

               {/* Import Section */}
               <div className="pt-6 border-t border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <Upload size={20} className="text-brand-400" />
                     匯入 CSV 資料 (Import)
                  </h3>
                  
                  <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                     <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                           <label className="block text-xs font-semibold text-slate-400 mb-2">選擇類別 (Category)</label>
                           <select 
                              value={selectedImportCategory}
                              onChange={(e) => setSelectedImportCategory(e.target.value as keyof typeof CSV_CONFIG)}
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white text-sm outline-none focus:border-brand-500 capitalize"
                           >
                              {Object.keys(CSV_CONFIG).map(k => (
                                 <option key={k} value={k}>{k}</option>
                              ))}
                           </select>
                        </div>
                        <div className="flex-1 w-full">
                           <label className="block text-xs font-semibold text-slate-400 mb-2">上傳 CSV 檔案</label>
                           <input 
                              ref={fileInputRef}
                              type="file" 
                              accept=".csv"
                              onChange={handleImport}
                              className="block w-full text-sm text-slate-400
                                file:mr-4 file:py-2.5 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-brand-600 file:text-white
                                hover:file:bg-brand-500
                                cursor-pointer"
                           />
                        </div>
                     </div>
                     {importStatus && (
                        <div className={`mt-4 text-sm font-medium ${importStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                           {importStatus}
                        </div>
                     )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                     注意：匯入將會暫時覆蓋當前畫面的數據。複雜欄位 (如 QC 缺陷) 必須是合法的 JSON 格式字串。
                  </p>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
