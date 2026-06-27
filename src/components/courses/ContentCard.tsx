// 'use client';
// import { Edit, Trash2, PlayCircle, FileText, BookOpen, Download, ArrowRight } from 'lucide-react';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';

// interface ContentCardProps {
//     id: number;
//     title: string;
//     subtitle?: string;
//     type: 'quiz' | 'assignment' | 'resource' | 'lecture';
//     role: 'admin' | 'teacher' | 'student';
//     onEdit?: () => void;
//     onDelete?: () => void;
//     sectionId?: number;
// }

// const iconMap = {
//     quiz: <FileText size={20} className="text-amber-500" />,
//     assignment: <BookOpen size={20} className="text-purple-500" />,
//     resource: <Download size={20} className="text-accent-blue" />,
//     lecture: <PlayCircle size={20} className="text-emerald-500" />
// };

// const ContentCard = ({ id, title, subtitle, type, role, onEdit, onDelete, sectionId }: ContentCardProps) => {
//     const params = useParams();
    
//     // Course ID extraction (Dono cases handle kar liye hain)
//     const courseId = params.courseId || params.id || params.courseid;

//     // # 1. DYNAMIC PATHING: Har role ke liye alag base path
//     const basePath = role === 'student' 
//         ? '/student/enrolled-courses' // Student ke liye ye path ensure kiya hai
//         : role === 'admin' 
//             ? '/admin/courses' 
//             : '/teacher/assigned-courses';

//     // Detail URL construction
//     const detailUrl = `${basePath}/${courseId}/section/${sectionId}/${type}/${id}`;

//     return (
//         <div className="flex items-center justify-between p-4 bg-card-bg rounded-2xl border border-border-subtle hover:border-accent-blue/30 hover:bg-sidebar-to/10 group shadow-sm">
            
//             {/* Main Content Area: Link covers Icon and Title */}
//             <Link href={detailUrl} className="flex items-center gap-4 flex-1">
//                 <div className="w-12 h-12 rounded-xl bg-app-bg border border-border-subtle flex items-center justify-center group-hover:scale-105 shadow-inner">
//                     {iconMap[type]}
//                 </div>
//                 <div>
//                     <h4 className="font-black text-sm text-text-main group-hover:text-accent-blue uppercase tracking-tight">
//                         {title}
//                     </h4>
//                     {subtitle && (
//                         <p className="text-[10px] text-text-muted mt-0.5 font-bold uppercase tracking-wider">
//                             {subtitle}
//                         </p>
//                     )}
//                 </div>
//             </Link>

//             <div className="flex items-center gap-2">
//                 {/* # 2. TEACHER/ADMIN ONLY: Edit aur Delete sirf unko dikhenge */}
//                 {(role === 'admin' || role === 'teacher') && (
//                     <div className="flex items-center gap-1">
//                         <button 
//                             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(); }} 
//                             className="p-2 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
//                         >
//                             <Edit size={16} />
//                         </button>
//                         <button 
//                             onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(); }} 
//                             className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
//                         >
//                             <Trash2 size={16} />
//                         </button>
//                     </div>
//                 )}

//                 {/* # 3. SHARED VIEW BUTTON: Student aur Teacher dono ke liye button common hai */}
//                 <Link 
//                     href={detailUrl} 
//                     className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 text-accent-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-all border border-accent-blue/20"
//                 >
//                     {role === 'student' ? 'Access' : 'View'} <ArrowRight size={14} />
//                 </Link>
//             </div>
//         </div>
//     );
// };

// export default ContentCard;

'use client';
import { Edit, Trash2, PlayCircle, FileText, BookOpen, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ContentCardProps {
    id: number;
    title: string;
    subtitle?: string;
    type: 'quiz' | 'assignment' | 'resource' | 'lecture';
    role: 'admin' | 'teacher' | 'student';
    onEdit?: () => void;
    onDelete?: () => void;
    sectionId?: number;
}

// Icons se boxy background hata kar clean rakha hai, color hover par pop hoga
const iconMap = {
    quiz: <FileText size={18} className="text-text-muted group-hover:text-amber-500 transition-colors" />,
    assignment: <BookOpen size={18} className="text-text-muted group-hover:text-purple-500 transition-colors" />,
    resource: <Download size={18} className="text-text-muted group-hover:text-accent-blue transition-colors" />,
    lecture: <PlayCircle size={18} className="text-text-muted group-hover:text-emerald-500 transition-colors" />
};

const ContentCard = ({ id, title, subtitle, type, role, onEdit, onDelete, sectionId }: ContentCardProps) => {
    const params = useParams();
    
    // Course ID extraction
    const courseId = params.courseId || params.id || params.courseid;

    // DYNAMIC PATHING
    const basePath = role === 'student' 
        ? '/student/enrolled-courses' 
        : role === 'admin' 
            ? '/admin/courses' 
            : '/teacher/assigned-courses';

    const detailUrl = `${basePath}/${courseId}/section/${sectionId}/${type}/${id}`;

    return (
        // Boxy design removed. Using subtle border-bottom and hover background
        <div className="group flex items-center justify-between py-3 px-3 -mx-3 border-b border-border-subtle/40 last:border-0 hover:bg-border-subtle/20 rounded-xl transition-colors cursor-pointer">
            
            {/* Main Content Area */}
            <Link href={detailUrl} className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                <div className="flex-shrink-0 mt-0.5">
                    {iconMap[type]}
                </div>
                <div className="flex flex-col truncate">
                    <h4 className="font-bold text-[13px] text-text-main group-hover:text-accent-blue truncate transition-colors">
                        {title}
                    </h4>
                    {subtitle && (
                        <p className="text-[10px] text-text-muted font-medium truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </Link>

            {/* Actions Area */}
            <div className="flex items-center gap-4 flex-shrink-0">
                
                {/* Edit & Delete: Clean icons that appear smoothly on hover (desktop) or stay subtle (mobile) */}
                {(role === 'admin' || role === 'teacher') && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(); }} 
                            className="p-1.5 text-text-muted hover:text-text-main transition-colors"
                        >
                            <Edit size={14} />
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(); }} 
                            className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}

                {/* Shared View Link: Minimalist text and arrow instead of a bulky button */}
                <Link 
                    href={detailUrl} 
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-accent-blue transition-colors"
                >
                    <span className="hidden sm:inline-block">
                        {role === 'student' ? 'Access' : 'View'}
                    </span>
                    <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default ContentCard;