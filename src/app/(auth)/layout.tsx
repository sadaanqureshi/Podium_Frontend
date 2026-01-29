import React from 'react';

// Yeh layout (auth) group ke sabhi pages (signin, signup) par apply hoga
// Ismein koi sidebar nahi hai
export default function AuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Signin/Signup page yahaan render honge (bina sidebar) */}
      {children}
    </div>
  );
}