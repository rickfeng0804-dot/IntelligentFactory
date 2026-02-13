import { 
  DashboardData, 
  MachineStatus, 
  StandardMachine, 
  SortingMachine, 
  QCMachine, 
  PackagingMachine, 
  PersonnelData, 
  EnergyBlock 
} from '../types';
import { CSV_CONFIG, convertCSVTextToData } from './csvUtils';

export const DEFAULT_CSV_PATH = 'C:\\SmartFactory';

// --- MOCK DATA GENERATORS (Fallback) ---

const generateStatus = (): MachineStatus => {
  const r = Math.random();
  if (r > 0.95) return MachineStatus.Error;
  if (r > 0.85) return MachineStatus.Stopped;
  return MachineStatus.Running;
};

// Helper to generate Work Orders in 3 specific formats
const generateWorkOrder = (): string => {
  const type = Math.floor(Math.random() * 3);
  const randomDigits = (n: number) => Array.from({length: n}, () => Math.floor(Math.random() * 10)).join('');
  
  switch (type) {
    case 0:
      return `JB${randomDigits(8)}`;
    case 1:
      return `AB${randomDigits(6)}`;
    case 2:
      return `GP${randomDigits(4)}/${randomDigits(4)}`;
    default:
      return `JB${randomDigits(8)}`;
  }
};

const generateStandardMachines = (count: number, prefix: string): StandardMachine[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${(i + 1).toString().padStart(3, '0')}`,
    name: `${prefix} #${i + 1}`,
    status: generateStatus(),
    errorMessage: Math.random() > 0.95 ? '感測器超時' : undefined,
    workOrder: generateWorkOrder(),
    totalProduction: Math.floor(Math.random() * 50000) + 1000,
    currentMoldProduction: Math.floor(Math.random() * 5000)
  }));
};

const generateSortingMachines = (count: number): SortingMachine[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `SORT-${(i + 1).toString().padStart(2, '0')}`,
    name: `Sorting #${i + 1}`,
    status: generateStatus(),
    workOrder: generateWorkOrder(),
    totalProduction: Math.floor(Math.random() * 20000),
    yieldRate: 95 + Math.random() * 4.9,
    measurements: Array.from({ length: 10 }).map((_, j) => ({
      time: `${10 + j}:00`,
      value: 10 + Math.random() * 0.5
    }))
  }));
};

const generateQCMachines = (count: number): QCMachine[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `QC-${i + 1}`,
    name: `QC Auto #${i + 1}`,
    status: MachineStatus.Running,
    currentLot: `LOT-${Date.now().toString().slice(-6)}`,
    sampleYield: 98.5 + Math.random(),
    defects: [
      { type: 'Scratch', count: Math.floor(Math.random() * 10) },
      { type: 'Dimension', count: Math.floor(Math.random() * 5) },
      { type: 'Surface', count: Math.floor(Math.random() * 8) },
    ]
  }));
};

const generatePackagingMachines = (count: number): PackagingMachine[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `PKG-${i + 1}`,
    name: `Packer #${i + 1}`,
    status: MachineStatus.Running,
    workOrder: generateWorkOrder(),
    totalProduction: Math.floor(Math.random() * 500),
    speed: 45 + Math.floor(Math.random() * 10)
  }));
};

const generateEnergyBlocks = (count: number): EnergyBlock[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `E-BLK-${i + 1}`,
    name: `Zone ${String.fromCharCode(65 + i)} Power`,
    dailyConsumption: Math.floor(Math.random() * 500) + 100,
    trend: Array.from({ length: 24 }).map((_, h) => ({
      time: `${h}:00`,
      value: Math.floor(Math.random() * 50) + 20
    }))
  }));
};

export const getMockData = (): DashboardData => ({
  overview: {
    totalOEE: 87.5,
    activeMachines: 245,
    totalMachines: 274,
    dailyOutput: 1542000,
    productionTrend: Array.from({ length: 12 }).map((_, i) => ({
      time: `${i * 2}:00`,
      output: Math.floor(Math.random() * 50000) + 100000
    })),
    oeeTrend: Array.from({ length: 7 }).map((_, i) => ({
      day: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'][i],
      value: 80 + Math.random() * 15
    }))
  },
  headingMachines: generateStandardMachines(100, 'HD'), // Sheet 2
  threadingMachines: generateStandardMachines(100, 'TR'), // Sheet 3
  pointingMachines: generateStandardMachines(50, 'PT'), // Sheet 4
  sortingMachines: generateSortingMachines(20), // Sheet 5
  qcMachines: generateQCMachines(2), // Sheet 6
  packagingMachines: generatePackagingMachines(2), // Sheet 7
  personnel: [ // Sheet 8
    { department: 'Production A', headcount: 50, present: 48, attendanceRate: 96 },
    { department: 'Production B', headcount: 45, present: 45, attendanceRate: 100 },
    { department: 'Logistics', headcount: 20, present: 18, attendanceRate: 90 },
    { department: 'Quality', headcount: 15, present: 14, attendanceRate: 93.3 },
  ],
  energy: generateEnergyBlocks(20) // Sheet 9
});

// --- API FUNCTIONS (CSV PATH BASED) ---

const fetchCSV = async (basePath: string, fileName: string): Promise<string | null> => {
  try {
    // Normalize path slashes
    const normalizedPath = basePath.replace(/\\/g, '/').replace(/\/$/, '');
    const url = `${normalizedPath}/${fileName}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    return null;
  }
};

export const fetchFactoryData = async (basePath: string = DEFAULT_CSV_PATH): Promise<DashboardData> => {
  // Try to fetch all required CSVs
  // If fetch fails (likely due to CORS or file not found on local path), return Mock Data.
  
  const mock = getMockData();
  
  try {
    const keys = Object.keys(CSV_CONFIG) as (keyof typeof CSV_CONFIG)[];
    const promises = keys.map(async (key) => {
      const fileName = `${key}.csv`;
      const text = await fetchCSV(basePath, fileName);
      if (!text) return { key, data: null };
      return { key, data: convertCSVTextToData(key, text) };
    });

    const results = await Promise.all(promises);
    const fetchedData: any = {};
    let hasValidData = false;

    results.forEach(res => {
      if (res.data) {
        fetchedData[res.key] = res.data;
        hasValidData = true;
      }
    });

    if (!hasValidData) {
      console.warn("No valid CSV data found at path, using mock data.");
      return mock;
    }

    // Merge fetched data with mock structure (in case some files are missing)
    return {
      overview: (fetchedData.overview && fetchedData.overview[0]) || mock.overview,
      headingMachines: fetchedData.heading || mock.headingMachines,
      threadingMachines: fetchedData.threading || mock.threadingMachines,
      pointingMachines: fetchedData.pointing || mock.pointingMachines,
      sortingMachines: fetchedData.sorting || mock.sortingMachines,
      qcMachines: fetchedData.qc || mock.qcMachines,
      packagingMachines: fetchedData.packaging || mock.packagingMachines,
      personnel: fetchedData.personnel || mock.personnel,
      energy: fetchedData.energy || mock.energy
    };

  } catch (error) {
    console.error("Error loading CSV data:", error);
    return mock;
  }
};
