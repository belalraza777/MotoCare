import { AxiosInstance } from 'axios';
import { LogsPage, LogTypeFilter } from '../types/log.types';
import { ApiResponse } from '../types/api.types';

interface LogsParams {
  type: LogTypeFilter;
  bikeId?: string;
  limit: number; 
}

export function createLogApi(api: AxiosInstance) {
  return {
    getPage: (params: LogsParams) =>
      api.get<ApiResponse<LogsPage>>('/logs', { params }).then((res) => res.data.data),
  };
}