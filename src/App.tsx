import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { UserLogin } from './pages/UserLogin';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Penalties } from './pages/Penalties';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ 
    children, 
    allowedRoles 
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
    );

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/login/admin" element={<AdminLogin />} />
                    <Route path="/login/user" element={<UserLogin />} />
                    
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="penalties" element={<Penalties />} />
                        <Route path="users" element={
                            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                                <Users />
                            </ProtectedRoute>
                        } />
                        <Route path="settings" element={
                            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                                <Settings />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}
