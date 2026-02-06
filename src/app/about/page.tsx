'use client';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-app-bg text-text-main transition-colors duration-300">
      <MarketingNavbar />
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-text-main">
              Our <span className="text-accent-blue">Mission.</span>
            </h2>
            <p className="text-text-muted text-lg leading-relaxed font-medium">
              We are redefining digital education by providing tools that make learning interactive, accessible, and deeply engaging for everyone, everywhere.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, title: "Secure Data", desc: "Enterprise grade security" },
                { icon: Zap, title: "Fast Delivery", desc: "Global edge CDN streaming" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-card-bg rounded-2xl border border-border-subtle shadow-sm">
                  <item.icon className="text-accent-blue" size={24} />
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-text-main">{item.title}</h4>
                    <p className="text-[10px] text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-accent-blue to-indigo-600 rounded-[3rem] shadow-2xl rotate-3 flex items-center justify-center p-12">
               <Globe size={120} className="text-white/20 animate-pulse" />
               <div className="absolute inset-0 flex items-center justify-center font-black text-8xl opacity-10 text-white">PODIUM</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}