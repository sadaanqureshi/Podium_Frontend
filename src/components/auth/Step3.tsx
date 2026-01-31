'use client';

import React, { Dispatch, SetStateAction } from 'react';
// 1. FIX: 'OnboardingData' type ko import karein
import { OnboardingData } from '@/app/(auth)/auth/onboarding/page';

// 2. FIX: Props interface ko update karein (NO 'any')
interface StepProps {
  data: OnboardingData;
  setData: Dispatch<SetStateAction<OnboardingData>>;
  submit: () => void;
}

const interestsList = [
  'Public Speaking', 'Social Media Management', 'Translation', 'Medical', 'IT',
  'Music Performance', 'Event Coordination', 'Sustainable Agriculture', 'Law', 'Dispute Resolution',
  'Graphic Design', 'Veterinary Support'
];

const Step3Interests: React.FC<StepProps> = ({ data, setData, submit }) => {

  // 3. FIX: 'setData' ko callback function ke saath istemaal karein
  const toggleInterest = (interest: string) => {
    setData(prevData => {
      // Yahaan 'prevData.interests' ka undefined hona check karna zaroori hai
      const currentInterests = prevData.interests || [];
      const isSelected = currentInterests.includes(interest);

      let newInterests = [];
      if (isSelected) {
        newInterests = currentInterests.filter((item: string) => item !== interest);
      } else {
        newInterests = [...currentInterests, interest];
      }

      // Naya object return karein
      return { ...prevData, interests: newInterests };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Select your interest areas</h2>

      <div className="flex flex-wrap gap-3">
        {interestsList.map((interest) => {
          // Yahaan 'data.interests' ka undefined hona check karna zaroori hai
          const isSelected = (data.interests || []).includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${isSelected
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {interest}
            </button>
          );
        })}
      </div>

      {/* Done Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </form>
  );
};

export default Step3Interests;