// components/AssignmentsContent.tsx

import React from 'react';
import { Assignment } from '@/data/courses'; // Type import karein

interface AssignmentsProps {
  assignments: Assignment[];
}

const AssignmentsContent: React.FC<AssignmentsProps> = ({ assignments }) => {
  return (
    <div className="space-y-6">
      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <div key={assignment.id} className="border border-gray-200 rounded-lg p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
              <span className="text-sm text-red-600 flex-shrink-0">Last Date of Submission: {assignment.lastDate}</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1 mb-6">
              <p><span className="font-medium text-gray-800">Objective:</span> {assignment.objective}</p>
              <p><span className="font-medium text-gray-800">Deliverable:</span> {assignment.deliverable}</p>
              <p><span className="font-medium text-gray-800">Format:</span> {assignment.format}</p>
            </div>
            <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Submit Assignment
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No assignments for this course.</p>
      )}
    </div>
  );
};

export default AssignmentsContent;