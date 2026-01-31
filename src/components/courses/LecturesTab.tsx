import { Video, Plus, PlayCircle } from 'lucide-react';
// Import ContentCard here
import ContentCard from './courses/ContentCard';

export const LecturesTab = ({ data, onAdd, role }: { data: any[], onAdd: () => void, role: string }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Course Lectures ({data.length})</h2>
                {role !== 'student' && (
                    <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        <Plus size={18} /> Add Lecture
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {data.map((lecture: any, idx: number) => (
                    <ContentCard
                        key={lecture.id}
                        title={lecture.title}
                        subtitle="15:30 Mins • Ready to play"
                        type="lecture"
                        role={role as any}
                        onAction={() => console.log("Play Video")}
                    />
                ))}
            </div>
        </div>
    );
};