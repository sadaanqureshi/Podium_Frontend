'use client';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAdminCourses } from '@/lib/store/features/courseSlice';
import { ShieldAlert, Database, DollarSign, Activity, Settings2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const dispatch = useAppDispatch();
    const { adminCourses } = useAppSelector((state) => state.course);

    useEffect(() => {
        dispatch(fetchAdminCourses({ page: 1, limit: 10 }));
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-app-bg text-text-main pb-20">
            <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
                
                {/* System Hero */}
                <div className="hero-registry-card rounded-[3rem] p-10 md:p-16 border border-border-subtle shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">System Superuser</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-text-main">Central Control Node</h1>
                            <p className="text-text-muted text-sm font-medium uppercase tracking-widest">Monitor system-wide metrics, users, and financial logs.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-4 bg-card-bg border border-border-subtle rounded-2xl text-text-muted hover:text-red-500 transition-all shadow-xl"><ShieldAlert size={24} /></button>
                            <button className="p-4 bg-card-bg border border-border-subtle rounded-2xl text-text-muted hover:text-accent-blue transition-all shadow-xl"><Settings2 size={24} /></button>
                        </div>
                    </div>
                </div>

                {/* Admin Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-card-bg p-8 rounded-[2rem] border border-border-subtle space-y-2">
                        <DollarSign className="text-emerald-500 mb-2" size={24} />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Revenue</p>
                        <p className="text-2xl font-black">$42.8k</p>
                    </div>
                    <div className="bg-card-bg p-8 rounded-[2rem] border border-border-subtle space-y-2">
                        <Database className="text-accent-blue mb-2" size={24} />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Courses</p>
                        <p className="text-2xl font-black">{adminCourses.meta?.totalItems || 0}</p>
                    </div>
                    <div className="bg-card-bg p-8 rounded-[2rem] border border-border-subtle space-y-2">
                        <UserPlus className="text-amber-500 mb-2" size={24} />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">User Nodes</p>
                        <p className="text-2xl font-black">1.4k</p>
                    </div>
                    <div className="bg-card-bg p-8 rounded-[2rem] border border-border-subtle space-y-2">
                        <Activity className="text-red-500 mb-2" size={24} />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">System Load</p>
                        <p className="text-2xl font-black text-emerald-500">STABLE</p>
                    </div>
                </div>

                {/* Logs / Quick Access */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card-bg rounded-[2.5rem] border border-border-subtle p-10 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Global Course Registry</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border-subtle text-[9px] font-black uppercase text-text-muted tracking-widest">
                                        <th className="pb-4">Course Name</th>
                                        <th className="pb-4">Instructor</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right">Registry ID</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-black uppercase tracking-tight">
                                    {adminCourses.data.slice(0, 5).map((item: any) => (
                                        <tr key={item.id} className="border-b border-border-subtle/30 last:border-0 hover:bg-app-bg/30 transition-all">
                                            <td className="py-4">{item.courseName}</td>
                                            <td className="py-4">{item.teacher?.firstName}</td>
                                            <td className="py-4"><span className="text-emerald-500">Live</span></td>
                                            <td className="py-4 text-right text-text-muted">NODE-{item.id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pending Approvals Widget */}
                    <div className="bg-card-bg rounded-[2.5rem] border border-border-subtle p-8 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pending Approvals</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex flex-col gap-3">
                                <p className="text-[10px] font-black uppercase leading-tight">New Payment Proof: Student_42</p>
                                <Link href="/admin/enrollment-requests" className="text-[9px] font-black text-amber-500 uppercase tracking-widest underline">Review Transaction</Link>
                            </div>
                            <div className="p-4 bg-accent-blue/5 rounded-2xl border border-accent-blue/20 flex flex-col gap-3">
                                <p className="text-[10px] font-black uppercase leading-tight">Instructor Invitation: maaziam</p>
                                <Link href="/admin/invitations" className="text-[9px] font-black text-accent-blue uppercase tracking-widest underline">Manage Token</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}