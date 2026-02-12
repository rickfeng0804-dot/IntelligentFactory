import { 
  DashboardData, 
  StandardMachine, 
  SortingMachine, 
  QCMachine, 
  PackagingMachine, 
  PersonnelData, 
  EnergyBlock 
} from '../types';

// Headers definition matching the Google Sheet logic
export const CSV_CONFIG = {
  overview: ['Total OEE', 'Active Machines', 'Total Machines', 'Daily Output'],
  heading: ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'CurrentMoldProduction', 'ErrorMessage'],
  threading: ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'CurrentMoldProduction', 'ErrorMessage'],
  pointing: ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'CurrentMoldProduction', 'ErrorMessage'],
  sorting: ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'YieldRate'],
  qc: ['ID', 'Name', 'Status', 'CurrentLot', 'SampleYield', 'Defects(JSON)'],
  packaging: ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'Speed'],
  personnel: ['Department', 'Headcount', 'Present', 'AttendanceRate'],
  energy: ['ID', 'Name', 'DailyConsumption', 'Trend(JSON)']
};

// Helper to escape CSV fields
const escapeCSV = (field: any): string => {
  if (field === null || field === undefined) return '';
  const stringValue = typeof field === 'object' ? JSON.stringify(field) : String(field);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// --- EXPORT FUNCTIONS ---

export const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportCategory = (key: keyof typeof CSV_CONFIG, data: DashboardData) => {
  const headers = CSV_CONFIG[key];
  let rows: any[][] = [];

  switch (key) {
    case 'overview':
      rows = [[data.overview.totalOEE, data.overview.activeMachines, data.overview.totalMachines, data.overview.dailyOutput]];
      break;
    case 'heading':
      rows = data.headingMachines.map(m => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.currentMoldProduction, m.errorMessage]);
      break;
    case 'threading':
      rows = data.threadingMachines.map(m => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.currentMoldProduction, m.errorMessage]);
      break;
    case 'pointing':
      rows = data.pointingMachines.map(m => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.currentMoldProduction, m.errorMessage]);
      break;
    case 'sorting':
      rows = data.sortingMachines.map(m => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.yieldRate]);
      break;
    case 'qc':
      rows = data.qcMachines.map(m => [m.id, m.name, m.status, m.currentLot, m.sampleYield, m.defects]);
      break;
    case 'packaging':
      rows = data.packagingMachines.map(m => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.speed]);
      break;
    case 'personnel':
      rows = data.personnel.map(p => [p.department, p.headcount, p.present, p.attendanceRate]);
      break;
    case 'energy':
      rows = data.energy.map(e => [e.id, e.name, e.dailyConsumption, e.trend]);
      break;
  }

  downloadCSV(`Zhiying_${key}_${new Date().toISOString().split('T')[0]}`, headers, rows);
};

// --- IMPORT FUNCTIONS ---

const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const parseCSVImport = async (key: keyof typeof CSV_CONFIG, file: File): Promise<any> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    const cols = parseCSVLine(line);
    
    // Helper to safe parse JSON columns
    const parseJson = (val: string) => {
        try { return JSON.parse(val); } catch { return []; }
    };
    
    // Helper to safe parse numbers
    const parseNum = (val: string) => Number(val) || 0;

    switch (key) {
      case 'overview':
        return {
          totalOEE: parseNum(cols[0]),
          activeMachines: parseNum(cols[1]),
          totalMachines: parseNum(cols[2]),
          dailyOutput: parseNum(cols[3])
        };
      case 'heading':
      case 'threading':
      case 'pointing':
        return {
          id: cols[0],
          name: cols[1],
          status: cols[2],
          workOrder: cols[3],
          totalProduction: parseNum(cols[4]),
          currentMoldProduction: parseNum(cols[5]),
          errorMessage: cols[6] || undefined
        } as StandardMachine;
      case 'sorting':
        return {
          id: cols[0],
          name: cols[1],
          status: cols[2],
          workOrder: cols[3],
          totalProduction: parseNum(cols[4]),
          yieldRate: parseNum(cols[5]),
          measurements: [] // CSV doesn't store the complex measurement history in this simple view, init empty
        } as SortingMachine;
      case 'qc':
        return {
          id: cols[0],
          name: cols[1],
          status: cols[2],
          currentLot: cols[3],
          sampleYield: parseNum(cols[4]),
          defects: parseJson(cols[5])
        } as QCMachine;
      case 'packaging':
        return {
          id: cols[0],
          name: cols[1],
          status: cols[2],
          workOrder: cols[3],
          totalProduction: parseNum(cols[4]),
          speed: parseNum(cols[5])
        } as PackagingMachine;
      case 'personnel':
        return {
          department: cols[0],
          headcount: parseNum(cols[1]),
          present: parseNum(cols[2]),
          attendanceRate: parseNum(cols[3])
        } as PersonnelData;
      case 'energy':
        return {
          id: cols[0],
          name: cols[1],
          dailyConsumption: parseNum(cols[2]),
          trend: parseJson(cols[3])
        } as EnergyBlock;
      default:
        return null;
    }
  });
};