import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, History, RefreshCcw } from 'lucide-react';
import { Task, TaskStatus, User, UserRole } from '../types';
import { TaskModal } from '../components/TaskModal';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { tasksApi, TaskResponse, authApi } from '../api';

export const Tasks: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === UserRole.SUPER_ADMIN;
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Use fetched users for Admin, or just current user for regular staff
    const usersForModal = isAdmin ? allUsers : [
        { id: user?.id || 'current', fullName: user?.fullName || 'Me', email: user?.email || '', role: user?.role || UserRole.USER, createdAt: '' },
    ];

    console.log('[Tasks] Rendering. User:', user?.email, 'isAdmin:', isAdmin, 'ID:', user?.id, 'Name:', user?.fullName);

    const mapResponseToTask = (res: TaskResponse, usersList: User[] = []): Task => {
        const idStr = String(res.id || '');
        
        // Clean up names for matching
        const cleanName = (n: string | null | undefined) => (n || '').toLowerCase().trim();
        const currentUserName = cleanName(user?.fullName);
        const currentUserId = user?.id || '0';
        
        const foundAssignee = usersList.find(u => cleanName(u.fullName) === cleanName(res.assigneeName));
        const foundCreator = usersList.find(u => cleanName(u.fullName) === cleanName(res.creatorName));

        // Admin detection
        const isAdminName = (n: string | null | undefined) => 
            cleanName(n) === 'super admin' || cleanName(n) === 'admin';
        
        const isCreatorAdmin = isAdminName(res.creatorName) || foundCreator?.role === UserRole.SUPER_ADMIN;
        const isAssigneeAdmin = isAdminName(res.assigneeName) || foundAssignee?.role === UserRole.SUPER_ADMIN;

        // Best effort ID mapping
        const getMappedId = (name: string, foundUser: User | undefined, isAdminRole: boolean) => {
            if (foundUser) return foundUser.id;
            if (cleanName(name) === currentUserName) return currentUserId;
            if (isAdminRole) return '1';
            return '0';
        };

        return {
            id: idStr,
            title: res.title || 'Untitled Objective',
            description: res.description || 'No description provided.',
            status: (res.status as TaskStatus) || TaskStatus.PENDING,
            deadline: res.deadline?.includes('T') ? res.deadline : (res.deadline || '').replace(' ', 'T'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            creator: { 
                id: getMappedId(res.creatorName, foundCreator, isCreatorAdmin),
                fullName: res.creatorName || 'Unknown', 
                email: '', 
                role: isCreatorAdmin ? UserRole.SUPER_ADMIN : UserRole.USER, 
                createdAt: '' 
            },
            assignee: { 
                id: getMappedId(res.assigneeName, foundAssignee, isAssigneeAdmin),
                fullName: res.assigneeName || 'Unknown', 
                email: '', 
                role: isAssigneeAdmin ? UserRole.SUPER_ADMIN : UserRole.USER, 
                createdAt: '' 
            },
            isDeleted: false
        }
    };

    const fetchTasks = async (usersList: User[] = allUsers) => {
        setLoading(true);
        console.log('[Tasks] Fetching registry with users list size:', usersList.length);
        try {
            const data = await tasksApi.getTasks();
            setTasks(data.map(res => mapResponseToTask(res, usersList)));
            setError(null);
        } catch (err: any) {
            console.error('[Tasks] Fetch error:', err);
            if (tasks.length === 0) {
                setError('Failed to retrieve task registry.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersAndTasks = async () => {
        let currentUsers: User[] = [];
        console.log('[Tasks] fetchUsersAndTasks starting. isAdmin:', isAdmin);
        
        if (isAdmin) {
            try {
                console.log('[Tasks] Calling authApi.getUsers()...');
                const users = await authApi.getUsers();
                console.log('[Tasks] authApi.getUsers() response:', users);
                
                if (Array.isArray(users)) {
                    currentUsers = users.map((u: any) => ({
                        id: String(u.id),
                        fullName: u.fullName || u.name || 'User',
                        email: u.email || '', 
                        role: (String(u.fullName).toLowerCase().includes('admin') || String(u.role).toLowerCase().includes('admin')) 
                            ? UserRole.SUPER_ADMIN : UserRole.USER,
                        createdAt: ''
                    }));
                    setAllUsers(currentUsers);
                    console.log('[Tasks] Users synchronized successfully:', currentUsers.length);
                } else {
                    console.warn('[Tasks] getUsers returned non-array:', users);
                }
            } catch (err) {
                console.error('[Tasks] Error fetching users from admin endpoint:', err);
                console.warn('[Tasks] Fallback to empty user list.');
            }
        } else {
            console.log('[Tasks] User is not admin, skipping global user fetch.');
        }

        // Always fetch tasks, using whatever users we managed to get
        fetchTasks(currentUsers.length > 0 ? currentUsers : allUsers);
    };

    useEffect(() => {
        if (user) {
            fetchUsersAndTasks();
        }
    }, [user, isAdmin]);

    if (!user) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                <div className="animate-pulse">Retrieving Registry...</div>
            </div>
        );
    }

    const handleSaveTask = async (taskData: Partial<Task> & { assigneeId?: string }) => {
        if (!taskData.title?.trim()) {
            alert('Mission title is mandatory for registry.');
            return;
        }

        try {
            setError(null);
            console.log('[Tasks] Save attempt. Admin:', isAdmin, 'payload:', taskData);

            // Format date to yyyy-MM-ddTHH:mm:ss for Spring Boot compatibility
            const formatDateForBackend = (dateStr: string) => {
                const date = new Date(dateStr);
                return date.toISOString().split('.')[0]; // Removes .SSSZ
            };

            if (selectedTask) {
                // UPDATE Logic
                const taskId = parseInt(selectedTask.id);
                const deadline = taskData.deadline ? formatDateForBackend(taskData.deadline) : formatDateForBackend(selectedTask.deadline);
                
                let response;
                // Normalize assigneeId - can be 'current', 'me', or numeric string
                const rawAssigneeId = taskData.assigneeId || selectedTask.assignee.id;
                // Important: Try to get numeric ID from user.id which might be like "1"
                const userNumericId = parseInt(user?.id || '0');
                
                const normalizedAssigneeId = (rawAssigneeId === 'current' || rawAssigneeId === 'me' || isNaN(parseInt(rawAssigneeId))) 
                    ? userNumericId 
                    : parseInt(rawAssigneeId);

                if (isAdmin) {
                    const finalAssigneeId = normalizedAssigneeId > 0 ? normalizedAssigneeId : (parseInt(selectedTask.assignee.id) || userNumericId);
                    const payload = {
                        title: taskData.title || selectedTask.title,
                        description: taskData.description || selectedTask.description,
                        deadline: deadline,
                        assigneeId: finalAssigneeId,
                        status: taskData.status || selectedTask.status
                    };
                    console.log('[Tasks] Payload for Admin Update:', payload);
                    response = await tasksApi.updateAdminTask(taskId, payload);
                } else {
                    // USER update logic
                    const isAssignedByAdmin = selectedTask.creator.role === UserRole.SUPER_ADMIN || selectedTask.creator.fullName === 'Super Admin';
                    
                    const payload = {
                        title: isAssignedByAdmin ? selectedTask.title : (taskData.title || selectedTask.title),
                        description: isAssignedByAdmin ? selectedTask.description : (taskData.description || selectedTask.description),
                        deadline: isAssignedByAdmin ? selectedTask.deadline : deadline,
                        status: taskData.status || selectedTask.status
                    };
                    
                    console.log('[Tasks] Payload for User Update:', payload);
                    response = await tasksApi.updatePersonalTask(taskId, payload);
                }

                console.log('[Tasks] Update Success. Response ID:', response.id);
                setTasks(prev => prev.map(t => t.id === selectedTask.id ? mapResponseToTask(response, allUsers) : t));
            } else {
                // CREATE Logic
                let response;
                const deadline = taskData.deadline ? formatDateForBackend(taskData.deadline) : formatDateForBackend(new Date().toISOString());

                const rawAssigneeId = taskData.assigneeId;
                const userNumericId = parseInt(user?.id || '0');
                const normalizedAssigneeId = (!rawAssigneeId || rawAssigneeId === 'current' || rawAssigneeId === 'me' || isNaN(parseInt(rawAssigneeId))) 
                    ? userNumericId 
                    : parseInt(rawAssigneeId);

                if (isAdmin) {
                    const finalAssigneeId = normalizedAssigneeId > 0 ? normalizedAssigneeId : userNumericId;
                    console.log('[Tasks] Payload for Admin Create (Assignee:', finalAssigneeId, '):', {
                        title: taskData.title || '',
                        description: taskData.description || '',
                        deadline: deadline,
                        assigneeId: finalAssigneeId
                    });
                    response = await tasksApi.createAdminTask({
                        title: taskData.title || '',
                        description: taskData.description || '',
                        deadline: deadline,
                        assigneeId: finalAssigneeId
                    });
                } else {
                    console.log('[Tasks] Payload for Personal Create:', {
                        title: taskData.title || '',
                        description: taskData.description || '',
                        deadline: deadline
                    });
                    response = await tasksApi.createPersonalTask({
                        title: taskData.title || '',
                        description: taskData.description || '',
                        deadline: deadline
                    });
                }
                
                console.log('[Tasks] Create Success. Server ID:', response.id);
                // Optimistic update
                const newTask = mapResponseToTask(response, allUsers);
                setTasks(prev => [newTask, ...prev]);
            }
            
            setIsModalOpen(false);
            setSelectedTask(null);
            
            // Sync after a delay to allow backend to persist
            setTimeout(fetchUsersAndTasks, 1000);

        } catch (err: any) {
            console.error('[Tasks] Save error:', err);
            const serverMessage = err.response?.data?.message || err.message;
            alert('Failed to save task: ' + serverMessage);
            fetchTasks();
        }
    };

    const filteredTasks = tasks.filter(t => {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (t.title || '').toLowerCase().includes(query);
        const assigneeMatch = (t.assignee?.fullName || '').toLowerCase().includes(query);
        const matchesSearch = titleMatch || assigneeMatch;
        
        if (isAdmin) return matchesSearch;
        
        // User visibility: Assigned to them OR Created by them (using names for safety)
        const myName = (user.fullName || '').toLowerCase().trim();
        const assigneeName = (t.assignee?.fullName || '').toLowerCase().trim();
        const creatorName = (t.creator?.fullName || '').toLowerCase().trim();

        const isAssignedToMe = assigneeName === myName;
        const isCreatedByMe = creatorName === myName;

        return matchesSearch && (isAssignedToMe || isCreatedByMe);
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
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <RefreshCcw className="w-5 h-5 animate-spin text-zinc-400" />
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Synchronizing registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="text-red-500 font-mono text-[10px] uppercase tracking-widest">{error}</span>
                                            <button onClick={fetchTasks} className="text-[10px] underline uppercase tracking-widest text-zinc-400 hover:text-zinc-900">Force Retry</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const isOverdue = new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
                                    return (
                                        <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-[10px] text-zinc-400">#{task.id.length > 4 ? task.id.slice(-4) : task.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{task.title}</p>
                                                <p className="text-xs text-zinc-400 truncate max-w-[240px] mt-0.5">{task.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                        {task.assignee?.fullName?.charAt(0) || (String(task.assignee?.id) === String(user?.id) ? user?.fullName?.charAt(0) : '?')}
                                                    </div>
                                                    <span className="text-zinc-600 font-medium">{task.assignee?.fullName || (String(task.assignee?.id) === String(user?.id) ? user?.fullName : 'Unassigned')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[90px] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    task.status === TaskStatus.COMPLETED ? 'bg-zinc-900 text-white border-zinc-900' :
                                                    isOverdue ? 'bg-red-50 text-red-700 border-red-200' :
                                                    task.status === TaskStatus.IN_PROGRESS ? 'bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm' :
                                                    task.status === TaskStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-white text-zinc-400 border-zinc-100'
                                                }`}>
                                                    {isOverdue ? 'CRITICAL / OVERDUE' : (task.status || 'PENDING').replace('_', ' ')}
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">
                                        {tasks.length === 0 ? 'No tasks registered in the system.' : 'No tasks match your current search parameters.'}
                                    </td>
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
                users={usersForModal}
            />
        </div>
    );
};
