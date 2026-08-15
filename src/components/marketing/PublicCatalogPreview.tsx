'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardCheck, Video } from 'lucide-react';
import CourseList from '@/components/courses/CourseList';
import { loadPublicCatalog, type CatalogCategory, type CatalogCourse } from '@/lib/marketing/catalog';
import { getToken } from '@/lib/api/apiService';
import { COURSE_INCLUDES } from '@/components/marketing/content';
import { useAppSelector } from '@/lib/store/hooks';
import { normalizeRole, roleFromRoleId } from '@/lib/navigationConfig';

const INCLUDE_ICONS = [BookOpen, Video, ClipboardCheck];

function courseHref(courseId: number, role: string, hasToken: boolean) {
  if (hasToken && role === 'student') return `/student/available-courses/${courseId}`;
  if (hasToken && role === 'teacher') return '/teacher/assigned-courses';
  if (hasToken && role === 'admin') return '/admin/courses';
  return '/student/signin';
}

function courseCta(role: string, hasToken: boolean) {
  if (hasToken && role === 'student') return 'View Details';
  if (hasToken) return 'Open portal';
  return 'Sign in to view';
}

type PublicCatalogPreviewProps = {
  limit?: number;
  showViewAll?: boolean;
  query?: string;
  category?: string;
};

export function PublicCatalogPreview({
  limit = 6,
  showViewAll = true,
  query = '',
  category = '',
}: PublicCatalogPreviewProps) {
  const token = useAppSelector((s) => s.auth.token);
  const roleId = useAppSelector((s) => s.auth.roleId);
  const authRole = useAppSelector((s) => s.auth.role);
  const user = useAppSelector((s) => s.auth.user);
  const role = roleFromRoleId(roleId) || normalizeRole(user?.role) || normalizeRole(authRole);
  const hasToken = !!token || !!getToken();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPublicCatalog(limit)
      .then((result) => {
        if (cancelled) return;
        setCourses(result.courses);
        setCategories(result.categories);
        setTotalItems(result.totalItems);
        setRequiresAuth(result.requiresAuth);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const q = query.trim().toLowerCase();
  const cat = category.trim().toLowerCase();
  const visible = courses
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    .filter((c) => !cat || (c.category || '').toLowerCase() === cat)
    .map((c) => ({
      ...c,
      href: courseHref(c.id, role, hasToken),
      ctaLabel: courseCta(role, hasToken),
    }));

  return (
    <div className="space-y-8">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/courses"
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border ${
              !cat
                ? 'bg-accent-blue text-white border-accent-blue'
                : 'bg-card-bg text-text-muted border-border-subtle hover:text-text-main hover:border-accent-blue/40'
            }`}
          >
            All
          </Link>
          {categories.map((item) => {
            const active = cat === item.name.toLowerCase();
            return (
              <Link
                key={item.id}
                href={`/courses?category=${encodeURIComponent(item.name)}`}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border ${
                  active
                    ? 'bg-accent-blue text-white border-accent-blue'
                    : 'bg-card-bg text-text-muted border-border-subtle hover:text-text-main hover:border-accent-blue/40'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 rounded-xl border border-border-subtle bg-card-bg animate-pulse" />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <>
          <CourseList courses={visible} basePath="/student/available-courses" showProgress={false} />
          {showViewAll && (
            <div className="flex justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-accent-blue text-xs font-black uppercase tracking-widest hover:underline"
              >
                View all courses {totalItems > 0 ? `(${totalItems})` : ''} <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COURSE_INCLUDES.map((item, i) => {
              const Icon = INCLUDE_ICONS[i];
              return (
                <div key={item.title} className="rounded-xl border border-border-subtle bg-card-bg p-6 space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-text-main">{item.title}</h3>
                  <p className="text-sm text-text-muted font-medium leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-main">
                {requiresAuth || !hasToken
                  ? 'Sign in as a student to browse the live catalog.'
                  : q || cat
                    ? 'No courses match that filter.'
                    : 'No courses are listed yet.'}
              </p>
              <p className="text-sm text-text-muted font-medium mt-1">
                Enrollment, fees, and course details open after you sign in.
              </p>
            </div>
            <Link
              href="/student/signin"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue shrink-0"
            >
              Student sign in <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
