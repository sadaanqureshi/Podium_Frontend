'use client';
import React, { useState } from 'react';
import ModulePageTemplate from '@/components/courses/ModulePageTemplate';
import GenericFormModal from '@/components/ui/GenericFormModal';

const TeacherQuizzes = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Mock Assigned Courses (Filters ke liye)
    const assignedCourses = [
        { id: 1, courseName: "Advanced TypeScript" },
        { id: 4, courseName: "Node.js Backend" }
    ];

    // 2. Mock Teacher Quizzes (Edit/Delete buttons ke saath dikhenge)
    const allTeacherQuizzes = [
        { id: 201, title: "Middleware Quiz", courseName: "Node.js Backend", totalMarks: 50 },
        { id: 202, title: "TS Advanced Patterns", courseName: "Advanced TypeScript", totalMarks: 30 },
        { id: 203, title: "Express Routing Basics", courseName: "Node.js Backend", totalMarks: 20 },
    ];

    const quizFields = [
        { name: 'title', label: 'Quiz Title', type: 'text', required: true },
        { name: 'courseName', label: 'Course', type: 'select', options: assignedCourses.map(c => ({ label: c.courseName, value: c.courseName })), required: true },
        { name: 'totalMarks', label: 'Total Marks', type: 'number', required: true },
    ];

    const handleAddQuiz = async (formData: FormData) => {
        console.log("Creating new quiz:", Object.fromEntries(formData));
        setIsModalOpen(false);
        alert("Mock: Quiz created successfully!");
    };

    return (
        <>
            <ModulePageTemplate
                role="teacher"
                type="quiz"
                pageTitle="Quiz Management"
                subTitle="Create and monitor quizzes for your students"
                courses={assignedCourses}
                allData={allTeacherQuizzes}
                onAddClick={() => setIsModalOpen(true)}
            />

            <GenericFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Quiz"
                submitText="Create Quiz"
                fields={quizFields as any}
                onSubmit={handleAddQuiz}
            />
        </>
    );
}

export default TeacherQuizzes;