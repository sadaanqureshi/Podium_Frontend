// src/lib/navigationConfig.ts
import {
  LayoutDashboard,
  BookOpen,
  NotepadText,
  Users,
  Settings,
  History,
  Bell,
  Moon,
  CreditCard,
  Megaphone,
  NotebookPen,
  BookCopy,
  CalendarCheck,
  ClipboardList,
  Sparkles,
  Inbox,
  GraduationCap,
  UserRound,
  Library,
  FolderOpen,
  FileQuestion,
  UserCog,
  BadgeCheck,
  Layers,
  Award,
} from 'lucide-react';

/**
 * Longer / more specific keys win in getNavIcon.
 * Keep phrases that appear in API sidebar names for admin / teacher / student.
 */
export const ICON_MAPPING: Record<string, any> = {
  // Dashboards
  'admin dashboard': LayoutDashboard,
  'teacher dashboard': LayoutDashboard,
  'student dashboard': LayoutDashboard,
  dashboard: LayoutDashboard,

  // People / admin ops
  'student management': GraduationCap,
  'teacher management': UserCog,
  'teacher assignments': BadgeCheck,
  'teacher assignment': BadgeCheck,
  management: Users,

  // Courses (role-specific labels still share course icons)
  'courses management': BookOpen,
  'assigned courses': Library,
  'enrolled courses': BookOpen,
  'available courses': Layers,
  'my courses': BookOpen,
  courses: BookOpen,

  // Teacher inbox vs student homework
  'course assignments': Inbox,
  'course assignment': Inbox,
  'assign courses': Inbox,
  'assign course': Inbox,
  'course updates': Sparkles,
  'course update': Sparkles,
  updates: Sparkles,

  // Learning content
  quizzes: FileQuestion,
  quiz: FileQuestion,
  assignments: NotebookPen,
  assignment: NotebookPen,
  resources: BookCopy,
  resource: BookCopy,
  'my grades': Award,
  marksheet: Award,
  grades: Award,

  // Ops
  'audit logs': History,
  'audit log': History,
  enrollments: ClipboardList,
  enrollment: ClipboardList,
  attendance: CalendarCheck,
  fees: CreditCard,
  announcements: Megaphone,
  annoucement: Megaphone,
  announcement: Megaphone,
  configuration: Settings,
  profile: UserRound,
  notifications: Bell,
  'dark mode': Moon,
  folders: FolderOpen,
  section: FolderOpen,
};

export type AppRole = 'admin' | 'teacher' | 'student';

/** Map API role.id → portal role (source of truth after profile sync) */
export const roleFromRoleId = (roleId: number | null | undefined): AppRole | '' => {
  if (roleId === 1) return 'admin';
  if (roleId === 2) return 'teacher';
  if (roleId === 3) return 'student';
  return '';
};

export const roleFromProfileUser = (user: any): AppRole | '' => {
  const byId = roleFromRoleId(user?.role?.id);
  if (byId) return byId;
  return normalizeRole(user?.role) as AppRole | '';
};

export const normalizeRole = (roleInput: any): string => {
  if (!roleInput && roleInput !== 0) return '';
  if (typeof roleInput === 'object') {
    const byId = roleFromRoleId(roleInput.id);
    if (byId) return byId;
    const raw = roleInput.roleName || roleInput.name || roleInput.slug || '';
    return String(raw).toLowerCase().trim();
  }
  return String(roleInput).toLowerCase().trim();
};

/** Portal from URL is the source of truth for which app shell you're in */
export const getPortalRoleFromPath = (pathname: string): AppRole | '' => {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/teacher')) return 'teacher';
  if (pathname.startsWith('/student')) return 'student';
  return '';
};

export const getDashboardPathForRole = (role: string): string => {
  const r = normalizeRole(role);
  if (r === 'admin') return '/admin/dashboard';
  if (r === 'teacher') return '/teacher/dashboard';
  if (r === 'student') return '/student/dashboard';
  return '/';
};

export const getSignInPathForRole = (role: string): string => {
  const r = normalizeRole(role);
  if (r === 'admin') return '/admin/signin';
  if (r === 'teacher') return '/teacher/signin';
  if (r === 'student') return '/student/signin';
  return '/';
};

/** Prefer longer key matches so specific labels beat generic ones */
export const getNavIcon = (itemName: string) => {
  const lowerName = itemName.toLowerCase().trim();

  // Exact match first
  if (ICON_MAPPING[lowerName]) return ICON_MAPPING[lowerName];

  const key = Object.keys(ICON_MAPPING)
    .filter((k) => lowerName.includes(k))
    .sort((a, b) => b.length - a.length)[0];

  return key ? ICON_MAPPING[key] : null;
};

/** Friendly sidebar labels (API may send longer names like "Attendance Management") */
export const getNavLabel = (itemName: string, role?: string): string => {
  const lower = itemName.toLowerCase().trim();
  const r = normalizeRole(role);

  if (lower.includes('attendance')) return 'Attendance';

  // Admin: course ↔ teacher assignment queue (not student homework)
  if (
    r === 'admin' &&
    (lower.includes('teacher assignment') || lower === 'teacher assignments')
  ) {
    return 'Teacher Assignments';
  }

  // Teacher inbox for admin-assigned courses (API may send "Course Updates")
  if (
    r === 'teacher' &&
    (lower.includes('course assignment') ||
      lower.includes('assign course') ||
      lower.includes('course update') ||
      (lower === 'updates' && !lower.includes('assignment')))
  ) {
    return 'Course Assignments';
  }

  if (
    r === 'student' &&
    (lower.includes('course update') || lower === 'updates' || lower.includes('material update'))
  ) {
    return 'Course Updates';
  }

  if (
    r === 'student' &&
    lower.includes('enrollment') &&
    !lower.includes('enrolled courses')
  ) {
    return 'Enrollment Requests';
  }

  if (r === 'teacher' && lower === 'courses management') {
    return 'My Courses';
  }

  if (r === 'teacher' && lower === 'assigned courses') {
    return 'My Courses';
  }

  if (
    r === 'student' &&
    (lower === 'my grades' || lower.includes('marksheet') || lower === 'grades')
  ) {
    return 'My Grades';
  }

  return itemName;
};

export const getRolePath = (roleInput: any, itemName: string): string => {
  const name = itemName.toLowerCase().trim();
  const role = normalizeRole(roleInput);

  const rolePrefix =
    role === 'admin' ? '/admin' :
    role === 'teacher' ? '/teacher' :
    role === 'student' ? '/student' : '';

  // --- A. DASHBOARD ---
  if (name === 'admin dashboard') return '/admin/dashboard';
  if (name === 'teacher dashboard') return '/teacher/dashboard';
  if (name === 'student dashboard' || name === 'dashboard') {
    return rolePrefix ? `${rolePrefix}/dashboard` : '/dashboard';
  }

  // --- ATTENDANCE (teacher / student only; admin nav removed) ---
  if (name.includes('attendance')) {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'teacher') return '/teacher/attendance';
    return '/student/attendance';
  }

  // --- STUDENT: My Grades hub (pick a course marksheet) ---
  if (
    name === 'my grades' ||
    name.includes('my grade') ||
    name.includes('marksheet') ||
    name === 'grades'
  ) {
    return '/student/my-grades';
  }

  // --- TEACHER: course assignment inbox (before generic "assignment" folder) ---
  // Login sidebar may send "Course Updates" / "Course Assignments" / "Assign Courses"
  if (
    role === 'teacher' &&
    (name.includes('course assignment') ||
      name.includes('assign course') ||
      name.includes('assignment request') ||
      name.includes('course update') ||
      name === 'updates')
  ) {
    return '/teacher/course-assignments';
  }

  // --- STUDENT COURSE LISTS ---
  if (name === 'enrolled courses') return '/student/enrolled-courses';
  if (name === 'available courses') return '/student/available-courses';

  // Course Updates feed (API may send "Course Updates" / "Updates")
  if (
    role === 'student' &&
    (name.includes('course update') ||
      name === 'updates' ||
      name.includes('material update') ||
      name.includes('new material'))
  ) {
    return '/student/course-updates';
  }

  // --- ENROLLMENTS (never send students to admin enrollments) ---
  if (name.includes('enrollment') && !name.includes('enrolled courses')) {
    if (role === 'admin') return '/admin/enrollments';
    if (role === 'student') return '/student/enrollment-requests';
    // Student-facing menu names even if role briefly unknown
    if (
      name.includes('student enrollment') ||
      name.includes('my enrollment') ||
      name.includes('enrollment request')
    ) {
      return '/student/enrollment-requests';
    }
  }

  // --- ADMIN: Teacher Assignments (before generic "assignment" folder) ---
  if (
    role === 'admin' &&
    (name.includes('teacher assignment') || name === 'teacher assignments')
  ) {
    return '/admin/teacher-assignments';
  }

  // --- DYNAMIC FOLDERS ---
  // Skip generic "assignment" when the item is the teacher course-assignment inbox
  // or the admin teacher-assignments queue
  const isTeacherCourseAssignmentInbox =
    role === 'teacher' &&
    (name.includes('course assignment') ||
      name.includes('assign course') ||
      name.includes('course update'));
  const isAdminTeacherAssignments =
    role === 'admin' && name.includes('teacher assignment');

  const dynamicFolders = ['quiz', 'assignment', 'resource', 'profile', 'fees'];
  const matched = dynamicFolders.find((folder) => name.includes(folder));
  if (
    matched &&
    !(matched === 'assignment' && (isTeacherCourseAssignmentInbox || isAdminTeacherAssignments))
  ) {
    let folderName = matched;
    if (matched === 'quiz') folderName = 'quizzes';
    return rolePrefix ? `${rolePrefix}/${folderName}` : `/${folderName}`;
  }

  // --- OVERRIDES (admin/teacher specific) ---
  if (name === 'courses management') {
    return role === 'admin' ? '/admin/courses' : role === 'teacher' ? '/teacher/assigned-courses' : '/student/enrolled-courses';
  }

  const overrides: Record<string, string> = {
    'student management': '/admin/student',
    'teacher management': '/admin/teacher',
    'teacher assignments': '/admin/teacher-assignments',
    'assigned courses': '/teacher/assigned-courses',
    'course assignments': '/teacher/course-assignments',
    'annoucement management': role === 'admin' ? '/admin/announcements' : '/announcements',
  };

  return overrides[name] || '#';
};
