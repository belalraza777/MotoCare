import { AxiosInstance } from 'axios';
import { BikeDashboard } from '../types/dashboard.types';
import { ApiResponse } from '../types/api.types';

export function createDashboardApi(api: AxiosInstance) {
  return {
    get: (bikeId: string) =>
      api.get<ApiResponse<BikeDashboard>>(`/bikes/${bikeId}/dashboard`).then((res) => res.data.data),
  };
}