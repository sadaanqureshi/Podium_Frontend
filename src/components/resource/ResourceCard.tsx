import React from 'react';
import { Resource } from '@/data/courses'; // Data se type import karein

// 1. Props ke liye naya Interface
interface ResourceCardProps {
  resource: Resource;
  courseTitle: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, courseTitle }) => {
  return (
    // Poora card border ke saath
    <div className="border border-gray-200 rounded-lg p-5 md:p-6">
      {/* Course ka naam (chota sa) */}
      <p className="text-sm font-medium text-gray-500 mb-2">
        Course: {courseTitle}
      </p>
      
      {/* Resource Details */}
      <div>
        {/* Title aur Date (Responsive) */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
          <span className="text-sm text-gray-500 flex-shrink-0">
            Upload Date: {resource.uploadDate}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          {resource.description}
        </p>
        
        {/* View Button */}
        <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          View
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;