'use client';
import React, { useState } from 'react';
import ModulePageTemplate from '@/components/courses/ModulePageTemplate';
import GenericFormModal from '@/components/ui/GenericFormModal';

const TeacherResources = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const assignedCourses = [{ id: 1, courseName: "Advanced TypeScript" }];

    const resourceFields = [
        { name: 'title', label: 'Resource Title', type: 'text', required: true },
        { name: 'courseName', label: 'Course', type: 'select', options: assignedCourses.map(c => ({ label: c.courseName, value: c.courseName })), required: true },
        { name: 'file', label: 'Upload PDF', type: 'file' },
    ];

    return (
        <>
            <ModulePageTemplate
                role="teacher"
                type="resource"
                pageTitle="Manage Resources"
                subTitle="Upload notes and materials for students."
                courses={assignedCourses}
                allData={[]} // Start with empty for testing
                onAddClick={() => setIsModalOpen(true)}
            />
            <GenericFormModal
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title="Upload New Resource" submitText="Upload Now"
                fields={resourceFields as any} onSubmit={async () => setIsModalOpen(false)}
            />
        </>
    );
}

export default TeacherResources;