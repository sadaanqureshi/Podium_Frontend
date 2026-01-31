// components/ResourcesContent.tsx

import React, { useState, useEffect } from 'react';
import { Resource } from '@/data/courses'; // Type import karein

interface ResourcesProps {
  resources: Resource[];
}

const ResourcesContent: React.FC<ResourcesProps> = ({ resources }) => {
  const [showSkeleton, setShowSkeleton] = useState(resources.length === 0);

  useEffect(() => {
    if (resources.length === 0) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [resources.length]);

  if (resources.length === 0) {
    if (showSkeleton) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4 animate-pulse"
            >
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
              </div>
              <div className="text-left md:text-right flex-shrink-0">
                <div className="h-3 bg-gray-100 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
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
    <div className="space-y-4">
      {resources.map((res) => (
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
      ))}
    </div>
  );
};

export default ResourcesContent;