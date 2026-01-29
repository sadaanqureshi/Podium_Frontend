// components/LecturesContent.tsx

'use client'; 

import React, { useState } from 'react';
import Image from 'next/image';
import { Square, CheckSquare, PlayCircle } from 'lucide-react';
// Apni 'data/courses.ts' se types import karein
import { RecordedLecture, OnlineClass } from '@/data/courses'; 

// Props ke liye interface
interface LecturesProps {
  recordedLectures: RecordedLecture[];
  onlineClasses: OnlineClass[];
  videoPreviewUrl: string; // Dynamic image ke liye
}

// Online Classes ke liye alag component
const OnlineClassesContent: React.FC<{ classes: OnlineClass[] }> = ({ classes }) => {
  return (
    <div className="space-y-4">
      {classes.map((session) => (
        <div key={session.id} className="border border-gray-200 rounded-lg p-5">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
            <span className="text-sm text-gray-600 flex-shrink-0">{session.schedule}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{session.description}</p>
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Join Online Class
          </button>
        </div>
      ))}
    </div>
  );
};

// Recorded Lectures ke liye alag component
const RecordedLecturesContent: React.FC<{ lectures: RecordedLecture[], videoPreviewUrl: string }> = ({ lectures: initialLectures, videoPreviewUrl }) => {
  
  const [lectures, setLectures] = useState(initialLectures.map(lec => ({ ...lec })));

  const handleToggle = (id: number) => {
    setLectures(prevLectures =>
      prevLectures.map(lec =>
        lec.id === id ? { ...lec, completed: !lec.completed } : lec
      )
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Side: Lecture List (Interactive) */}
      <div className="lg:col-span-1 border border-gray-200 rounded-lg p-4 h-fit">
        <ul className="space-y-3">
          {lectures.map((lecture) => (
            <li
              key={lecture.id}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleToggle(lecture.id)}
            >
              {lecture.completed ? (
                <CheckSquare size={20} className="text-blue-600 flex-shrink-0" />
              ) : (
                <Square size={20} className="text-gray-400 flex-shrink-0" />
              )}
              <span className={`text-sm ${lecture.completed ? 'text-gray-800 line-through' : 'text-gray-600'}`}>
                {lecture.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side: Video Player (Dynamic Image) */}
      <div className="lg:col-span-2 relative w-full h-[250px] md:h-[450px] rounded-lg overflow-hidden bg-black">
        <Image 
          src={videoPreviewUrl} // <-- DYNAMIC
          alt="Lecture Video" 
          layout="fill" 
          objectFit="cover" 
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <PlayCircle size={80} className="text-white/80" fill="white" />
        </div>
      </div>
    </div>
  );
};

// Main Component jo dono ko control karega
const LecturesContent: React.FC<LecturesProps> = ({ recordedLectures, onlineClasses, videoPreviewUrl }) => {
  const [activeSubTab, setActiveSubTab] = useState<'recorded' | 'online'>('recorded');

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveSubTab('recorded')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeSubTab === 'recorded'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Recorded Lectures
        </button>
        <button
          onClick={() => setActiveSubTab('online')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeSubTab === 'online'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Online Classes
        </button>
      </div>

      {/* Conditional Rendering */}
      <div>
        {activeSubTab === 'recorded' ? (
          <RecordedLecturesContent lectures={recordedLectures} videoPreviewUrl={videoPreviewUrl} />
        ) : (
          <OnlineClassesContent classes={onlineClasses} />
        )}
      </div>
    </div>
  );
};

export default LecturesContent;