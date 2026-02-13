import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, Database, Copy, Check, FileSpreadsheet, Download, Upload, Cloud, RotateCcw } from 'lucide-react';
import { getMockData, syncDataToGoogleSheet, DEFAULT_GOOGLE_SCRIPT_URL } from '../services/api';
import { DashboardData } from '../types';
import { CSV_CONFIG, exportCategory, parseCSVImport } from '../services/csvUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentUrl: string;
  currentData: DashboardData | null;
  onDataUpdate: (data: DashboardData) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentUrl, currentData, onDataUpdate }) => {
  const [url, setUrl] = useState(currentUrl);
  const [activeTab, setActiveTab] = useState<'connection' | 'backend' | 'csv'>('connection');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  
  // CSV Import State
  const [selectedImportCategory, setSelectedImportCategory] = useState<keyof typeof CSV_CONFIG>('heading');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl, isOpen]);

  const handleSave = () => {
    onSave(url);
    onClose();
  };

  const handleSync = async () => {
    if (!url) return;
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      const mockData = getMockData();
      await syncDataToGoogleSheet(url, mockData);
      setSyncStatus('success');
    } catch (error) {
      console.error(error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = (key: keyof typeof CSV_CONFIG) => {
    if (!currentData) return;
    exportCategory(key, currentData);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentData) return;
    const file = e.target.files[0];
    setImportStatus('解析中...');
    
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
      setImportStatus(`成功！已匯入 ${parsedData.length} 筆資料。`);
      setTimeout(() => setImportStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setImportStatus('解析 CSV 錯誤，請檢查格式。');
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(GAS_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-600/20 rounded-lg text-brand-400">
                <Database size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">資料設定</h2>
                <p className="text-sm text-slate-400">管理工廠數據來源</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 px-6 shrink-0 gap-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'connection' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2"><Cloud size={16}/> Google 試算表</span>
          </button>
          <button 
            onClick={() => setActiveTab('csv')}
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'csv' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            <span className="flex items-center gap-2"><FileSpreadsheet size={16}/> CSV 匯出/匯入</span>
          </button>
          <button 
            onClick={() => setActiveTab('backend')}
            className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'backend' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            後端腳本
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {activeTab === 'connection' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Google Apps Script 網頁應用程式網址</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                  />
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
                  >
                    <Save size={18} />
                    儲存
                  </button>
                </div>
                {/* Reset to Default Button */}
                <div className="flex justify-end">
                   <button 
                     type="button"
                     onClick={() => setUrl(DEFAULT_GOOGLE_SCRIPT_URL)}
                     className="text-xs text-slate-500 hover:text-brand-400 transition-colors flex items-center gap-1 mt-1"
                   >
                     <RotateCcw size={12} />
                     重置為預設值
                   </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/50">
                 <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                   <AlertCircle size={20} className="text-yellow-400" />
                   初始化試算表資料
                 </h3>
                 <p className="text-sm text-slate-400 mb-4">
                   此操作將自動產生所需欄位並填入初始模擬資料到所有9個工作表中。
                   <strong className="text-brand-400 ml-1">需要先部署後端腳本（見分頁）。</strong>
                 </p>
                 
                 <div className="flex items-center gap-4">
                   <button 
                     onClick={handleSync}
                     disabled={!url || isSyncing}
                     className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-colors ${!url || isSyncing ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20'}`}
                   >
                     {isSyncing ? (
                       <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                     ) : (
                       <Database size={18} />
                     )}
                     {isSyncing ? '初始化中...' : '產生欄位並寫入資料'}
                   </button>
                   
                   {syncStatus === 'success' && (
                     <div className="text-green-400 text-sm flex items-center gap-1">
                       <Check size={16} /> 資料傳送成功！
                     </div>
                   )}
                   {syncStatus === 'error' && (
                     <div className="text-red-400 text-sm flex items-center gap-1">
                       <AlertCircle size={16} /> 資料傳送失敗，請檢查網址。
                     </div>
                   )}
                 </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-800 p-4 rounded border border-slate-700">
                 <p className="font-semibold mb-2">工作表對映：</p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono">
                    <span>Sheet 1: 總覽 (Overview)</span>
                    <span>Sheet 2: 打頭機 (Heading)</span>
                    <span>Sheet 3: 搓牙機 (Threading)</span>
                    <span>Sheet 4: 夾尾機 (Pointing)</span>
                    <span>Sheet 5: 篩選機 (Sorting)</span>
                    <span>Sheet 6: QC 抽檢 (Quality)</span>
                    <span>Sheet 7: 包裝機 (Packaging)</span>
                    <span>Sheet 8: 人員 (Personnel)</span>
                    <span>Sheet 9: 能源 (Energy)</span>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
             <div className="space-y-6">
               {/* Export Section */}
               <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <Download size={20} className="text-brand-400" />
                     匯出資料為 CSV
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
                     匯入 CSV 資料
                  </h3>
                  
                  <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                     <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                           <label className="block text-xs font-semibold text-slate-400 mb-2">選擇類別</label>
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
                        <div className={`mt-4 text-sm font-medium ${importStatus.includes('錯誤') ? 'text-red-400' : 'text-green-400'}`}>
                           {importStatus}
                        </div>
                     )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                     注意：匯入將取代所選類別的當前資料集。複雜資料欄位（如 QC 缺陷）需為有效的 JSON 字串。
                  </p>
               </div>
             </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center">
                 <div>
                   <h3 className="font-bold text-white">Google Apps Script 程式碼</h3>
                   <p className="text-xs text-slate-400">請將此代碼貼入 Google Sheets 指令碼編輯器 <code>Code.gs</code> 中。</p>
                 </div>
                 <button 
                   onClick={copyToClipboard}
                   className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-xs font-mono text-white transition-colors"
                 >
                   {copied ? <Check size={14} /> : <Copy size={14} />}
                   {copied ? '已複製！' : '複製程式碼'}
                 </button>
              </div>
              
              <div className="flex-1 relative min-h-[300px] border border-slate-700 rounded-lg overflow-hidden bg-[#1e1e1e]">
                <pre className="absolute inset-0 p-4 overflow-auto text-xs font-mono text-green-400 leading-relaxed selection:bg-brand-500/30">
                  {GAS_CODE}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// The Google Apps Script code to be displayed to the user
const GAS_CODE = `
// ----------------------------------------------------
// PASTE THIS INTO YOUR GOOGLE APPS SCRIPT (Code.gs)
// ----------------------------------------------------

function doGet(e) {
  var sheetIndex = e.parameter.sheet;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  
  if (!sheetIndex) {
    // Return basic info if no sheet specified
    return ContentService.createTextOutput(JSON.stringify({
      status: 'active',
      totalSheets: sheets.length
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Convert 1-based index to 0-based array index
  var idx = parseInt(sheetIndex) - 1;
  
  if (idx < 0 || idx >= sheets.length) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Sheet not found'})).setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = sheets[idx];
  var data = sheet.getDataRange().getValues();
  
  // Convert rows to JSON (assuming row 1 is headers)
  var headers = data[0];
  var result = [];
  
  if (data.length > 1) {
    // Special handling for Overview (Sheet 1) which is usually single object
    if (idx === 0) { 
       // Logic for Overview: Return object
       var obj = {};
       for(var k=0; k<headers.length; k++) {
         // Convert camelCase roughly
         var key = headers[k].replace(/\\s+/g, '');
         key = key.charAt(0).toLowerCase() + key.slice(1);
         obj[key] = data[1][k];
       }
       return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Logic for Lists
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j].replace(/\\s+/g, ''); // Remove spaces
        key = key.charAt(0).toLowerCase() + key.slice(1); // camelCase
        
        // Handle JSON strings (Trends/Defects)
        var val = row[j];
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { val = JSON.parse(val); } catch(e) {}
        }
        obj[key] = val;
      }
      result.push(obj);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Handle Initialization / Sync
  try {
    var payload = JSON.parse(e.postData.contents);
    
    if (payload.action === 'sync' && payload.sheets) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheetsConfig = payload.sheets;
      
      // We expect keys '1', '2', ... '9'
      for (var key in sheetsConfig) {
        var config = sheetsConfig[key];
        var idx = parseInt(key) - 1;
        var sheets = ss.getSheets();
        
        var sheet;
        if (idx < sheets.length) {
          sheet = sheets[idx];
          sheet.setName(config.name); // Rename existing
        } else {
          sheet = ss.insertSheet(config.name, idx); // Create new
        }
        
        sheet.clear(); // Wipe clean
        
        // Set Headers
        if (config.headers && config.headers.length > 0) {
          sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
          sheet.getRange(1, 1, 1, config.headers.length).setFontWeight("bold");
          
          // Set Data
          if (config.rows && config.rows.length > 0) {
            sheet.getRange(2, 1, config.rows.length, config.rows[0].length).setValues(config.rows);
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'ignored'})).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export default SettingsModal;