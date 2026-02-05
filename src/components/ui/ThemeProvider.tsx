// 'use client';
// import { ThemeProvider as NextThemesProvider } from 'next-themes';

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
//       {children}
//     </NextThemesProvider>
//   );
// }

'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    // 'class' attribute hona zaroori hai taaki Tailwind ko signal miley
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}