import React from 'react';
import LayoutWrapper from '@/components/sidebar/LayputWrapper'; // Aapka sidebar wala wrapper

// Yeh layout (main) group ke sabhi pages (dashboard, courses, etc.) par apply hoga
export default function StudentMainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Ab LayoutWrapper sirf (main) group ke pages par apply hoga
    <LayoutWrapper>
      {children} {/* Sidebar ke andar pages yahaan render honge */}
    </LayoutWrapper>
  );
}