import { Maintenance } from './maintenance.types';

export interface Service {
  _id: string;
  bikeId: string;
  date: string;
  odometer: number;
  workshop?: string;
  maintenanceIds: Maintenance[]; // populated by the backend
  totalCost: number;
  serviceCharge?: number;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceItemInput {
  type: string;
  brand?: string;
  cost?: number;
  notes?: string;
}

export interface CreateServiceInput {
  date: string;
  odometer: number;
  workshop?: string;
  notes?: string;
  serviceCharge?: number;
  maintenanceItems: MaintenanceItemInput[];
}