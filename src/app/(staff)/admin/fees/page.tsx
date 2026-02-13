'use client';
import React, { useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchFeesData } from '@/lib/store/features/financeSlice';
import UserManagementTable from '@/components/ui/UserManagementTable';

const FeesManagement = () => {
    const dispatch = useAppDispatch();
    
    // # 1. REDUX STATE ACCESS
    const { transactions, stats, loading } = useAppSelector((state) => state.finance);

    useEffect(() => {
        dispatch(fetchFeesData());
    }, [dispatch]);

    // # 2. TABLE COLUMN CONFIGURATION (Using Design Tokens)
    const feesColumns = useMemo(() => [
        {
            header: 'Transaction ID',
            key: 'uuid',
            render: (item: any) => <span className="font-bold text-accent-blue italic text-xs">#{item.uuid?.slice(0, 8)}</span>
        },
        {
            header: 'Course / Detail',
            key: 'courseName',
            render: (item: any) => (
                <div>
                    <p className="font-black text-text-main uppercase tracking-tight text-sm italic">{item.courseName || 'General Payment'}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{item.studentEmail}</p>
                </div>
            )
        },
        {
            header: 'Amount',
            key: 'amount',
            render: (item: any) => <span className="font-black text-text-main tracking-tighter italic text-base">${item.amount}</span>
        },
        {
            header: 'Status',
            key: 'status',
            align: 'center' as const,
            render: (item: any) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    item.status === 'paid' 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Date',
            key: 'createdAt',
            align: 'right' as const,
            render: (item: any) => <span className="text-text-muted font-black text-[10px] uppercase">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
        }
    ], []);

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main">
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Finance Terminal</h1>
                <p className="text-text-muted font-medium mt-1 italic underline decoration-accent-blue/20">Real-time revenue tracking and transaction auditing.</p>
            </div>

            {/* Stats Section: Fully Dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Gross Revenue" value={`$${stats?.totalRevenue || 0}`} icon={<DollarSign />} color="text-emerald-500" bgColor="bg-emerald-500/10" />
                <StatCard title="Cleared Trans." value={stats?.paidTransactionCount} icon={<TrendingUp />} color="text-accent-blue" bgColor="bg-accent-blue/10" />
                <StatCard title="Awaiting" value={stats?.pendingPayments} icon={<Clock />} color="text-amber-500" bgColor="bg-amber-500/10" />
                <StatCard title="Volume" value={stats?.totalTransactions} icon={<CreditCard />} color="text-purple-500" bgColor="bg-purple-500/10" />
            </div>

            {/* Table Section: Uses Table's own dark mode logic through card-bg token */}
            <div className="bg-card-bg rounded-[2.5rem] shadow-2xl overflow-hidden border border-border-subtle">
                <UserManagementTable
                    data={transactions}
                    loading={loading}
                    columnConfig={feesColumns}
                    type="Transaction"
                    visibleActions={[]}
                />
            </div>
        </div>
    );
};

// StatCard Sub-component (Refactored with Design Tokens)
const StatCard = ({ title, value, icon, color, bgColor }: any) => (
    <div className="bg-card-bg p-7 rounded-[2.5rem] border border-border-subtle shadow-sm flex items-center gap-6 hover:scale-[1.02] group">
        <div className={`w-16 h-16 rounded-[1.5rem] ${bgColor} ${color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
        </div>
        <div>
            <p className="text-text-muted text-[9px] font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-2xl font-black text-text-main mt-1 tracking-tighter italic">{value || 0}</h3>
        </div>
    </div>
);

export default FeesManagement;