'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// React 19 / Next 16 flags next-themes' FOUC <script> as an error.
// That script is intentional and runs during SSR — suppress the false positive
// so the error overlay does not block navigation (e.g. Attendance).
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('Encountered a script tag')) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    // 'class' attribute hona zaroori hai taaki Tailwind ko signal miley
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
