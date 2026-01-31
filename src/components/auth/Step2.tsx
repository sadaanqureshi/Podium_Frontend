'use client';

import React, { Dispatch, SetStateAction } from 'react';
// 1. FIX: 'OnboardingData' type ko import karein
import { OnboardingData } from '@/app/(auth)/auth/onboarding/page';

// 2. FIX: Props interface ko update karein (NO 'any')
interface StepProps {
  data: OnboardingData;
  setData: Dispatch<SetStateAction<OnboardingData>>;
  nextStep: () => void;
}

const fields = [
  'Software Development',
  'Design',
  'Physics',
  'Chemistry',
  'Arts',
  'Maths',
];

const Step2Field: React.FC<StepProps> = ({ data, setData, nextStep }) => {

  // 3. FIX: 'setData' ko callback function ke saath istemaal karein
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prevData => ({
      ...prevData,
      learningField: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">What field are you learning for?</h2>

      <div className="space-y-3">
        {fields.map((field) => (
          <label key={field} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="learningField"
              value={field}
              checked={data.learningField === field} // 'data' prop se value lein
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-base text-gray-800">{field}</span>
          </label>
        ))}
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Step2Field;