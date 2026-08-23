import axios from 'axios';
import { getVillageSlug } from './tenant';

const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL?.trim();
    if (envUrl) return envUrl;
    if (typeof window !== 'undefined') {
        const { protocol, hostname } = window.location;
        return `${protocol}//${hostname}:5055`;
    }
    return 'http://localhost:5055';
};

const API_BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const slug = getVillageSlug();
    if (slug) {
        config.headers['X-Village-Slug'] = slug;
    }
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// If the token is rejected (expired, invalid, or wrong village), clear the
// stale session and send the admin back to log in rather than leaving the
// UI stuck silently failing every write.
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.dispatchEvent(new Event('auth-change'));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
