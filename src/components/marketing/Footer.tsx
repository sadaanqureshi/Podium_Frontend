import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-card-bg">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-3">
          <p className="text-text-main font-black text-lg tracking-tight uppercase">Podium</p>
          <p className="text-text-muted text-sm font-medium leading-relaxed">
            Academy LMS — browse courses, enroll, and learn with lectures, quizzes, and grades in one place.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Explore</p>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-semibold text-text-main hover:text-accent-blue">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Account</p>
          <ul className="space-y-2">
            <li>
              <Link href="/student/signin" className="text-sm font-semibold text-text-main hover:text-accent-blue">
                Student sign in
              </Link>
            </li>
            <li>
              <Link href="/student/signup" className="text-sm font-semibold text-text-main hover:text-accent-blue">
                Create account
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Get started</p>
          <Link
            href="/student/signup"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-hover-blue"
          >
            Student sign up
          </Link>
          <p className="text-xs text-text-muted font-medium">
            Need an academy account?{' '}
            <Link href="/contact?intent=institution" className="text-accent-blue font-bold hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-border-subtle px-6 py-4">
        <p className="max-w-7xl mx-auto text-[11px] text-text-muted font-medium">
          © {new Date().getFullYear()} Podium. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
