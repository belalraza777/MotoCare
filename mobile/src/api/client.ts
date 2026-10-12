import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import { useMemo, useRef } from 'react';
import { createBikeApi } from './bike.api';
import { createMaintenanceApi } from './maintenance.api';
import { createFuelApi } from './fuel.api';
import { createServiceApi } from './service.api';
import { createDocumentApi } from './document.api';
import { createDashboardApi } from './dashboard.api';
import { createLogApi } from './log.api';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:8000/api';

// This hook provides an API client with methods for interacting with various endpoints.
export function useApiClient() {
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMemo(() => {
    const instance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getTokenRef.current();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return {
      bikes: createBikeApi(instance),
      maintenance: createMaintenanceApi(instance),
      fuel: createFuelApi(instance),
      services: createServiceApi(instance),
      documents: createDocumentApi(instance),
      dashboard: createDashboardApi(instance),
      logs: createLogApi(instance),
    };
  }, [baseUrl]);
}