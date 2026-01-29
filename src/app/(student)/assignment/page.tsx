'use client';
import React from 'react';
import ModulePageTemplate from '@/components/courses/ModulePageTemplate';

const StudentAssignments = () => {
    const enrolledCourses = [
        { id: 1, courseName: "Advanced TypeScript" },
        { id: 2, courseName: "Next.js 15 Deep Dive" }
    ];

    const allStudentAssignments = [
        { id: 301, title: "Build a Todo with Generics", courseName: "Advanced TypeScript", subtitle: "Deadline: 28 Jan", status: "pending" },
        { id: 302, title: "Server Actions Practice", courseName: "Next.js 15 Deep Dive", subtitle: "Deadline: 30 Jan", status: "submitted" },
    ];

    return (
        <ModulePageTemplate 
            role="student"
            type="assignment"
            pageTitle="Assignments"
            subTitle="Submit your tasks before the deadline."
            courses={enrolledCourses} 
            allData={allStudentAssignments}
        />
    );
}

export default StudentAssignments;