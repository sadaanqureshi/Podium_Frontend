'use client';
import React from 'react';
import { Plus, Folder } from 'lucide-react';

interface SectionProps {
    sectionName: string;
    children: React.ReactNode;
    role: 'admin' | 'teacher' | 'student';
    type: string;
    onAddItem: () => void;
}

export const SectionWrapper = ({ sectionName, children, role, type, onAddItem }: SectionProps) => {
    return (
        // bg-app-bg/50 aur border-border-subtle automatic theme sync handle karenge
        <div className="mb-8 bg-app-bg/50 rounded-[2rem] border border-border-subtle overflow-hidden shadow-sm transition-all hover:shadow-md">
            
            {/* Section Header: bg-card-bg use kar raha hai */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 bg-card-bg border-b border-border-subtle gap-4 transition-colors">
                <div className="flex items-center gap-3">
                    {/* Folder Icon: accent-blue/10 for premium glow effect */}
                    <div className="p-2.5 bg-accent-blue/10 rounded-xl text-accent-blue shadow-sm">
                        <Folder size={20} />
                    </div>
                    <h3 className="text-lg font-extrabold text-text-main tracking-tight uppercase">{sectionName}</h3>
                </div>

                {role !== 'student' && (
                    <button
                        onClick={onAddItem}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-hover-blue transition-all active:scale-95 shadow-xl shadow-accent-blue/10"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add {type}</span>
                    </button>
                )}
            </div>

            {/* Section Content Wrapper */}
            <div className="p-4 space-y-3">
                {children}
            </div>
        </div>
    );
};