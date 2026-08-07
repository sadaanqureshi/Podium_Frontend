// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import {
//     Loader2,
//     Calendar,
//     ClipboardCheck,
//     CheckCircle2,
//     XCircle,
//     Clock3,
//     Layers,
//     BookOpen,
// } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { fetchEnrolledCourses } from '@/lib/store/features/courseSlice';
// import {
//     fetchMyAttendance,
//     clearMyAttendance,
// } from '@/lib/store/features/academicSlice';
// import CustomDropdown from '@/components/ui/CustomDropdown';
// import { useToast } from '@/context/ToastContext';
// import type { StudentAttendanceStatus } from '@/lib/api/apiService';

// const statusBadge = (status: StudentAttendanceStatus | string) => {
//     if (status === 'present') {
//         return {
//             label: 'Present',
//             className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
//             Icon: CheckCircle2,
//         };
//     }
//     if (status === 'absent') {
//         return {
//             label: 'Absent',
//             className: 'bg-red-500/10 border-red-500/20 text-red-500',
//             Icon: XCircle,
//         };
//     }
//     return {
//         label: 'Pending',
//         className: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
//         Icon: Clock3,
//     };
// };

// export default function StudentAttendancePage() {
//     const dispatch = useAppDispatch();
//     const { showToast } = useToast();

//     const [mounted, setMounted] = useState(false);
//     const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
//     const [selectedLectureId, setSelectedLectureId] = useState<number | ''>('');
//     const [lectureCatalog, setLectureCatalog] = useState<
//         { label: string; value: number }[]
//     >([]);
//     // After a course is chosen (default or manual), auto-pick its first lecture once
//     const [autoPickLecture, setAutoPickLecture] = useState(false);

//     const { enrolledCourses = [], loading: courseLoading } = useAppSelector((state) => state.course);
//     const {
//         myAttendance,
//         myAttendanceSummary,
//         myAttendanceLoading,
//         myAttendanceError,
//     } = useAppSelector((state) => state.academic);

//     useEffect(() => {
//         setMounted(true);
//     }, []);

//     useEffect(() => {
//         dispatch(fetchEnrolledCourses());
//         return () => {
//             dispatch(clearMyAttendance());
//         };
//     }, [dispatch]);

//     useEffect(() => {
//         if (myAttendanceError) {
//             showToast(myAttendanceError, 'error');
//         }
//     }, [myAttendanceError, showToast]);

//     const courseOptions = useMemo(() => {
//         return enrolledCourses
//             .map((item: any) => {
//                 const course = item.course || item;
//                 return {
//                     label: course.courseName || course.title || `Course ${course.id}`,
//                     value: course.id as number,
//                 };
//             })
//             .filter((opt: { value: number }) => opt.value != null);
//     }, [enrolledCourses]);

//     // Default: first enrolled course
//     useEffect(() => {
//         if (courseLoading.enrolledCourses) return;
//         if (courseOptions.length === 0) return;
//         if (selectedCourseId !== '') return;

//         setSelectedCourseId(Number(courseOptions[0].value));
//         setSelectedLectureId('');
//         setLectureCatalog([]);
//         setAutoPickLecture(true);
//     }, [courseOptions, courseLoading.enrolledCourses, selectedCourseId]);

//     useEffect(() => {
//         if (selectedCourseId === '') {
//             dispatch(clearMyAttendance());
//             return;
//         }

//         const params: { courseId: number; lectureId?: number } = {
//             courseId: selectedCourseId,
//         };
//         if (selectedLectureId !== '') {
//             params.lectureId = selectedLectureId;
//         }

//         dispatch(fetchMyAttendance(params));
//     }, [dispatch, selectedCourseId, selectedLectureId]);

//     const lectureOptions = useMemo(() => {
//         const seen = new Map<number, { label: string; order: number | null }>();
//         for (const row of myAttendance) {
//             if (row.lecture?.id != null && !seen.has(row.lecture.id)) {
//                 const order =
//                     row.lecture.lectureOrder != null
//                         ? `#${row.lecture.lectureOrder} · `
//                         : '';
//                 seen.set(row.lecture.id, {
//                     label: `${order}${row.lecture.title}`,
//                     order: row.lecture.lectureOrder,
//                 });
//             }
//         }
//         return Array.from(seen.entries())
//             .sort((a, b) => {
//                 const ao = a[1].order;
//                 const bo = b[1].order;
//                 if (ao == null && bo == null) return 0;
//                 if (ao == null) return 1;
//                 if (bo == null) return -1;
//                 return ao - bo;
//             })
//             .map(([id, { label }]) => ({ label, value: id }));
//     }, [myAttendance]);

//     // Build lecture catalog from course-level response, then default to first lecture
//     useEffect(() => {
//         if (selectedCourseId === '') {
//             setLectureCatalog([]);
//             return;
//         }
//         // Only seed catalog from unfiltered (all lectures) responses
//         if (selectedLectureId !== '' || myAttendanceLoading) return;

//         if (myAttendance.length > 0) {
//             setLectureCatalog(lectureOptions);
//             if (autoPickLecture && lectureOptions.length > 0) {
//                 setSelectedLectureId(lectureOptions[0].value);
//                 setAutoPickLecture(false);
//             } else if (autoPickLecture) {
//                 setAutoPickLecture(false);
//             }
//         } else if (autoPickLecture) {
//             setLectureCatalog([]);
//             setAutoPickLecture(false);
//         }
//     }, [
//         selectedCourseId,
//         selectedLectureId,
//         myAttendance,
//         myAttendanceLoading,
//         lectureOptions,
//         autoPickLecture,
//     ]);

//     const handleCourseChange = (value: string | number) => {
//         if (value === '' || value == null) return;
//         setSelectedLectureId('');
//         setLectureCatalog([]);
//         setSelectedCourseId(Number(value));
//         setAutoPickLecture(true);
//     };

//     const handleLectureChange = (value: string | number) => {
//         setAutoPickLecture(false);
//         setSelectedLectureId(value === '' ? '' : Number(value));
//     };

//     const coursesLoading =
//         courseLoading.enrolledCourses && enrolledCourses.length === 0;

//     if (!mounted) return <div className="h-screen bg-app-bg transition-none" />;

//     if (coursesLoading) {
//         return (
//             <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
//                 <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
//                 <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">
//                     Loading...
//                 </p>
//             </div>
//         );
//     }

//     const summaryCards = [
//         {
//             label: 'Present',
//             value: myAttendanceSummary.present,
//             icon: CheckCircle2,
//             accent: 'text-emerald-500 bg-emerald-500/10',
//         },
//         {
//             label: 'Absent',
//             value: myAttendanceSummary.absent,
//             icon: XCircle,
//             accent: 'text-red-500 bg-red-500/10',
//         },
//         {
//             label: 'Pending',
//             value: myAttendanceSummary.pending,
//             icon: Clock3,
//             accent: 'text-amber-500 bg-amber-500/10',
//         },
//         {
//             label: 'Total',
//             value: myAttendanceSummary.total,
//             icon: Layers,
//             accent: 'text-accent-blue bg-accent-blue/10',
//         },
//     ];

//     const lectureDropdownOptions =
//         lectureCatalog.length > 0 ? lectureCatalog : lectureOptions;

//     return (
//         <div className="bg-app-bg min-h-screen text-text-main pb-16">
//             <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-12 space-y-8">
//                 {/* Header */}
//                 <div className="space-y-2">
//                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">
//                         <ClipboardCheck size={12} /> Attendance
//                     </div>
//                     <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
//                         Attendance
//                     </h1>
//                     <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed">
//                         View lecture-wise attendance for your enrolled courses.
//                     </p>
//                 </div>

//                 {/* Filters */}
//                 <div className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
//                                 <BookOpen size={12} className="text-accent-blue" /> Course
//                             </label>
//                             {enrolledCourses.length === 0 ? (
//                                 <p className="text-sm text-text-muted font-medium py-3">
//                                     You are not enrolled in any courses
//                                 </p>
//                             ) : (
//                                 <CustomDropdown
//                                     options={courseOptions}
//                                     value={selectedCourseId}
//                                     onChange={handleCourseChange}
//                                     placeholder="Select a course"
//                                     className="w-full"
//                                 />
//                             )}
//                         </div>

//                         <div className="space-y-2">
//                             <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
//                                 <Calendar size={12} className="text-accent-blue" /> Lecture
//                             </label>
//                             <CustomDropdown
//                                 options={[
//                                     { label: 'All lectures', value: '' },
//                                     ...lectureDropdownOptions,
//                                 ]}
//                                 value={selectedLectureId}
//                                 onChange={handleLectureChange}
//                                 placeholder="All lectures"
//                                 className="w-full"
//                                 disabled={
//                                     selectedCourseId === '' ||
//                                     (myAttendanceLoading && lectureDropdownOptions.length === 0)
//                                 }
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {enrolledCourses.length === 0 ? null : selectedCourseId === '' ? (
//                     <div className="bg-card-bg border border-border-subtle rounded-2xl p-12 text-center shadow-sm">
//                         <Loader2 className="animate-spin text-accent-blue mx-auto mb-4" size={36} />
//                         <p className="text-sm font-bold text-text-muted uppercase tracking-wider">
//                             Loading course attendance
//                         </p>
//                     </div>
//                 ) : (
//                     <>
//                         {/* Summary */}
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//                             {summaryCards.map((card) => {
//                                 const Icon = card.icon;
//                                 return (
//                                     <div
//                                         key={card.label}
//                                         className="bg-card-bg border border-border-subtle rounded-2xl p-5 shadow-sm flex items-center gap-4"
//                                     >
//                                         <div
//                                             className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
//                                         >
//                                             <Icon size={20} />
//                                         </div>
//                                         <div className="min-w-0">
//                                             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">
//                                                 {card.label}
//                                             </p>
//                                             <p className="text-2xl font-black tabular-nums">
//                                                 {myAttendanceLoading ? '—' : card.value}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         {/* Lecture list */}
//                         <div className="bg-card-bg border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
//                             <div className="px-5 md:px-6 py-4 border-b border-border-subtle flex items-center justify-between gap-3">
//                                 <h2 className="text-xs font-black uppercase tracking-widest text-text-muted">
//                                     Lecture Attendance
//                                 </h2>
//                                 {myAttendanceLoading && (
//                                     <Loader2
//                                         className="animate-spin text-accent-blue"
//                                         size={18}
//                                     />
//                                 )}
//                             </div>

//                             {myAttendanceLoading && myAttendance.length === 0 ? (
//                                 <div className="py-16 flex flex-col items-center justify-center">
//                                     <Loader2
//                                         className="animate-spin text-accent-blue mb-3"
//                                         size={36}
//                                     />
//                                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
//                                         Loading attendance
//                                     </p>
//                                 </div>
//                             ) : myAttendance.length === 0 ? (
//                                 <div className="py-16 px-6 text-center">
//                                     <p className="text-sm font-bold text-text-muted uppercase tracking-wider">
//                                         No attendance records for this course yet
//                                     </p>
//                                     <p className="text-xs text-text-muted mt-2 max-w-md mx-auto">
//                                         Attendance appears for live lectures once your teacher
//                                         creates and marks them.
//                                     </p>
//                                 </div>
//                             ) : (
//                                 <ul className="divide-y divide-border-subtle">
//                                     {myAttendance.map((row) => {
//                                         const badge = statusBadge(row.status);
//                                         const BadgeIcon = badge.Icon;
//                                         return (
//                                             <li
//                                                 key={row.attendanceId}
//                                                 className="px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-app-bg/60 transition-colors"
//                                             >
//                                                 <div className="min-w-0 space-y-1">
//                                                     <p className="text-sm font-black text-text-main uppercase tracking-tight truncate">
//                                                         {row.lecture?.title || 'Untitled lecture'}
//                                                     </p>
//                                                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
//                                                         {row.lecture?.lectureOrder != null && (
//                                                             <span>
//                                                                 Order {row.lecture.lectureOrder}
//                                                             </span>
//                                                         )}
//                                                         {row.lecture?.lectureType && (
//                                                             <span className="text-accent-blue">
//                                                                 {row.lecture.lectureType}
//                                                             </span>
//                                                         )}
//                                                         <span className="inline-flex items-center gap-1.5">
//                                                             <Calendar
//                                                                 size={12}
//                                                                 className="text-accent-blue"
//                                                             />
//                                                             {row.attendanceDate || 'Not dated'}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 <span
//                                                     className={`inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${badge.className}`}
//                                                 >
//                                                     <BadgeIcon size={12} />
//                                                     {badge.label}
//                                                 </span>
//                                             </li>
//                                         );
//                                     })}
//                                 </ul>
//                             )}
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Loader2,
    Calendar,
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Clock3,
    Layers,
    BookOpen,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchEnrolledCourses } from '@/lib/store/features/courseSlice';
import {
    fetchMyAttendance,
    clearMyAttendance,
} from '@/lib/store/features/academicSlice';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useToast } from '@/context/ToastContext';
import type { StudentAttendanceStatus } from '@/lib/api/apiService';

const statusBadge = (status: StudentAttendanceStatus | string) => {
    if (status === 'present') {
        return {
            label: 'Present',
            className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
            Icon: CheckCircle2,
        };
    }
    if (status === 'absent') {
        return {
            label: 'Absent',
            className: 'bg-red-500/10 border-red-500/20 text-red-500',
            Icon: XCircle,
        };
    }
    return {
        label: 'Pending',
        className: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        Icon: Clock3,
    };
};

export default function StudentAttendancePage() {
    const dispatch = useAppDispatch();
    const { showToast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
    const [selectedLectureId, setSelectedLectureId] = useState<number | ''>('');
    const [lectureCatalog, setLectureCatalog] = useState<
        { label: string; value: number }[]
    >([]);
    // After a course is chosen (default or manual), auto-pick its first lecture once
    const [autoPickLecture, setAutoPickLecture] = useState(false);

    const { enrolledCourses = [], loading: courseLoading } = useAppSelector((state) => state.course);
    const {
        myAttendance,
        myAttendanceSummary,
        myAttendanceLoading,
        myAttendanceError,
    } = useAppSelector((state) => state.academic);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        dispatch(fetchEnrolledCourses());
        return () => {
            dispatch(clearMyAttendance());
        };
    }, [dispatch]);

    useEffect(() => {
        if (myAttendanceError) {
            showToast(myAttendanceError, 'error');
        }
    }, [myAttendanceError, showToast]);

    const courseOptions = useMemo(() => {
        return enrolledCourses
            .map((item: any) => {
                const course = item.course || item;
                return {
                    label: course.courseName || course.title || `Course ${course.id}`,
                    value: course.id as number,
                };
            })
            .filter((opt: { value: number }) => opt.value != null);
    }, [enrolledCourses]);

    // Default: first enrolled course
    useEffect(() => {
        if (courseLoading.enrolledCourses) return;
        if (courseOptions.length === 0) return;
        if (selectedCourseId !== '') return;

        setSelectedCourseId(Number(courseOptions[0].value));
        setSelectedLectureId('');
        setLectureCatalog([]);
        setAutoPickLecture(true);
    }, [courseOptions, courseLoading.enrolledCourses, selectedCourseId]);

    useEffect(() => {
        if (selectedCourseId === '') {
            dispatch(clearMyAttendance());
            return;
        }

        const params: { courseId: number; lectureId?: number } = {
            courseId: selectedCourseId,
        };
        if (selectedLectureId !== '') {
            params.lectureId = selectedLectureId;
        }

        dispatch(fetchMyAttendance(params));
    }, [dispatch, selectedCourseId, selectedLectureId]);

    const lectureOptions = useMemo(() => {
        const seen = new Map<number, { label: string; order: number | null }>();
        for (const row of myAttendance) {
            if (row.lecture?.id != null && !seen.has(row.lecture.id)) {
                const order =
                    row.lecture.lectureOrder != null
                        ? `#${row.lecture.lectureOrder} · `
                        : '';
                seen.set(row.lecture.id, {
                    label: `${order}${row.lecture.title}`,
                    order: row.lecture.lectureOrder,
                });
            }
        }
        return Array.from(seen.entries())
            .sort((a, b) => {
                const ao = a[1].order;
                const bo = b[1].order;
                if (ao == null && bo == null) return 0;
                if (ao == null) return 1;
                if (bo == null) return -1;
                return ao - bo;
            })
            .map(([id, { label }]) => ({ label, value: id }));
    }, [myAttendance]);

    // Build lecture catalog from course-level response, then default to first lecture
    useEffect(() => {
        if (selectedCourseId === '') {
            setLectureCatalog([]);
            return;
        }
        // Only seed catalog from unfiltered (all lectures) responses
        if (selectedLectureId !== '' || myAttendanceLoading) return;

        if (myAttendance.length > 0) {
            setLectureCatalog(lectureOptions);
            if (autoPickLecture && lectureOptions.length > 0) {
                setSelectedLectureId(lectureOptions[0].value);
                setAutoPickLecture(false);
            } else if (autoPickLecture) {
                setAutoPickLecture(false);
            }
        } else if (autoPickLecture) {
            setLectureCatalog([]);
            setAutoPickLecture(false);
        }
    }, [
        selectedCourseId,
        selectedLectureId,
        myAttendance,
        myAttendanceLoading,
        lectureOptions,
        autoPickLecture,
    ]);

    const handleCourseChange = (value: string | number) => {
        if (value === '' || value == null) return;
        setSelectedLectureId('');
        setLectureCatalog([]);
        setSelectedCourseId(Number(value));
        setAutoPickLecture(true);
    };

    const handleLectureChange = (value: string | number) => {
        setAutoPickLecture(false);
        setSelectedLectureId(value === '' ? '' : Number(value));
    };

    const coursesLoading =
        courseLoading.enrolledCourses && enrolledCourses.length === 0;

    if (!mounted) return <div className="h-screen bg-app-bg transition-none" />;

    if (coursesLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
                <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">
                    Loading...
                </p>
            </div>
        );
    }

    const summaryCards = [
        {
            label: 'Present',
            value: myAttendanceSummary.present,
            icon: CheckCircle2,
            accent: 'text-emerald-500 bg-emerald-500/10',
        },
        {
            label: 'Absent',
            value: myAttendanceSummary.absent,
            icon: XCircle,
            accent: 'text-red-500 bg-red-500/10',
        },
        {
            label: 'Pending',
            value: myAttendanceSummary.pending,
            icon: Clock3,
            accent: 'text-amber-500 bg-amber-500/10',
        },
        {
            label: 'Total',
            value: myAttendanceSummary.total,
            icon: Layers,
            accent: 'text-accent-blue bg-accent-blue/10',
        },
    ];

    const lectureDropdownOptions =
        lectureCatalog.length > 0 ? lectureCatalog : lectureOptions;

    return (
        <div className="bg-app-bg min-h-screen text-text-main pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-12 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest">
                        <ClipboardCheck size={12} /> Attendance
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                        Attendance
                    </h1>
                    <p className="text-text-muted text-sm font-medium max-w-xl leading-relaxed">
                        View lecture-wise attendance for your enrolled courses.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-card-bg border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 👉 FIX: space-y-1.5 taake label aur dropdown qareeb aayen */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={12} className="text-accent-blue" /> Course
                            </label>
                            {enrolledCourses.length === 0 ? (
                                <p className="text-sm text-text-muted font-medium py-2">
                                    You are not enrolled in any courses
                                </p>
                            ) : (
                                <CustomDropdown
                                    options={courseOptions}
                                    value={selectedCourseId}
                                    onChange={handleCourseChange}
                                    placeholder="Select a course"
                                    // 👉 FIX: !min-h-[42px] !h-[42px] se specific is page par height control hogi
                                    className="w-full !min-h-[42px] !h-[42px]"
                                />
                            )}
                        </div>

                        {/* 👉 FIX: space-y-1.5 */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} className="text-accent-blue" /> Lecture
                            </label>
                            <CustomDropdown
                                options={[
                                    { label: 'All lectures', value: '' },
                                    ...lectureDropdownOptions,
                                ]}
                                value={selectedLectureId}
                                onChange={handleLectureChange}
                                placeholder="All lectures"
                                // 👉 FIX: Forcefully overriding height class for slimmer look
                                className="w-full !min-h-[42px] !h-[42px]"
                                disabled={
                                    selectedCourseId === '' ||
                                    (myAttendanceLoading && lectureDropdownOptions.length === 0)
                                }
                            />
                        </div>
                    </div>
                </div>

                {enrolledCourses.length === 0 ? null : selectedCourseId === '' ? (
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-12 text-center shadow-sm">
                        <Loader2 className="animate-spin text-accent-blue mx-auto mb-4" size={36} />
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">
                            Loading course attendance
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {summaryCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={card.label}
                                        className="bg-card-bg border border-border-subtle rounded-2xl p-5 shadow-sm flex items-center gap-4"
                                    >
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}
                                        >
                                            <Icon size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest truncate">
                                                {card.label}
                                            </p>
                                            <p className="text-2xl font-black tabular-nums">
                                                {myAttendanceLoading ? '—' : card.value}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Lecture list */}
                        <div className="bg-card-bg border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 md:px-6 py-4 border-b border-border-subtle flex items-center justify-between gap-3">
                                <h2 className="text-xs font-black uppercase tracking-widest text-text-muted">
                                    Lecture Attendance
                                </h2>
                                {myAttendanceLoading && (
                                    <Loader2
                                        className="animate-spin text-accent-blue"
                                        size={18}
                                    />
                                )}
                            </div>

                            {myAttendanceLoading && myAttendance.length === 0 ? (
                                <div className="py-16 flex flex-col items-center justify-center">
                                    <Loader2
                                        className="animate-spin text-accent-blue mb-3"
                                        size={36}
                                    />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                                        Loading attendance
                                    </p>
                                </div>
                            ) : myAttendance.length === 0 ? (
                                <div className="py-16 px-6 text-center">
                                    <p className="text-sm font-bold text-text-muted uppercase tracking-wider">
                                        No attendance records for this course yet
                                    </p>
                                    <p className="text-xs text-text-muted mt-2 max-w-md mx-auto">
                                        Attendance appears for live lectures once your teacher
                                        creates and marks them.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-border-subtle">
                                    {myAttendance.map((row) => {
                                        const badge = statusBadge(row.status);
                                        const BadgeIcon = badge.Icon;
                                        return (
                                            <li
                                                key={row.attendanceId}
                                                className="px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-app-bg/60 transition-colors"
                                            >
                                                <div className="min-w-0 space-y-1">
                                                    <p className="text-sm font-black text-text-main uppercase tracking-tight truncate">
                                                        {row.lecture?.title || 'Untitled lecture'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                        {row.lecture?.lectureOrder != null && (
                                                            <span>
                                                                Order {row.lecture.lectureOrder}
                                                            </span>
                                                        )}
                                                        {row.lecture?.lectureType && (
                                                            <span className="text-accent-blue">
                                                                {row.lecture.lectureType}
                                                            </span>
                                                        )}
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Calendar
                                                                size={12}
                                                                className="text-accent-blue"
                                                            />
                                                            {row.attendanceDate || 'Not dated'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${badge.className}`}
                                                >
                                                    <BadgeIcon size={12} />
                                                    {badge.label}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}