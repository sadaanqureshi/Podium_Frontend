// components/CourseTabs.tsx

'use client';

import React from 'react';

// Type define karein props ke liye
interface CourseTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void; // Function jo state badlega
}

const CourseTabs: React.FC<CourseTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'lectures', label: 'Lectures' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'resources', label: 'Resources and Notes' },
  ];

  // Active tab ke liye common styles
  const activeClass = 'border-b-2 border-gray-900 text-gray-900 font-semibold';
  // Inactive tab ke liye common styles
  const inactiveClass = 'text-gray-500 hover:text-gray-700';

  return (
    <nav className="border-b border-gray-200 overflow-x-auto">
      <ul className="flex items-center gap-8 min-w-max">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              // Condition ke hisaab se style apply karein
              className={`py-4 px-1 text-sm ${
                activeTab === tab.id ? activeClass : inactiveClass
              }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CourseTabs;