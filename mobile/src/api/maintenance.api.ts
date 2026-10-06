import { AxiosInstance } from 'axios';
import { Maintenance, CreateMaintenanceInput } from '../types/maintenance.types';
import { ApiResponse } from '../types/api.types';

// Nested under a bike — every call needs bikeId since maintenance
// records don't exist independently of a bike (matches backend routing)
export function createMaintenanceApi(api: AxiosInstance) {
  return {
    getAll: (bikeId: string) =>
      api.get<ApiResponse<Maintenance[]>>(`/bikes/${bikeId}/maintenance`).then((res) => res.data.data),

    getOne: (bikeId: string, maintenanceId: string) =>
      api.get<ApiResponse<Maintenance>>(`/bikes/${bikeId}/maintenance/${maintenanceId}`).then((res) => res.data.data),

    create: (bikeId: string, data: CreateMaintenanceInput) =>
      api.post<ApiResponse<Maintenance>>(`/bikes/${bikeId}/maintenance`, data).then((res) => res.data.data),

    update: (bikeId: string, maintenanceId: string, data: Partial<CreateMaintenanceInput>) =>
      api.patch<ApiResponse<Maintenance>>(`/bikes/${bikeId}/maintenance/${maintenanceId}`, data).then((res) => res.data.data),

    delete: (bikeId: string, maintenanceId: string) =>
      api.delete(`/bikes/${bikeId}/maintenance/${maintenanceId}`),
  };
}