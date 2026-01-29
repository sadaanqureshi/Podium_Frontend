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
  
  // 1. ROLE EXTRACTION: Object ya string dono ko handle karega
  let role = "";
  if (roleInput && typeof roleInput === 'object') {
    role = (roleInput.roleName || roleInput.name || roleInput.slug || "").toLowerCase();
  } else {
    role = String(roleInput || "").toLowerCase();
  }

  // Prefix generation
  const rolePrefix = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '';
  
  // console.log(`Final Calculated Role: "${role}", Item: "${name}", Prefix: "${rolePrefix}"`);

  // --- A. DASHBOARD SPECIFIC LOGIC ---
  // Is logic se teeno dashboards alag alag raste par jayenge aur ek saath select nahi honge
  if (name === "admin dashboard") return "/admin/dashboard";
  if (name === "teacher dashboard") return "/teacher/dashboard";
  if (name === "student dashboard" || name === "dashboard") return "/dashboard";

  // --- B. DYNAMIC FOLDERS (Quizzes, Assignments, etc.) ---
  const dynamicFolders = ["quiz", "assignment", "resource", "profile","fees"];
  const matched = dynamicFolders.find(folder => name.includes(folder));

  if (matched) {
    let folderName = matched;
    // Map names to actual folder names
    if (matched === 'quiz') folderName = 'quizzes';
    if (matched === 'assignment') folderName = 'assignment';
    if (matched === 'resource') folderName = 'resource';
    if (matched === 'fees') folderName = 'fees';
    if (matched === 'profile') folderName = 'profile';

    // Role ke mutabiq path: e.g., /teacher/quizzes ya /quizzes
    return rolePrefix ? `${rolePrefix}/${folderName}` : `/${folderName}`;
  }

  // --- C. SPECIFIC OVERRIDES ---
  const overrides: Record<string, string> = {
    // Admin specific
    "courses management": "/admin/courses",
    "student management": "/admin/student",
    "teacher management": "/admin/teacher",
    "audit logs": "/admin/logs",
    "configuration": "/admin/config",
    
    // Teacher specific
    "assigned courses": "/teacher/assigned-courses",
    
    // Student specific
    "enrolled courses": "/enroll-courses",
    "available courses": "/available-courses",
    
    // Global
    "notifications": "/notifications",
    "fees management": "/fees",
    "annoucement management": role === 'admin' ? "/admin/announcements" : "/announcements",
  };

  return overrides[name] || '#';
};