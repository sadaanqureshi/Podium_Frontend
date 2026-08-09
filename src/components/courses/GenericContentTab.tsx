// 'use client';
// import React, { useState } from 'react';
// import {
//     Layers, FolderPlus, Video,
//     MonitorPlay, CalendarPlus, LayoutGrid,
//     ChevronDown, FolderOpen
// } from 'lucide-react';
// import ContentCard from './ContentCard';
// import { motion, AnimatePresence } from 'framer-motion';

// interface Props {
//     title: string;
//     type: 'lecture' | 'quiz' | 'assignment' | 'resource';
//     data: any[];
//     role: 'admin' | 'teacher' | 'student';
//     onAddSection: () => void;
//     onAddItem: (sectionId: number) => void;
//     onEditItem: (item: any, sectionId: number) => void;
//     onDeleteItem: (item: any, sectionId: number) => void;
//     onScheduleOnline?: (sectionId: number) => void;
//     onSubTabChange?: (subTab: 'recorded' | 'online') => void;
// }

// export const GenericContentTab = ({
//     title, type, data, role,
//     onAddSection, onAddItem, onEditItem, onDeleteItem,
//     onSubTabChange
// }: Props) => {
//     const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');
    
//     // Collapsible Logic: Initialize with all sections open by default or just the first one
//     const [openSections, setOpenSections] = useState<number[]>(data.map((_, index) => index));

//     const toggleSection = (index: number) => {
//         setOpenSections(prev => 
//             prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
//         );
//     };

//     const handleTabChange = (tab: 'recorded' | 'online') => {
//         setActiveLectureSubTab(tab);
//         if (onSubTabChange) onSubTabChange(tab);
//     };

//     const renderItems = (items: any[], sectionId: number, filterType?: 'recorded' | 'online') => {
//         const filtered = filterType
//             ? items.filter(item => item.lectureType === filterType)
//             : items;

//         if (filtered.length === 0) return (
//             <div className="flex flex-col items-center justify-center py-10 bg-app-bg/50 rounded-xl border border-dashed border-border-subtle">
//                 <LayoutGrid size={24} className="mb-2 text-text-muted/40" />
//                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60">No {filterType || ''} content added yet</p>
//             </div>
//         );

//         return (
//             <div className="grid grid-cols-1 gap-3">
//                 {filtered.map((item: any) => (
//                     <ContentCard
//                         key={item.id}
//                         id={item.id}
//                         title={item.title || item.name}
//                         sectionId={sectionId}
//                         subtitle={
//                             type === 'quiz'
//                                 ? `Marks: ${item.totalMarks}`
//                                 : (item.lectureType === 'online'
//                                     ? `Starts: ${item.liveStart ? new Date(item.liveStart).toLocaleString('en-GB') : 'TBD'}`
//                                     : 'Recorded Session')
//                         }
//                         type={type}
//                         role={role}
//                         isCompleted={item.isCompleted}
//                         onEdit={() => onEditItem(item, sectionId)}
//                         onDelete={() => onDeleteItem(item, sectionId)}
//                     />
//                 ))}
//             </div>
//         );
//     };

//     return (
//         <div className="animate-in fade-in duration-300 pb-8">
//             {/* Header: Clean & Professional */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-border-subtle pb-6">
//                 <div>
//                     <h2 className="text-xl md:text-2xl font-black capitalize text-text-main tracking-tight mb-1">{title} Content</h2>
//                     <p className="text-text-muted text-xs font-medium">Manage and organize your course materials efficiently.</p>
//                 </div>
//                 {role !== 'student' && (
//                     <button
//                         onClick={onAddSection}
//                         className="flex items-center gap-2 px-5 py-2.5 bg-text-main text-card-bg rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-md shrink-0"
//                     >
//                         <FolderPlus size={16} strokeWidth={2.5} />
//                         <span>Add New Section</span>
//                     </button>
//                 )}
//             </div>

//             {data.length > 0 ? (
//                 <div className="space-y-4">
//                     {data.map((section: any, index: number) => {
//                         const isOpen = openSections.includes(index);
                        
//                         return (
//                             <div key={section.id} className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:border-accent-blue/30 transition-colors">
                                
//                                 {/* Section Header (Collapsible Trigger) */}
//                                 <div 
//                                     className="p-4 md:p-5 flex items-center justify-between bg-app-bg/30 cursor-pointer select-none"
//                                     onClick={() => toggleSection(index)}
//                                 >
//                                     <div className="flex items-center gap-3 md:gap-4">
//                                         <div className="w-8 h-8 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0">
//                                             <FolderOpen size={16} />
//                                         </div>
//                                         <div>
//                                             <h4 className="font-bold text-sm text-text-main tracking-tight">{section.sectionName}</h4>
//                                             <p className="text-[10px] text-text-muted font-medium mt-0.5">
//                                                 {section.items ? section.items.length : 0} Items Inside
//                                             </p>
//                                         </div>
//                                     </div>
                                    
//                                     <div className="flex items-center gap-3 shrink-0">
//                                         {role !== 'student' && (
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation(); // Stop collapsible from triggering
//                                                     onAddItem(section.id);
//                                                 }}
//                                                 className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-card-bg border border-border-subtle hover:border-accent-blue hover:text-accent-blue text-text-muted rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
//                                             >
//                                                 <span>+ Add Item</span>
//                                             </button>
//                                         )}
//                                         <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-text-muted p-1">
//                                             <ChevronDown size={18} />
//                                         </motion.div>
//                                     </div>
//                                 </div>

//                                 {/* Section Body (Collapsible Content) */}
//                                 <AnimatePresence>
//                                     {isOpen && (
//                                         <motion.div
//                                             initial={{ height: 0, opacity: 0 }}
//                                             animate={{ height: "auto", opacity: 1 }}
//                                             exit={{ height: 0, opacity: 0 }}
//                                             transition={{ duration: 0.2, ease: "easeInOut" }}
//                                             className="overflow-hidden"
//                                         >
//                                             <div className="p-4 md:p-5 border-t border-border-subtle/50">
                                                
//                                                 {/* Add Item Button for Mobile (Visible only when open) */}
//                                                 {role !== 'student' && (
//                                                     <div className="sm:hidden mb-4">
//                                                         <button
//                                                             onClick={() => onAddItem(section.id)}
//                                                             className="w-full flex items-center justify-center gap-2 py-2.5 bg-app-bg border border-dashed border-border-subtle hover:border-accent-blue text-text-muted hover:text-accent-blue rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
//                                                         >
//                                                             <span>+ Add New Content Here</span>
//                                                         </button>
//                                                     </div>
//                                                 )}

//                                                 {type === 'lecture' ? (
//                                                     <div className="space-y-5">
//                                                         {/* Sleek Pill-Shaped Sub-Tabs for Lectures */}
//                                                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                                                             <div className="flex bg-app-bg p-1 rounded-xl border border-border-subtle w-max">
//                                                                 <button
//                                                                     onClick={() => handleTabChange('recorded')}
//                                                                     className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
//                                                                         activeLectureSubTab === 'recorded'
//                                                                             ? 'bg-card-bg text-accent-blue shadow-sm border border-border-subtle/50'
//                                                                             : 'text-text-muted hover:text-text-main'
//                                                                     }`}
//                                                                 >
//                                                                     <MonitorPlay size={14} /> Recorded
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={() => handleTabChange('online')}
//                                                                     className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
//                                                                         activeLectureSubTab === 'online'
//                                                                             ? 'bg-card-bg text-purple-500 shadow-sm border border-border-subtle/50'
//                                                                             : 'text-text-muted hover:text-text-main'
//                                                                     }`}
//                                                                 >
//                                                                     <Video size={14} /> Online
//                                                                 </button>
//                                                             </div>

//                                                             {activeLectureSubTab === 'online' && (role === 'admin' || role === 'teacher') && (
//                                                                 <button
//                                                                     onClick={() => onAddItem(section.id)}
//                                                                     className="flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-purple-500/20 transition-all border border-purple-500/20 w-full sm:w-auto"
//                                                                 >
//                                                                     <CalendarPlus size={14} /> Schedule Session
//                                                                 </button>
//                                                             )}
//                                                         </div>

//                                                         {/* Items List inside Lecture */}
//                                                         <div className="animate-in slide-in-from-bottom-2 duration-300">
//                                                             {renderItems(section.items, section.id, activeLectureSubTab)}
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     // Items List for Non-Lectures (Quizzes, Resources, etc)
//                                                     <div>
//                                                         {renderItems(section.items, section.id)}
//                                                     </div>
//                                                 )}

//                                             </div>
//                                         </motion.div>
//                                     )}
//                                 </AnimatePresence>

//                             </div>
//                         );
//                     })}
//                 </div>
//             ) : (
//                 /* Empty State: Professional look */
//                 <div className="text-center py-20 bg-card-bg rounded-2xl border border-dashed border-border-subtle mt-4">
//                     <Layers size={40} className="mx-auto text-text-muted/30 mb-3" />
//                     <p className="text-text-muted font-bold text-sm mb-1">No Sections Available</p>
//                     <p className="text-text-muted/60 text-[11px]">Click "Add New Section" to start building your course.</p>
//                 </div>
//             )}
//         </div>
//     );
// };


'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Layers, FolderPlus, Video,
    MonitorPlay, CalendarPlus, LayoutGrid,
    ChevronDown, FolderOpen
} from 'lucide-react';
import ContentCard from './ContentCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchSubmissions } from '@/lib/store/features/assignmentSlice';
import {
    countStatusBearingSubmissions,
    hasSubmissionStatus,
} from '@/lib/assignmentSubmissions';
import { getQuizSubmissionsAPI } from '@/lib/api/apiService';
import {
    hasQuizCountOnWithContent,
    normalizeQuizAttemptsList,
    resolveQuizSubmissionBadge,
    type QuizAttemptRow,
} from '@/lib/quizSubmissions';

interface Props {
    title: string;
    type: 'lecture' | 'quiz' | 'assignment' | 'resource';
    data: any[];
    role: 'admin' | 'teacher' | 'student';
    onAddSection: () => void;
    onAddItem: (sectionId: number) => void;
    onEditItem: (item: any, sectionId: number) => void;
    onDeleteItem: (item: any, sectionId: number) => void;
    onScheduleOnline?: (sectionId: number) => void;
    onSubTabChange?: (subTab: 'recorded' | 'online') => void;
}

function resolveSubmissionCount(item: any, cached?: any[]): number | null {
    // Prefer live submissions list — only count rows that have a status
    if (Array.isArray(cached)) {
        return countStatusBearingSubmissions(cached);
    }
    // Fallback fields from course payload (only if > 0)
    const fallback =
        (typeof item?.submissionCount === 'number' && item.submissionCount) ||
        (typeof item?.submissionsCount === 'number' && item.submissionsCount) ||
        (typeof item?.pendingSubmissionCount === 'number' && item.pendingSubmissionCount) ||
        (typeof item?._count?.submissions === 'number' && item._count.submissions) ||
        (Array.isArray(item?.submissions)
            ? item.submissions.filter(hasSubmissionStatus).length
            : 0);
    return fallback > 0 ? fallback : null;
}

function assignmentSubtitle(item: any) {
    const marks = item.totalMarks ?? item.total_marks;
    const due = item.dueDate
        ? new Date(item.dueDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : null;
    const parts = [
        marks != null ? `${marks} pts` : null,
        due ? `Due ${due}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Assignment';
}

export const GenericContentTab = ({
    title, type, data, role,
    onAddSection, onAddItem, onEditItem, onDeleteItem,
    onSubTabChange
}: Props) => {
    const dispatch = useAppDispatch();
    const submissionsCache = useAppSelector((s) => s.assignment.submissionsCache);
    const fetchedSubmissionIds = useRef<Set<number>>(new Set());
    const fetchedQuizIds = useRef<Set<number>>(new Set());
    const [quizAttemptsCache, setQuizAttemptsCache] = useState<Record<number, QuizAttemptRow[]>>(
        {}
    );

    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');
    
    // Collapsible Logic: Initialize with all sections open by default
    const [openSections, setOpenSections] = useState<number[]>(data.map((_, index) => index));

    const assignmentIds = useMemo(() => {
        if (type !== 'assignment' || role === 'student') return [] as number[];
        return data
            .flatMap((section) => section.items || [])
            .map((item: any) => Number(item?.id))
            .filter((id: number) => Number.isFinite(id) && id > 0);
    }, [type, role, data]);

    const quizItemsNeedingFetch = useMemo(() => {
        if (type !== 'quiz' || role === 'student') return [] as number[];
        return data
            .flatMap((section) => section.items || [])
            .filter((item: any) => !hasQuizCountOnWithContent(item))
            .map((item: any) => Number(item?.id))
            .filter((id: number) => Number.isFinite(id) && id > 0);
    }, [type, role, data]);

    useEffect(() => {
        if (!assignmentIds.length) return;
        assignmentIds.forEach((id) => {
            if (fetchedSubmissionIds.current.has(id)) return;
            if (submissionsCache[id] !== undefined) {
                fetchedSubmissionIds.current.add(id);
                return;
            }
            fetchedSubmissionIds.current.add(id);
            dispatch(fetchSubmissions(id));
        });
    }, [assignmentIds, dispatch, submissionsCache]);

    // Quiz badges: prefer with-content counts; otherwise soft-fetch attempts API (like assignments)
    useEffect(() => {
        if (!quizItemsNeedingFetch.length) return;
        let cancelled = false;
        quizItemsNeedingFetch.forEach((id) => {
            if (fetchedQuizIds.current.has(id)) return;
            fetchedQuizIds.current.add(id);
            getQuizSubmissionsAPI(id)
                .then((res) => {
                    if (cancelled) return;
                    const rows = normalizeQuizAttemptsList(res);
                    setQuizAttemptsCache((prev) => ({ ...prev, [id]: rows }));
                })
                .catch(() => {
                    if (cancelled) return;
                    setQuizAttemptsCache((prev) => ({ ...prev, [id]: [] }));
                });
        });
        return () => {
            cancelled = true;
        };
    }, [quizItemsNeedingFetch]);

    const toggleSection = (index: number) => {
        setOpenSections(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleTabChange = (tab: 'recorded' | 'online') => {
        setActiveLectureSubTab(tab);
        if (onSubTabChange) onSubTabChange(tab);
    };

    const renderItems = (items: any[], sectionId: number, filterType?: 'recorded' | 'online') => {
        const filtered = filterType
            ? items.filter(item => item.lectureType === filterType)
            : items;

        if (filtered.length === 0) return (
            <div className="flex flex-col items-center justify-center py-6 bg-app-bg/50 rounded-lg border border-dashed border-border-subtle">
                <LayoutGrid size={20} className="mb-2 text-text-muted/40" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60">No {filterType || ''} content added</p>
            </div>
        );

        return (
            <div className="flex flex-col gap-1">
                {filtered.map((item: any) => {
                    const submissionCount =
                        role === 'student'
                            ? null
                            : type === 'assignment'
                              ? resolveSubmissionCount(item, submissionsCache[item.id])
                              : type === 'quiz'
                                ? resolveQuizSubmissionBadge(
                                      item,
                                      quizAttemptsCache[item.id]
                                  )
                                : null;

                    const subtitle =
                        type === 'quiz'
                            ? `Marks: ${item.total_marks ?? item.totalMarks ?? '—'}${
                                  item.is_Published === true || item.isPublished === true
                                      ? ' · Published'
                                      : item.is_Published === false || item.isPublished === false
                                        ? ' · Draft'
                                        : ''
                              }`
                            : type === 'assignment'
                              ? assignmentSubtitle(item)
                              : type === 'resource'
                                ? 'Resource file'
                                : item.lectureType === 'online'
                                  ? `Starts: ${item.liveStart ? new Date(item.liveStart).toLocaleString('en-GB') : 'TBD'}`
                                  : 'Recorded Session';

                    return (
                        <ContentCard
                            key={item.id}
                            id={item.id}
                            title={item.title || item.name}
                            sectionId={sectionId}
                            subtitle={subtitle}
                            type={type}
                            role={role}
                            isCompleted={item.isCompleted}
                            badgeCount={submissionCount}
                            badgeLabel="submissions"
                            onEdit={() => onEditItem(item, sectionId)}
                            onDelete={() => onDeleteItem(item, sectionId)}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-300 pb-8">
            {/* Header: Clean & Professional */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-border-subtle pb-5">
                <div>
                    <h2 className="text-xl md:text-2xl font-black capitalize text-text-main tracking-tight mb-1">{title} Content</h2>
                    <p className="text-text-muted text-xs font-medium">Manage and organize your course materials efficiently.</p>
                </div>
                {role !== 'student' && (
                    <button
                        onClick={onAddSection}
                        className="flex items-center gap-2 px-4 py-2 bg-text-main text-card-bg rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-sm shrink-0"
                    >
                        <FolderPlus size={16} strokeWidth={2.5} />
                        <span>Add Section</span>
                    </button>
                )}
            </div>

            {data.length > 0 ? (
                <div className="space-y-3">
                    {data.map((section: any, index: number) => {
                        const isOpen = openSections.includes(index);
                        
                        return (
                            <div key={section.id} className="bg-card-bg border border-border-subtle rounded-xl overflow-hidden transition-colors">
                                
                                {/* Section Header (Collapsible Trigger) - Minimal Padding */}
                                <div 
                                    className="px-4 py-3 flex items-center justify-between bg-app-bg/50 cursor-pointer select-none hover:bg-border-subtle/10 transition-colors"
                                    onClick={() => toggleSection(index)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-accent-blue flex items-center justify-center shrink-0">
                                            <FolderOpen size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-bold text-sm text-text-main tracking-tight leading-none">{section.sectionName}</h4>
                                            {/* Minimal item counter */}
                                            {section.items && section.items.length > 0 && (
                                               <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-1">
                                                   {section.items.length} Items
                                               </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 shrink-0">
                                        {role !== 'student' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddItem(section.id);
                                                }}
                                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 hover:bg-border-subtle/30 text-text-muted hover:text-accent-blue rounded-md text-[10px] font-bold uppercase tracking-widest transition-all"
                                            >
                                                <span>+ Add</span>
                                            </button>
                                        )}
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-text-muted">
                                            <ChevronDown size={16} />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Section Body (Collapsible Content) */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-2">
                                                
                                                {/* Add Item Button for Mobile */}
                                                {role !== 'student' && (
                                                    <div className="sm:hidden mb-3 mt-1">
                                                        <button
                                                            onClick={() => onAddItem(section.id)}
                                                            className="w-full flex items-center justify-center gap-2 py-2 bg-app-bg border border-dashed border-border-subtle text-text-muted rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                                        >
                                                            <span>+ Add Content</span>
                                                        </button>
                                                    </div>
                                                )}

                                                {type === 'lecture' ? (
                                                    <div className="space-y-4 mt-2">
                                                        {/* Sleek Sub-Tabs for Lectures */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="flex bg-app-bg p-0.5 rounded-lg border border-border-subtle w-max">
                                                                <button
                                                                    onClick={() => handleTabChange('recorded')}
                                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                                        activeLectureSubTab === 'recorded'
                                                                            ? 'bg-card-bg text-accent-blue shadow-sm border border-border-subtle/50'
                                                                            : 'text-text-muted hover:text-text-main'
                                                                    }`}
                                                                >
                                                                    <MonitorPlay size={12} /> Recorded
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTabChange('online')}
                                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                                        activeLectureSubTab === 'online'
                                                                            ? 'bg-card-bg text-purple-500 shadow-sm border border-border-subtle/50'
                                                                            : 'text-text-muted hover:text-text-main'
                                                                    }`}
                                                                >
                                                                    <Video size={12} /> Online
                                                                </button>
                                                            </div>

                                                            {activeLectureSubTab === 'online' && (role === 'admin' || role === 'teacher') && (
                                                                <button
                                                                    onClick={() => onAddItem(section.id)}
                                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-md font-bold text-[10px] uppercase tracking-widest hover:bg-purple-500/20 transition-all border border-purple-500/20 w-full sm:w-auto"
                                                                >
                                                                    <CalendarPlus size={12} /> Schedule
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Items List inside Lecture */}
                                                        <div className="animate-in slide-in-from-bottom-2 duration-300">
                                                            {renderItems(section.items, section.id, activeLectureSubTab)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Items List for Non-Lectures
                                                    <div className="mt-2">
                                                        {renderItems(section.items, section.id)}
                                                    </div>
                                                )}

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-16 bg-card-bg rounded-xl border border-dashed border-border-subtle mt-4">
                    <Layers size={32} className="mx-auto text-text-muted/30 mb-3" />
                    <p className="text-text-muted font-bold text-sm mb-1">No Sections Available</p>
                    <p className="text-text-muted/60 text-xs">Click "Add Section" to start building.</p>
                </div>
            )}
        </div>
    );
};