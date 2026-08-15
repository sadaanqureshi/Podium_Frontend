'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, ClipboardList, GraduationCap, Search } from 'lucide-react';
import { PublicCatalogPreview } from '@/components/marketing/PublicCatalogPreview';
import { FaqList } from '@/components/marketing/FaqList';
import { HOW_IT_WORKS, ROLE_CARDS } from '@/components/marketing/content';

const TRUST = [
  { icon: BookOpen, title: 'Live catalog', body: 'Browse academy courses — not placeholder counts.' },
  { icon: ClipboardList, title: 'Enrollment & fees', body: 'Request a seat and upload payment proof when a course is paid.' },
  { icon: GraduationCap, title: 'Learn in one portal', body: 'Lectures, quizzes, assignments, attendance, and grades together.' },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
  };

  return (
    <main>
      <section className="relative px-6 pt-10 pb-14 md:pt-16 md:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(720px,90vw)] h-[320px] rounded-full bg-accent-blue/10 blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 text-center space-y-7">
          <span className="inline-block px-4 py-1.5 bg-accent-blue/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-accent-blue/20">
            Course marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-text-main">
            Find a course.
            <br />
            <span className="text-accent-blue">Enroll. Learn.</span>
          </h1>
          <p className="text-text-muted text-base md:text-lg font-medium leading-relaxed">
            Browse the live academy catalog, request a seat, and take lectures, quizzes, and assignments in one portal.
          </p>

          <form onSubmit={onSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses"
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-card-bg border border-border-subtle outline-none focus:border-accent-blue font-medium text-text-main"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-5 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue shrink-0"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/courses"
              className="group px-7 py-3.5 bg-accent-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest inline-flex items-center justify-center gap-3 hover:bg-hover-blue active:scale-95"
            >
              Browse courses <ArrowRight size={18} className="group-hover:translate-x-1" />
            </Link>
            <Link
              href="/student/signup"
              className="px-7 py-3.5 bg-card-bg text-text-main border border-border-subtle rounded-2xl font-black uppercase text-xs tracking-widest hover:border-accent-blue/40 text-center"
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-card-bg border-y border-border-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST.map((item) => (
            <div key={item.title} className="p-6 rounded-2xl bg-app-bg border border-border-subtle space-y-3">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-2xl flex items-center justify-center text-accent-blue">
                <item.icon size={24} />
              </div>
              <h2 className="text-lg font-black text-text-main">{item.title}</h2>
              <p className="text-sm text-text-muted font-medium leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-2">Catalog</p>
              <h2 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">Featured courses</h2>
            </div>
            <Link href="/courses" className="text-xs font-black uppercase tracking-widest text-accent-blue hover:underline">
              Open catalog
            </Link>
          </div>
          <PublicCatalogPreview limit={6} />
        </div>
      </section>

      <section className="py-16 px-6 bg-card-bg border-y border-border-subtle">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">How it works</p>
            <h2 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">From browse to classroom</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="p-6 rounded-2xl border border-border-subtle bg-app-bg space-y-3">
                <span className="text-accent-blue font-black text-sm tracking-widest">{item.step}</span>
                <h3 className="text-lg font-black text-text-main">{item.title}</h3>
                <p className="text-sm text-text-muted font-medium leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Who it is for</p>
            <h2 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">Pick your portal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLE_CARDS.map((role) => (
              <div key={role.title} className="p-6 rounded-2xl border border-border-subtle bg-card-bg flex flex-col gap-4">
                <h3 className="text-xl font-black text-text-main">{role.title}</h3>
                <p className="text-sm text-text-muted font-medium leading-relaxed flex-1">{role.body}</p>
                <Link
                  href={role.href}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-accent-blue/30 bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white"
                >
                  {role.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-card-bg border-t border-border-subtle">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">FAQ</p>
            <h2 className="text-3xl font-black text-text-main tracking-tight">Before you enroll</h2>
          </div>
          <FaqList />
        </div>
      </section>
    </main>
  );
}
