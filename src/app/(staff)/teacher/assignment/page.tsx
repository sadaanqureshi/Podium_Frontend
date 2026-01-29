'use client';
import React, { useState } from 'react';
import ModulePageTemplate from '@/components/courses/ModulePageTemplate';
import GenericFormModal from '@/components/ui/GenericFormModal';

const TeacherAssignments = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const assignedCourses = [{ id: 1, courseName: "Advanced TypeScript" }];

    const allTeacherAssignments = [
        { id: 401, title: "Zod Validation Task", courseName: "Advanced TypeScript", subtitle: "25 Submissions" },
    ];

    const assignmentFields = [
        { name: 'title', label: 'Assignment Title', type: 'text', required: true },
        { name: 'courseName', label: 'Course', type: 'select', options: assignedCourses.map(c => ({ label: c.courseName, value: c.courseName })), required: true },
        { name: 'deadline', label: 'Deadline Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    ];

    return (
        <>
            <ModulePageTemplate 
                role="teacher"
                type="assignment"
                pageTitle="Manage Assignments"
                subTitle="Create tasks and grade your students."
                courses={assignedCourses} 
                allData={allTeacherAssignments}
                onAddClick={() => setIsModalOpen(true)}
            />
            <GenericFormModal 
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title="Create New Assignment" submitText="Create Assignment"
                fields={assignmentFields as any} onSubmit={async () => setIsModalOpen(false)}
            />
        </>
    );
}

export default TeacherAssignments;