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

const iconMap = {
    quiz: <FileText size={20} className="text-amber-500" />,
    assignment: <BookOpen size={20} className="text-purple-500" />,
    resource: <Download size={20} className="text-blue-500" />,
    lecture: <PlayCircle size={20} className="text-green-500" />
};

const ContentCard = ({ id, title, subtitle, type, role, onEdit, onDelete, sectionId }: ContentCardProps) => {
    const params = useParams();
    const courseId = params.courseId || params.id;
    // console.log("Section ID:", params);
    // const sectionId = params.sectionId;

    const basePath = role === 'student' ? '/student/my-courses' : role === 'admin' ? '/admin/courses' : '/teacher/assigned-courses';
    // const detailUrl = `${basePath}/${courseId}/${type}/${id}`;
    // const detailUrl = `${basePath}/${courseId}/${type}/${sectionId}/${id}`;
    // const detailUrl = `${basePath}/${courseId}/section/${sectionId}/${type}/${id}`;
    const detailUrl = `${basePath}/${courseId}/section/${sectionId}/${type}/${id}`;

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all group">
            <Link href={detailUrl} className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                    {iconMap[type]}
                </div>
                <div>
                    <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">{title}</h4>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
                </div>
            </Link>

            <div className="flex items-center gap-2">
                {(role === 'admin' || role === 'teacher') && (
                    <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                )}
                <Link href={detailUrl} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                    View <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
};
export default ContentCard;