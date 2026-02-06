'use client';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-app-bg text-text-main transition-colors duration-300">
      <MarketingNavbar />
      <section className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-text-main">
            Get in <span className="text-accent-blue">Touch.</span>
          </h2>
          <p className="text-text-muted font-medium">Have questions? We're here to help you grow.</p>
        </div>

        <form className="space-y-6 text-left bg-card-bg p-8 md:p-12 rounded-[3rem] border border-border-subtle shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">Full Name</label>
              <input type="text" className="w-full bg-app-bg border border-border-subtle rounded-2xl px-6 py-4 outline-none focus:border-accent-blue transition-all font-bold text-text-main" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">Email Address</label>
              <input type="email" className="w-full bg-app-bg border border-border-subtle rounded-2xl px-6 py-4 outline-none focus:border-accent-blue transition-all font-bold text-text-main" placeholder="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">Your Message</label>
            <textarea rows={5} className="w-full bg-app-bg border border-border-subtle rounded-3xl px-6 py-4 outline-none focus:border-accent-blue transition-all font-bold resize-none text-text-main" placeholder="How can we help?"></textarea>
          </div>
          <button type="submit" className="w-full py-5 bg-accent-blue text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-hover-blue transition-all shadow-xl shadow-accent-blue/20 active:scale-95">
            Send Message <Send size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}