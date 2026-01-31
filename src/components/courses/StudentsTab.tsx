'use client';
import React from 'react';
import { UserPlus, GraduationCap, Calendar } from 'lucide-react';
import UserManagementTable from '@/components/ui/UserManagementTable';

interface StudentsTabProps {
    data: any[];
    onAdd: () => void;
    role: string;
    loading?: boolean;
    // # Naya prop add kiya gaya hai delete logic handle karne ke liye
    onDelete: (id: number, name: string) => void;
}

export const StudentsTab = ({ data, onAdd, role, onDelete, loading = false }: StudentsTabProps) => {
    if (role === 'student') return null;

    // Enrollment list ke liye Column Configuration
    const enrollmentColumns = [
        {
            header: 'Student Info',
            key: 'studentName',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase shadow-sm">
                        {item.studentName?.[0] || 'S'}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-[#0F172A]">{item.studentName}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Student Email',
            key: 'studentEmail',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <p className="font-bold text-sm text-[#0F172A]">{item.studentEmail}</p>

                </div>
            )
        },
        {
            header: 'Enrollment Date',
            key: 'enrolledAt',
            align: 'center' as const,
            render: (item: any) => (
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs">
                        <Calendar size={12} className="text-gray-300" />
                        {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            align: 'right' as const,
            render: (item: any) => (
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {item.status || 'Active'}
                </span>
            )
        }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 px-2">
                <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">Enrolled Students</h2>
                    <p className="text-gray-400 text-xs font-medium">List of students currently in this course</p>
                </div>

                {role === 'admin' && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span>Add Student</span>
                    </button>
                )}
            </div>

            {/* Generic Table Integration */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <UserManagementTable
                    data={data}
                    loading={loading}
                    columnConfig={enrollmentColumns}
                    type="enrollment"
                    // # Edit button ko list se remove kar diya gaya hai
                    // # Ab sirf delete aur view buttons nazar aayenge
                    visibleActions={role === 'admin' ? ['delete', 'view'] : []}
                    // # Delete confirmation logic ko integration ke liye update kiya gaya hai
                    onDelete={(id) => {
                        const student = data.find(s => s.id === id);
                        onDelete(id, student?.studentName || "Student");
                    }}
                />
            </div>

            {/* Empty State Handled by Table component already */}
        </div>
    );
};