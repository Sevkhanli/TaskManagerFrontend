import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, History } from 'lucide-react';
import { Task, TaskStatus, User, UserRole } from '../types';
import { TaskModal } from '../components/TaskModal';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export const Tasks: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === UserRole.SUPER_ADMIN;
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Users for Assignment (Admin only)
    const mockUsers: User[] = [
        { id: 'admin_1', fullName: 'Super Admin', email: 'admin@taskflow.pro', role: UserRole.SUPER_ADMIN, createdAt: '' },
        { id: 'user_1', fullName: 'Farid Abdullayev', email: 'farid@example.com', role: UserRole.USER, createdAt: '' },
        { id: 'user_2', fullName: 'Leyla Gurbanova', email: 'leyla@example.com', role: UserRole.USER, createdAt: '' },
        { id: 'user_3', fullName: 'Ilgar Kerimov', email: 'ilgar@example.com', role: UserRole.USER, createdAt: '' },
    ];

    useEffect(() => {
        if (!user) return;

        // Mock Initial Tasks - Dynamic setup to ensure current user sees data
        const initialTasks: Task[] = [
            {
                id: '1',
                title: 'Infrastructure Audit',
                description: 'Review security protocols for our cloud cluster.',
                status: TaskStatus.IN_PROGRESS,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deadline: '2026-05-25T23:59:59Z',
                creator: mockUsers[0], // Admin
                assignee: isAdmin ? mockUsers[1] : user, // Assign to current user if they are staff
                isDeleted: false
            },
            {
                id: '2',
                title: 'Process Optimization',
                description: 'Automate internal reporting workflows.',
                status: TaskStatus.TODO,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deadline: '2026-06-01T23:59:59Z',
                creator: user, // Self-created
                assignee: user, 
                isDeleted: false
            }
        ];
        setTasks(initialTasks);
    }, [user, isAdmin]);

    const handleSaveTask = (taskData: Partial<Task> & { assigneeId?: string }) => {
        const assignee = mockUsers.find(u => u.id === taskData.assigneeId) || user!;
        
        if (selectedTask) {
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? {
                ...t,
                ...taskData,
                assignee,
                updatedAt: new Date().toISOString()
            } as Task : t));
        } else {
            const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                title: taskData.title || '',
                description: taskData.description || '',
                status: taskData.status || TaskStatus.TODO,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deadline: taskData.deadline || new Date().toISOString(),
                creator: user!,
                assignee: isAdmin ? assignee : user!, // Users can only create for self
                isDeleted: false
            };
            setTasks(prev => [newTask, ...prev]);
        }
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    // Filter Logic: Admin sees all, User sees tasks assigned to them OR created by them
    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             t.assignee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (isAdmin) return matchesSearch;
        return matchesSearch && (t.assignee.id === user?.id || t.creator.id === user?.id);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <header>
                    <h2 className="text-3xl font-bold tracking-tight">Mission Control</h2>
                    <p className="text-zinc-500">Operational tasks and strategic objectives.</p>
                </header>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 transition-all w-full md:w-64"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setSelectedTask(null);
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> New Objective
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">UID</th>
                                <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Task Information</th>
                                <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Assignee</th>
                                <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 text-center">Status</th>
                                <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Deadline</th>
                                <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const isOverdue = new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
                                    return (
                                        <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">#{task.id.slice(0, 4)}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{task.title}</p>
                                                <p className="text-xs text-zinc-400 truncate max-w-[240px] mt-0.5">{task.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                        {task.assignee.fullName.charAt(0)}
                                                    </div>
                                                    <span className="text-zinc-600 font-medium">{task.assignee.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[90px] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    task.status === TaskStatus.COMPLETED ? 'bg-zinc-900 text-white border-zinc-900' :
                                                    isOverdue ? 'bg-red-50 text-red-700 border-red-200' :
                                                    task.status === TaskStatus.IN_PROGRESS ? 'bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm' :
                                                    'bg-white text-zinc-400 border-zinc-100'
                                                }`}>
                                                    {isOverdue ? 'CRITICAL / OVERDUE' : task.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-zinc-600'}`}>
                                                        {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">
                                                        {format(new Date(task.deadline), 'HH:mm')} Zulu
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                                                        title="Status History"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">No tasks found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <TaskModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                }}
                onSave={handleSaveTask}
                task={selectedTask}
                currentUser={user!}
                users={mockUsers}
            />
        </div>
    );
};
