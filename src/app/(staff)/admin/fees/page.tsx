'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { getFeesDataAPI } from '@/lib/api/apiService';
import UserManagementTable from '@/components/ui/UserManagementTable';

const FeesManagement = () => {
    const [feesData, setFeesData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const res = await getFeesDataAPI(); // GET /admin/fees
                setFeesData(res);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchFees();
    }, []);
    console.log(feesData);
    // Table Column Configuration
    const feesColumns = [
        {
            header: 'Transaction ID',
            key: 'uuid',
            render: (item: any) => <span className="font-bold text-blue-600">#{item.uuid}</span>
        },
        {
            header: 'Course / Detail',
            key: 'courseName',
            render: (item: any) => (
                <div>
                    <p className="font-bold text-[#0F172A]">{item.courseName || 'General Payment'}</p>
                    <p className="text-[10px] text-gray-400">{item.studentEmail}</p>
                </div>
            )
        },
        {
            header: 'Amount',
            key: 'amount',
            align: 'left' as const,
            render: (item: any) => <span className="font-black text-gray-900">{item.amount}</span>
        },
        {
            header: 'Status',
            key: 'status',
            align: 'center' as const,
            render: (item: any) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Date',
            key: 'createdAt',
            align: 'right' as const,
            render: (item: any) => <span className="text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
        }
    ];

    const stats = feesData?.stats;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Fees Management</h1>
                <p className="text-gray-500 font-medium">Financial overview and transaction history.</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Revenue" value={stats?.totalRevenue} icon={<DollarSign />} color="text-green-600" bgColor="bg-green-50" />
                <StatCard title="Paid Trans." value={stats?.paidTransactionCount} icon={<TrendingUp />} color="text-blue-600" bgColor="bg-blue-50" />
                <StatCard title="Pending" value={stats?.pendingPayments} icon={<Clock />} color="text-amber-600" bgColor="bg-amber-50" />
                <StatCard title="All Transactions" value={stats?.totalTransactions} icon={<CreditCard />} color="text-purple-600" bgColor="bg-purple-50" />
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <UserManagementTable
                    data={feesData?.transactions || []}
                    loading={loading}
                    columnConfig={feesColumns}
                    type="transaction"
                    visibleActions={[]} // Fees mein actions nahi chahiye
                />
            </div>
        </div>
    );
};

// StatCard Sub-component
const StatCard = ({ title, value, icon, color, bgColor }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-lg">
        <div className={`w-14 h-14 rounded-2xl ${bgColor} ${color} flex items-center justify-center shadow-inner`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black text-[#0F172A] mt-0.5">{value || 0}</h3>
        </div>
    </div>
);

export default FeesManagement;