'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicCatalogPreview } from '@/components/marketing/PublicCatalogPreview';

function CoursesCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [query, setQuery] = useState(initialQ);

  const heading = useMemo(() => {
    if (category) return category;
    if (initialQ) return `Results for “${initialQ}”`;
    return 'Course catalog';
  }, [category, initialQ]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    router.push(params.toString() ? `/courses?${params.toString()}` : '/courses');
  };

  return (
    <main className="px-6 py-12 md:py-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Marketplace</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-main">{heading}</h1>
          <p className="text-text-muted font-medium max-w-2xl">
            Live courses from the academy. Sign in as a student to open details and enroll.
          </p>
        </div>

        <form onSubmit={onSearch} className="flex gap-2 max-w-xl">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
            className="flex-1 h-12 px-5 rounded-xl bg-card-bg border border-border-subtle outline-none focus:border-accent-blue font-medium text-text-main"
          />
          <button
            type="submit"
            className="h-12 px-5 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue shrink-0"
          >
            Search
          </button>
        </form>

        <PublicCatalogPreview
          limit={12}
          showViewAll={false}
          query={initialQ}
          category={category}
        />
      </div>
    </main>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-text-muted text-center">Loading catalog…</div>}>
      <CoursesCatalog />
    </Suspense>
  );
}
