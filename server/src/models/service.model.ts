import { Schema, model, Types } from 'mongoose';

export interface IService {
  bikeId: Types.ObjectId;
  date: Date;
  odometer: number;
  workshop?: string;
  maintenanceIds: Types.ObjectId[]; // references only — no duplicated maintenance data
  serviceCharge: number;
  totalCost: number; // sum of linked Maintenance.cost, computed on write
  notes?: string;
}

const serviceSchema = new Schema<IService>(
  {
    bikeId: { type: Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
    date: { type: Date, required: true },
    odometer: { type: Number, required: true },
    workshop: String,
    maintenanceIds: [{ type: Schema.Types.ObjectId, ref: 'Maintenance' }],
    serviceCharge: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

// newest-first lookups power "last service" (next-due calc) and history
serviceSchema.index({ bikeId: 1, date: -1 });

export const Service = model<IService>('Service', serviceSchema);