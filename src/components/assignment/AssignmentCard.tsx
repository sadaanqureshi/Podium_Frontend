import React from 'react';
import { Assignment } from '@/data/courses'; // Data se type import karein

// 1. Props ke liye naya Interface
interface AssignmentCardProps {
  assignment: Assignment;
  courseTitle: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, courseTitle }) => {
  return (
    // Poora card border ke saath
    <div className="border border-gray-200 rounded-lg p-5 md:p-6">
      {/* Course ka naam (chota sa) */}
      <p className="text-sm font-medium text-gray-500 mb-2">
        Course: {courseTitle}
      </p>
      
      {/* Assignment Details */}
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
          <span className="text-sm text-red-600 flex-shrink-0">
            Last Date of Submission: {assignment.lastDate}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1 mb-6">
          <p><span className="font-medium text-gray-800">Objective:</span> {assignment.objective}</p>
          <p><span className="font-medium text-gray-800">Deliverable:</span> {assignment.deliverable}</p>
          <p><span className="font-medium text-gray-800">Format:</span> {assignment.format}</p>
        </div>
        
        <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          View Assignment
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;