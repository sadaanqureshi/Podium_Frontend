'use client';
import React, { useState, useEffect } from 'react';
import {
    Loader2, Calendar, ClipboardCheck, UserCheck,
    ArrowLeft, Search, X, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { getAllAttendancesAPI, updateAttendanceAPI } from '@/lib/api/apiService';
import UserManagementTable from '@/components/ui/UserManagementTable';

const AttendancePage = () => {
    const [attendances, setAttendances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const fetchAttendances = async () => {
        try {
            const res = await getAllAttendancesAPI();
            setAttendances(res.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAttendances(); }, []);

    // # 1. UPDATE ATTENDANCE LOGIC
    const handleStatusChange = async (attendanceId: number, studentId: number, newStatus: string) => {
        setUpdateLoading(true);
        try {
            // Hum session ke current state ko update karenge
            const updatedDetails = selectedSession.attendanceDetails.map((det: any) => {
                if (det.student.id === studentId) return { ...det, status: newStatus };
                return det;
            });

            const presentIds = updatedDetails.filter((d: any) => d.status === 'present').map((d: any) => d.student.id);
            const absentIds = updatedDetails.filter((d: any) => d.status === 'absent').map((d: any) => d.student.id);
            const lateIds = updatedDetails.filter((d: any) => d.status === 'late').map((d: any) => d.student.id);

            const payload = {
                attendanceDate: selectedSession.attendanceDate,
                presentStudentIds: presentIds,
                absentStudentIds: absentIds,
                lateStudentIds: lateIds // Included as per verbal instruction
            };

            await updateAttendanceAPI(attendanceId, payload);

            // Modal state update taaki UI foran change ho
            setSelectedSession({ ...selectedSession, attendanceDetails: updatedDetails });
            fetchAttendances(); // Refresh main list
        } catch (err) {
            alert("Update failed!");
        } finally {
            setUpdateLoading(false);
        }
    };

    // --- TABLE CONFIGURATION ---
    const columnConfig = [
        {
            header: 'Lecture Title',
            key: 'lectureTitle',
            render: (item: any) => <span className="font-bold text-[#0F172A]">{item.lecture?.title}</span>
        },
        {
            header: 'Date',
            key: 'attendanceDate',
            render: (item: any) => (
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar size={14} /> {item.attendanceDate}
                </div>
            )
        },
        {
            header: 'Teacher',
            key: 'teacher',
            render: (item: any) => <span className="text-xs font-bold text-blue-600 uppercase">{item.teacher?.firstName} {item.teacher?.lastName}</span>
        },
        {
            header: 'Strength',
            key: 'details',
            align: 'center' as const,
            render: (item: any) => (
                <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black">{item.attendanceDetails?.length || 0} Students</span>
            )
        }
    ];

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-[#0F172A]">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Attendance Records</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor and update daily classroom presence.</p>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden p-2">
                <UserManagementTable
                    data={attendances}
                    loading={false}
                    columnConfig={columnConfig}
                    type="Attendance"
                    visibleActions={['view']}
                    onView={(id) => {
                        const session = attendances.find(a => a.id === id);
                        setSelectedSession(session);
                    }}
                />
            </div>

            {/* # ATTENDANCE MARKER MODAL (Dark Blue Theme) */}
            {selectedSession && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-4xl rounded-[3.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-300">

                        <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center border-b border-slate-700">
                            <div>
                                <h3 className="text-2xl font-black">{selectedSession.lecture?.title}</h3>
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Date: {selectedSession.attendanceDate}</p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={28} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto no-scrollbar flex-1 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedSession.attendanceDetails.map((detail: any) => (
                                    <div key={detail.student.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs">
                                                {detail.student.firstName?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm">{detail.student.firstName} {detail.student.lastName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{detail.student.email}</p>
                                            </div>
                                        </div>

                                        {/* # STATUS DROPDOWN */}
                                        <div className="relative">
                                            <select
                                                value={detail.status || '-'}
                                                onChange={(e) => handleStatusChange(selectedSession.id, detail.student.id, e.target.value)}
                                                disabled={updateLoading}
                                                className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none border-2 transition-all ${detail.status === 'present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                        detail.status === 'absent' ? 'bg-red-50 border-red-100 text-red-600' :
                                                            detail.status === 'late' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                                'bg-white border-slate-100 text-slate-400'
                                                    }`}
                                            >
                                                <option value="-">Select Status</option>
                                                <option value="present">Present</option>
                                                <option value="absent">Absent</option>
                                                <option value="late">Late</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center">
                            <div className="flex gap-4">
                                <span className="text-[10px] font-black uppercase text-slate-400">Loading State:</span>
                                {updateLoading && <Loader2 className="animate-spin text-blue-600" size={16} />}
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="px-10 py-4 bg-[#0F172A] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Close Editor</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;