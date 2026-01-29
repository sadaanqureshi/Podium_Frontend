// data/courses.ts

// 1. Types
export interface RecordedLecture {
  id: number;
  title: string;
  completed: boolean;
}

export interface OnlineClass {
  id: number;
  title: string;
  description: string;
  schedule: string;
}

export interface Quiz {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  lastDate?: string;
  attemptedDate?: string;
  marksScored?: string;
  sampleQuestion?: string;
}

export interface Assignment {
  id: number;
  title: string;
  lastDate: string;
  objective: string;
  deliverable: string;
  format: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  uploadDate: string;
}

// 2. Main Course Type (Updated)
export interface Course {
  id: number;
  title: string;
  author: string;
  authorImageUrl: string; // <-- Detail page avatar ke liye
  description: string;
  longDescription: string; // Detail page ke liye
  rating: number;
  totalRatings: string;
  enrollmentDate: string;
  progress: number;
  currentLesson: number;
  totalLessons: number;
  imageUrl: string; // <-- Card ke liye
  videoPreviewUrl: string; // <-- Detail page video ke liye
  price: number; // <-- Price field
  recordedLectures: RecordedLecture[];
  onlineClasses: OnlineClass[]; // <-- Online classes field
  quizzes: Quiz[];
  assignments: Assignment[];
  resources: Resource[];
}

// 3. FAKE DATABASE (SINGLE SOURCE OF TRUTH) - POORE 8 COURSES KE SAATH
export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Introduction to UX Design',
    author: 'Sarah Mitchell',
    authorImageUrl: 'https://picsum.photos/seed/sarah/40/40',
    description: 'Learn the foundations of user experience, from research to wireframes.',
    longDescription: 'This course introduces you to the fundamentals of User Experience (UX) design, covering key concepts such as user research, wireframing, prototyping, and usability testing...',
    rating: 4.7,
    totalRatings: '(2,345 ratings)',
    enrollmentDate: 'Jan 12, 2025',
    progress: 10,
    currentLesson: 2,
    totalLessons: 20,
    imageUrl: 'https://picsum.photos/id/1060/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/1060/800/450',
    price: 200,
    recordedLectures: [
      { id: 1, title: 'What is UX Design?', completed: true },
      { id: 2, title: 'The UX Design Process', completed: true },
      { id: 3, title: 'Understanding Users & Research Methods', completed: false },
    ],
    onlineClasses: [
      { id: 1, title: 'User Research Techniques', description: 'Overview of UX design, its role in digital products...', schedule: 'Scheduled on: 31, Dec 2025 - 9:00AM' },
      { id: 2, title: 'The UX Design Process', description: 'Step-by-step breakdown of discovery, research...', schedule: 'Scheduled on: 31, Dec 2025 - 9:00AM' },
    ],
    quizzes: [
      { id: 1, title: 'Quiz 2: Basics of UX (Lessons 1-3)', status: 'pending', lastDate: '20, Dec 2025', sampleQuestion: 'Which of these best defines User Experience (UX)?' },
      { id: 2, title: 'Quiz 1: Basics of UX (Lessons 1-3)', status: 'completed', attemptedDate: '17, Nov 2025', marksScored: '07/10' },
    ],
    assignments: [
      { id: 1, title: 'Assignment 1', lastDate: '20, Dec 2025', objective: 'Create a low-fidelity wireframe...', deliverable: 'Wireframe of homepage...', format: 'Image or Figmas' }
    ],
    resources: [
      { id: 1, title: 'UX Research Template (PDF, 3 pages)', description: 'Plan and document user interviews...', uploadDate: '20, Dec 2025' },
    ]
  },
  {
    id: 2,
    title: 'Data Science with Python',
    author: 'Dr. Arjun Mehta',
    authorImageUrl: 'https://picsum.photos/seed/arjun/40/40',
    description: 'Build your skills in data analysis, visualization, and machine learning.',
    longDescription: 'Dive deep into data science using Python. This course covers everything from basic data manipulation with Pandas to advanced machine learning models...',
    rating: 4.6,
    totalRatings: '(1,890 ratings)',
    enrollmentDate: 'Feb 05, 2025',
    progress: 40,
    currentLesson: 8,
    totalLessons: 20,
    imageUrl: 'https://picsum.photos/id/237/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/237/800/450',
    price: 250,
    recordedLectures: [{ id: 1, title: 'Python Basics', completed: true }],
    onlineClasses: [
      { id: 1, title: 'Live Q&A with Dr. Mehta', description: 'Ask your questions about data visualization.', schedule: 'Scheduled on: 30, Dec 2025 - 10:00AM' },
    ],
    quizzes: [{ id: 1, title: 'Quiz 1: Python Fundamentals', status: 'pending', lastDate: '25, Dec 2025' }],
    assignments: [{ id: 1, title: 'Assignment 1: Data Cleaning', lastDate: '22, Dec 2025', objective: 'Clean the provided dataset...', deliverable: 'A clean CSV file...', format: 'CSV' }],
    resources: [{ id: 1, title: 'Pandas Cheat Sheet', description: 'Quick reference for Pandas functions.', uploadDate: '01, Dec 2025' }]
  },
  {
    id: 3,
    title: 'Business Communication Essentials',
    author: 'Emily Johnson',
    authorImageUrl: 'https://picsum.photos/seed/emily/40/40',
    description: 'Enhance your professional communication and presentation skills.',
    longDescription: 'This course focuses on critical communication skills for the modern workplace, including effective emails, persuasive presentations, and navigating difficult conversations.',
    rating: 4.7,
    totalRatings: '(1,450 ratings)',
    enrollmentDate: 'Mar 10, 2025',
    progress: 0,
    currentLesson: 0,
    totalLessons: 20,
    imageUrl: 'https://picsum.photos/id/1015/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/1015/800/450',
    price: 150,
    recordedLectures: [
      { id: 1, title: 'Writing Effective Emails', completed: false },
      { id: 2, title: 'Public Speaking Basics', completed: false },
    ],
    onlineClasses: [
      { id: 1, title: 'Live Workshop: Presentation Skills', description: 'Practice your public speaking in a live session.', schedule: 'Scheduled on: 05, Jan 2026 - 2:00PM' }
    ],
    quizzes: [
      { id: 1, title: 'Quiz 1: Email Etiquette', status: 'pending', lastDate: '28, Dec 2025' },
    ],
    assignments: [],
    resources: [
      { id: 1, title: 'Email Templates (PDF)', description: 'Ready-to-use templates for common business scenarios.', uploadDate: '15, Nov 2025' },
    ]
  },
  {
    id: 4,
    title: 'Web Development Bootcamp',
    author: 'Alex Nguyen',
    authorImageUrl: 'https://picsum.photos/seed/alex/40/40',
    description: 'From HTML to full-stack apps – build websites that work beautifully.',
    longDescription: 'A complete bootcamp to take you from zero to hero in web development. You will learn HTML, CSS, JavaScript, React, Node.js, and databases to build real-world projects.',
    rating: 4.8,
    totalRatings: '(3,120 ratings)',
    enrollmentDate: 'Apr 22, 2025',
    progress: 10,
    currentLesson: 2,
    totalLessons: 20,
    imageUrl: 'https://picsum.photos/id/10/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/10/800/450',
    price: 300,
    recordedLectures: [
      { id: 1, title: 'HTML Basics', completed: true },
      { id: 2, title: 'CSS Fundamentals', completed: true },
      { id: 3, title: 'JavaScript Essentials', completed: false },
    ],
    onlineClasses: [
      { id: 1, title: 'Code Review: Portfolio Project', description: 'Get live feedback on your portfolio project from Alex.', schedule: 'Scheduled on: 20, Jan 2026 - 11:00AM' }
    ],
    quizzes: [
      { id: 1, title: 'Quiz 1: HTML & CSS', status: 'pending', lastDate: '30, Dec 2025' },
    ],
    assignments: [
      { id: 1, title: 'Assignment 1: Build a Portfolio Page', lastDate: '15, Jan 2026', objective: 'Create a personal portfolio using HTML/CSS.', deliverable: 'A live website URL.', format: 'URL' }
    ],
    resources: []
  },
  {
    id: 5,
    title: 'Digital Marketing Fundamentals',
    author: 'Mark Chen',
    authorImageUrl: 'https://picsum.photos/seed/mark/40/40',
    description: 'Learn SEO, SEM, content marketing, and social media strategy.',
    longDescription: 'A comprehensive guide to digital marketing. This course covers SEO, SEM, content strategy, social media marketing, and email marketing, preparing you for a certification.',
    rating: 4.5,
    totalRatings: '(1,980 ratings)',
    enrollmentDate: 'May 01, 2025',
    progress: 0,
    currentLesson: 0,
    totalLessons: 25,
    imageUrl: 'https://picsum.photos/id/1011/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/1011/800/450',
    price: 180,
    recordedLectures: [{ id: 1, title: 'Intro to SEO', completed: false }],
    onlineClasses: [
      { id: 1, title: 'SEO Strategy Session', description: 'Live breakdown of a successful SEO campaign.', schedule: 'Scheduled on: 10, Jan 2026 - 3:00PM' }
    ],
    quizzes: [{ id: 1, title: 'Quiz 1: Marketing Terms', status: 'pending', lastDate: '30, Dec 2025' }],
    assignments: [],
    resources: [{ id: 1, title: 'SEO Checklist (PDF)', description: 'A handy checklist for your SEO projects.', uploadDate: '02, Dec 2025' }]
  },
  {
    id: 6,
    title: 'Advanced React and Next.js',
    author: 'Dr. Evelyn Reed',
    authorImageUrl: 'https://picsum.photos/seed/evelyn/40/40',
    description: 'Master advanced React patterns, state management, and Next.js features.',
    longDescription: 'Take your React skills to the next level. We will explore advanced hooks, state management with Redux/Zustand, performance optimization, and server-side rendering with Next.js.',
    rating: 4.9,
    totalRatings: '(2,850 ratings)',
    enrollmentDate: 'May 15, 2025',
    progress: 20,
    currentLesson: 4,
    totalLessons: 20,
    imageUrl: 'https://picsum.photos/id/103/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/103/800/450',
    price: 350,
    recordedLectures: [
      { id: 1, title: 'Deep Dive into Hooks', completed: true },
      { id: 2, title: 'State Management Patterns', completed: false }
    ],
    onlineClasses: [
      { id: 1, title: 'Advanced State Management Q&A', description: 'Discussing Zustand vs. Redux with Dr. Reed.', schedule: 'Scheduled on: 12, Jan 2026 - 5:00PM' }
    ],
    quizzes: [],
    assignments: [{ id: 1, title: 'Assignment 1: Build a Mini-Store', lastDate: '10, Jan 2026', objective: 'Build a small e-commerce UI with state management.', deliverable: 'GitHub repo link.', format: 'URL' }],
    resources: [{ id: 1, title: 'React Hooks Cheat Sheet', description: 'Quick reference for all React hooks.', uploadDate: '05, Dec 2025' }]
  },
  {
    id: 7,
    title: 'Graphic Design Masterclass',
    author: 'Laura Bianchi',
    authorImageUrl: 'https://picsum.photos/seed/laura/40/40',
    description: 'Learn typography, color theory, and layout design using Adobe tools.',
    longDescription: 'From beginner to pro, this masterclass covers the fundamentals of graphic design, including typography, color theory, layout, and composition, using Adobe Photoshop and Illustrator.',
    rating: 4.6,
    totalRatings: '(2,100 ratings)',
    enrollmentDate: 'June 01, 2025',
    progress: 0,
    currentLesson: 0,
    totalLessons: 30,
    imageUrl: 'https://picsum.photos/id/1016/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/1016/800/450',
    price: 170,
    recordedLectures: [{ id: 1, title: 'Intro to Photoshop', completed: false }],
    onlineClasses: [
      { id: 1, title: 'Photoshop Tools Deep Dive', description: 'Live demonstration of advanced Photoshop techniques.', schedule: 'Scheduled on: 14, Jan 2026 - 1:00PM' }
    ],
    quizzes: [],
    assignments: [],
    resources: [{ id: 1, title: 'Color Theory Guide', description: 'A complete guide to color combinations.', uploadDate: '10, Dec 2025' }]
  },
  {
    id: 8,
    title: 'AI for Everyone',
    author: 'Prof. Kenji Tanaka',
    authorImageUrl: 'https://picsum.photos/seed/kenji/40/40',
    description: 'Understand artificial intelligence, machine learning, and data science basics.',
    longDescription: 'This non-technical course helps you understand the basics of AI, machine learning, and data science. Learn what AI can (and cannot) do and how it impacts society.',
    rating: 4.8,
    totalRatings: '(4,500 ratings)',
    enrollmentDate: 'June 10, 2025',
    progress: 0,
    currentLesson: 0,
    totalLessons: 15,
    imageUrl: 'https://picsum.photos/id/1074/400/200',
    videoPreviewUrl: 'https://picsum.photos/id/1074/800/450',
    price: 100,
    recordedLectures: [{ id: 1, title: 'What is AI?', completed: false }],
    onlineClasses: [
      { id: 1, title: 'The Future of AI: Live Talk', description: 'A discussion with Prof. Tanaka about emerging AI trends.', schedule: 'Scheduled on: 18, Jan 2026 - 4:00PM' }
    ],
    quizzes: [{ id: 1, title: 'Quiz 1: AI Concepts', status: 'pending', lastDate: '15, Jan 2026' }],
    assignments: [],
    resources: []
  }
];