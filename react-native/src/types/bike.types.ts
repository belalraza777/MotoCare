export type FuelType = 'PETROL' | 'ELECTRIC' | 'DIESEL' | 'HYBRID';

export interface Bike {
  _id: string;
  brand: string;
  model: string;
  variant?: string;
  registrationNumber?: string;
  purchaseDate?: string;
  fuelType: FuelType;
  currentKm: number;
  serviceIntervalKm: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBikeInput {
  brand: string;
  model: string;
  variant?: string;
  registrationNumber?: string;
  purchaseDate?: string;
  fuelType: FuelType;
  currentKm?: number;
  serviceIntervalKm: number;
}

export type UpdateBikeInput = Partial<CreateBikeInput>;