// 'use client';
// import React, { useEffect, useMemo, useState } from 'react';
// import { DollarSign, TrendingUp, Clock, CreditCard, Eye, FileText, User, BookOpen, Check, X } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { fetchFeesData, fetchTransactionDetails, clearSelectedTransaction } from '@/lib/store/features/financeSlice';
// // 👉 FIX: PURANI API IMPORT KAR DI HAI
// import { updateEnrollmentStatusAPI } from '@/lib/api/apiService';
// import { useToast } from '@/context/ToastContext';
// import UserManagementTable from '@/components/ui/UserManagementTable';
// import MoreInfo from '@/components/ui/MoreInfo'; 

// const FeesManagement = () => {
//     const dispatch = useAppDispatch();
//     const { showToast } = useToast();

//     // UI States
//     const [actionLoading, setActionLoading] = useState<boolean>(false);
    
//     // Sidebar Modal State
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [activeTransactionId, setActiveTransactionId] = useState<number | string | null>(null);

//     // Redux State Access
//     const { transactions, stats, loading, selectedTransaction, detailsLoading } = useAppSelector((state) => state.finance);

//     useEffect(() => {
//         dispatch(fetchFeesData());
//     }, [dispatch]);

//     // Handle View Click
//     const handleView = (id: number | string) => {
//         setActiveTransactionId(id);
//         setIsModalOpen(true);
//         // GET API dispatch on click
//         dispatch(fetchTransactionDetails(id)); 
//     };

//     // Close Modal safely
//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setActiveTransactionId(null);
//         dispatch(clearSelectedTransaction()); // State clean kar do
//     };

//     // 👉 FIX: PATCH API Execution - Ab Enroll ID aur Purani API use karegi
//     const executeStatusUpdate = async (action: 'approve' | 'reject') => {
//         // Redux mein save hui transaction (JSON) se Enroll ID nikalna
//         const enrollId = selectedTransaction?.enrollId || selectedTransaction?.enroll?.id;

//         if (!enrollId) {
//             showToast('Error: Enrollment ID missing from details!', 'error');
//             return;
//         }

//         let payload: any = { action };
        
//         // Optional Reject Reason prompt inside main logic
//         if (action === 'reject') {
//             const reason = window.prompt("Enter rejection reason (optional):");
//             if (reason === null) return; // User pressed cancel
//             if (reason.trim()) payload.rejectionReason = reason;
//         }

//         setActionLoading(true);
//         try {
//             // 👉 PURANI API CALL HO RAHI HAI ENROLL ID KE SATH
//             await updateEnrollmentStatusAPI(enrollId, payload);
//             showToast(`Transaction successfully ${action === 'approve' ? 'approved' : 'dismissed'}!`, 'success');
            
//             // Refresh parent table data
//             dispatch(fetchFeesData()); 
//             handleCloseModal(); // Action successful hone pr modal band
//         } catch (error: any) {
//             showToast(error.message || 'Action failed', 'error');
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     // --- TABLE COLUMNS ---
//     const feesColumns = useMemo(() => [
//         {
//             header: 'Transaction ID',
//             key: 'uuid',
//             render: (item: any) => <span className="font-bold text-accent-blue text-xs uppercase">#{item.uuid?.slice(0, 8) || item.id || 'N/A'}</span>
//         },
//         {
//             header: 'Student Name',
//             key: 'student',
//             render: (item: any) => (
//                 <p className="font-black text-text-main uppercase tracking-tight text-sm">{item.studentName || item.student?.firstName || 'Unknown'}</p>
//             )
//         },
//         {
//             header: 'Course / Detail',
//             key: 'courseName',
//             render: (item: any) => (
//                 <p className="font-black text-text-main uppercase tracking-tight text-sm">{item.courseName || item.course?.courseName || 'General Payment'}</p>
//             )
//         },
//         {
//             header: 'Amount',
//             key: 'amount',
//             render: (item: any) => <span className="font-black text-emerald-500 tracking-tighter text-base">${item.amount || item.course?.price || 0}</span>
//         },
//         {
//             header: 'Status',
//             key: 'status',
//             align: 'center' as const,
//             render: (item: any) => {
//                 const currentStatus = item.status?.toLowerCase() || 'pending';
//                 let statusClasses = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

//                 if (currentStatus === 'paid' || currentStatus === 'approved' || currentStatus === 'enrolled') {
//                     statusClasses = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
//                 } else if (currentStatus === 'dismissed' || currentStatus === 'rejected') {
//                     statusClasses = 'bg-red-500/10 text-red-500 border-red-500/20';
//                 }

//                 return (
//                     <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${statusClasses}`}>
//                         {item.status || 'Pending'}
//                     </span>
//                 );
//             }
//         },
//         {
//             header: 'Date',
//             key: 'createdAt',
//             align: 'right' as const,
//             render: (item: any) => <span className="text-text-muted font-bold text-xs">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
//         },
//         {
//             header: 'Action',
//             key: 'actions',
//             align: 'right' as const,
//             render: (item: any) => {
//                 const recordId = item.id || item.uuid; 
//                 return (
//                     <div className="flex justify-end">
//                         <button
//                             onClick={() => handleView(recordId)}
//                             className="flex items-center gap-2 p-2 px-4 bg-accent-blue/10 text-accent-blue font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-accent-blue hover:text-white transition-all shadow-sm"
//                             title="View Details"
//                         >
//                             <Eye size={14} strokeWidth={2.5} /> View
//                         </button>
//                     </div>
//                 );
//             }
//         }
//     ], []);

//     // 👉 HELPER: Map Backend JSON to Generic Modal Props
//     const generateModalProps = () => {
//         const data = selectedTransaction;
//         if (!data) return { topCards: [], sections: [], imageProof: null, showActions: false };

//         const student = data?.enroll?.student || {};
//         const course = data?.enroll?.course || {};
//         const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown';
//         const currentStatus = data?.status?.toLowerCase() || 'pending';

//         const statusClasses = currentStatus === 'paid' || currentStatus === 'approved' || currentStatus === 'enrolled'
//             ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
//             : currentStatus === 'dismissed' || currentStatus === 'rejected' 
//             ? 'bg-red-500/10 text-red-500 border-red-500/20' 
//             : 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            
//         const statusBadge = (
//             <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusClasses}`}>
//                 {data.status || 'Pending'}
//             </span>
//         );

//         return {
//             topCards: [
//                 { label: 'Total Amount', value: <span className="text-3xl font-black text-emerald-500 tracking-tighter">${data.amount || 0}</span> },
//                 { label: 'Status', value: statusBadge }
//             ],
//             sections: [
//                 {
//                     title: 'Payment Info',
//                     icon: <CreditCard size={14} />,
//                     fields: [
//                         { label: 'Transaction ID', value: data.uuid || 'N/A', isHighlight: true },
//                         { label: 'Payment Method', value: data.paymentType || 'N/A', capitalize: true },
//                         { label: 'Date Submitted', value: data.createdAt ? new Date(data.createdAt).toLocaleString('en-GB') : 'N/A' }
//                     ]
//                 },
//                 {
//                     title: 'Student Identity',
//                     icon: <User size={14} />,
//                     fields: [
//                         { label: 'Full Name', value: studentName },
//                         { label: 'Email Address', value: student.email || 'N/A' },
//                         { label: 'Roll Number', value: student.rollNumber || 'N/A' },
//                         { label: 'Contact', value: student.contactNumber || 'N/A' }
//                     ]
//                 },
//                 {
//                     title: 'Course Details',
//                     icon: <BookOpen size={14} />,
//                     fields: [
//                         { label: 'Course Enrolled', value: course.courseName || 'N/A', isHighlight: true },
//                         { label: 'Course Price', value: `$${course.price || '0.00'}` }
//                     ]
//                 }
//             ],
//             imageProof: data.screenshotUrl ? { label: 'Verification Proof', url: data.screenshotUrl } : null,
//             showActions: currentStatus === 'pending'
//         };
//     };

//     const modalConfig = generateModalProps();

//     return (
//         <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main animate-in fade-in duration-300 relative">
//             {/* Header */}
//             <div className="mb-10 border-b border-border-subtle pb-6">
//                 <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Finance Terminal</h1>
//                 <p className="text-text-muted font-medium text-sm mt-1">Audit transactions and manage payment approvals.</p>
//             </div>

//             {/* Stats Section */}
//             <div className="space-y-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     <StatCard title="Gross Revenue" value={`$${stats?.totalRevenue || 0}`} icon={<DollarSign />} color="text-emerald-500" bgColor="bg-emerald-500/10" />
//                     <StatCard title="Cleared Trans." value={stats?.paidTransactionCount} icon={<TrendingUp />} color="text-accent-blue" bgColor="bg-accent-blue/10" />
//                     <StatCard title="Awaiting" value={stats?.pendingPayments} icon={<Clock />} color="text-amber-500" bgColor="bg-amber-500/10" />
//                     <StatCard title="Volume" value={stats?.totalTransactions} icon={<CreditCard />} color="text-purple-500" bgColor="bg-purple-500/10" />
//                 </div>

//                 {/* Main Table */}
//                 <div className="bg-card-bg rounded-[1rem] shadow-sm border border-border-subtle overflow-hidden">
//                     <UserManagementTable
//                         data={transactions}
//                         loading={loading}
//                         columnConfig={feesColumns}
//                         type="Transaction"
//                     />
//                 </div>
//             </div>

//             {/* 👉 UNIVERSAL SIDE MODAL */}
//             <MoreInfo 
//                 isOpen={isModalOpen}
//                 onClose={handleCloseModal}
//                 loading={detailsLoading}
//                 actionLoading={actionLoading}
                
//                 // Config Mapped Props
//                 title="Transaction Details"
//                 subtitle="Review Application"
//                 headerIcon={<FileText size={20} strokeWidth={2.5} />}
//                 topCards={modalConfig.topCards}
//                 sections={modalConfig.sections}
//                 imageProof={modalConfig.imageProof}
//                 showActions={modalConfig.showActions}
//                 closedMessage="Transaction Closed"
//                 onApprove={() => executeStatusUpdate('approve')}
//                 onReject={() => executeStatusUpdate('reject')}
//             />
//         </div>
//     );
// };

// // StatCard Component
// const StatCard = ({ title, value, icon, color, bgColor }: any) => (
//     <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-5 hover:border-accent-blue/30 transition-colors">
//         <div className={`w-14 h-14 rounded-xl ${bgColor} ${color} flex items-center justify-center shrink-0`}>
//             {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
//         </div>
//         <div>
//             <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">{title}</p>
//             <h3 className="text-2xl font-black text-text-main mt-0.5 tracking-tight">{value || 0}</h3>
//         </div>
//     </div>
// );

// export default FeesManagement;

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, Clock, CreditCard, Eye, FileText, User, BookOpen, Check, X, Filter } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchFeesData, fetchTransactionDetails, clearSelectedTransaction } from '@/lib/store/features/financeSlice';
// 👉 FIX: PURANI API IMPORT KAR DI HAI
import { updateEnrollmentStatusAPI } from '@/lib/api/apiService';
import { useToast } from '@/context/ToastContext';
import UserManagementTable from '@/components/ui/UserManagementTable';
import MoreInfo from '@/components/ui/MoreInfo'; 

const FeesManagement = () => {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    // UI States
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all'); // 👉 Filter State
    
    // Sidebar Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTransactionId, setActiveTransactionId] = useState<number | string | null>(null);

    // Redux State Access
    const { transactions, stats, loading, selectedTransaction, detailsLoading } = useAppSelector((state) => state.finance);

    useEffect(() => {
        dispatch(fetchFeesData());
    }, [dispatch]);

    // Handle View Click
    const handleView = (id: number | string) => {
        setActiveTransactionId(id);
        setIsModalOpen(true);
        // GET API dispatch on click
        dispatch(fetchTransactionDetails(id)); 
    };

    // Close Modal safely
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setActiveTransactionId(null);
        dispatch(clearSelectedTransaction()); // State clean kar do
    };

    // 👉 FIX: PATCH API Execution - Ab Enroll ID aur Purani API use karegi
    const executeStatusUpdate = async (action: 'approve' | 'reject') => {
        // Redux mein save hui transaction (JSON) se Enroll ID nikalna
        const enrollId = selectedTransaction?.enrollId || selectedTransaction?.enroll?.id;

        if (!enrollId) {
            showToast('Error: Enrollment ID missing from details!', 'error');
            return;
        }

        let payload: any = { action };
        
        // Optional Reject Reason prompt inside main logic
        if (action === 'reject') {
            const reason = window.prompt("Enter rejection reason (optional):");
            if (reason === null) return; // User pressed cancel
            if (reason.trim()) payload.rejectionReason = reason;
        }

        setActionLoading(true);
        try {
            // 👉 PURANI API CALL HO RAHI HAI ENROLL ID KE SATH
            await updateEnrollmentStatusAPI(enrollId, payload);
            showToast(`Transaction successfully ${action === 'approve' ? 'approved' : 'dismissed'}!`, 'success');
            
            // Refresh parent table data
            dispatch(fetchFeesData()); 
            handleCloseModal(); // Action successful hone pr modal band
        } catch (error: any) {
            showToast(error.message || 'Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // 👉 FILTER LOGIC
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        if (activeFilter === 'all') return transactions;
        
        return transactions.filter((txn: any) => {
            const status = txn.status?.toLowerCase() || 'pending';
            return status === activeFilter;
        });
    }, [transactions, activeFilter]);

    // --- TABLE COLUMNS ---
    const feesColumns = useMemo(() => [
        {
            header: 'Transaction ID',
            key: 'uuid',
            render: (item: any) => <span className="font-bold text-accent-blue text-xs uppercase">#{item.uuid?.slice(0, 8) || item.id || 'N/A'}</span>
        },
        {
            header: 'Student Name',
            key: 'student',
            render: (item: any) => (
                <p className="font-black text-text-main uppercase tracking-tight text-sm">{item.studentName || item.student?.firstName || 'Unknown'}</p>
            )
        },
        {
            header: 'Course / Detail',
            key: 'courseName',
            render: (item: any) => (
                <p className="font-black text-text-main uppercase tracking-tight text-sm">{item.courseName || item.course?.courseName || 'General Payment'}</p>
            )
        },
        {
            header: 'Amount',
            key: 'amount',
            render: (item: any) => <span className="font-black text-emerald-500 tracking-tighter text-base">${item.amount || item.course?.price || 0}</span>
        },
        {
            header: 'Status',
            key: 'status',
            align: 'center' as const,
            render: (item: any) => {
                const currentStatus = item.status?.toLowerCase() || 'pending';
                let statusClasses = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

                if (currentStatus === 'paid' || currentStatus === 'approved' || currentStatus === 'enrolled') {
                    statusClasses = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                } else if (currentStatus === 'dismissed' || currentStatus === 'rejected' || currentStatus === 'failed') {
                    statusClasses = 'bg-red-500/10 text-red-500 border-red-500/20';
                }

                return (
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${statusClasses}`}>
                        {item.status || 'Pending'}
                    </span>
                );
            }
        },
        {
            header: 'Date',
            key: 'createdAt',
            align: 'right' as const,
            render: (item: any) => <span className="text-text-muted font-bold text-xs">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right' as const,
            render: (item: any) => {
                const recordId = item.id || item.uuid; 
                return (
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleView(recordId)}
                            className="flex items-center gap-2 p-2 px-4 bg-accent-blue/10 text-accent-blue font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-accent-blue hover:text-white transition-all shadow-sm"
                            title="View Details"
                        >
                            <Eye size={14} strokeWidth={2.5} /> View
                        </button>
                    </div>
                );
            }
        }
    ], []);

    // 👉 HELPER: Map Backend JSON to Generic Modal Props
    const generateModalProps = () => {
        const data = selectedTransaction;
        if (!data) return { topCards: [], sections: [], imageProof: null, showActions: false };

        const student = data?.enroll?.student || {};
        const course = data?.enroll?.course || {};
        const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown';
        const currentStatus = data?.status?.toLowerCase() || 'pending';

        const statusClasses = currentStatus === 'paid' || currentStatus === 'approved' || currentStatus === 'enrolled'
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : currentStatus === 'dismissed' || currentStatus === 'rejected' || currentStatus === 'failed'
            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            
        const statusBadge = (
            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusClasses}`}>
                {data.status || 'Pending'}
            </span>
        );

        return {
            topCards: [
                { label: 'Total Amount', value: <span className="text-3xl font-black text-emerald-500 tracking-tighter">${data.amount || 0}</span> },
                { label: 'Status', value: statusBadge }
            ],
            sections: [
                {
                    title: 'Payment Info',
                    icon: <CreditCard size={14} />,
                    fields: [
                        { label: 'Transaction ID', value: data.uuid || 'N/A', isHighlight: true },
                        { label: 'Payment Method', value: data.paymentType || 'N/A', capitalize: true },
                        { label: 'Date Submitted', value: data.createdAt ? new Date(data.createdAt).toLocaleString('en-GB') : 'N/A' }
                    ]
                },
                {
                    title: 'Student Identity',
                    icon: <User size={14} />,
                    fields: [
                        { label: 'Full Name', value: studentName },
                        { label: 'Email Address', value: student.email || 'N/A' },
                        { label: 'Roll Number', value: student.rollNumber || 'N/A' },
                        { label: 'Contact', value: student.contactNumber || 'N/A' }
                    ]
                },
                {
                    title: 'Course Details',
                    icon: <BookOpen size={14} />,
                    fields: [
                        { label: 'Course Enrolled', value: course.courseName || 'N/A', isHighlight: true },
                        { label: 'Course Price', value: `$${course.price || '0.00'}` }
                    ]
                }
            ],
            imageProof: data.screenshotUrl ? { label: 'Verification Proof', url: data.screenshotUrl } : null,
            showActions: currentStatus === 'pending'
        };
    };

    const modalConfig = generateModalProps();

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main animate-in fade-in duration-300 relative">
            {/* Header */}
            <div className="mb-10 border-b border-border-subtle pb-6">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Finance Terminal</h1>
                <p className="text-text-muted font-medium text-sm mt-1">Audit transactions and manage payment approvals.</p>
            </div>

            {/* Stats Section */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Gross Revenue" value={`$${stats?.totalRevenue || 0}`} icon={<DollarSign />} color="text-emerald-500" bgColor="bg-emerald-500/10" />
                    <StatCard title="Cleared Trans." value={stats?.paidTransactionCount} icon={<TrendingUp />} color="text-accent-blue" bgColor="bg-accent-blue/10" />
                    <StatCard title="Awaiting" value={stats?.pendingPayments} icon={<Clock />} color="text-amber-500" bgColor="bg-amber-500/10" />
                    <StatCard title="Volume" value={stats?.totalTransactions} icon={<CreditCard />} color="text-purple-500" bgColor="bg-purple-500/10" />
                </div>

                {/* Main Table with Filter Tabs */}
                <div className="bg-card-bg rounded-[1rem] shadow-sm border border-border-subtle overflow-hidden">
                    {/* 👉 FILTER SECTION ADDED HERE */}
                    <div className="px-6 py-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-app-bg/50">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-text-muted" />
                            <h3 className="text-sm font-bold text-text-main">Filter by Status</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'paid', 'failed'].map((filter) => (
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
                        data={filteredTransactions} // 👉 FIX: Filtered Data Table ko Diya Ja Raha Hai
                        loading={loading}
                        columnConfig={feesColumns}
                        type="Transaction"
                    />
                </div>
            </div>

            {/* 👉 UNIVERSAL SIDE MODAL */}
            <MoreInfo 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                loading={detailsLoading}
                actionLoading={actionLoading}
                
                // Config Mapped Props
                title="Transaction Details"
                subtitle="Review Application"
                headerIcon={<FileText size={20} strokeWidth={2.5} />}
                topCards={modalConfig.topCards}
                sections={modalConfig.sections}
                imageProof={modalConfig.imageProof}
                showActions={modalConfig.showActions}
                closedMessage="Transaction Closed"
                onApprove={() => executeStatusUpdate('approve')}
                onReject={() => executeStatusUpdate('reject')}
            />
        </div>
    );
};

// StatCard Component
const StatCard = ({ title, value, icon, color, bgColor }: any) => (
    <div className="bg-card-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-5 hover:border-accent-blue/30 transition-colors">
        <div className={`w-14 h-14 rounded-xl ${bgColor} ${color} flex items-center justify-center shrink-0`}>
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
        <div>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black text-text-main mt-0.5 tracking-tight">{value || 0}</h3>
        </div>
    </div>
);

export default FeesManagement;