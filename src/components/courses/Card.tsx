'use client';
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
  totalLessons: number;
  imageUrl: string;
  basePath: string;
  showProgress?: boolean;
}

const Card: React.FC<CourseCardProps> = ({
  id, title, author, description, rating, progress = 0,
  totalLessons, imageUrl, basePath, showProgress = true
}) => {

  console.log('title',title);
  return (
    <Link href={`${basePath}/${id}`} className="block h-full">
      {/* Card Container: bg-card-bg for premium layered look */}
      <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-border-subtle bg-card-bg transition-all duration-500 group">

        <div className="relative w-full h-48">
          {/* FIX: alt property mein fallback lagaya hai taaki error khatam ho jaye */}
          <Image 
            src={imageUrl || '/blankcover.jpg'} 
            alt={title || "Academy Course Material"} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-700" 
            unoptimized 
          />
          <div className="absolute top-3 left-3 bg-card-bg/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl border border-border-subtle">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-black text-text-main">{rating || 0}</span>
          </div>
        </div>

        <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
          <p className="text-accent-blue text-[9px] font-black uppercase tracking-[0.2em] mb-2">{author}</p>
          <h3 className="text-lg font-black text-text-main line-clamp-2 mb-2 group-hover:text-accent-blue transition-colors h-14 uppercase tracking-tight leading-tight">
            {title || "Untitled Course"}
          </h3>
          <p className="text-text-muted text-[11px] line-clamp-2 mb-6 flex-grow font-medium leading-relaxed">
            {description}
          </p>

          {/* Progress Section: Uses app-bg for contrast */}
          {showProgress && (
            <div className="mb-6">
              <div className="flex justify-between text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">
                <span>Progress Status</span>
                <span className="text-accent-blue">{progress}%</span>
              </div>
              <div className="w-full bg-app-bg border border-border-subtle rounded-full h-2 shadow-inner">
                <div 
                    className="bg-accent-blue h-full rounded-full transition-all duration-700 shadow-lg shadow-accent-blue/30" 
                    style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] font-black text-text-muted border-t border-border-subtle pt-5 uppercase tracking-widest">
            <BookOpen size={14} className="text-accent-blue" />
            <span>{totalLessons || 0} Terminal Lessons</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;