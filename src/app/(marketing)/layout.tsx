import type { Metadata } from 'next';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { MarketingFooter } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Podium — Course marketplace',
  description: 'Browse academy courses, enroll, and learn with lectures, quizzes, and grades in one LMS.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-text-main">
      <MarketingNavbar />
      <div className="flex-1 pt-24 md:pt-28">{children}</div>
      <MarketingFooter />
    </div>
  );
}
