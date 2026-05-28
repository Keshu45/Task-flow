import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL === '/' 
  ? '/bfhl' 
  : (import.meta.env.VITE_API_URL || '') + '/bfhl';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
