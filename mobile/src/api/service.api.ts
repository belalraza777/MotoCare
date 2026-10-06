import { AxiosInstance } from 'axios';
import { Service, CreateServiceInput } from '../types/service.types';
import { ApiResponse } from '../types/api.types';

export function createServiceApi(api: AxiosInstance) {
  return {
    getAll: (bikeId: string) =>
      api.get<ApiResponse<Service[]>>(`/bikes/${bikeId}/services`).then((res) => res.data.data),

    getOne: (bikeId: string, serviceId: string) =>
      api.get<ApiResponse<Service>>(`/bikes/${bikeId}/services/${serviceId}`).then((res) => res.data.data),

    create: (bikeId: string, data: CreateServiceInput) =>
      api.post<ApiResponse<Service>>(`/bikes/${bikeId}/services`, data).then((res) => res.data.data),

    delete: (bikeId: string, serviceId: string) =>
      api.delete(`/bikes/${bikeId}/services/${serviceId}`),
  };
}