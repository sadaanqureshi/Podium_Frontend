'use client';
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CourseFilterDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    teachers: string[];
    types: string[]; // Agar aapke paas categories hain
    filters: { teacher: string; type: string };
    setFilters: React.Dispatch<React.SetStateAction<{ teacher: string; type: string }>>;
    onClear: () => void;
}

const CourseFilterDropdown: React.FC<CourseFilterDropdownProps> = ({
    isOpen, onClose, teachers, types, filters, setFilters, onClear
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Bahar click karne par modal band karne ka logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-14 mt-2 w-72 bg-card-bg border border-border-subtle rounded-2xl shadow-2xl z-50 p-5"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black uppercase text-text-main tracking-widest">Filters</h3>
                        <button onClick={onClose} className="text-text-muted hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Teacher Filter */}
                    <div className="mb-4">
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-2 tracking-wider">Instructor</label>
                        <select
                            value={filters.teacher}
                            onChange={(e) => setFilters({ ...filters, teacher: e.target.value })}
                            className="w-full p-2.5 bg-app-bg border border-border-subtle rounded-xl text-xs font-bold text-text-main outline-none focus:border-accent-blue cursor-pointer"
                        >
                            <option value="">All Instructors</option>
                            {teachers.map((teacher, idx) => (
                                <option key={idx} value={teacher}>{teacher}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type/Category Filter */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-2 tracking-wider">Course Type</label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="w-full p-2.5 bg-app-bg border border-border-subtle rounded-xl text-xs font-bold text-text-main outline-none focus:border-accent-blue cursor-pointer"
                        >
                            <option value="">All Types</option>
                            {/* Hum dynamically unique types map karenge */}
                            {types.map((type, idx) => (
                                <option key={idx} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={onClear}
                            className="flex-1 py-2 text-[10px] font-black uppercase text-text-muted hover:bg-border-subtle rounded-xl transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 bg-accent-blue text-white text-[10px] font-black uppercase rounded-xl shadow-lg active:scale-95 transition-all"
                        >
                            Apply
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CourseFilterDropdown;