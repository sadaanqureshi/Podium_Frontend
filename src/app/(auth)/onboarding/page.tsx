'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';

import Step1Details from '@/components/auth/Step1';
import Step2Field from '@/components/auth/Step2';
import Step3Interests from '@/components/auth/Step3';

// 1. FIX: 'OnboardingData' type ko EXPORT karein taaki doosre components use import kar sakein
export interface OnboardingData {
  fullName: string;
  dob: string;
  gender: string;
  learningField: string;
  interests: string[];
}

const OnboardingPage = () => {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    dob: '',
    gender: '', // Placeholder ke liye empty string
    learningField: 'Software Development',
    interests: [],
  });

  const nextStep = () => setCurrentStep(prev => (prev < 3 ? prev + 1 : 3));

  const handleFinalSubmit = async () => {
    console.log('Submitting Onboarding Data:', formData);
    // ... (Backend API call logic)
    router.push('/dashboard');
  };

  const progress = Math.round((currentStep / 3) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="py-4 px-8 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BookOpen size={28} className="text-black" />
          <span className="text-xl font-bold">Podium Professional</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200">
        <div
          className="h-2 bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Form Content Area */}
      <main className="flex-grow w-full p-8 md:p-16">
        <div className="w-full max-w-2xl">
          {/* Conditional rendering: Sahi step dikhayein */}
          {/* Hum 'setFormData' ko props ke zariye pass kar rahe hain */}
          {currentStep === 1 && (
            <Step1Details 
              data={formData} 
              setData={setFormData} // setFormData function pass karein
              nextStep={nextStep} 
            />
          )}
          {currentStep === 2 && (
            <Step2Field 
              data={formData} 
              setData={setFormData} // setFormData function pass karein
              nextStep={nextStep} 
            />
          )}
          {currentStep === 3 && (
            <Step3Interests 
              data={formData} 
              setData={setFormData} // setFormData function pass karein
              submit={handleFinalSubmit} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;