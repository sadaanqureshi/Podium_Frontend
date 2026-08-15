export const MARKETING_FAQ = [
  {
    q: 'How do I enroll in a course?',
    a: 'Create a student account, browse the catalog, and request enrollment. Paid courses ask for payment proof; an admin reviews the request before you get access.',
  },
  {
    q: 'Who can sign up?',
    a: 'Students can register themselves. Teachers and institution admins sign in through their own portals — they are invited by the academy, not self-serve.',
  },
  {
    q: 'What is inside a course?',
    a: 'Recorded lectures, live classes, quizzes, assignments, resources, attendance, and a marksheet. Exactly what you use after you enroll — not a separate product.',
  },
  {
    q: 'How do fees work?',
    a: 'Each course can have a price. You submit payment proof with your enrollment request. Admins confirm the fee before the course unlocks.',
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create an account',
    body: 'Sign up as a student in a minute. Teachers and admins use the portal they were given.',
  },
  {
    step: '02',
    title: 'Pick a course',
    body: 'Browse the live catalog, open a course, and request a seat — free or paid.',
  },
  {
    step: '03',
    title: 'Learn in one place',
    body: 'Lectures, quizzes, assignments, attendance, and grades stay on the same course.',
  },
] as const;

export const ROLE_CARDS = [
  {
    title: 'Students',
    body: 'Browse courses, enroll, submit work, and track grades and attendance.',
    href: '/student/signup',
    cta: 'Create student account',
  },
  {
    title: 'Teachers',
    body: 'Teach assigned courses, grade quizzes and assignments, and take attendance.',
    href: '/teacher/signin',
    cta: 'Teacher sign in',
  },
  {
    title: 'Institutions',
    body: 'Run the academy: courses, enrollments, fees, students, and teachers.',
    href: '/contact?intent=institution',
    cta: 'Talk to us',
  },
] as const;

export const ABOUT_CAPABILITIES = [
  { title: 'Courses & catalog', body: 'Create courses with covers, categories, teachers, and prices.' },
  { title: 'Enrollment & fees', body: 'Students request a seat and upload payment proof. Admins approve.' },
  { title: 'Live & recorded', body: 'Lectures, live classes, and downloadable resources per section.' },
  { title: 'Quizzes & assignments', body: 'Deadlines, submissions, and grading in the same course.' },
  { title: 'Attendance', body: 'Teachers mark attendance; students see their own record.' },
  { title: 'Grades & marksheet', body: 'Quiz and assignment scores roll into a course marksheet.' },
] as const;

export const COURSE_INCLUDES = [
  { title: 'Lectures', body: 'Recorded lessons organized by section.' },
  { title: 'Live classes', body: 'Scheduled sessions with your teacher.' },
  { title: 'Graded work', body: 'Quizzes, assignments, and a marksheet.' },
] as const;

export const CONTACT_INTENTS = [
  { value: 'student', label: 'Student help' },
  { value: 'teacher', label: 'Teacher onboarding' },
  { value: 'institution', label: 'Institution / academy' },
  { value: 'other', label: 'Other' },
] as const;

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@podium.app';
