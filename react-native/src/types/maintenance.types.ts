export type MaintenanceType =
  | 'ENGINE_OIL'
  | 'OIL_FILTER'
  | 'AIR_FILTER'
  | 'BRAKES'
  | 'TYRE'
  | 'BATTERY'
  | 'SPARK_PLUG'
  | 'GEAR_OIL'
  | 'COOLANT'
  | 'CHAIN'
  | 'CHAIN_LUBRICATION'
  | 'CLUTCH'
  | 'GENERAL_CHECK'
  | 'OTHER';

export interface Maintenance {
  _id: string;
  bikeId: string;
  serviceId?: string | null;
  type: MaintenanceType;
  brand?: string;
  date: string;
  odometer: number;
  cost: number;
  notes?: string;
  createdAt: string;
}

export interface CreateMaintenanceInput {
  type: MaintenanceType;
  brand?: string;
  date: string;
  odometer: number;
  cost?: number;
  notes?: string;
}