// components/PriceCardList.tsx

import React from 'react';
import PriceCard from '@/components/courses/PriceCard';
import { Course } from '@/data/courses'; // Data ki type import karein

// 1. Define karein ke isko 'courses' ka array chahiye
interface PriceCardListProps {
  courses: Course[];
}

// 2. Yeh ek "Dumb" component hai (koi state nahi)
const PriceCardList: React.FC<PriceCardListProps> = ({ courses }) => {
  return (
    // 3. Grid layout ki classes yahaan daalein
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      {/* 4. Props se milne wale 'courses' array ko map karein */}
      {courses.map((course) => (
        <PriceCard
          key={course.id}
          id={course.id}
          title={course.title}
          author={course.author}
          description={course.description}
          rating={course.rating}
          price={course.price}
          imageUrl={course.imageUrl}
        />
      ))}
    </div>
  );
};

export default PriceCardList;