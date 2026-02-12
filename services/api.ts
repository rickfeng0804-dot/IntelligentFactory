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

// Helper to generate Work Orders in 3 specific formats
const generateWorkOrder = (): string => {
  const type = Math.floor(Math.random() * 3);
  const randomDigits = (n: number) => Array.from({length: n}, () => Math.floor(Math.random() * 10)).join('');
  
  switch (type) {
    case 0:
      // Format 1: JB11511876 (JB + 8 digits)
      return `JB${randomDigits(8)}`;
    case 1:
      // Format 2: AB260701 (AB + 6 digits)
      return `AB${randomDigits(6)}`;
    case 2:
      // Format 3: GP2026/0203 (GP + 4 digits + / + 4 digits)
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

// --- API FUNCTIONS ---

export const fetchFactoryData = async (baseUrl: string = DEFAULT_GOOGLE_SCRIPT_URL): Promise<DashboardData> => {
  // If no URL is provided/configured, strictly use mock
  if (!baseUrl || baseUrl.trim() === '') {
    return getMockData();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for real data

    // Strategy: Fetch all sheets in parallel
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

/**
 * Sends a POST request to the Google Script to initialize columns and write data.
 */
export const syncDataToGoogleSheet = async (baseUrl: string, data: DashboardData): Promise<void> => {
  if (!baseUrl) throw new Error("No API URL provided");

  // Transform complex data into flat sheet structures
  // Sheet 1: Overview
  const sheet1Headers = ['Total OEE', 'Active Machines', 'Total Machines', 'Daily Output'];
  const sheet1Rows = [[data.overview.totalOEE, data.overview.activeMachines, data.overview.totalMachines, data.overview.dailyOutput]];

  // Helper for Standard Machines
  const machineHeaders = ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'CurrentMoldProduction', 'ErrorMessage'];
  const mapStandard = (m: StandardMachine) => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.currentMoldProduction, m.errorMessage || ''];

  // Sheet 5: Sorting
  const sortHeaders = ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'YieldRate'];
  const mapSorting = (m: SortingMachine) => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.yieldRate];

  // Sheet 6: QC
  const qcHeaders = ['ID', 'Name', 'Status', 'CurrentLot', 'SampleYield', 'Defects(JSON)'];
  const mapQC = (m: QCMachine) => [m.id, m.name, m.status, m.currentLot, m.sampleYield, JSON.stringify(m.defects)];

  // Sheet 7: Packaging
  const pkgHeaders = ['ID', 'Name', 'Status', 'WorkOrder', 'TotalProduction', 'Speed'];
  const mapPkg = (m: PackagingMachine) => [m.id, m.name, m.status, m.workOrder, m.totalProduction, m.speed];

  // Sheet 8: Personnel
  const hrHeaders = ['Department', 'Headcount', 'Present', 'AttendanceRate'];
  const mapHR = (p: PersonnelData) => [p.department, p.headcount, p.present, p.attendanceRate];

  // Sheet 9: Energy
  const energyHeaders = ['ID', 'Name', 'DailyConsumption', 'Trend(JSON)'];
  const mapEnergy = (e: EnergyBlock) => [e.id, e.name, e.dailyConsumption, JSON.stringify(e.trend)];

  const payload = {
    action: 'sync',
    sheets: {
      '1': { name: 'Overview', headers: sheet1Headers, rows: sheet1Rows },
      '2': { name: 'Heading', headers: machineHeaders, rows: data.headingMachines.map(mapStandard) },
      '3': { name: 'Threading', headers: machineHeaders, rows: data.threadingMachines.map(mapStandard) },
      '4': { name: 'Pointing', headers: machineHeaders, rows: data.pointingMachines.map(mapStandard) },
      '5': { name: 'Sorting', headers: sortHeaders, rows: data.sortingMachines.map(mapSorting) },
      '6': { name: 'QC', headers: qcHeaders, rows: data.qcMachines.map(mapQC) },
      '7': { name: 'Packaging', headers: pkgHeaders, rows: data.packagingMachines.map(mapPkg) },
      '8': { name: 'Personnel', headers: hrHeaders, rows: data.personnel.map(mapHR) },
      '9': { name: 'Energy', headers: energyHeaders, rows: data.energy.map(mapEnergy) },
    }
  };

  // We use mode: 'no-cors' because GAS Web Apps don't always handle CORS Preflight for POST requests easily without specific script setups.
  // Using no-cors means we can send data, but we can't read the response. 
  // The User Interface will assume success if no network error is thrown.
  await fetch(baseUrl, {
    method: 'POST',
    mode: 'no-cors', 
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Plain text avoids preflight
    },
    body: JSON.stringify(payload)
  });
};