// components/CourseAccordion.tsx
'use client';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  lectures: number;
  time: string;
  children: React.ReactNode; // Content ko 'children' ke taur par lein
  isOpen: boolean;
  setIsOpen: () => void;
}

const CourseAccordion: React.FC<AccordionProps> = ({ 
  title, 
  lectures, 
  time, 
  children, 
  isOpen, 
  setIsOpen 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Header */}
      <button
        onClick={setIsOpen} // Parent se state control karein
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            size={20}
            className={`transform transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 flex-shrink-0">
          <span>{lectures} lectures</span>
          <span>{time}</span>
        </div>
      </button>
      
      {/* Content (Jo slide hota hai) */}
      {isOpen && (
        <div className="px-4 pb-4 pl-12 border-t border-gray-100">
          {children} {/* Yahaan content render hoga */}
        </div>
      )}
    </div>
  );
};

export default CourseAccordion;