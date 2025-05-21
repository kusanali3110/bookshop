import axios from 'axios';
import { API_URLS } from './api';

const isDevelopment = import.meta.env.VITE_ENV === 'development';

// Create axios instance with default config
const instance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    if (isDevelopment) {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      });
    }
    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (isDevelopment) {
      console.error('Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          console.error('Unauthorized access');
          break;
        case 403:
          // Handle forbidden access
          console.error('Access forbidden');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        case 500:
          // Handle server error
          console.error('Server error');
          break;
        default:
          console.error('Unknown error');
      }
    }

    return Promise.reject(error);
  }
);

// Export both named and default exports
export { instance as axios, API_URLS };
export default instance; 