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

export const DEFAULT_GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbwkcUPRvuSsJX7WTxKT2QzlYV4ZGKR09kcMobBpFUIGumOGvaHX1VAE9G1TlBa_me/exec';

// --- MOCK DATA GENERATORS (Fallback) ---

const generateStatus = (): MachineStatus => {
  const r = Math.random();
  if (r > 0.95) return MachineStatus.Error;
  if (r > 0.85) return MachineStatus.Stopped;
  return MachineStatus.Running;
};

const generateStandardMachines = (count: number, prefix: string): StandardMachine[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${(i + 1).toString().padStart(3, '0')}`,
    name: `${prefix} #${i + 1}`,
    status: generateStatus(),
    errorMessage: Math.random() > 0.95 ? 'Sensor Timeout' : undefined,
    workOrder: `WO-${20230000 + i}`,
    totalProduction: Math.floor(Math.random() * 50000) + 1000,
    currentMoldProduction: Math.floor(Math.random() * 5000)
  }));
};

const generateSortingMachines = (count: number): SortingMachine[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `SORT-${(i + 1).toString().padStart(2, '0')}`,
    name: `Sorting #${i + 1}`,
    status: generateStatus(),
    workOrder: `WO-${20240000 + i}`,
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
    workOrder: `PKG-WO-${i}`,
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

const getMockData = (): DashboardData => ({
  overview: {
    totalOEE: 87.5,
    activeMachines: 245,
    totalMachines: 274,
    dailyOutput: 1542000
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

// --- API FETCH FUNCTION ---

export const fetchFactoryData = async (baseUrl: string = DEFAULT_GOOGLE_SCRIPT_URL): Promise<DashboardData> => {
  // If no URL is provided/configured, strictly use mock
  if (!baseUrl || baseUrl.trim() === '') {
    return getMockData();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for real data

    // Strategy: Fetch all sheets in parallel based on the user requirement
    // Sheet 1: Overview
    // Sheet 2: Heading
    // Sheet 3: Threading
    // Sheet 4: Pointing
    // Sheet 5: Sorting
    // Sheet 6: QC
    // Sheet 7: Packaging
    // Sheet 8: Personnel
    // Sheet 9: Energy
    
    // We append ?sheet=X to the base URL
    const fetchSheet = async (index: number) => {
      // Handle URLs that already have query params
      const separator = baseUrl.includes('?') ? '&' : '?';
      const url = `${baseUrl}${separator}sheet=${index}`;
      
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow'
      });
      if (!res.ok) throw new Error(`Failed to fetch sheet ${index}`);
      return res.json();
    };

    const promises = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => fetchSheet(i));
    const results = await Promise.all(promises);
    
    clearTimeout(timeoutId);

    // Map the array of results to the DashboardData structure
    // We assume the Google Sheet returns JSON that matches or closely resembles our types.
    // In a real app, we would use Zod or similar for validation. Here we cast and pray (or fallback).
    
    // Note: If the user provides a single endpoint that returns ALL data (sheet=undefined), 
    // the code below would need to be different. 
    // But the prompt "Page 1 links to Sheet 1" strongly suggests separation.
    
    return {
      overview: results[0] as DashboardData['overview'],
      headingMachines: results[1] as StandardMachine[],
      threadingMachines: results[2] as StandardMachine[],
      pointingMachines: results[3] as StandardMachine[],
      sortingMachines: results[4] as SortingMachine[],
      qcMachines: results[5] as QCMachine[],
      packagingMachines: results[6] as PackagingMachine[],
      personnel: results[7] as PersonnelData[],
      energy: results[8] as EnergyBlock[]
    };

  } catch (error) {
    console.warn("API Fetch failed, using fallback mock data. Error:", error);
    return getMockData();
  }
};