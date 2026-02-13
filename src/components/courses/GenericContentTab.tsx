'use client';
import React, { useState } from 'react';
import {
    Layers, FolderPlus, Video,
    MonitorPlay, CalendarPlus, LayoutGrid
} from 'lucide-react';
import ContentCard from './ContentCard';
import { SectionWrapper } from './SectionWrapper';

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

export const GenericContentTab = ({
    title, type, data, role,
    onAddSection, onAddItem, onEditItem, onDeleteItem,
    onSubTabChange
}: Props) => {
    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');

    const handleTabChange = (tab: 'recorded' | 'online') => {
        setActiveLectureSubTab(tab);
        if (onSubTabChange) onSubTabChange(tab);
    };

    const renderItems = (items: any[], sectionId: number, filterType?: 'recorded' | 'online') => {
        const filtered = filterType
            ? items.filter(item => item.lectureType === filterType)
            : items;

        if (filtered.length === 0) return (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted opacity-30">
                <LayoutGrid size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Terminal: No {filterType || ''} items found</p>
            </div>
        );

        return filtered.map((item: any) => (
            <ContentCard
                key={item.id}
                id={item.id}
                title={item.title || item.name}
                sectionId={sectionId}
                subtitle={
                    type === 'quiz'
                        ? `Marks: ${item.totalMarks}`
                        : (item.lectureType === 'online'
                            ? `Starts: ${item.liveStart ? new Date(item.liveStart).toLocaleString('en-GB') : 'TBD'}`
                            : 'Recorded Session')
                }
                type={type}
                role={role}
                onEdit={() => onEditItem(item, sectionId)}
                onDelete={() => onDeleteItem(item, sectionId)}
            />
        ));
    };

    return (
        <div className="animate-in fade-in duration-300">
            {/* Header: text-text-main auto-switches color */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-2xl font-black capitalize text-text-main tracking-tight">{title} Terminal</h2>
                    <p className="text-text-muted text-sm font-medium underline decoration-accent-blue/20">Manage your course assets and registry efficiently.</p>
                </div>
                {role !== 'student' && (
                    <button
                        onClick={onAddSection}
                        className="flex items-center gap-2 px-6 py-3 bg-text-main text-card-bg rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl"
                    >
                        <FolderPlus size={18} strokeWidth={2.5} />
                        <span>Initialize Section</span>
                    </button>
                )}
            </div>

            {data.length > 0 ? (
                data.map((section: any) => (
                    <SectionWrapper
                        key={section.id}
                        sectionName={section.sectionName}
                        role={role}
                        type={type}
                        onAddItem={() => onAddItem(section.id)}
                    >
                        {type === 'lecture' ? (
                            <div className="space-y-6">
                                {/* Sub-Tabs: Uses Design Tokens for consistent Blue/Purple logic */}
                                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleTabChange('recorded')}
                                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeLectureSubTab === 'recorded'
                                                    ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                                                    : 'text-text-muted hover:bg-sidebar-to/20'
                                                }`}
                                        >
                                            <MonitorPlay size={14} /> Recorded
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('online')}
                                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeLectureSubTab === 'online'
                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                                    : 'text-text-muted hover:bg-sidebar-to/20'
                                                }`}
                                        >
                                            <Video size={14} /> Online
                                        </button>
                                    </div>

                                    {activeLectureSubTab === 'online' && (role === 'admin' || role === 'teacher') && (
                                        <button
                                            onClick={() => onAddItem(section.id)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600/10 text-purple-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-purple-600/20 transition-all border border-purple-600/20"
                                        >
                                            <CalendarPlus size={14} /> Schedule Session
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                    {renderItems(section.items, section.id, activeLectureSubTab)}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {renderItems(section.items, section.id)}
                            </div>
                        )}
                    </SectionWrapper>
                ))
            ) : (
                /* Empty State: Themed with border-border-subtle */
                <div className="text-center py-24 bg-card-bg rounded-[3rem] border-2 border-dashed border-border-subtle">
                    <Layers size={50} className="mx-auto text-text-muted/20 mb-4" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-sm">Terminal: No Content Found</p>
                </div>
            )}
        </div>
    );
};