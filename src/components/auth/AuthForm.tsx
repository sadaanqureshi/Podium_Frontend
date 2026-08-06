'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

// Import country codes for the phone field
import countryCodesData from '@/lib/countryCodesData.json';

export interface AuthFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'phone';
  placeholder?: string;
  required?: boolean;
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  fields: AuthFormField[];
  submitText: string;
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  isLoading: boolean;
  generalError: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  setGeneralError: (error: string) => void; 
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  fields,
  submitText,
  onSubmit,
  isLoading,
  generalError,
  footerText,
  footerLinkText,
  footerLinkHref,
  setGeneralError
}) => {
  
  // Initialize states
  const initialState = fields.reduce((acc, field) => {
    acc[field.id] = '';
    return acc;
  }, {} as Record<string, string>);

  const [formData, setFormData] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [selectedDialCode, setSelectedDialCode] = useState<string>("+92");

  const countryOptions = countryCodesData.map((country: any) => ({
      label: `${country.emoji} ${country.dial_code}`,
      value: country.dial_code
  }));

  const getMaxPhoneLength = () => {
      const country: any = countryCodesData.find((c: any) => c.dial_code === selectedDialCode);
      if (country && country.phoneLength) {
          return Math.max(...country.phoneLength); 
      }
      return 15; 
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear error
    if (fieldErrors[id]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    if (generalError) setGeneralError('');
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const nameRegex = /^[A-Za-z\s'-]+$/;
    const emailRegex = /^\S+@\S+\.\S+$/;

    fields.forEach((field) => {
      const val = formData[field.id]?.trim() || '';

      if (field.required && !val) {
        errors[field.id] = `${field.label} is required`;
      }

      if (val) {
        if (field.id === 'firstName' || field.id === 'lastName') {
          if (val.length < 2) errors[field.id] = "Must be at least 2 characters";
          else if (val.length > 20) errors[field.id] = "Must be less than 20 characters";
          else if (!nameRegex.test(val)) errors[field.id] = "Only letters allowed";
        }

        if (field.type === 'email') {
          if (!emailRegex.test(val)) errors[field.id] = "Valid email is required";
          else if (val.length > 30) errors[field.id] = "Must be less than 30 characters";
        }

        if (field.type === 'phone' || field.id === 'contactNumber') {
           const cleanNum = val.replace(/\D/g, ''); 
           const selectedCountry: any = countryCodesData.find((c: any) => c.dial_code === selectedDialCode); 
           
           if (!/^\d+$/.test(val)) {
               errors[field.id] = "Only numbers are allowed";
           } else if (selectedCountry && !selectedCountry.phoneLength.includes(cleanNum.length)) { 
               errors[field.id] = `Invalid length for ${selectedCountry.name} (${selectedCountry.phoneLength.join(' or ')} digits)`; 
           }
        }

        if (field.type === 'password' && field.id === 'password') {
          if (val.length < 6) errors[field.id] = "Must be at least 6 characters";
          else if (val.length > 20) errors[field.id] = "Must be less than 20 characters";
          else if (!/[a-z]/.test(val)) errors[field.id] = "Must contain lowercase letter";
          else if (!/[A-Z]/.test(val)) errors[field.id] = "Must contain uppercase letter";
          else if (!/[0-9]/.test(val)) errors[field.id] = "Must contain a number";
        }

        if (field.type === 'password' && field.id === 'confirmPassword') {
          if (val !== formData['password']) errors[field.id] = "Passwords do not match";
          else if (val.length < 6) errors[field.id] = "Must be at least 6 characters";
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const submissionData = { ...formData };
    fields.forEach(f => {
       if(f.type === 'phone') {
           const cleanNum = submissionData[f.id].replace(/\D/g, '');
           submissionData[f.id] = `${selectedDialCode}${cleanNum}`;
       }
    });

    await onSubmit(submissionData);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black mb-1 text-text-main tracking-tight">{title}</h1>
        <p className="text-text-muted text-xs font-medium">{subtitle}</p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => {
            const isFullWidth = fields.length <= 2 || field.type === 'email' || field.type === 'password' || field.type === 'phone';

            return (
              <div key={field.id} className={`space-y-1.5 ${isFullWidth ? 'sm:col-span-2' : 'sm:col-span-1'}`}>
                <label htmlFor={field.id} className="block text-[11px] font-bold text-text-main ml-1">
                  {field.label}
                </label>

                {field.type === 'password' ? (
                  <div className="relative">
                    <input
                      type={showPasswordMap[field.id] ? "text" : "password"}
                      id={field.id}
                      value={formData[field.id]}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder || "••••••••"}
                      className={`w-full pl-4 pr-10 py-3 bg-app-bg border text-sm text-text-main rounded-lg outline-none transition-all disabled:opacity-50 ${
                        fieldErrors[field.id] 
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors focus:outline-none"
                    >
                      {showPasswordMap[field.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                ) : field.type === 'phone' ? (
                  <div className={`flex items-stretch h-[46px] rounded-lg border transition-all ${
                    fieldErrors[field.id] 
                      ? 'border-red-500 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500/50' 
                      : 'border-border-subtle focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue bg-app-bg'
                  }`}>
                      <div className="w-[140px] shrink-0 border-r border-border-subtle h-full">
                          <CustomDropdown
                              options={countryOptions}
                              value={selectedDialCode}
                              onChange={(val) => {
                                  setSelectedDialCode(String(val));
                                  handleInputChange(field.id, ''); 
                              }}
                              placeholder="Code"
                              className="border-0 shadow-none hover:bg-transparent rounded-r-none h-full bg-transparent px-3" 
                          />
                      </div>
                      <input
                          type="text"
                          id={field.id}
                          placeholder={field.placeholder || "Enter phone number"}
                          value={formData[field.id] || ''}
                          maxLength={getMaxPhoneLength()}
                          onChange={(e) => {
                              const max = getMaxPhoneLength();
                              let clean = e.target.value.replace(/\D/g, '');
                              if(clean.length > max) clean = clean.slice(0, max);
                              handleInputChange(field.id, clean);
                          }} 
                          className="w-full h-full px-4 bg-transparent text-text-main text-sm font-medium outline-none rounded-r-lg"
                          disabled={isLoading}
                      />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    value={formData[field.id]}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 bg-app-bg border text-sm text-text-main rounded-lg outline-none transition-all disabled:opacity-50 ${
                      fieldErrors[field.id] 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30'
                    }`}
                    disabled={isLoading}
                  />
                )}

                {fieldErrors[field.id] && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors[field.id]}</p>
                )}
              </div>
            );
          })}
        </div>

        {generalError && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold text-center border border-red-500/20">
            {generalError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 bg-accent-blue text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : submitText}
        </button>
      </form>

      {(footerText || footerLinkText) && (
        <p className="text-xs text-center text-text-muted font-medium mt-4">
          {footerText}{' '}
          {footerLinkHref && footerLinkText && (
            <Link href={footerLinkHref} className="font-bold text-accent-blue hover:underline transition-all">
              {footerLinkText}
            </Link>
          )}
        </p>
      )}
    </div>
  );
};

export default AuthForm;