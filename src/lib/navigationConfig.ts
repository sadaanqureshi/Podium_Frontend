// src/config/navigationConfig.ts
import {
  LayoutDashboard, BookOpen, NotepadText, Users, Settings,
  History, Bell, Moon, CreditCard, Megaphone, NotebookPen, BookCopy
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
};

export const getRolePath = (roleInput: any, itemName: string): string => {
  const name = itemName.toLowerCase().trim();

  let role = "";
  if (roleInput && typeof roleInput === 'object') {
    role = (roleInput.roleName || roleInput.name || roleInput.slug || "").toLowerCase();
  } else {
    role = String(roleInput || "").toLowerCase();
  }

  // # UPDATE: Student prefix added for the new folder structure
  const rolePrefix = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : role === 'student' ? '/student' : '';

  // --- A. DASHBOARD SPECIFIC LOGIC (Updated paths) ---
  if (name === "admin dashboard") return "/admin/dashboard";
  if (name === "teacher dashboard") return "/teacher/dashboard";
  if (name === "student dashboard" || name === "dashboard") return rolePrefix ? `${rolePrefix}/dashboard` : "/dashboard";

  // --- B. DYNAMIC FOLDERS (Ensuring /student prefix) ---
  const dynamicFolders = ["quiz", "assignment", "resource", "profile", "fees", "attendance"];
  const matched = dynamicFolders.find(folder => name.includes(folder));

  if (matched) {
    let folderName = matched;
    if (matched === 'quiz') folderName = 'quizzes';
    return rolePrefix ? `${rolePrefix}/${folderName}` : `/${folderName}`;
  }

  // --- C. SPECIFIC OVERRIDES ---
  const overrides: Record<string, string> = {
    "courses management": "/admin/courses",
    "student management": "/admin/student",
    "teacher management": "/admin/teacher",
    "assigned courses": "/teacher/assigned-courses",
    "enrolled courses": "/student/enrolled-courses", // # Updated
    "available courses": "/student/available-courses", // # Updated
    "annoucement management": role === 'admin' ? "/admin/announcements" : "/announcements",
  };

  return overrides[name] || '#';
};