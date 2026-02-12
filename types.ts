export enum MachineStatus {
  Running = 'Running',
  Stopped = 'Stopped',
  Error = 'Error',
  Maintenance = 'Maintenance'
}

export interface BaseMachine {
  id: string;
  name: string;
  status: MachineStatus;
  errorMessage?: string;
  workOrder: string;
  totalProduction: number;
}

// For Heading (Sheet 2), Threading (Sheet 3), Pointing (Sheet 4)
export interface StandardMachine extends BaseMachine {
  currentMoldProduction: number;
}

// For Sorting (Sheet 5)
export interface SortingMachine extends BaseMachine {
  yieldRate: number;
  measurements: { time: string; value: number }[]; // Trend data
}

// For QC (Sheet 6)
export interface QCMachine {
  id: string;
  name: string;
  status: MachineStatus;
  currentLot: string;
  sampleYield: number;
  defects: { type: string; count: number }[];
}

// For Packaging (Sheet 7)
export interface PackagingMachine extends BaseMachine {
  speed: number; // packs per minute
}

// For Personnel (Sheet 8)
export interface PersonnelData {
  department: string;
  headcount: number;
  present: number;
  attendanceRate: number;
}

// For Energy (Sheet 9)
export interface EnergyBlock {
  id: string;
  name: string;
  dailyConsumption: number; // kWh
  trend: { time: string; value: number }[]; // Per minute usage
}

export interface DashboardData {
  overview: {
    totalOEE: number;
    activeMachines: number;
    totalMachines: number;
    dailyOutput: number;
  };
  headingMachines: StandardMachine[];
  threadingMachines: StandardMachine[];
  pointingMachines: StandardMachine[];
  sortingMachines: SortingMachine[];
  qcMachines: QCMachine[];
  packagingMachines: PackagingMachine[];
  personnel: PersonnelData[];
  energy: EnergyBlock[];
}