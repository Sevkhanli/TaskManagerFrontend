import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Authorization header
api.interceptors.request.use((config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    
    const accessToken = localStorage.getItem('tf_access_token');
    const refreshToken = localStorage.getItem('tf_refresh_token');

    // For login, we don't need these headers
    if (config.url?.includes('/api/auth/login')) {
        return config;
    }

    if (accessToken && config.url !== '/api/auth/refresh-token') {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // For refresh token, use the refresh token in the Auth header as typically required
    if (config.url === '/api/auth/refresh-token' && refreshToken) {
        config.headers.Authorization = `Bearer ${refreshToken}`;
    }

    // Add Refresh Token for logout as specifically requested
    if (config.url === '/api/auth/logout' && refreshToken) {
        // Ensure Authorization is also present as requested
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        config.headers['X-Refresh-Token'] = refreshToken;
    }

    return config;
}, (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
});

// Response interceptor to handle token expiration (401 errors)
api.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    async (error) => {
        console.error(`[API Response Error] ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
        const originalRequest = error.config;

        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh-token') {
            console.log('[API] 401 detected, attempting token refresh...');
            originalRequest._retry = true;

            try {
                const response = await authApi.refreshToken();
                if (response.success) {
                    console.log('[API] Refresh successful, retrying original request');
                    localStorage.setItem('tf_access_token', response.accessToken);
                    localStorage.setItem('tf_refresh_token', response.refreshToken);
                    
                    // Update header and retry
                    originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('[API] Refresh token failed, redirecting to login', refreshError);
                // Refresh failed, clear everything
                localStorage.removeItem('tf_access_token');
                localStorage.removeItem('tf_refresh_token');
                localStorage.removeItem('tf_user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    fullName: string;
    email: string;
}

export const authApi = {
    login: async (credentials: any): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/login', credentials);
        return response.data;
    },
    logout: async (): Promise<void> => {
        await api.post('/api/auth/logout');
    },
    getMe: async (): Promise<AuthResponse> => {
        const response = await api.get<AuthResponse>('/api/auth/me');
        return response.data;
    },
    refreshToken: async (): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/auth/refresh-token');
        return response.data;
    }
};

export default api;
