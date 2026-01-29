'use client';
import React from 'react';
import ModulePageTemplate from '@/components/courses/ModulePageTemplate';

const StudentResources = () => {
    const enrolledCourses = [{ id: 1, courseName: "Advanced TypeScript" }];

    const allResources = [
        { id: 501, title: "TypeScript Cheat Sheet", courseName: "Advanced TypeScript", subtitle: "PDF Document" },
        { id: 502, title: "Official Docs Link", courseName: "Advanced TypeScript", subtitle: "External Link" },
    ];

    return (
        <ModulePageTemplate 
            role="student"
            type="resource"
            pageTitle="Study Resources"
            subTitle="Download notes and helpful links."
            courses={enrolledCourses} 
            allData={allResources}
        />
    );
}

export default StudentResources;