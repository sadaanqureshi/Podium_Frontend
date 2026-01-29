'use client';

import React, { Fragment, Dispatch, SetStateAction } from 'react'; // 'Fragment', 'Dispatch', 'SetStateAction' import karein
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
// 1. 'OnboardingData' type ko import karein
import { OnboardingData } from '@/app/(auth)/auth/onboarding/page';

// 2. Props interface ko update karein dev
interface StepProps {
  data: OnboardingData; // 'data' ki type
  setData: Dispatch<SetStateAction<OnboardingData>>; // 'setData' function ki type
  nextStep: () => void;
}

const Step1Details: React.FC<StepProps> = ({ data, setData, nextStep }) => {
  
  // 3. 'setData' ko hamesha callback function ke saath istemaal karein
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  // 4. Gender change ko bhi callback ke saath update karein
  const handleGenderChange = (value: string) => {
    setData(prevData => ({
      ...prevData,
      gender: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const genderOptions = ['Male', 'Female', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Enter Your Details</h2>
      
      {/* Full Name Input */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={data.fullName} // 'data' prop se value lein
          onChange={handleInputChange}
          placeholder="John Doe"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>

      {/* Date of Birth Input (Calendar) */}
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>
        <input
          type="date" // <-- YEH CALENDAR OPEN KAREGA
          id="dob"
          name="dob"
          value={data.dob} // 'data' prop se value lein
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>

      {/* Gender Dropdown (Khubsurat wala) */}
      <div>
        <Listbox value={data.gender} onChange={handleGenderChange}>
          <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white px-4 py-2 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
              <span className={`block truncate ${data.gender ? 'text-gray-900' : 'text-gray-400'}`}>
                {data.gender || "Gender"} {/* Placeholder (jaisa screenshot mein hai) */}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown size={20} className="text-gray-400" />
              </span>
            </Listbox.Button>
            
            {/* Smooth Animation (Fade + Scale) */}
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              {/* Dropdown Options (Rounded) */}
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                {genderOptions.map((gender) => (
                  <Listbox.Option
                    key={gender}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                    value={gender}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {gender}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <Check size={20} />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
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

export default Step1Details;