// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//     X,
//     Loader2,
//     AlertCircle,
//     CalendarDays
// } from 'lucide-react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import QuizBuilderField from './QuizBuilderField';
// import CustomDropdown from './CustomDropdown';

// import countryCodesData from '@/lib/countryCodesData.json';

// export interface FormField {
//     name: string;
//     label: string;
//     type: 'text' | 'number' | 'textarea' | 'select' | 'files' | 'checkbox-group' | 'date' | 'time' | 'datetime-local' | 'quiz-builder' | 'phone';
//     placeholder?: string;
//     required?: boolean;
//     options?: { label: string; value: string | number }[];
// }

// interface GenericFormModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     title: string;
//     fields: FormField[];
//     onSubmit: (data: FormData) => Promise<void>;
//     loading?: boolean;
//     initialData?: any;
//     submitText?: string;
// }

// const GenericFormModal: React.FC<GenericFormModalProps> = ({
//     isOpen,
//     onClose,
//     title,
//     fields,
//     onSubmit,
//     loading,
//     initialData,
//     submitText
// }) => {
//     const [formValues, setFormValues] = useState<Record<string, any>>({});
//     const [errors, setErrors] = useState<Record<string, string>>({});

//     // 👉 STATE FOR PHONE NUMBER DROPDOWN
//     const [selectedDialCode, setSelectedDialCode] = useState<string>("+92");

//     // Convert JSON country data to CustomDropdown format
//     const countryOptions = countryCodesData.map((country: any) => ({
//         label: `${country.emoji} ${country.dial_code}`,
//         value: country.dial_code
//     }));

//     // Get max allowed length for currently selected country
//     const getMaxPhoneLength = () => {
//         const country: any = countryCodesData.find((c: any) => c.dial_code === selectedDialCode);
//         if (country && country.phoneLength) {
//             return Math.max(...country.phoneLength);
//         }
//         return 15;
//     };

//     // Calculate current datetime to prevent past selection
//     const minDate = new Date();

//     useEffect(() => {
//         if (isOpen && initialData) {
//             const formattedData = { ...initialData };
//             const startTime = initialData.start_time || initialData.startTime;
//             const endTime = initialData.end_time || initialData.endTime;
//             const totalMarks = initialData.total_marks || initialData.totalMarks;

//             // Using Date objects for react-datepicker instead of ISO strings
//             if (startTime) formattedData.start_time = new Date(startTime);
//             if (endTime) formattedData.end_time = new Date(endTime);
//             if (totalMarks) formattedData.total_marks = totalMarks;

//             if (initialData.contactNumber) {
//                 const numStr = String(initialData.contactNumber);
//                 const sortedCodes = [...countryCodesData].sort((a: any, b: any) => b.dial_code.length - a.dial_code.length);
//                 const matchedCountry = sortedCodes.find((c: any) => numStr.startsWith(c.dial_code));

//                 if (matchedCountry) {
//                     setSelectedDialCode(matchedCountry.dial_code);
//                     formattedData.contactNumber = numStr.replace(matchedCountry.dial_code, '').trim();
//                 }
//             }

//             setFormValues(formattedData);
//         } else {
//             setFormValues({});
//             setErrors({});
//             setSelectedDialCode("+92");
//         }
//     }, [isOpen, initialData]);

//     const validate = () => {
//         const newErrors: Record<string, string> = {};
//         const nameRegex = /^[A-Za-z\s'-]+$/;
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         fields.forEach((field) => {
//             const val = formValues[field.name];

//             if (field.required && (!val || (Array.isArray(val) && val.length === 0))) {
//                 newErrors[field.name] = `${field.label} is required.`;
//             }

//             if (val) {
//                 if (field.name === 'firstName' || field.name === 'lastName') {
//                     if (val.length < 3 || val.length > 50) newErrors[field.name] = "Must be 3-50 characters.";
//                     else if (!nameRegex.test(val)) newErrors[field.name] = "Only letters, spaces, hyphens allowed.";
//                 }

//                 if (field.name === 'email') {
//                     if (!emailRegex.test(val)) newErrors[field.name] = "Enter a valid email address.";
//                     else if (val.length < 5 || val.length > 100) newErrors[field.name] = "Email volume out of range.";
//                 }

//                 if (field.type === 'phone' || field.name === 'contactNumber') {
//                     const cleanNum = val.replace(/\D/g, '');
//                     const selectedCountry: any = countryCodesData.find((c: any) => c.dial_code === selectedDialCode);

//                     if (!/^\d+$/.test(val)) {
//                         newErrors[field.name] = "Only numbers are allowed.";
//                     } else if (selectedCountry && !selectedCountry.phoneLength.includes(cleanNum.length)) {
//                         newErrors[field.name] = `Invalid length for ${selectedCountry.name} (${selectedCountry.phoneLength.join(' or ')} digits).`;
//                     }
//                 }

//                 if (field.name === 'password' && val.length < 6) {
//                     newErrors[field.name] = "Password must be min 6 characters.";
//                 }
//             }

//             if (field.type === 'quiz-builder' && val) {
//                 const quiz = val as any[];
//                 quiz.forEach((q, idx) => {
//                     if (!q.question_text) newErrors[field.name] = `Question ${idx + 1} has no text.`;
//                     if (q.question_type !== 'SHORT') {
//                         if (!q.options || q.options.length < 2) newErrors[field.name] = `Question ${idx + 1} requires 2+ options.`;
//                         if (!q.options.some((o: any) => o.is_correct)) newErrors[field.name] = `Question ${idx + 1} missing correct key.`;
//                     }
//                 });
//             }
//         });

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleInputChange = (name: string, value: any) => {
//         setFormValues({ ...formValues, [name]: value });
//         if (errors[name]) {
//             setErrors((prev) => {
//                 const updated = { ...prev };
//                 delete updated[name];
//                 return updated;
//             });
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!validate()) return;

//         const formData = new FormData();
//         fields.forEach((field) => {
//             let value = formValues[field.name];

//             if (field.type === 'files') {
//                 if (value instanceof File) formData.append(field.name, value);
//             } else if (field.type === 'quiz-builder') {
//                 formData.append(field.name, JSON.stringify(value || []));
//             }
//             else if (field.type === 'phone' || field.name === 'contactNumber') {
//                 if (value) {
//                     const cleanNum = String(value).replace(/\D/g, '');
//                     formData.append(field.name, `${selectedDialCode}${cleanNum}`);
//                 }
//             }
//             // 👉 FORMATTING DATE FOR API SUBMISSION
//             else if (field.type === 'date' || field.type === 'datetime-local') {
//                 if (value) {
//                     formData.append(field.name, new Date(value).toISOString());
//                 }
//             }
//             else if (field.type === 'number' && value !== null && value !== undefined && value !== "") {
//                 formData.append(field.name, value.toString());
//             } else if (value !== null && value !== undefined && value !== "") {
//                 formData.append(field.name, value.toString());
//             }
//         });

//         try {
//             await onSubmit(formData);
//         } catch (err: any) {
//             console.error("Submission failed");
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
//             <div className="bg-card-bg w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border-subtle">

//                 <div className="flex justify-between items-center px-8 py-6 border-b border-border-subtle bg-app-bg/50">
//                     <div>
//                         <h2 className="text-xl font-bold tracking-tight text-text-main">{title}</h2>
//                         <p className="text-xs text-text-muted mt-1 font-medium">Please fill in the details below.</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-border-subtle rounded-lg transition-colors">
//                         <X size={20} />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="overflow-y-visible bg-card-bg flex-1">
//                     <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
//                             {fields.map((field) => (
//                                 <div key={field.name} className={(field.type === 'textarea' || field.type === 'quiz-builder') ? 'md:col-span-2' : ''}>
//                                     <label className="block text-xs font-semibold text-text-main mb-2">
//                                         {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
//                                     </label>

//                                     {field.type === 'quiz-builder' ? (
//                                         <QuizBuilderField
//                                             initialData={formValues[field.name]}
//                                             onChange={(data) => handleInputChange(field.name, data)}
//                                             error={errors[field.name]}
//                                         />
//                                     ) : (
//                                         <div className="space-y-1 relative">
//                                             {field.type === 'select' ? (
//                                                 <CustomDropdown
//                                                     options={field.options || []}
//                                                     value={formValues[field.name] || ''}
//                                                     onChange={(val) => handleInputChange(field.name, val)}
//                                                     placeholder={`Select ${field.label}`}
//                                                     className={errors[field.name] ? 'border-red-500 bg-red-500/10 focus:ring-red-500/20' : 'bg-app-bg'}
//                                                 />
//                                             ) : field.type === 'phone' || field.name === 'contactNumber' ? (

//                                                 <div className={`flex items-stretch h-[46px] rounded-xl border transition-all ${errors[field.name] ? 'border-red-500 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500/50' : 'border-border-subtle focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue bg-app-bg'}`}>
//                                                     <div className="w-[140px] shrink-0 border-r border-border-subtle h-full">
//                                                         <CustomDropdown
//                                                             options={countryOptions}
//                                                             value={selectedDialCode}
//                                                             onChange={(val) => {
//                                                                 setSelectedDialCode(String(val));
//                                                                 handleInputChange(field.name, '');
//                                                             }}
//                                                             placeholder="Code"
//                                                             className="border-0 shadow-none hover:bg-transparent rounded-r-none h-full bg-transparent px-3"
//                                                         />
//                                                     </div>

//                                                     <input
//                                                         type="text"
//                                                         placeholder={field.placeholder || "Enter phone number"}
//                                                         value={formValues[field.name] || ''}
//                                                         maxLength={getMaxPhoneLength()}
//                                                         onChange={(e) => {
//                                                             const max = getMaxPhoneLength();
//                                                             let clean = e.target.value.replace(/\D/g, '');
//                                                             if (clean.length > max) clean = clean.slice(0, max);
//                                                             handleInputChange(field.name, clean);
//                                                         }}
//                                                         className="w-full h-full px-4 bg-transparent text-text-main text-sm font-medium outline-none rounded-r-xl"
//                                                     />
//                                                 </div>

//                                             ) : field.type === 'date' || field.type === 'datetime-local' ? (

//                                                 // 👉 MODERN CALENDAR WITH REACT-DATEPICKER
//                                                 <div className={`relative flex items-center rounded-xl border transition-all h-[46px] bg-app-bg overflow-visible ${errors[field.name] ? 'border-red-500 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500/50' : 'border-border-subtle focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue'}`}>
//                                                     <DatePicker
//                                                         selected={formValues[field.name] ? new Date(formValues[field.name]) : null}
//                                                         onChange={(date: Date | null) => handleInputChange(field.name, date)} // 👉 Type yahan fix ki gayi hai
//                                                         minDate={minDate}
//                                                         showTimeSelect={field.type === 'datetime-local'}
//                                                         timeFormat="HH:mm"
//                                                         timeIntervals={15}
//                                                         timeCaption="time"
//                                                         dateFormat={field.type === 'datetime-local' ? "MMMM d, yyyy h:mm aa" : "MMMM d, yyyy"}
//                                                         placeholderText={field.placeholder || "Select a date"}
//                                                         className="w-full h-[46px] px-4 bg-transparent text-text-main text-sm font-medium outline-none rounded-xl cursor-pointer"
//                                                         wrapperClassName="w-full"
//                                                         popperPlacement="bottom-start"
//                                                         popperProps={{
//                                                             strategy: 'fixed'
//                                                         }}
//                                                     />
//                                                     <div className="absolute right-4 pointer-events-none text-text-muted">
//                                                         <CalendarDays size={18} />
//                                                     </div>
//                                                 </div>

//                                             ) : (
//                                                 <input
//                                                     type={field.type === 'files' ? 'file' : (field.type === 'textarea' ? 'text' : field.type)}
//                                                     placeholder={field.placeholder}
//                                                     value={field.type === 'files' ? undefined : (formValues[field.name] || '')}
//                                                     onChange={(e) => {
//                                                         if (field.type === 'files') {
//                                                             const file = e.target.files?.[0];
//                                                             handleInputChange(field.name, file || null);
//                                                         } else {
//                                                             handleInputChange(field.name, e.target.value);
//                                                         }
//                                                     }}
//                                                     className={`w-full h-[46px] px-4 rounded-xl border bg-app-bg text-text-main text-sm font-medium transition-all outline-none focus:ring-1 focus:ring-accent-blue ${errors[field.name] ? 'border-red-500 bg-red-500/5 focus:ring-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent-blue'} ${field.type === 'files' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent-blue/10 file:text-accent-blue hover:file:bg-accent-blue/20 cursor-pointer text-text-muted' : ''}`}
//                                                 />
//                                             )}

//                                             {errors[field.name] && (
//                                                 <div className="flex items-center gap-1.5 mt-1 text-red-500">
//                                                     <AlertCircle size={14} />
//                                                     <span className="text-xs font-medium">{errors[field.name]}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="px-8 py-5 bg-app-bg/90 flex justify-end gap-3 border-t border-border-subtle z-10 backdrop-blur-md">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-6 py-2.5 text-sm font-semibold text-text-muted hover:text-text-main hover:bg-border-subtle rounded-xl transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="px-6 py-2.5 bg-accent-blue text-white rounded-xl font-semibold text-sm hover:bg-hover-blue disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
//                         >
//                             {loading && <Loader2 size={16} className="animate-spin" />}
//                             {submitText || 'Save Changes'}
//                         </button>
//                     </div>
//                 </form>
//             </div>

//            {/* OVERRIDING REACT-DATEPICKER DEFAULT STYLES FOR THEME CONSISTENCY */}
//             <style jsx global>{`
//                 .react-datepicker-wrapper {
//                     width: 100%;
//                 }
//                 .react-datepicker-popper {
//                     z-index: 999999 !important;
//                 }
//                 .react-datepicker {
//                     font-family: inherit;
//                     background-color: var(--card-bg, #1a1b1e);
//                     border: 1px solid var(--border-subtle, #2d3748);
//                     border-radius: 12px;
//                     color: var(--text-main, #e5e7eb);
//                     box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
//                     overflow: hidden;
//                 }
//                 .react-datepicker__header {
//                     background-color: var(--app-bg, #111827);
//                     border-bottom: 1px solid var(--border-subtle, #2d3748);
//                     padding-top: 12px;
//                 }
//                 .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
//                     color: var(--text-main, #e5e7eb);
//                     font-weight: 700;
//                     font-size: 0.875rem;
//                 }
//                 .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
//                     color: var(--text-main, #e5e7eb);
//                 }
//                 .react-datepicker__day:hover, .react-datepicker__month-text:hover, .react-datepicker__quarter-text:hover, .react-datepicker__year-text:hover {
//                     background-color: var(--border-subtle, #374151);
//                     border-radius: 6px;
//                 }
//                 .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range, .react-datepicker__month-text--selected, .react-datepicker__month-text--in-selecting-range, .react-datepicker__month-text--in-range, .react-datepicker__quarter-text--selected, .react-datepicker__quarter-text--in-selecting-range, .react-datepicker__quarter-text--in-range, .react-datepicker__year-text--selected, .react-datepicker__year-text--in-selecting-range, .react-datepicker__year-text--in-range {
//                     background-color: #3b82f6; /* accent-blue */
//                     color: white;
//                     border-radius: 6px;
//                     font-weight: bold;
//                 }
//                 .react-datepicker__day--disabled, .react-datepicker__month-text--disabled, .react-datepicker__quarter-text--disabled, .react-datepicker__year-text--disabled {
//                     color: var(--text-muted, #9ca3af);
//                     opacity: 0.3;
//                 }
                
//                 /* 👉 FIXED FOR BOTH LIGHT AND DARK MODES */
//                 .react-datepicker__time-container {
//                     border-left: 1px solid var(--border-subtle, #2d3748);
//                     background-color: var(--card-bg, #1a1b1e); 
//                 }
//                 .react-datepicker__time-container .react-datepicker__time {
//                     background-color: var(--card-bg, #1a1b1e) !important; 
//                 }
//                 .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
//                     padding: 8px 12px;
//                     color: var(--text-main, #e5e7eb); 
//                 }
//                 .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
//                     background-color: var(--border-subtle, #374151) !important;
//                     color: var(--text-main) !important; /* 👉 FORCED WHITE HATA DIYA HAI */
//                 }
//                 .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
//                     background-color: #3b82f6 !important;
//                     color: white !important;
//                     font-weight: bold;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default GenericFormModal;


'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Loader2,
    AlertCircle,
    CalendarDays
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import QuizBuilderField from './QuizBuilderField';
import CustomDropdown from './CustomDropdown';

import countryCodesData from '@/lib/countryCodesData.json';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'files' | 'checkbox-group' | 'date' | 'time' | 'datetime-local' | 'quiz-builder' | 'phone';
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string | number }[];
}

interface GenericFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    fields: FormField[];
    onSubmit: (data: FormData) => Promise<void>;
    loading?: boolean;
    initialData?: any;
    submitText?: string;
}

const GenericFormModal: React.FC<GenericFormModalProps> = ({
    isOpen,
    onClose,
    title,
    fields,
    onSubmit,
    loading,
    initialData,
    submitText
}) => {
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 👉 STATE FOR PHONE NUMBER DROPDOWN
    const [selectedDialCode, setSelectedDialCode] = useState<string>("+92");

    // Convert JSON country data to CustomDropdown format
    const countryOptions = countryCodesData.map((country: any) => ({
        label: `${country.emoji} ${country.dial_code}`,
        value: country.dial_code
    }));

    // Get max allowed length for currently selected country
    const getMaxPhoneLength = () => {
        const country: any = countryCodesData.find((c: any) => c.dial_code === selectedDialCode);
        if (country && country.phoneLength) {
            return Math.max(...country.phoneLength);
        }
        return 15;
    };

    // Calculate current datetime to prevent past selection
    const minDate = new Date();

    useEffect(() => {
        if (isOpen && initialData) {
            const formattedData = { ...initialData };
            const startTime = initialData.start_time || initialData.startTime;
            const endTime = initialData.end_time || initialData.endTime;
            const totalMarks = initialData.total_marks || initialData.totalMarks;

            // Using Date objects for react-datepicker instead of ISO strings
            if (startTime) formattedData.start_time = new Date(startTime);
            if (endTime) formattedData.end_time = new Date(endTime);
            if (totalMarks) formattedData.total_marks = totalMarks;

            if (initialData.contactNumber) {
                const numStr = String(initialData.contactNumber);
                const sortedCodes = [...countryCodesData].sort((a: any, b: any) => b.dial_code.length - a.dial_code.length);
                const matchedCountry = sortedCodes.find((c: any) => numStr.startsWith(c.dial_code));

                if (matchedCountry) {
                    setSelectedDialCode(matchedCountry.dial_code);
                    formattedData.contactNumber = numStr.replace(matchedCountry.dial_code, '').trim();
                }
            }

            setFormValues(formattedData);
        } else {
            setFormValues({});
            setErrors({});
            setSelectedDialCode("+92");
        }
    }, [isOpen, initialData]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const nameRegex = /^[A-Za-z\s'-]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // 👉 CHECKING FOR END TIME LOGIC BEFORE LOOPING
        const hasStartTime = fields.some(f => f.name === 'start_time' || f.name === 'startTime');
        const hasEndTime = fields.some(f => f.name === 'end_time' || f.name === 'endTime');

        if (hasStartTime && hasEndTime) {
            const startVal = formValues['start_time'] || formValues['startTime'];
            const endVal = formValues['end_time'] || formValues['endTime'];

            if (startVal && endVal) {
                const start = new Date(startVal).getTime();
                const end = new Date(endVal).getTime();

                if (end <= start) {
                    const endFieldName = formValues['end_time'] !== undefined ? 'end_time' : 'endTime';
                    newErrors[endFieldName] = "End time must be after the start time.";
                }
            }
        }

        fields.forEach((field) => {
            const val = formValues[field.name];

            if (field.required && (!val || (Array.isArray(val) && val.length === 0))) {
                newErrors[field.name] = `${field.label} is required.`;
            }

            if (val) {
                if (field.name === 'firstName' || field.name === 'lastName') {
                    if (val.length < 3 || val.length > 50) newErrors[field.name] = "Must be 3-50 characters.";
                    else if (!nameRegex.test(val)) newErrors[field.name] = "Only letters, spaces, hyphens allowed.";
                }

                if (field.name === 'email') {
                    if (!emailRegex.test(val)) newErrors[field.name] = "Enter a valid email address.";
                    else if (val.length < 5 || val.length > 100) newErrors[field.name] = "Email volume out of range.";
                }

                if (field.type === 'phone' || field.name === 'contactNumber') {
                    const cleanNum = val.replace(/\D/g, '');
                    const selectedCountry: any = countryCodesData.find((c: any) => c.dial_code === selectedDialCode);

                    if (!/^\d+$/.test(val)) {
                        newErrors[field.name] = "Only numbers are allowed.";
                    } else if (selectedCountry && !selectedCountry.phoneLength.includes(cleanNum.length)) {
                        newErrors[field.name] = `Invalid length for ${selectedCountry.name} (${selectedCountry.phoneLength.join(' or ')} digits).`;
                    }
                }

                if (field.name === 'password' && val.length < 6) {
                    newErrors[field.name] = "Password must be min 6 characters.";
                }
            }

            if (field.type === 'quiz-builder' && val) {
                const quiz = val as any[];
                quiz.forEach((q, idx) => {
                    if (!q.question_text) newErrors[field.name] = `Question ${idx + 1} has no text.`;
                    if (q.question_type !== 'SHORT') {
                        if (!q.options || q.options.length < 2) newErrors[field.name] = `Question ${idx + 1} requires 2+ options.`;
                        if (!q.options.some((o: any) => o.is_correct)) newErrors[field.name] = `Question ${idx + 1} missing correct key.`;
                    }
                });
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (name: string, value: any) => {
        setFormValues({ ...formValues, [name]: value });
        if (errors[name]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const formData = new FormData();
        fields.forEach((field) => {
            let value = formValues[field.name];

            if (field.type === 'files') {
                if (value instanceof File) formData.append(field.name, value);
            } else if (field.type === 'quiz-builder') {
                formData.append(field.name, JSON.stringify(value || []));
            }
            else if (field.type === 'phone' || field.name === 'contactNumber') {
                if (value) {
                    const cleanNum = String(value).replace(/\D/g, '');
                    formData.append(field.name, `${selectedDialCode}${cleanNum}`);
                }
            }
            // 👉 FORMATTING DATE FOR API SUBMISSION
            else if (field.type === 'date' || field.type === 'datetime-local') {
                if (value) {
                    formData.append(field.name, new Date(value).toISOString());
                }
            }
            else if (field.type === 'number' && value !== null && value !== undefined && value !== "") {
                formData.append(field.name, value.toString());
            } else if (value !== null && value !== undefined && value !== "") {
                formData.append(field.name, value.toString());
            }
        });

        try {
            await onSubmit(formData);
        } catch (err: any) {
            console.error("Submission failed");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card-bg w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border-subtle">

                <div className="flex justify-between items-center px-8 py-6 border-b border-border-subtle bg-app-bg/50">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main">{title}</h2>
                        <p className="text-xs text-text-muted mt-1 font-medium">Please fill in the details below.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-border-subtle rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-visible bg-card-bg flex-1">
                    <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {fields.map((field) => {
                                // Determine minDate for end_time based on start_time
                                let dynamicMinDate = minDate;
                                if (field.name === 'end_time' || field.name === 'endTime') {
                                    const startVal = formValues['start_time'] || formValues['startTime'];
                                    if (startVal) {
                                        dynamicMinDate = new Date(startVal);
                                    }
                                }

                                return (
                                <div key={field.name} className={(field.type === 'textarea' || field.type === 'quiz-builder') ? 'md:col-span-2' : ''}>
                                    <label className="block text-xs font-semibold text-text-main mb-2">
                                        {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                    </label>

                                    {field.type === 'quiz-builder' ? (
                                        <QuizBuilderField
                                            initialData={formValues[field.name]}
                                            onChange={(data) => handleInputChange(field.name, data)}
                                            error={errors[field.name]}
                                        />
                                    ) : (
                                        <div className="space-y-1 relative">
                                            {field.type === 'select' ? (
                                                <CustomDropdown
                                                    options={field.options || []}
                                                    value={formValues[field.name] || ''}
                                                    onChange={(val) => handleInputChange(field.name, val)}
                                                    placeholder={`Select ${field.label}`}
                                                    className={errors[field.name] ? 'border-red-500 bg-red-500/10 focus:ring-red-500/20' : 'bg-app-bg'}
                                                />
                                            ) : field.type === 'phone' || field.name === 'contactNumber' ? (

                                                <div className={`flex items-stretch h-[46px] rounded-xl border transition-all ${errors[field.name] ? 'border-red-500 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500/50' : 'border-border-subtle focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue bg-app-bg'}`}>
                                                    <div className="w-[140px] shrink-0 border-r border-border-subtle h-full">
                                                        <CustomDropdown
                                                            options={countryOptions}
                                                            value={selectedDialCode}
                                                            onChange={(val) => {
                                                                setSelectedDialCode(String(val));
                                                                handleInputChange(field.name, '');
                                                            }}
                                                            placeholder="Code"
                                                            className="border-0 shadow-none hover:bg-transparent rounded-r-none h-full bg-transparent px-3"
                                                        />
                                                    </div>

                                                    <input
                                                        type="text"
                                                        placeholder={field.placeholder || "Enter phone number"}
                                                        value={formValues[field.name] || ''}
                                                        maxLength={getMaxPhoneLength()}
                                                        onChange={(e) => {
                                                            const max = getMaxPhoneLength();
                                                            let clean = e.target.value.replace(/[^0-9]/g, '');
                                                            if (clean.length > max) clean = clean.slice(0, max);
                                                            handleInputChange(field.name, clean);
                                                        }}
                                                        className="w-full h-full px-4 bg-transparent text-text-main text-sm font-medium outline-none rounded-r-xl"
                                                    />
                                                </div>

                                            ) : field.type === 'date' || field.type === 'datetime-local' ? (

                                                // 👉 MODERN CALENDAR WITH REACT-DATEPICKER
                                                <div className={`relative flex items-center rounded-xl border transition-all h-[46px] bg-app-bg overflow-visible ${errors[field.name] ? 'border-red-500 bg-red-500/5 focus-within:ring-1 focus-within:ring-red-500/50' : 'border-border-subtle focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue'}`}>
                                                    <DatePicker
                                                        selected={formValues[field.name] ? new Date(formValues[field.name]) : null}
                                                        onChange={(date: Date | null) => handleInputChange(field.name, date)}
                                                        minDate={dynamicMinDate}
                                                        showTimeSelect={field.type === 'datetime-local'}
                                                        timeFormat="h:mm aa" // Changed to 12-hour format with AM/PM
                                                        timeIntervals={15}
                                                        timeCaption="time"
                                                        dateFormat={field.type === 'datetime-local' ? "MMMM d, yyyy h:mm aa" : "MMMM d, yyyy"}
                                                        placeholderText={field.placeholder || "Select a date"}
                                                        className="w-full h-[46px] px-4 bg-transparent text-text-main text-sm font-medium outline-none rounded-xl cursor-pointer"
                                                        wrapperClassName="w-full"
                                                        popperPlacement="bottom-start"
                                                        popperProps={{
                                                            strategy: 'fixed'
                                                        }}
                                                    />
                                                    <div className="absolute right-4 pointer-events-none text-text-muted">
                                                        <CalendarDays size={18} />
                                                    </div>
                                                </div>

                                            ) : (
                                                <input
                                                    type={field.type === 'files' ? 'file' : (field.type === 'textarea' ? 'text' : field.type)}
                                                    placeholder={field.placeholder}
                                                    value={field.type === 'files' ? undefined : (formValues[field.name] || '')}
                                                    onChange={(e) => {
                                                        if (field.type === 'files') {
                                                            const file = e.target.files?.[0];
                                                            handleInputChange(field.name, file || null);
                                                        } else {
                                                            handleInputChange(field.name, e.target.value);
                                                        }
                                                    }}
                                                    className={`w-full h-[46px] px-4 rounded-xl border bg-app-bg text-text-main text-sm font-medium transition-all outline-none focus:ring-1 focus:ring-accent-blue ${errors[field.name] ? 'border-red-500 bg-red-500/5 focus:ring-red-500/50 focus:border-red-500' : 'border-border-subtle focus:border-accent-blue'} ${field.type === 'files' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent-blue/10 file:text-accent-blue hover:file:bg-accent-blue/20 cursor-pointer text-text-muted' : ''}`}
                                                />
                                            )}

                                            {errors[field.name] && (
                                                <div className="flex items-center gap-1.5 mt-1 text-red-500">
                                                    <AlertCircle size={14} />
                                                    <span className="text-xs font-medium">{errors[field.name]}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>

                    <div className="px-8 py-5 bg-app-bg/90 flex justify-end gap-3 border-t border-border-subtle z-10 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-semibold text-text-muted hover:text-text-main hover:bg-border-subtle rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-accent-blue text-white rounded-xl font-semibold text-sm hover:bg-hover-blue disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {submitText || 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* OVERRIDING REACT-DATEPICKER DEFAULT STYLES FOR THEME CONSISTENCY */}
            <style jsx global>{`
                .react-datepicker-wrapper {
                    width: 100%;
                }
                .react-datepicker-popper {
                    z-index: 999999 !important;
                }
                .react-datepicker {
                    font-family: inherit;
                    background-color: var(--card-bg, #1a1b1e);
                    border: 1px solid var(--border-subtle, #2d3748);
                    border-radius: 12px;
                    color: var(--text-main, #e5e7eb);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .react-datepicker__header {
                    background-color: var(--app-bg, #111827);
                    border-bottom: 1px solid var(--border-subtle, #2d3748);
                    padding-top: 12px;
                }
                .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
                    color: var(--text-main, #e5e7eb);
                    font-weight: 700;
                    font-size: 0.875rem;
                }
                .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
                    color: var(--text-main, #e5e7eb);
                }
                .react-datepicker__day:hover, .react-datepicker__month-text:hover, .react-datepicker__quarter-text:hover, .react-datepicker__year-text:hover {
                    background-color: var(--border-subtle, #374151);
                    border-radius: 6px;
                }
                .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range, .react-datepicker__month-text--selected, .react-datepicker__month-text--in-selecting-range, .react-datepicker__month-text--in-range, .react-datepicker__quarter-text--selected, .react-datepicker__quarter-text--in-selecting-range, .react-datepicker__quarter-text--in-range, .react-datepicker__year-text--selected, .react-datepicker__year-text--in-selecting-range, .react-datepicker__year-text--in-range {
                    background-color: #3b82f6; /* accent-blue */
                    color: white;
                    border-radius: 6px;
                    font-weight: bold;
                }
                .react-datepicker__day--disabled, .react-datepicker__month-text--disabled, .react-datepicker__quarter-text--disabled, .react-datepicker__year-text--disabled {
                    color: var(--text-muted, #9ca3af);
                    opacity: 0.3;
                }
                
                /* 👉 FIXED FOR BOTH LIGHT AND DARK MODES */
                .react-datepicker__time-container {
                    border-left: 1px solid var(--border-subtle, #2d3748);
                    background-color: var(--card-bg, #1a1b1e); 
                }
                .react-datepicker__time-container .react-datepicker__time {
                    background-color: var(--card-bg, #1a1b1e) !important; 
                }
                .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
                    padding: 8px 12px;
                    color: var(--text-main, #e5e7eb); 
                }
                .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
                    background-color: var(--border-subtle, #374151) !important;
                    color: var(--text-main) !important; /* 👉 FORCED WHITE HATA DIYA HAI */
                }
                .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
                    background-color: #3b82f6 !important;
                    color: white !important;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default GenericFormModal;