import { Schema, model, Types } from 'mongoose';

// Fixed set of maintenance categories — keeping this as an enum (not free text)
// avoids typos like "brake_pad" vs "brakes" breaking due-date matching later
export enum MaintenanceType {
  ENGINE_OIL = 'ENGINE_OIL',
  OIL_FILTER = 'OIL_FILTER',
  AIR_FILTER = 'AIR_FILTER',
  BRAKES = 'BRAKES',
  TYRE = 'TYRE',
  BATTERY = 'BATTERY',
  SPARK_PLUG = 'SPARK_PLUG',
  GEAR_OIL = 'GEAR_OIL',
  COOLANT = 'COOLANT',
  CHAIN = 'CHAIN',
  CHAIN_LUBRICATION = 'CHAIN_LUBRICATION',
  CLUTCH = 'CLUTCH',
  GENERAL_CHECK = 'GENERAL_CHECK',
  OTHER = 'OTHER',
}

export interface IMaintenance {
  bikeId: Types.ObjectId;
  serviceId?: Types.ObjectId | null; // nullable — supports standalone entries not tied to a Service
  type: MaintenanceType;
  brand?: string;
  date: Date;
  odometer: number;
  cost: number;
  notes?: string;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    bikeId: { type: Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
    type: { type: String, enum: Object.values(MaintenanceType), required: true },
    brand: String,
    date: { type: Date, required: true },
    odometer: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

// Powers "last done" lookups: find most recent Maintenance of a given
// type for a bike, sorted by date — this is what next-due calculations rely on
maintenanceSchema.index({ bikeId: 1, type: 1, date: -1 });

export const Maintenance = model<IMaintenance>('Maintenance', maintenanceSchema);