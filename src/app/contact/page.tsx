'use client';
import { MarketingNavbar } from '@/components/marketing/Navbar';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      <MarketingNavbar />
      <section className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">Get in <span className="text-blue-500">Touch.</span></h2>
          <p className="text-slate-400 font-medium">Have questions? We're here to help you grow.</p>
        </div>

        <form className="space-y-6 text-left bg-white/5 p-8 md:p-12 rounded-[3rem] border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email Address</label>
              <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold" placeholder="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Your Message</label>
            <textarea rows={5} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold resize-none" placeholder="How can we help?"></textarea>
          </div>
          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
            Send Message <Send size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}