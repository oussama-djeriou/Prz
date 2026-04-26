import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 422)) {
            localStorage.removeItem('token');
            const protectedPaths = ['/dashboard', '/chat', '/admin'];
            const isProtectedPath = protectedPaths.some((path) => window.location.pathname.startsWith(path));
            if (isProtectedPath && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
