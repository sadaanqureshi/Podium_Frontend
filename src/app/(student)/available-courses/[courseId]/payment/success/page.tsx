// app/available-courses/[courseId]/payment/success/page.tsx
'use client';
import React from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const PaymentSuccessPage = () => {
  return (
    <div className="w-full p-8 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <CheckCircle size={64} className="text-blue-600" fill="white" />
      <h1 className="text-2xl font-bold mt-6 mb-2">Payment Successful!</h1>
      <p className="text-gray-600">
        You are successfully enrolled in 
        <Link href="/enroll-courses/1" className="text-blue-600 font-medium hover:underline">
          {' '}Introduction to UX Design
        </Link>
      </p>
    </div>
  );
};

export default PaymentSuccessPage;