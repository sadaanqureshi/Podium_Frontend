import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

export const CourseInfoCard = ({ data }: { data: any }) => (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-1.5 text-sm font-bold">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="text-gray-900">{data?.averageRating || "4.7"}</span>
                <span className="text-gray-400 font-medium">({data?.ratingCount || "2,345"} ratings)</span>
            </div>
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A] mb-1">{data?.courseName || "Loading..."}</h1>
                <p className="text-sm text-gray-500 font-medium">
                    Created by: <span className="text-blue-600 cursor-pointer hover:underline">{data?.teacher.firstName + data?.teacher.lastName || "Expert Instructor"}</span>
                </p>
            </div>
            <div className="pt-2">
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">Introduction</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{data?.shortDescription || "Learn the fundamentals with expert-led curriculum and hands-on projects."}</p>
            </div>
        </div>
        <div className="relative w-full md:w-64 h-44 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border-4 border-white bg-gray-50">
            <Image src={data?.coverImg || "/blankcover.jpg"} alt="Course" fill className="object-cover" unoptimized />
        </div>
    </div>
);