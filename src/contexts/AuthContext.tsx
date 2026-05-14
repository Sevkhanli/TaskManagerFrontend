import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('[Auth] JWT parse error:', e);
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            console.log('[Auth] Initializing check...');
            const token = localStorage.getItem('tf_access_token');
            if (!token) {
                console.log('[Auth] No access token found in storage.');
                setLoading(false);
                return;
            }

            try {
                console.log('[Auth] Fetching user profile...');
                const response = await authApi.getMe();
                console.log('[Auth] Profile response:', response);
                
                if (response.success) {
                    const tokenToUse = response.accessToken || token;
                    const decoded = parseJwt(tokenToUse);
                    console.log('[Auth] Decoded token for check:', decoded);

                    const email = decoded?.sub || response.email || 'User';
                    const fullName = response.fullName || response.name || 'User';
                    
                    // Logic: Check roles array from token FIRST
                    let role = UserRole.USER;
                    if (decoded?.roles?.includes('ROLE_ADMIN') || decoded?.role === 'admin' || email.includes('admin')) {
                        role = UserRole.SUPER_ADMIN;
                    }

                    const userData: User = {
                        id: decoded?.userId || email || 'unknown',
                        email: email,
                        fullName: fullName,
                        role: role,
                        createdAt: new Date().toISOString()
                    };

                    console.log('[Auth] User verified:', userData);
                    setUser(userData);
                    if (response.accessToken) localStorage.setItem('tf_access_token', response.accessToken);
                    if (response.refreshToken) localStorage.setItem('tf_refresh_token', response.refreshToken);
                } else {
                    console.warn('[Auth] Profile fetch unsuccessful, logging out.');
                    handleLogoutLocal();
                }
            } catch (error) {
                console.error('[Auth] Initial auth check failed with error:', error);
                handleLogoutLocal();
            } finally {
                setLoading(false);
                console.log('[Auth] Initialization complete, loading set to false.');
            }
        };

        checkAuth();
    }, []);

    const handleLogoutLocal = () => {
        console.log('[Auth] Clearing local session data.');
        setUser(null);
        localStorage.removeItem('tf_access_token');
        localStorage.removeItem('tf_refresh_token');
        localStorage.removeItem('tf_user');
    };

    const login = async (credentials: any) => {
        console.log('[Auth] Login attempt for:', credentials.email);
        setLoading(true);
        try {
            const response = await authApi.login(credentials);
            console.log('[Auth] Login raw response:', JSON.stringify(response, null, 2));
            
            if (response.success && response.accessToken) {
                localStorage.setItem('tf_access_token', response.accessToken);
                localStorage.setItem('tf_refresh_token', response.refreshToken);
                
                const decoded = parseJwt(response.accessToken);
                console.log('[Auth] Decoded token from login:', decoded);

                const email = decoded?.sub || response.email || credentials.email;
                const fullName = response.fullName || response.name || 'User';
                
                // Logic: Extract role from ROLE_ADMIN array in token
                let role = UserRole.USER;
                if (decoded?.roles?.includes('ROLE_ADMIN') || decoded?.role === 'admin') {
                    role = UserRole.SUPER_ADMIN;
                }
                
                const userData: User = {
                    id: decoded?.userId || email || Math.random().toString(36).substr(2, 9),
                    email: email,
                    fullName: fullName,
                    role: role,
                    createdAt: new Date().toISOString()
                };
                
                console.log('[Auth] Login success. Final userData structure:', userData);
                
                setUser(userData);
                localStorage.setItem('tf_user', JSON.stringify(userData));
                
                return userData;
            } else {
                console.warn('[Auth] Login failed:', response.message);
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('[Auth] Login execution error:', error);
            throw error;
        } finally {
            setLoading(false);
            console.log('[Auth] Login flow concluded, loading: false');
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('API logout failed:', error);
        } finally {
            handleLogoutLocal();
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
