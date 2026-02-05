'use client';
import React, { useMemo } from 'react';
import { UserPlus, Calendar, Mail } from 'lucide-react';
import UserManagementTable from '@/components/ui/UserManagementTable';

interface StudentsTabProps {
    data: any[];
    onAdd: () => void;
    role: string;
    loading?: boolean;
    onDelete: (id: number, name: string) => void;
}

export const StudentsTab = ({ data, onAdd, role, onDelete, loading = false }: StudentsTabProps) => {
    if (role === 'student') return null;

    // # 1. COLUMN CONFIGURATION (Using Central Design Tokens)
    const enrollmentColumns = useMemo(() => [
        {
            header: 'Student Identity',
            // Key changed to avoid internal Table conflict and ensure custom render is used
            key: 'display_identity', 
            render: (item: any) => (
                <div className="flex items-center gap-4">
                    {/* Avatar: bg-app-bg handles Light/Dark switch automatically */}
                    <div className="w-10 h-10 rounded-2xl bg-app-bg border border-border-subtle flex items-center justify-center font-black text-accent-blue text-xs shadow-sm uppercase ">
                        {item.studentName?.[0] || 'S'}
                    </div>
                    {/* Name: text-text-main for high contrast in both themes */}
                    <p className="font-black text-text-main text-sm uppercase tracking-tight">
                        {item.studentName}
                    </p>
                </div>
            )
        },
        {
            header: 'Email Address',
            key: 'studentEmail',
            render: (item: any) => (
                <div className="flex items-center gap-2 text-text-muted font-bold text-xs">
                    <Mail size={12} className="text-accent-blue/60" />
                    {item.studentEmail}
                </div>
            )
        },
        {
            header: 'Enrolled On',
            key: 'enrolledAt',
            align: 'center' as const,
            render: (item: any) => (
                <div className="flex items-center justify-center gap-2 text-text-muted font-black text-[10px] uppercase">
                    <Calendar size={13} className="text-accent-blue/40" />
                    {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString('en-GB') : 'N/A'}
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            align: 'right' as const,
            render: (item: any) => (
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                    {item.status || 'Active'}
                </span>
            )
        }
    ], []);

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header stays for titles but uses tokens */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2">
                <div>
                    <h2 className="text-2xl font-black text-text-main uppercase tracking-tight">Course Roster</h2>
                    <p className="text-text-muted text-xs font-medium underline decoration-accent-blue/20">Verified student directory for this intake.</p>
                </div>

                {role === 'admin' && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-hover-blue transition-all shadow-xl shadow-accent-blue/20 active:scale-95"
                    >
                        <UserPlus size={16} strokeWidth={3} />
                        <span>Enroll Student</span>
                    </button>
                )}
            </div>

            {/* # 2. TABLE INTEGRATION (No custom wrappers needed) */}
            <UserManagementTable
                data={data}
                loading={loading}
                columnConfig={enrollmentColumns}
                type="enrollment"
                visibleActions={role === 'admin' ? ['delete', 'view'] : []}
                // Callback passes both ID and Name to parent for confirmation modal
                onDelete={(id, name) => onDelete(id, name)} 
            />
        </div>
    );
};