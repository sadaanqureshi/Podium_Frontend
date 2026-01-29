'use client';
import React from 'react';
import ModulePageTemplate from '@/components/courses/ModulePageTemplate';

const StudentQuizzes = () => {
    // 1. Mock Enrolled Courses (Filters ke liye)
    const enrolledCourses = [
        { id: 1, courseName: "Advanced TypeScript" },
        { id: 2, courseName: "Next.js 15 Deep Dive" },
        { id: 3, courseName: "UI/UX Mastery" }
    ];

    // 2. Mock Quizzes Data
    const allStudentQuizzes = [
        { id: 101, title: "TS Interfaces & Types", courseName: "Advanced TypeScript", totalMarks: 20, status: "pending" },
        { id: 102, title: "Server Components Quiz", courseName: "Next.js 15 Deep Dive", totalMarks: 15, status: "completed" },
        { id: 103, title: "Typography Basics", courseName: "UI/UX Mastery", totalMarks: 10, status: "pending" },
        { id: 104, title: "Generics in TS", courseName: "Advanced TypeScript", totalMarks: 25, status: "pending" },
    ];

    return (
        <ModulePageTemplate 
            role="student"
            type="quiz"
            pageTitle="My Quizzes"
            subTitle="Upcoming and pending quizzes for you"
            courses={enrolledCourses} 
            allData={allStudentQuizzes}
        />
    );
}

export default StudentQuizzes;