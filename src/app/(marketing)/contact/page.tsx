'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { FaqList } from '@/components/marketing/FaqList';
import { CONTACT_EMAIL, CONTACT_INTENTS } from '@/components/marketing/content';

function ContactForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const initialIntent = useMemo(() => {
    const fromQuery = searchParams.get('intent') || 'student';
    return CONTACT_INTENTS.some((i) => i.value === fromQuery) ? fromQuery : 'student';
  }, [searchParams]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [intent, setIntent] = useState(initialIntent);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setIntent(initialIntent);
  }, [initialIntent]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
    if (!message.trim() || message.trim().length < 10) next.message = 'Tell us a bit more (at least 10 characters)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);

    const intentLabel = CONTACT_INTENTS.find((i) => i.value === intent)?.label || intent;
    const subject = encodeURIComponent(`[Podium] ${intentLabel} — ${name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\nIntent: ${intentLabel}\n\n${message.trim()}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    showToast('Opening your email app with the message. We will reply at the address you entered.', 'success');
    setSending(false);
  };

  const fieldClass = (key: string) =>
    `w-full bg-app-bg border rounded-2xl px-6 py-4 outline-none font-bold text-text-main ${
      errors[key] ? 'border-red-500' : 'border-border-subtle focus:border-accent-blue'
    }`;

  return (
    <form onSubmit={onSubmit} className="space-y-6 text-left bg-card-bg p-8 md:p-12 rounded-[2rem] border border-border-subtle" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">
            Full name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass('name')}
            placeholder="Your name"
          />
          {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass('email')}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-intent" className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">
          I am writing about
        </label>
        <select
          id="contact-intent"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className={fieldClass('intent')}
        >
          {CONTACT_INTENTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass('message')} rounded-3xl resize-none`}
          placeholder="How can we help?"
        />
        {errors.message && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full py-5 bg-accent-blue text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-hover-blue active:scale-95 disabled:opacity-60"
      >
        Send message <Send size={16} />
      </button>
      <p className="text-center text-xs text-text-muted font-medium">
        Submitting opens your email app to {CONTACT_EMAIL}.
      </p>
    </form>
  );
}

export default function ContactPage() {
  return (
    <main className="px-6 py-12 md:py-16">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-text-main">
            Get in <span className="text-accent-blue">touch</span>
          </h1>
          <p className="text-text-muted font-medium">
            Student help, teacher onboarding, or an academy that wants Podium.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/student/signin"
            className="rounded-xl border border-border-subtle bg-card-bg px-5 py-4 text-sm font-bold text-text-main hover:border-accent-blue/40"
          >
            Already enrolled? Sign in
          </Link>
          <Link
            href="/courses"
            className="rounded-xl border border-border-subtle bg-card-bg px-5 py-4 text-sm font-bold text-text-main hover:border-accent-blue/40"
          >
            Want a course? Browse catalog
          </Link>
        </div>

        <Suspense fallback={<div className="h-96 rounded-[2rem] border border-border-subtle bg-card-bg animate-pulse" />}>
          <ContactForm />
        </Suspense>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-text-main text-center">Quick answers</h2>
          <FaqList />
        </div>
      </div>
    </main>
  );
}
