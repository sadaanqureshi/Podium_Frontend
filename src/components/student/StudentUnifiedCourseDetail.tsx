'use client';
import React, { useState, useMemo } from 'react';
import { FileText, Layers, ArrowLeft, Loader2, Video, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { CourseInfoCard } from '@/components/courses/CourseInfoCard';
import { GenericContentTab } from '@/components/courses/GenericContentTab';

const TAB_TO_TYPE_MAP: any = { 
    lectures: 'lecture', 
    quizzes: 'quiz', 
    assignments: 'assignment', 
    resources: 'resource' 
};

const StudentUnifiedCourseDetail = ({ courseId, data, isLoading, backUrl }: any) => {
    // Student ke liye default tab Lectures hai
    const [activeTab, setActiveTab] = useState('lectures');
    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');

    const activeTabData = useMemo(() => {
        if (!data?.sections) return [];
        return data.sections.map((sec: any) => ({
            id: sec.id,
            sectionName: sec.title,
            items: sec[activeTab] || []
        }));
    }, [data, activeTab]);

    if (isLoading && !data) return (
        <div className="h-screen flex items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue" size={48} />
        </div>
    );

    // Student ke liye specific tabs (Students tab excluded)
    const tabs = [
        { id: 'lectures', label: 'Lectures', icon: Video },
        { id: 'quizzes', label: 'Quizzes', icon: FileText },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'resources', label: 'Resources', icon: Layers }
    ];

    return (
        <div className="w-full bg-app-bg min-h-screen font-sans text-text-main transition-colors duration-300">
            <div className="p-8 pb-0">
                <Link href={backUrl} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold transition-all text-sm uppercase tracking-widest">
                    <ArrowLeft size={16} /> My Learning
                </Link>
            </div>
            
            <div className="p-8 pt-4">
                <CourseInfoCard data={data?.course} />
                
                {/* Tabs Container */}
                <div className="flex gap-2 bg-card-bg p-1.5 rounded-2xl border border-border-subtle my-6 overflow-x-auto no-scrollbar shadow-sm">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id 
                                ? 'bg-text-main text-card-bg dark:bg-accent-blue dark:text-white shadow-lg' 
                                : 'text-text-muted hover:bg-app-bg'
                            }`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-card-bg rounded-[2.5rem] shadow-sm border border-border-subtle p-8 min-h-[450px]">
                    <GenericContentTab
                        title={activeTab} 
                        type={TAB_TO_TYPE_MAP[activeTab]} 
                        data={activeTabData} 
                        role="student" 
                        onAddSection={() => {}} 
                        onSubTabChange={(tab: any) => setActiveLectureSubTab(tab)} 
                        onAddItem={() => {}} 
                        onEditItem={() => {}} 
                        onDeleteItem={() => {}}
                    />
                </div>
            </div>
        </div>
    );
};

export default StudentUnifiedCourseDetail;