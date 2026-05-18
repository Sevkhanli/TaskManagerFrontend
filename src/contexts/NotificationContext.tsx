import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
}

interface NotificationContextType {
    notify: (type: NotificationType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback((type: NotificationType, title: string, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, type, title, message }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            {/* Notification Portal */}
            <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center p-4">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col items-center p-8 text-center"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                                n.type === 'success' ? 'bg-green-50 text-green-600' :
                                n.type === 'error' ? 'bg-red-50 text-red-600' :
                                'bg-blue-50 text-blue-600'
                            }`}>
                                {n.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> :
                                 n.type === 'error' ? <AlertCircle className="w-8 h-8" /> :
                                 <Info className="w-8 h-8" />}
                            </div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-2">{n.title}</h4>
                            <p className="text-sm text-zinc-500 mb-6 px-4">{n.message}</p>
                            <button 
                                onClick={() => removeNotification(n.id)}
                                className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                            >
                                Bağla
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
