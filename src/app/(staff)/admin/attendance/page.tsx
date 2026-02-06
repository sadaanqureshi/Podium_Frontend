'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Calendar, ChevronDown, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAttendance, updateAttendance } from '@/lib/store/features/academicSlice';
import UserManagementTable from '@/components/ui/UserManagementTable';

const AttendancePage = () => {
    const dispatch = useAppDispatch();
    const { attendance, loading } = useAppSelector((state) => state.academic);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => { dispatch(fetchAttendance()); }, [dispatch]);

    const handleStatusChange = async (attendanceId: number, studentId: number, newStatus: string) => {
        setUpdateLoading(true);
        try {
            const currentDetails = selectedSession.attendanceDetails.map((det: any) => {
                if (det.student.id === studentId) return { ...det, status: newStatus };
                return det;
            });

            const payload = {
                attendanceDate: selectedSession.attendanceDate,
                presentStudentIds: currentDetails.filter((d: any) => d.status === 'present').map((d: any) => d.student.id),
                absentStudentIds: currentDetails.filter((d: any) => d.status === 'absent').map((d: any) => d.student.id),
                lateStudentIds: currentDetails.filter((d: any) => d.status === 'late').map((d: any) => d.student.id)
            };

            const resultAction = await dispatch(updateAttendance({ id: attendanceId, payload })).unwrap();
            setSelectedSession(resultAction);
        } catch (err) { console.error(err); }
        finally { setUpdateLoading(false); }
    };

    const columnConfig = useMemo(() => [
        {
            header: 'Lecture Title', key: 'lectureTitle',
            render: (item: any) => <span className="font-black text-text-main uppercase text-xs italic">{item.lecture?.title}</span>
        },
        {
            header: 'Date', key: 'attendanceDate',
            render: (item: any) => (
                <div className="flex items-center gap-2 text-text-muted font-bold text-xs">
                    <Calendar size={14} className="text-accent-blue" /> {item.attendanceDate}
                </div>
            )
        },
        {
            header: 'Teacher', key: 'teacher',
            render: (item: any) => <span className="text-xs font-black text-accent-blue uppercase italic">{item.teacher?.firstName} {item.teacher?.lastName}</span>
        },
        {
            header: 'Strength', key: 'details', align: 'center' as const,
            render: (item: any) => <span className="bg-app-bg text-text-muted px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-border-subtle">{item.attendanceDetails?.length || 0} Students</span>
        }
    ], []);

    if (loading && attendance.length === 0) return <div className="h-screen flex items-center justify-center bg-app-bg"><Loader2 className="animate-spin text-accent-blue" size={48} /></div>;

    return (
        <div className="p-4 md:p-8 bg-app-bg min-h-screen text-text-main transition-colors duration-300">
            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tight uppercase text-accent-blue">Presence Log</h1>
                <p className="text-text-muted font-medium mt-1 italic underline decoration-accent-blue/20">Real-time classroom attendance tracking.</p>
            </div>

            <div className="bg-card-bg rounded-[2.5rem] shadow-2xl overflow-hidden border border-border-subtle">
                <UserManagementTable
                    data={attendance}
                    loading={loading}
                    columnConfig={columnConfig}
                    type="Attendance"
                    visibleActions={['view']}
                    onView={(id) => {
                        const session = attendance.find(a => a.id === id);
                        setSelectedSession(session);
                    }}
                />
            </div>

            {/* Attendance Marking Modal (Dark Mode Updated) */}
            {selectedSession && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-card-bg w-full max-w-4xl rounded-[3.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-border-subtle">
                        <div className="bg-text-main p-10 text-card-bg flex justify-between items-center transition-colors">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic">{selectedSession.lecture?.title}</h3>
                                <p className="text-[10px] text-accent-blue font-black tracking-widest mt-1 uppercase">SYNC DATE: {selectedSession.attendanceDate}</p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="p-3 hover:bg-card-bg/10 rounded-2xl transition-all"><X size={28} /></button>
                        </div>

                        <div className="p-8 overflow-y-auto no-scrollbar flex-1 bg-card-bg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedSession.attendanceDetails.map((detail: any) => (
                                    <div key={detail.student.id} className="p-5 bg-app-bg rounded-[2rem] border border-border-subtle flex items-center justify-between group hover:border-accent-blue/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-accent-blue text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-accent-blue/20">{detail.student.firstName?.[0].toUpperCase()}</div>
                                            <div>
                                                <p className="font-black text-sm text-text-main">{detail.student.firstName} {detail.student.lastName}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase">{detail.status || 'not-marked'}</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={detail.status || '-'}
                                                onChange={(e) => handleStatusChange(selectedSession.id, detail.student.id, e.target.value)}
                                                disabled={updateLoading}
                                                className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none border-2 transition-all ${
                                                    detail.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                    detail.status === 'absent' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                    detail.status === 'late' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                                                    'bg-card-bg border-border-subtle text-text-muted'
                                                }`}
                                            >
                                                <option value="-">Select Status</option>
                                                <option value="present">Present</option>
                                                <option value="absent">Absent</option>
                                                <option value="late">Late</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-text-muted" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 border-t border-border-subtle bg-app-bg flex justify-between items-center">
                            {updateLoading && <Loader2 className="animate-spin text-accent-blue" size={24} />}
                            <button onClick={() => setSelectedSession(null)} className="px-12 py-4 bg-text-main text-card-bg rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all ml-auto">Terminate Session</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendancePage;