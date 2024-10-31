import axios from 'axios';
import { UNI_SAT_API_URL } from './constants';

export const uniSatAxios = axios.create({
  baseURL: UNI_SAT_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_UNI_SAT_API_KEY}`,
  },
});

export const backendAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});
