// 'use client';
// import React, { useEffect, use } from 'react';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { fetchCourseContent } from '@/lib/store/features/courseSlice';
// import { 
//     Loader2, BookOpen, Clock, User, ArrowLeft, 
//     ChevronRight, CheckCircle, Star, Info 
// } from 'lucide-react';
// import Link from 'next/link';

// const AvailableCourseDetailPage = ({ params }: { params: Promise<any> }) => {
//     const resolvedParams = use(params);
//     const courseId = Number(resolvedParams.courseId);
//     const dispatch = useAppDispatch();

//     // Redux State Access
//     const { courseContent, loading } = useAppSelector((state) => state.course);
    
//     // Data extract karna: Aapka slice 'courseContent' record use karta hai
//     const fullData = courseContent[courseId];
//     const course = fullData?.course || fullData; // Handle both direct and nested structure
//     const sections = fullData?.sections || [];

//     useEffect(() => {
//         if (courseId) {
//             dispatch(fetchCourseContent(courseId));
//         }
//     }, [courseId, dispatch]);

//     // Page Loading State
//     if (!course || loading.adminCourses) return (
//         <div className="h-screen flex flex-col items-center justify-center bg-app-bg">
//             <Loader2 className="animate-spin text-accent-blue mb-4" size={48} />
//             <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Accessing Course Details...</p>
//         </div>
//     );

//     return (
//         <div className="h-full bg-app-bg text-text-main pb-20">
//             {/* Header Navigation */}
//             <div className="max-w-7xl mx-auto px-6 pt-8">
//                 <Link href="/student/available-courses" className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-[10px] uppercase tracking-widest transition-all">
//                     <ArrowLeft size={14} /> Back to Catalog
//                 </Link>
//             </div>

//             {/* Hero Section: Blueprint Style */}
//             <div className="max-w-7xl mx-auto px-6 mt-8">
//                 <div className="hero-registry-card rounded-[3rem] p-8 md:p-16 border border-border-subtle relative overflow-hidden shadow-2xl">
//                     <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                    
//                     <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//                         <div className="space-y-8">
//                             <div className="flex items-center gap-3">
//                                 <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-[9px] font-black uppercase tracking-widest border border-accent-blue/20">
//                                     Course ID: {course.id}
//                                 </span>
//                                 <div className="h-1 w-1 bg-text-muted rounded-full"></div>
//                                 <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
//                                     {course.languages || 'English'}
//                                 </span>
//                             </div>

//                             <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
//                                 {course.courseName}
//                             </h1>

//                             <p className="text-text-muted text-sm md:text-base font-medium leading-relaxed max-w-xl">
//                                 {course.shortDescription}
//                             </p>

//                             <div className="flex flex-wrap gap-6 pt-4">
//                                 <div className="flex items-center gap-2">
//                                     <User size={18} className="text-accent-blue" />
//                                     <span className="text-[10px] font-black uppercase tracking-widest">
//                                         Instructor: {course.teacher?.firstName} {course.teacher?.lastName}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <Clock size={18} className="text-accent-blue" />
//                                     <span className="text-[10px] font-black uppercase tracking-widest">
//                                         Lifetime Access
//                                     </span>
//                                 </div>
//                             </div>

//                             {/* ENROLL BUTTON */}
//                             <div className="pt-6">
//                                 <Link 
//                                     href={`/student/available-courses/${courseId}/payment`}
//                                     className="px-12 py-5 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-accent-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 w-full md:w-fit"
//                                 >
//                                     Enroll Now <ChevronRight size={18} />
//                                 </Link>
//                                 <p className="mt-4 text-[15px] text-text-muted font-bold uppercase tracking-widest text-center md:text-left">
//                                     One-time investment: ${course.price}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Visual Node */}
//                         <div className="hidden lg:flex justify-center">
//                             <div className="relative w-80 h-80 bg-card-bg rounded-[4rem] border border-border-subtle shadow-inner flex items-center justify-center group overflow-hidden">
//                                 {course.coverImg ? (
//                                     <img src={course.coverImg} alt="Course" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
//                                 ) : (
//                                     <BookOpen size={80} className="text-accent-blue opacity-20" />
//                                 )}
//                                 <div className="absolute inset-0 bg-gradient-to-t from-app-bg to-transparent opacity-60"></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Detailed Info & Curriculum */}
//             <div className="max-w-7xl mx-auto px-6 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
                
//                 {/* Left: About & Content */}
//                 <div className="lg:col-span-2 space-y-20">
//                     <section>
//                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-8 flex items-center gap-3">
//                             <Info size={16} /> Course Blueprint
//                         </h3>
//                         <div className="prose prose-invert max-w-none">
//                             <p className="text-text-main text-base font-medium leading-loose whitespace-pre-wrap opacity-80">
//                                 {course.longDescription || "No detailed description provided for this registry node."}
//                             </p>
//                         </div>
//                     </section>

//                     <section className="space-y-8">
//                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-8 flex items-center gap-3">
//                             <BookOpen size={16} /> Curriculum Registry ({sections.length} Units)
//                         </h3>
                        
//                         <div className="space-y-4">
//                             {sections.map((section: any, sIdx: number) => (
//                                 <div key={section.id} className="bg-card-bg border border-border-subtle rounded-[2rem] overflow-hidden group hover:border-accent-blue/30 shadow-sm">
//                                     <div className="p-6 md:p-8 flex items-center justify-between bg-app-bg/30">
//                                         <div className="flex items-center gap-5">
//                                             <div className="w-10 h-10 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-black text-xs shadow-inner">
//                                                 {sIdx + 1}
//                                             </div>
//                                             <h4 className="font-black text-sm md:text-base uppercase tracking-tight">{section.title}</h4>
//                                         </div>
//                                         <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
//                                             {section.lectures?.length || 0} Modules
//                                         </span>
//                                     </div>
//                                     <div className="px-8 pb-8 space-y-2">
//                                         {section.lectures?.map((lecture: any) => (
//                                             <div key={lecture.id} className="flex items-center gap-4 py-3 border-b border-border-subtle/30 last:border-0">
//                                                 <CheckCircle size={14} className="text-text-muted/30" />
//                                                 <span className="text-xs font-medium uppercase tracking-wide opacity-70">{lecture.title}</span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </section>
//                 </div>

//                 {/* Right: Meta Stats */}
//                 <div className="space-y-8">
//                     <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-8 shadow-2xl sticky top-8">
//                         <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-8">Registry Intel</h4>
                        
//                         <div className="space-y-8">
//                             <div className="flex items-center gap-5">
//                                 <div className="p-3 bg-app-bg rounded-2xl border border-border-subtle"><Star className="text-amber-500" size={20} /></div>
//                                 <div>
//                                     <p className="text-[9px] font-bold text-text-muted uppercase">Rating</p>
//                                     <p className="text-xs font-black uppercase">{course.avgRating || 0} / 5.00</p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-5">
//                                 <div className="p-3 bg-app-bg rounded-2xl border border-border-subtle"><Clock className="text-accent-blue" size={20} /></div>
//                                 <div>
//                                     <p className="text-[9px] font-bold text-text-muted uppercase">Total Content</p>
//                                     <p className="text-xs font-black uppercase">{course.totalLectures || 'N/A'} Lectures</p>
//                                 </div>
//                             </div>

//                             <div className="pt-4">
//                                 <Link 
//                                     href={`/student/available-courses/${courseId}/enroll`}
//                                     className="block w-full py-4 bg-text-main text-card-bg text-center rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:opacity-90"
//                                 >
//                                     Initialize Enrollment
//                                 </Link>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AvailableCourseDetailPage;

'use client';
import React, { useEffect, use, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchCourseContent } from '@/lib/store/features/courseSlice';
import AvailableCourseHero from '@/components/courses/AvailableCourseHero'; 
import { 
    Loader2, BookOpen, Clock, User, ArrowLeft, 
    ChevronRight, CheckCircle, Star, Info, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; // Smooth collapse ke liye

const AvailableCourseDetailPage = ({ params }: { params: Promise<any> }) => {
    const resolvedParams = use(params);
    const courseId = Number(resolvedParams.courseId);
    const dispatch = useAppDispatch();

    // Redux State Access
    const { courseContent, loading } = useAppSelector((state) => state.course);
    
    // Data extract karna
    const fullData = courseContent[courseId];
    const course = fullData?.course || fullData; 
    const sections = fullData?.sections || [];

    const [openSections, setOpenSections] = useState<number[]>([0]);

    const toggleSection = (index: number) => {
        setOpenSections(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    useEffect(() => {
        if (courseId) {
            dispatch(fetchCourseContent(courseId));
        }
    }, [courseId, dispatch]);

    // Page Loading State
    if (!course || loading.courseContent[courseId]) return (
        <div className="h-full min-h-[80vh] flex flex-col items-center justify-center bg-app-bg">
            <Loader2 className="animate-spin text-accent-blue mb-4" size={40} />
            <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Course...</p>
        </div>
    );

    return (
        <div className="h-full bg-app-bg text-text-main pb-16">
            
            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 mb-6">
                <Link href="/student/available-courses" className="inline-flex items-center gap-2 text-text-muted hover:text-accent-blue font-bold text-xs uppercase tracking-wider transition-all">
                    <ArrowLeft size={16} /> Back to Catalog
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* 👉 NAYA HERO COMPONENT CALL */}
                <AvailableCourseHero course={course} />
            </div>

            {/* Detailed Info & Curriculum */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Left: About & Content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* About Section */}
                    <section className="bg-card-bg rounded-2xl p-6 md:p-8 border border-border-subtle shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-main mb-4 flex items-center gap-2 border-b border-border-subtle pb-3">
                            <Info size={16} className="text-accent-blue"/> Detailed Description
                        </h3>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-text-muted text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                {course.longDescription || "No detailed description provided for this course."}
                            </p>
                        </div>
                    </section>

                    {/* Curriculum Section - Collapsible */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-main mb-4 flex items-center gap-2 border-b border-border-subtle pb-3 px-2">
                            <BookOpen size={16} className="text-accent-blue"/> Course Content ({sections.length} Sections)
                        </h3>
                        
                        <div className="space-y-3">
                            {sections.map((section: any, sIdx: number) => {
                                const isOpen = openSections.includes(sIdx);
                                return (
                                    <div key={section.id} className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => toggleSection(sIdx)}
                                            className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-app-bg/50 transition-colors focus:outline-none"
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-8 h-8 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center font-black text-xs shrink-0">
                                                    {sIdx + 1}
                                                </div>
                                                <h4 className="font-bold text-sm text-text-main tracking-tight">{section.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0 text-text-muted">
                                                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                                                    {section.lectures?.length || 0} Lectures
                                                </span>
                                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                    <ChevronDown size={18} />
                                                </motion.div>
                                            </div>
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 pt-1 space-y-1">
                                                        {section.lectures?.map((lecture: any) => (
                                                            <div key={lecture.id} className="flex items-center gap-3 py-2.5 border-b border-border-subtle/50 last:border-0 pl-12">
                                                                <CheckCircle size={14} className="text-text-muted/40 shrink-0" />
                                                                <span className="text-xs font-medium text-text-muted">{lecture.title}</span>
                                                            </div>
                                                        ))}
                                                        {(!section.lectures || section.lectures.length === 0) && (
                                                            <div className="pl-12 py-2 text-xs text-text-muted/50 italic">No lectures uploaded yet.</div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Right: Meta Stats & Enrollment */}
                <div className="space-y-6">
                    <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm sticky top-8">
                        <h4 className="text-xs font-black uppercase tracking-widest text-text-main mb-6 border-b border-border-subtle pb-3">
                            Enrollment Details
                        </h4>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Course Fee</span>
                                <span className="text-xl font-black text-text-main">${course.price}</span>
                            </div>

                            {/* <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-app-bg rounded-xl border border-border-subtle shrink-0">
                                    <Clock className="text-accent-blue" size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Content</p>
                                    <p className="text-sm font-black text-text-main">{course.totalLectures || 'N/A'} Lectures</p>
                                </div>
                            </div> */}

                            <div className="pt-4 mt-2 border-t border-border-subtle">
                                <Link 
                                    href={`/student/available-courses/${courseId}/payment`}
                                    className="block w-full py-3.5 bg-accent-blue text-white text-center rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md shadow-accent-blue/20"
                                >
                                    Enroll Now
                                </Link>
                                <p className="text-[9px] text-text-muted font-bold text-center mt-3 uppercase tracking-wider">
                                    Instant Lifetime Access
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailableCourseDetailPage;