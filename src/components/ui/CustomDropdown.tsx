'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
    label: React.ReactNode; 
    value: string | number;
}

interface CustomDropdownProps {
    options: DropdownOption[];
    value: string | number | "";
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;        
    menuClassName?: string;    
    disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    menuClassName = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // 👉 Position aur Width track karne ke liye
    const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        setMounted(true); // SSR Hydration error se bachne ke liye
    }, []);

    // 👉 Button ke hisaab se menu ki position set karna
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                // Menu ki width kam se kam 260px hogi, ya phir button ke barabar (agar button bara hai tou)
                const menuWidth = Math.max(260, rect.width);
                
                setMenuStyles({
                    position: 'fixed', // Portal ke sath hamesha fixed kaam ata hai
                    top: `${rect.bottom + 6}px`, // Button ke exactly neechay
                    left: `${rect.left}px`,
                    width: `${menuWidth}px`,
                    zIndex: 999999, // Sab modals se ooper
                });
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // 👉 Click Outside ya Modal Scroll karne par Dropdown close karna
    useEffect(() => {
        const handleInteract = (event: Event) => {
            const target = event.target as Node;
            // Agar button par ya menu par click ho tou band nahi karna
            if (dropdownRef.current?.contains(target) || menuRef.current?.contains(target)) {
                return;
            }
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleInteract);
            // Modal ke andar scroll karne se bhi menu band hojaye
            window.addEventListener('scroll', handleInteract, true); 
        }
        return () => {
            document.removeEventListener('mousedown', handleInteract);
            window.removeEventListener('scroll', handleInteract, true);
        };
    }, [isOpen]);

    const handleSelect = (selectedValue: string | number) => {
        onChange(selectedValue);
        setIsOpen(false);
    };

    // 👉 Portal ke andar render hone wala Menu
    const renderMenu = () => (
        <div 
            ref={menuRef}
            style={menuStyles}
            className={`bg-card-bg border border-border-subtle rounded-xl shadow-2xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${menuClassName}`}
        >
            <ul className="max-h-60 overflow-y-auto custom-scrollbar py-1.5">
                {options.length > 0 ? (
                    options.map((option, index) => {
                        const isSelected = option.value === value;
                        return (
                            <li
                                key={index}
                                onClick={() => handleSelect(option.value)}
                                className={`flex items-center justify-between px-4 py-3 text-[13px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                                    isSelected 
                                        ? 'bg-accent-blue/10 text-accent-blue font-bold' 
                                        : 'text-text-main hover:bg-app-bg hover:text-accent-blue'
                                }`}
                            >
                                <span className="pr-4">{option.label}</span>
                                {isSelected && <Check size={14} className="shrink-0 ml-auto" />}
                            </li>
                        );
                    })
                ) : (
                    <li className="px-4 py-3 text-sm text-text-muted font-medium text-center">
                        No options available
                    </li>
                )}
            </ul>
        </div>
    );

    return (
        <div className="relative w-full h-full flex items-center" ref={dropdownRef}>
            {/* 👉 TRIGGER BUTTON */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full h-full min-h-[46px] flex items-center justify-between px-3 md:px-4 bg-app-bg text-left text-sm font-medium transition-all outline-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border ${
                    isOpen ? 'border-accent-blue ring-1 ring-accent-blue/30' : 'border-transparent hover:bg-border-subtle/50'
                } ${className}`}
            >
                <span className={`block truncate ${!selectedOption ? 'text-text-muted' : 'text-text-main'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    size={16} 
                    className={`text-text-muted transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-accent-blue' : ''}`} 
                />
            </button>

            {/* 👉 PORTAL INJECTION (Bahar Render Hoga Modal ke) */}
            {mounted && isOpen && createPortal(renderMenu(), document.body)}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.4);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default CustomDropdown;