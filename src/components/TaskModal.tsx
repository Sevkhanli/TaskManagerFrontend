import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User as UserIcon, AlignLeft, Type } from 'lucide-react';
import { Task, TaskStatus, User, UserRole } from '../types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    task?: Task | null;
    currentUser: User;
    users: User[];
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    task, 
    currentUser,
    users
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [deadline, setDeadline] = useState('');
    const [assigneeId, setAssigneeId] = useState('');

    const isAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const isEditing = !!task;
    
    // Permission Logic:
    // 1. Admin can edit everything.
    // 2. User can edit everything of their OWN self-created tasks.
    // 3. User can ONLY edit status if the task was assigned to them by an Admin.
    const isTaskAssignedByAdmin = task && task.creator.role === UserRole.SUPER_ADMIN && task.assignee.id === currentUser.id;
    const isSelfCreatedTask = task && task.creator.id === currentUser.id && task.assignee.id === currentUser.id;

    // Users can edit everything except during creation (where they only create for self) 
    // and except for admin-assigned tasks where they only update status.
    const canEditMetadata = isAdmin || !isEditing || (isEditing && isSelfCreatedTask && !isTaskAssignedByAdmin);
    const canEditStatus = true; // Everyone can edit status of their assigned tasks

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setStatus(task.status);
            setDeadline(task.deadline.split('T')[0]);
            setAssigneeId(task.assignee.id);
        } else {
            setTitle('');
            setDescription('');
            setStatus(TaskStatus.TODO);
            setDeadline(new Date().toISOString().split('T')[0]);
            setAssigneeId(currentUser.id);
        }
    }, [task, currentUser, isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-zinc-200"
                >
                    <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900">
                                {isEditing ? 'Modify Task Details' : 'Launch New Task'}
                            </h3>
                            {isTaskAssignedByAdmin && (
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">
                                    Admin Assigned: Limited Editing
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Title Field */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                <Type className="w-3 h-3" /> Task Title
                            </label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={!canEditMetadata}
                                placeholder="Task title..."
                                className="input-field disabled:bg-zinc-50 disabled:text-zinc-500"
                            />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                <AlignLeft className="w-3 h-3" /> Description
                            </label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={!canEditMetadata}
                                placeholder="Describe the task..."
                                rows={3}
                                className="input-field resize-none py-3 disabled:bg-zinc-50 disabled:text-zinc-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Deadline Field */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    <Calendar className="w-3 h-3" /> Deadline
                                </label>
                                <input 
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    disabled={!canEditMetadata}
                                    className="input-field disabled:bg-zinc-50 disabled:text-zinc-500"
                                />
                            </div>

                            {/* Status Field */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    Status
                                </label>
                                <select 
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                    disabled={!canEditStatus}
                                    className="input-field bg-white"
                                >
                                    {Object.values(TaskStatus).map((s) => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Assignee Field (Admin Only) */}
                        {isAdmin && (
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    <UserIcon className="w-3 h-3" /> Assign To
                                </label>
                                <select 
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="input-field"
                                >
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.fullName} {u.id === currentUser.id ? '(Me)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {!isAdmin && !isEditing && (
                            <div className="p-4 rounded-xl bg-zinc-900 text-white flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs font-medium">Self-created task: You have full control over this objective.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        <button 
                            onClick={() => onSave({ title, description, status, deadline, assigneeId: assigneeId as any })}
                            className="btn-primary px-8"
                        >
                            {isEditing ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
