'use client';
import React, { useState, useEffect } from 'react';
import {
    Plus, Layers, FolderPlus, Video,
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
    // --- NEW PROPS ADDED WITHOUT BREAKING OLD ONES ---
    onEditItem: (item: any, sectionId: number) => void;
    onDeleteItem: (item: any, sectionId: number) => void;
    // -------------------------------------------------
    onScheduleOnline?: (sectionId: number) => void;
    onSubTabChange?: (subTab: 'recorded' | 'online') => void; // Parent sync callback
}

export const GenericContentTab = ({
    title, type, data, role,
    onAddSection, onAddItem, onEditItem, onDeleteItem, // New callbacks included
    onScheduleOnline, onSubTabChange
}: Props) => {
    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');

    // FIX: Jab bhi internal tab change ho, parent ko update karein
    const handleTabChange = (tab: 'recorded' | 'online') => {
        setActiveLectureSubTab(tab);
        if (onSubTabChange) onSubTabChange(tab);
    };

    // Updated renderItems to handle Edit/Delete signals
    const renderItems = (items: any[], sectionId: number, filterType?: 'recorded' | 'online') => {
        const filtered = filterType
            ? items.filter(item => item.lectureType === filterType)
            : items;

        if (filtered.length === 0) return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <LayoutGrid size={32} className="mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest italic">No {filterType || ''} items found</p>
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
                // --- CONNECTED BUTTONS TO PARENT CALLBACKS ---
                onEdit={() => onEditItem(item, sectionId)}
                onDelete={() => onDeleteItem(item, sectionId)}
            // ---------------------------------------------
            />
        ));
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-black capitalize text-[#0F172A] tracking-tight">{title}</h2>
                    <p className="text-slate-500 text-sm font-medium">Manage your course content efficiently</p>
                </div>
                {role !== 'student' && (
                    <button
                        onClick={onAddSection}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-2xl font-bold text-sm hover:bg-black shadow-xl transition-all active:scale-95"
                    >
                        <FolderPlus size={20} />
                        <span>New Section</span>
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
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleTabChange('recorded')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeLectureSubTab === 'recorded'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                                : 'text-slate-400 hover:bg-gray-100'
                                                }`}
                                        >
                                            <MonitorPlay size={14} /> Recorded
                                        </button>
                                        <button
                                            onClick={() => handleTabChange('online')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeLectureSubTab === 'online'
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-100'
                                                : 'text-slate-400 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Video size={14} /> Online
                                        </button>
                                    </div>

                                    {activeLectureSubTab === 'online' && (role === 'admin' || role === 'teacher') && (
                                        <button
                                            onClick={() => onAddItem(section.id)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold text-[10px] uppercase hover:bg-purple-100 transition-all border border-purple-100"
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
                <div className="text-center py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <Layers size={50} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold text-lg">No Content Found</p>
                </div>
            )}
        </div>
    );
};