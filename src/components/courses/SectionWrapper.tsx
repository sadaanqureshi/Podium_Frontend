// src/components/courses/SectionWrapper.tsx
import React from 'react';
import { Plus, ChevronDown, Folder } from 'lucide-react';

interface SectionProps {
    sectionName: string;
    children: React.ReactNode;
    role: 'admin' | 'teacher' | 'student';
    type: string;
    onAddItem: () => void; // Is section mein item add karne ke liye
}

export const SectionWrapper = ({ sectionName, children, role, type, onAddItem }: SectionProps) => {
    return (
        <div className="mb-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 bg-white border-b border-gray-50 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm">
                        <Folder size={20} />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0F172A] tracking-tight">{sectionName}</h3>
                </div>

                {role !== 'student' && (
                    <button 
                        onClick={onAddItem}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add {type} to Section</span>
                    </button>
                )}
            </div>

            {/* Section Content (Items List) */}
            <div className="p-4 space-y-3">
                {children}
            </div>
        </div>
    );
};