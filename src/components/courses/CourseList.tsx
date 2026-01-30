import React from 'react';
import Card from '@/components/courses/Card';
import { Course } from '@/data/courses';

interface CourseListProps {
  courses: Course[]; 
  basePath: string;
  showProgress?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({ courses, basePath, showProgress }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          author={course.author}
          description={course.description}
          rating={course.rating}
          progress={course.progress}
          currentLesson={course.currentLesson}
          totalLessons={course.totalLessons}
          imageUrl={course.imageUrl}
          basePath={basePath}
          showProgress={showProgress}
        />
      ))}
    </div>
  );
};

export default CourseList;