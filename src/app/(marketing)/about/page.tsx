import Link from 'next/link';
import { ABOUT_CAPABILITIES, ROLE_CARDS } from '@/components/marketing/content';

export default function AboutPage() {
  return (
    <main className="px-6 py-12 md:py-16">
      <div className="max-w-7xl mx-auto space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">About Podium</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-text-main">
              LMS for academies — not a generic learning feed.
            </h1>
            <p className="text-text-muted text-lg font-medium leading-relaxed">
              Podium runs the classroom side of an academy: a course catalog, enrollment with fee review, teaching tools, and student progress. Students, teachers, and admins each get a portal that already exists in the product.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue"
              >
                Browse courses
              </Link>
              <Link
                href="/contact?intent=institution"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border-subtle bg-card-bg text-text-main text-[10px] font-black uppercase tracking-widest"
              >
                Contact for institutions
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-border-subtle bg-card-bg p-8 md:p-12 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Built for</p>
            {ROLE_CARDS.map((role) => (
              <div key={role.title} className="border-b border-border-subtle last:border-0 pb-4 last:pb-0">
                <h2 className="font-black text-text-main">{role.title}</h2>
                <p className="text-sm text-text-muted font-medium mt-1">{role.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-2">What you can do</p>
            <h2 className="text-3xl font-black text-text-main tracking-tight">The product, not a brochure</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ABOUT_CAPABILITIES.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-border-subtle bg-card-bg space-y-2">
                <h3 className="font-bold text-text-main">{item.title}</h3>
                <p className="text-sm text-text-muted font-medium leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-card-bg p-8 md:p-10 space-y-3">
          <h2 className="text-2xl font-black text-text-main">Trust &amp; access</h2>
          <p className="text-text-muted font-medium leading-relaxed max-w-3xl">
            Each role sees only its portal. Students request enrollment; admins review payment proof and unlock the course. Teachers grade work and take attendance. There is no public CDN claim here — access is account-based, the same way the app already works.
          </p>
        </section>
      </div>
    </main>
  );
}
