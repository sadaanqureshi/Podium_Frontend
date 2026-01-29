import CoursePageTemplate from '@/components/courses/CoursePageTemplate';
import { mockCourses } from '@/data/courses';

export default function StudentPage() {
  return (
    <CoursePageTemplate
      title="Enrolled Courses"
      description="Continue your learning journey."
      courses={mockCourses}
      basePath="/enroll-courses"
    />
  );
}