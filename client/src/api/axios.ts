import axios from 'axios';

// VITE_API_URL will be set in Vercel to your Render backend URL.
// When not set (local dev), it uses an empty string to send a relative request,
// which Vite's proxy will forward to the backend running on port 5000.
const apiURL = import.meta.env.VITE_API_URL || '';
const baseURL = `${apiURL.replace(/\/$/, '')}/bfhl`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
