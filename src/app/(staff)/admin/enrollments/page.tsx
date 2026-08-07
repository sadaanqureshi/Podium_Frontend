// 'use client';
// import React, { useEffect, useMemo } from 'react';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { fetchEnrollmentsData } from '@/lib/store/features/financeSlice';
// import UserManagementTable from '@/components/ui/UserManagementTable';

// const EnrollmentsPage = () => {
//     const dispatch = useAppDispatch();

//     // Redux State Access (Sirf Enrollments)
//     const { enrollments, enrollmentsLoading } = useAppSelector((state) => state.finance);

//     useEffect(() => {
//         dispatch(fetchEnrollmentsData());
//     }, [dispatch]);

//     // --- TABLE COLUMNS: ENROLLMENTS ---
//     const enrollmentColumns = useMemo(() => [
//         {
//             header: 'Student',
//             key: 'student',
//             render: (item: any) => (
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-black text-sm uppercase shrink-0 border border-accent-blue/20">
//                         {item.student?.firstName?.[0] || 'U'}
//                     </div>
//                     <div>
//                         <p className="font-black text-text-main uppercase tracking-tight text-sm">{item.student?.firstName} {item.student?.lastName}</p>
//                         <p className="text-[10px] text-text-muted font-bold tracking-wider mt-0.5">{item.student?.email}</p>
//                     </div>
//                 </div>
//             )
//         },
//         {
//             header: 'Course',
//             key: 'course',
//             render: (item: any) => (
//                 <div>
//                     <p className="font-black text-text-main text-sm">{item.course?.courseName}</p>
//                     <p className="text-[11px] text-emerald-500 font-bold mt-0.5">${item.course?.price}</p>
//                 </div>
//             )
//         },
//         {
//             header: 'Date',
//             key: 'createdAt',
//             align: 'center' as const,
//             render: (item: any) => (
//                 <span className="text-text-muted font-bold text-xs">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
//             )
//         },
//         {
//             header: 'Status',
//             key: 'status',
//             align: 'right' as const,
//             render: (item: any) => {
//                 const currentStatus = item.status?.toLowerCase();
//                 let statusClasses = 'bg-amber-500/10 text-amber-500 border-amber-500/20'; // Default Pending

//                 if (currentStatus === 'enrolled' || currentStatus === 'approved') {
//                     statusClasses = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
//                 } else if (currentStatus === 'dismissed' || currentStatus === 'rejected') {
//                     statusClasses = 'bg-red-500/10 text-red-500 border-red-500/20';
//                 }

//                 return (
//                     <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${statusClasses}`}>
//                         {item.status}
//                     </span>
//                 );
//             }
//         }
//     ], []);

//     return (
//         <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main animate-in fade-in duration-300">
            
//             {/* Header */}
//             <div className="mb-10 border-b border-border-subtle pb-6">
//                 <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Course Enrollments</h1>
//                 <p className="text-text-muted font-medium text-sm mt-1">View all student enrollment records and history.</p>
//             </div>

//             {/* Table Section */}
//             <div className="bg-card-bg rounded-[1rem] shadow-sm border border-border-subtle overflow-hidden">
//                 <UserManagementTable
//                     data={enrollments}
//                     loading={enrollmentsLoading}
//                     columnConfig={enrollmentColumns}
//                     type="Enrollment"
//                     visibleActions={[]} // Action column has been completely removed as per instruction
//                 />
//             </div>
//         </div>
//     );
// };

// export default EnrollmentsPage;

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react'; 
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchEnrollmentsData } from '@/lib/store/features/financeSlice';
import UserManagementTable from '@/components/ui/UserManagementTable';

const EnrollmentsPage = () => {
    const dispatch = useAppDispatch();

    // 👉 FIX: Added Filter State for Enrollments
    const [activeFilter, setActiveFilter] = useState<'all' | 'enrolled' | 'rejected'>('all');

    // Redux State Access (Sirf Enrollments)
    const { enrollments, enrollmentsLoading } = useAppSelector((state) => state.finance);

    useEffect(() => {
        dispatch(fetchEnrollmentsData());
    }, [dispatch]);

    // 👉 FIX: FILTER LOGIC FOR ENROLLMENTS
    const filteredEnrollments = useMemo(() => {
        if (!enrollments) return [];
        if (activeFilter === 'all') return enrollments;
        
        return enrollments.filter((enrollment: any) => {
            const status = enrollment.status?.toLowerCase();
            return status === activeFilter;
        });
    }, [enrollments, activeFilter]);

    // --- TABLE COLUMNS: ENROLLMENTS ---
    const enrollmentColumns = useMemo(() => [
        {
            header: 'Student',
            key: 'student',
            render: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-black text-sm uppercase shrink-0 border border-accent-blue/20">
                        {item.student?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                        <p className="font-black text-text-main uppercase tracking-tight text-sm">{item.student?.firstName} {item.student?.lastName}</p>
                        <p className="text-[10px] text-text-muted font-bold tracking-wider mt-0.5">{item.student?.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Course',
            key: 'course',
            render: (item: any) => (
                <div>
                    <p className="font-black text-text-main text-sm">{item.course?.courseName}</p>
                    <p className="text-[11px] text-emerald-500 font-bold mt-0.5">${item.course?.price}</p>
                </div>
            )
        },
        {
            header: 'Date',
            key: 'createdAt',
            align: 'center' as const,
            render: (item: any) => (
                <span className="text-text-muted font-bold text-xs">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
            )
        },
        {
            header: 'Status',
            key: 'status',
            align: 'right' as const,
            render: (item: any) => {
                const currentStatus = item.status?.toLowerCase();
                let statusClasses = 'bg-amber-500/10 text-amber-500 border-amber-500/20'; // Default Pending

                if (currentStatus === 'enrolled' || currentStatus === 'approved') {
                    statusClasses = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                } else if (currentStatus === 'dismissed' || currentStatus === 'rejected') {
                    statusClasses = 'bg-red-500/10 text-red-500 border-red-500/20';
                }

                return (
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${statusClasses}`}>
                        {item.status}
                    </span>
                );
            }
        }
    ], []);

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main animate-in fade-in duration-300">
            
            {/* Header */}
            <div className="mb-10 border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Course Enrollments</h1>
                    <p className="text-text-muted font-medium text-sm mt-1">View all student enrollment records and history.</p>
                </div>
            </div>

            {/* Table Section with Filters */}
            <div className="bg-card-bg rounded-[1rem] shadow-sm border border-border-subtle overflow-hidden">
                
                {/* 👉 FILTER TABS SECTION */}
                <div className="px-6 py-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-app-bg/50">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-text-muted" />
                        <h3 className="text-sm font-bold text-text-main">Filter by Status</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'enrolled', 'rejected'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter as any)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    activeFilter === filter 
                                    ? 'bg-accent-blue text-white border-accent-blue shadow-md' 
                                    : 'bg-card-bg text-text-muted border-border-subtle hover:border-accent-blue/50 hover:text-text-main'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <UserManagementTable
                    data={filteredEnrollments} // 👉 FIX: Ab filtered array pass ho rahi hai
                    loading={enrollmentsLoading}
                    columnConfig={enrollmentColumns}
                    type="Enrollment"
                    visibleActions={[]} // Action column has been completely removed as per instruction
                />
            </div>
        </div>
    );
};

export default EnrollmentsPage;