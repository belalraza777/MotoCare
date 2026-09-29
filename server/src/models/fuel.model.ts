import { Schema, model, Types } from 'mongoose';

export interface IFuel {
  bikeId: Types.ObjectId;
  date: Date;
  litres: number;
  totalAmount: number;
}

const fuelSchema = new Schema<IFuel>(
  {
    bikeId: { type: Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
    date: { type: Date, required: true },
    litres: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

// powers monthly/yearly expense sums and the history timeline, newest first
fuelSchema.index({ bikeId: 1, date: -1 });

export const Fuel = model<IFuel>('Fuel', fuelSchema);