import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import { useMemo } from 'react';
import { createBikeApi } from './bike.api';
import { createMaintenanceApi } from './maintenance.api';
import { createFuelApi } from './fuel.api';


export function useApiClient() {
  const { getToken } = useAuth();

  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api'; // Fallback to localhost if the environment variable is not set

  return useMemo(() => {
    // Create an Axios instance with the base URL and any other configuration you need
    const instance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Add more API modules here as needed
    return {
      bikes: createBikeApi(instance),
      maintenance: createMaintenanceApi(instance),
      fuel: createFuelApi(instance),
    };
  }, [getToken]);
}