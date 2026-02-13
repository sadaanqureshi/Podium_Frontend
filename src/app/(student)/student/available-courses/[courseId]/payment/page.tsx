'use client';
import React, { useState, use } from 'react';
import {
  Loader2, ArrowLeft, Upload, CheckCircle2,
  CreditCard, Info, ShieldCheck, Send
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

const EnrollmentPaymentPage = ({ params }: { params: Promise<any> }) => {
  const resolvedParams = use(params);
  const courseId = Number(resolvedParams.courseId);

  const { showToast } = useToast();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Form Submission Logic
  // src/app/(student)/available-courses/[courseId]/payment/page.tsx

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast("Please upload payment screenshot", "error");
      return;
    }

    setUploading(true);
    try {
      // # Yahan aapki real API call aayegi
      // await enrollWithProofAPI(formData);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay

      showToast("Proof uploaded!", "success");

      // Redirecting to the success page inside the payment folder
      router.push(`/student/available-courses/${courseId}/payment/success`);
    } catch (err) {
      showToast("Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  if (isSubmitted) return (
    <div className="h-screen flex flex-col items-center justify-center bg-app-bg p-6 text-center">
      <div className="bg-card-bg border border-emerald-500/20 rounded-[3rem] p-12 max-w-xl space-y-8 shadow-2xl animate-in zoom-in-95">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
          <CheckCircle2 size={50} className="text-emerald-500" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tight text-text-main">Request Logged!</h2>
          <p className="text-text-muted text-sm font-medium leading-relaxed uppercase tracking-wider">
            Aapka payment proof admin ko bhej dia gaya hai. <br />
            **Admin verification** ke baad aapka course enroll ho jayega. <br />
            Isme taqreeban 2-4 ghante lag sakte hain.
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="inline-block w-full py-5 bg-text-main text-card-bg rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-bg text-text-main pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-12">

        {/* Navigation */}
        <Link href={`/student/available-courses/${courseId}`} className="flex items-center gap-2 text-text-muted hover:text-accent-blue font-black text-[10px] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Back to Course Detail
        </Link>

        {/* Header */}
        <div className="hero-registry-card rounded-[2.5rem] p-8 md:p-12 border border-border-subtle shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Enrollment Registry</h1>
            <p className="text-text-muted mt-4 font-medium uppercase text-[10px] tracking-[0.2em]">Finalize your access by providing payment proof.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Podium Details Card */}
          <div className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-8 md:p-10 shadow-lg space-y-8">
            <div className="flex items-center gap-4 text-accent-blue">
              <CreditCard size={24} />
              <h3 className="font-black uppercase tracking-widest text-xs">Podium Professional Account Details</h3>
            </div>

            <div className="space-y-6 bg-app-bg p-6 rounded-3xl border border-border-subtle/50 shadow-inner">
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Account Title</p>
                <p className="text-sm font-black uppercase tracking-tight">Academy Podium Professional</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Account Number / IBAN</p>
                <p className="text-sm font-black uppercase tracking-tighter">PK70 PODI 0000 1234 5678 9012</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Bank Name</p>
                <p className="text-sm font-black uppercase tracking-tight">Standard Chartered Bank</p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
              <Info size={20} className="text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase">
                Transaction ID should be visible in the screenshot.
              </p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handlePaymentSubmit} className="bg-card-bg border border-border-subtle rounded-[2.5rem] p-8 md:p-10 shadow-lg flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-emerald-500">
                <ShieldCheck size={24} />
                <h3 className="font-black uppercase tracking-widest text-xs">Secure Evidence Upload</h3>
              </div>

              <label className="group relative cursor-pointer border-2 border-dashed border-border-subtle hover:border-accent-blue/50 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-app-bg/30">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                {file ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="text-emerald-500" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">{file.name}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all">
                      <Upload className="text-accent-blue" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Attach Screenshot</p>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="mt-10 w-full py-5 bg-accent-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Upload Screenshot</>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default EnrollmentPaymentPage;