// components/ResourcesContent.tsx

import React from 'react';
import { Resource } from '@/data/courses'; // Type import karein

interface ResourcesProps {
  resources: Resource[];
}

const ResourcesContent: React.FC<ResourcesProps> = ({ resources }) => {
  return (
    <div className="space-y-4">
      {resources.length > 0 ? (
        resources.map((res) => (
          <div
            key={res.id}
            className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{res.title}</h3>
              <p className="text-sm text-gray-600">{res.description}</p>
            </div>
            <div className="text-left md:text-right flex-shrink-0">
              <span className="text-xs text-gray-500 block mb-2">Upload Date: {res.uploadDate}</span>
              <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                View
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No resources available for this course.</p>
      )}
    </div>
  );
};

export default ResourcesContent;