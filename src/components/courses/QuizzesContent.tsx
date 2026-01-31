// components/QuizzesContent.tsx

import React, { useState, useEffect } from 'react';
// import { CheckCircle } from 'lucide-react';
import { Quiz } from '@/data/courses'; // Type import karein

interface QuizzesProps {
  quizzes: Quiz[];
}

const QuizzesContent: React.FC<QuizzesProps> = ({ quizzes }) => {
  const [showSkeleton, setShowSkeleton] = useState(quizzes.length === 0);

  useEffect(() => {
    if (quizzes.length === 0) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [quizzes.length]);

  if (quizzes.length === 0) {
    if (showSkeleton) {
      return (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5 md:p-6 animate-pulse">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">Not yet added, not your fault.</p>
        <p className="text-gray-400 text-base">Relax a bit, have fun. Enjoy ;)</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="border border-gray-200 rounded-lg p-5 md:p-6">
          
          {quiz.status === 'pending' ? (
            // PENDING QUIZ
            <>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                <span className="text-sm text-red-600 flex-shrink-0">{quiz.lastDate ? `Last Date to Attempt: ${quiz.lastDate}` : ''}</span>
              </div>
              {quiz.sampleQuestion && (
                <div className="text-sm text-gray-800 space-y-2 ml-4 mb-6">
                  <p className="text-gray-600 mb-2">Sample Question:</p>
                  <p>{quiz.sampleQuestion}</p>
                </div>
              )}
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Take Quiz
              </button>
            </>
          ) : (
            // COMPLETED QUIZ
            <>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                <span className="text-sm text-gray-500 flex-shrink-0">{quiz.attemptedDate ? `Attempted Date: ${quiz.attemptedDate}` : ''}</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Marks Scored: {quiz.marksScored || 'N/A'}
              </p>
              <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                View Details
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizzesContent;