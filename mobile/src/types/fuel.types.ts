export interface Fuel {
  _id: string;
  bikeId: string;
  date: string;
  litres: number;
  totalAmount: number;
  createdAt: string;
}

export interface CreateFuelInput {
  date: string;
  litres: number;
  totalAmount: number;
}