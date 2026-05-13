import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (role: UserRole) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple mock auth check
        const storedUser = localStorage.getItem('tf_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (role: UserRole) => {
        // In a real app, this would call your backend
        const mockUser: User = {
            id: role === UserRole.SUPER_ADMIN ? 'admin_1' : 'user_' + Math.random().toString(36).substr(2, 9),
            email: role === UserRole.SUPER_ADMIN ? 'admin@taskflow.pro' : 'user@example.com',
            fullName: role === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Demo User',
            role: role,
            createdAt: new Date().toISOString()
        };
        setUser(mockUser);
        localStorage.setItem('tf_user', JSON.stringify(mockUser));
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('tf_user');
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
