export type LogTypeFilter = 'all' | 'fuel' | 'service' | 'maintenance';

interface BaseLog {
  _id: string;
  bikeId: string;
  bikeName: string;
  date: string;
  amount: number;
}

export interface FuelLog extends BaseLog {
  kind: 'FUEL';
  litres: number;
}

export interface ServiceLog extends BaseLog {
  kind: 'SERVICE';
  odometer: number;
  workshop?: string;
  items: string[];
}

export interface MaintenanceLog extends BaseLog {
  kind: 'MAINTENANCE';
  odometer: number;
  maintenanceType: string;
  brand?: string;
  serviceId?: string; // present when this record belongs to a service visit
}

export type LogItem = FuelLog | ServiceLog | MaintenanceLog; // told apart by `kind`

export interface LogsPage {
  items: LogItem[];
  hasMore: boolean;
}