// app/available-courses/[courseId]/payment/page.tsx
'use client';
import React, { use } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { mockCourses } from '@/data/courses';

const PaymentPage = ({ params }: { params: Promise<{ courseId: string }> }) => {
  const actualParams = use(params);
  const courseId = parseInt(actualParams.courseId, 10);
  const course = mockCourses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
      </div>
    );
  }

  const subtotal = course.price;
  const est = 2.00; // Example tax/fee
  const total = subtotal + est;

  return (
    <div className="w-full p-4 md:p-8">
      {/* ... (Header / Bell Icon) ... */}
      
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/available-courses" className="hover:underline">Available</Link>
        <ChevronRight size={16} className="mx-1" />
        <Link href={`/available-courses/${course.id}`} className="hover:underline">{course.title}</Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="font-medium text-gray-700">Payment</span>
      </nav>

      {/* Payment Layout (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Form */}
        <div className="max-w-lg">
          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card information</label>
              <div className="relative">
                <input type="text" placeholder="1234 1234 1234 1234" className="w-full p-2 border border-gray-300 rounded-md" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  {/* Card icons */}
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <input type="text" placeholder="MM / YY" className="w-1/2 p-2 border border-gray-300 rounded-md" />
                <input type="text" placeholder="CVC" className="w-1/2 p-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            <div>
              <label htmlFor="cardholder" className="block text-sm font-medium text-gray-700 mb-1">Cardholder name</label>
              <input type="text" id="cardholder" placeholder="Full name on card" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select id="country" className="w-full p-2 border border-gray-300 rounded-md">
                  <option>United States</option>
                  <option>Canada</option>
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input type="text" id="zip" className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            <Link href={`/available-courses/${course.id}/payment/success`} className="!mt-8 w-full block text-center py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800">
              Pay ${total.toFixed(2)}
            </Link>

            <p className="text-xs text-gray-500 text-center">
              By clicking Pay, you agree to the Link Terms and Privacy Policy.
            </p>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="h-fit lg:sticky top-8">
          <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
            <Image src={course.imageUrl} alt={course.title} width={100} height={80} className="rounded-md object-cover" />
            <div>
              <h4 className="font-semibold">{course.title}</h4>
              <p className="text-xl font-bold mt-1">${course.price.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 mt-6">
            <h4 className="text-lg font-semibold mb-4">Payment Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Course Price</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est.</span>
                <span>${est.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;