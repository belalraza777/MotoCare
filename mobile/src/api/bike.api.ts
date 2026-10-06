import { AxiosInstance } from 'axios';
import { Bike, CreateBikeInput, UpdateBikeInput } from '../types/bike.types';
import { ApiResponse } from '../types/api.types';


export function createBikeApi(api: AxiosInstance) {
  return {
    getAll: () =>
      api.get<ApiResponse<Bike[]>>('/bikes').then((res) => res.data.data),

    getOne: (id: string) =>
      api.get<ApiResponse<Bike>>(`/bikes/${id}`).then((res) => res.data.data),

    create: (data: CreateBikeInput) =>
      api.post<ApiResponse<Bike>>('/bikes', data).then((res) => res.data.data),

    update: (id: string, data: UpdateBikeInput) =>
      api.patch<ApiResponse<Bike>>(`/bikes/${id}`, data).then((res) => res.data.data),

    delete: (id: string) =>
      api.delete(`/bikes/${id}`),
  };
}