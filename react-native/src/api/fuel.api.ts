import { AxiosInstance } from 'axios';
import { Fuel, CreateFuelInput } from '../types/fuel.types';
import { ApiResponse } from '../types/api.types';

export function createFuelApi(api: AxiosInstance) {
  return {
    getAll: (bikeId: string) =>
      api.get<ApiResponse<Fuel[]>>(`/bikes/${bikeId}/fuel`).then((res) => res.data.data),

    getOne: (bikeId: string, fuelId: string) =>
      api.get<ApiResponse<Fuel>>(`/bikes/${bikeId}/fuel/${fuelId}`).then((res) => res.data.data),

    create: (bikeId: string, data: CreateFuelInput) =>
      api.post<ApiResponse<Fuel>>(`/bikes/${bikeId}/fuel`, data).then((res) => res.data.data),

    update: (bikeId: string, fuelId: string, data: Partial<CreateFuelInput>) =>
      api.patch<ApiResponse<Fuel>>(`/bikes/${bikeId}/fuel/${fuelId}`, data).then((res) => res.data.data),

    delete: (bikeId: string, fuelId: string) =>
      api.delete(`/bikes/${bikeId}/fuel/${fuelId}`),
  };
}