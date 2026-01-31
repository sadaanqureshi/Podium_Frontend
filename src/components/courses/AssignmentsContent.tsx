// components/AssignmentsContent.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Assignment } from '@/data/courses';

interface AssignmentsProps {
  assignments: Assignment[];
}

const AssignmentsContent: React.FC<AssignmentsProps> = ({ assignments }) => {
  const [showSkeleton, setShowSkeleton] = useState(assignments.length === 0);

  useEffect(() => {
    if (assignments.length === 0) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [assignments.length]);

  if (assignments.length === 0) {
    if (showSkeleton) {
      return (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5 md:p-6 animate-pulse">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                <div className="h-4 bg-gray-100 rounded w-4/6"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
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
      {assignments.map((assignment, index) => (
        <div key={assignment.id} className="border border-gray-200 rounded-lg p-5 md:p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Assignment {index + 1}: {assignment.title}
            </h3>
            <span className="text-sm text-red-600 flex-shrink-0">
              Last Date of Submission: {assignment.lastDate}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1 mb-6">
            <p><span className="font-medium text-gray-800">Objective:</span> {assignment.objective}</p>
            <p><span className="font-medium text-gray-800">Deliverable:</span> {assignment.deliverable}</p>
            <p><span className="font-medium text-gray-800">Format:</span> {assignment.format}</p>
          </div>
          <Link 
            href={`/assignment/${assignment.id}`}
            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Assignment
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AssignmentsContent;