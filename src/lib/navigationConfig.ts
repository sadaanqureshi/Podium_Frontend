// src/lib/navigationConfig.ts
import {
  LayoutDashboard, BookOpen, NotepadText, Users, Settings,
  History, Bell, Moon, CreditCard, Megaphone, NotebookPen, BookCopy, CalendarCheck, ClipboardList, Sparkles
} from 'lucide-react';

export const ICON_MAPPING: Record<string, any> = {
  "dashboard": LayoutDashboard,
  "management": Users,
  "courses": BookOpen,
  "quizzes": NotepadText,
  "assignments": NotebookPen,
  "assignment": NotebookPen,
  "resources": BookCopy,
  "resource": BookCopy,
  "audit logs": History,
  "profile": Settings,
  "notifications": Bell,
  "dark mode": Moon,
  "fees": CreditCard,
  "announcements": Megaphone,
  "configuration": Settings,
  "enrollments": Users,
  "enrollment": ClipboardList,
  "attendance": CalendarCheck,
  "course updates": Sparkles,
  "updates": Sparkles,
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

/** Prefer longer key matches so "Attendance Management" → attendance, not management */
export const getNavIcon = (itemName: string) => {
  const lowerName = itemName.toLowerCase();
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

  // --- ATTENDANCE (role-scoped) ---
  if (name.includes('attendance')) {
    if (role === 'teacher') return '/teacher/attendance';
    if (role === 'admin') return '/admin/attendance';
    return '/student/attendance';
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

  // --- DYNAMIC FOLDERS ---
  const dynamicFolders = ['quiz', 'assignment', 'resource', 'profile', 'fees'];
  const matched = dynamicFolders.find((folder) => name.includes(folder));
  if (matched) {
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
    'assigned courses': '/teacher/assigned-courses',
    'annoucement management': role === 'admin' ? '/admin/announcements' : '/announcements',
  };

  return overrides[name] || '#';
};
