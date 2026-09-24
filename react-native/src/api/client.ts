import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import { useMemo } from 'react';

// This hook returns an axios instance that automatically includes the user's authentication token in the Authorization header of each request. This allows you to make authenticated requests to your API without having to manually include the token in each request.
export function useApiClient() {
  const { getToken } = useAuth();

  return useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL,
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return instance;
  }, [getToken]);
}