'use client';
import React, { useState } from 'react';
import { Layers, MonitorPlay, Video, LayoutGrid } from 'lucide-react';
import ContentCard from '../courses/ContentCard';
import { SectionWrapper } from '../courses/SectionWrapper';

export const StudentGenericContentTab = ({
    title, type, data, role,
    onSubTabChange
}: any) => {
    const [activeLectureSubTab, setActiveLectureSubTab] = useState<'recorded' | 'online'>('recorded');
    const [onAddItem, setOnAddItem] = useState<any>(null);

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
                <p className="text-xs font-bold uppercase tracking-widest">No {filterType || ''} {type}s available</p>
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
                        ? `Total Marks: ${item.totalMarks}`
                        : (item.lectureType === 'online'
                            ? `Scheduled: ${item.liveStart ? new Date(item.liveStart).toLocaleString('en-GB') : 'TBD'}`
                            : 'Recorded Video')
                }
                type={type}
                role={role}
            />
        ));
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-2xl font-black capitalize text-text-main tracking-tight">{title} Explorer</h2>
                    <p className="text-text-muted text-sm font-medium">Access your learning materials and track your progress.</p>
                </div>
            </div>

            {data.length > 0 ? (
                data.map((section: any) => (
                    <SectionWrapper
                        key={section.id}
                        sectionName={section.sectionName}
                        role={role}
                        type={type}
                        onAddItem={onAddItem}
                    >
                        {type === 'lecture' ? (
                            <div className="space-y-6">
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
                                            <Video size={14} /> Live Sessions
                                        </button>
                                    </div>
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
                <div className="text-center py-24 bg-card-bg rounded-[3rem] border-2 border-dashed border-border-subtle">
                    <Layers size={50} className="mx-auto text-text-muted/20 mb-4" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-sm">No Content Released Yet</p>
                </div>
            )}
        </div>
    );
};

export default StudentGenericContentTab;