import React from 'react';
import { CheckCircle, Edit, Trash2, Users, Eye } from 'lucide-react';
import { Quiz } from '@/data/courses';

interface QuizCardProps {
  quiz: Quiz;
  courseTitle: string;
  role: 'student' | 'teacher' | 'admin';
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, courseTitle, role }) => {
  const isStaff = role === 'teacher' || role === 'admin';

  return (
    <div className="border border-gray-200 rounded-lg p-5 md:p-6 bg-white shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          {courseTitle}
        </p>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          quiz.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {quiz.status}
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
        {!isStaff && quiz.status === 'pending' && (
          <span className="text-sm text-red-600 font-medium">
            Due: {quiz.lastDate || 'No deadline'}
          </span>
        )}
      </div>

      {isStaff ? (
        /* --- TEACHER / ADMIN VIEW --- */
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-5">
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>45 Submissions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} />
              <span>Avg: 78%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex-1 md:flex-none px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <Edit size={14} /> Edit
            </button>
            <button className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Eye size={14} /> Results
            </button>
            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-auto transition-colors" title="Delete Quiz">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* --- STUDENT VIEW --- */
        <div className="mt-2">
          {quiz.status === 'pending' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2 italic">
                "{quiz.sampleQuestion || "No sample question available."}"
              </p>
              <button className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100">
                Take Quiz
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-3 rounded-lg">
              <span className="text-sm font-bold text-gray-700">
                Your Score: <span className="text-green-600">{quiz.marksScored || 'Graded'}</span>
              </span>
              <button className="w-full md:w-auto px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all">
                View Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizCard;