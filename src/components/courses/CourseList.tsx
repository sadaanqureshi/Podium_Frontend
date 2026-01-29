import React from 'react';
import Card from '@/components/courses/Card';

interface CourseListProps {
  courses: any[]; 
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
          // Backend keys mapping
          title={course.courseName}
          author={course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Instructor'}
          description={course.shortDescription}
          rating={course.avgRating || 0}
          imageUrl={course.coverImg}
          currentLesson={0} 
          totalLessons={course.totalLectures || 0}
          basePath={basePath} 
          showProgress={showProgress}
        />
      ))}
    </div>
  );
};

export default CourseList;