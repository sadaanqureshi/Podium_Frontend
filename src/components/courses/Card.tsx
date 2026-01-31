import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, BookOpen } from 'lucide-react';

interface CourseCardProps {
  id: number;
  title: string;
  author: string;
  description: string;
  rating: number;
  progress?: number;
  currentLesson: number;
  totalLessons: number;
  imageUrl: string;
  basePath: string;
  showProgress?: boolean; // Naya prop logic handle karne ke liye
}

const Card: React.FC<CourseCardProps> = ({
  id, title, author, description, rating, progress = 0,
  currentLesson, totalLessons, imageUrl, basePath, showProgress = true
}) => {
  return (
    <Link href={`${basePath}/${id}`} className="block h-full">
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 bg-white transition-all duration-300 group">

        <div className="relative w-full h-44">
          <Image src={imageUrl || '/blankcover.jpg'} alt={title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold">{rating || 0}</span>
          </div>
        </div>

        <div className="p-5 flex flex-col h-[calc(100%-11rem)]">
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">{author}</p>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors h-14">{title}</h3>
          <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow">{description}</p>

          {/* Teacher ke liye yeh section hide ho jayega */}
          {showProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 border-t border-gray-50 pt-4">
            <BookOpen size={14} className="text-blue-500" />
            <span>{totalLessons || 0} Total Lessons</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;