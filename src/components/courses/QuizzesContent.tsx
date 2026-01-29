// components/QuizzesContent.tsx

import React from 'react';
// import { CheckCircle } from 'lucide-react';
import { Quiz } from '@/data/courses'; // Type import karein

interface QuizzesProps {
  quizzes: Quiz[];
}

const QuizzesContent: React.FC<QuizzesProps> = ({ quizzes }) => {
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