import { Schema, model, Types } from 'mongoose';

export interface IBike {
  userId: Types.ObjectId;
  brand: string;
  model: string;
  variant?: string;
  registrationNumber?: string;
  purchaseDate?: Date;
  fuelType: 'petrol' | 'electric' | 'diesel';
  currentKm: number;
  serviceIntervalKm: number;
}

export enum FuelType {
  PETROL = 'PETROL',
  ELECTRIC = 'ELECTRIC',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
}

const bikeSchema = new Schema<IBike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    variant: String,
    registrationNumber: { type: String },
    fuelType: { type: String, enum: ['PETROL', 'ELECTRIC', 'DIESEL' , 'HYBRID'], required: true },
    currentKm: { type: Number, default: 0 },
    serviceIntervalKm: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Bike = model<IBike>('Bike', bikeSchema);