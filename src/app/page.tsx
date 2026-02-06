'use client';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import Link from 'next/link';

export default function BrandingHome() {
  return (
    <main className="min-h-screen bg-app-bg text-text-main selection:bg-accent-blue/30 font-sans transition-colors duration-300">
      <MarketingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Dynamic Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-accent-blue/10 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-block px-4 py-1.5 bg-accent-blue/10 text-accent-blue rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-accent-blue/20"
          >
            The Future of Learning
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] text-text-main"
          >
            Empower Your <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-cyan-500">Knowledge.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="text-text-muted max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed px-4"
          >
            A high-performance Learning Management System built for the next generation of creators, teachers, and students.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-6 px-6"
          >
            <Link href="/student/signup" className="group px-8 py-4 bg-accent-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-accent-blue/20 active:scale-95">
              Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href="/about" className="px-8 py-4 bg-card-bg text-text-main border border-border-subtle rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-app-bg transition-all text-center shadow-sm">
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-20 px-6 bg-card-bg border-y border-border-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-8">
          {[
            { icon: BookOpen, val: '250+', label: 'Premium Courses' },
            { icon: Users, val: '15k+', label: 'Active Learners' },
            { icon: Award, val: '98%', label: 'Completion Rate' }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              whileInView={{ opacity: 1, y: 0 }} 
              initial={{ opacity: 0, y: 20 }}
              className="text-center space-y-3 p-8 rounded-[2.5rem] bg-app-bg border border-border-subtle shadow-sm"
            >
              <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center mx-auto text-accent-blue">
                <stat.icon size={32} />
              </div>
              <h3 className="text-4xl font-black text-text-main">{stat.val}</h3>
              <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}