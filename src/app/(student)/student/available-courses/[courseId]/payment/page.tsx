'use client';
import React, { useState, use } from 'react';
import {
  Loader2, ArrowLeft, Upload, CheckCircle2,
  CreditCard, Info, ShieldCheck, Send, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { enrollWithProofAPI } from '@/lib/api/apiService'; // API Import ki hai

const EnrollmentPaymentPage = ({ params }: { params: Promise<any> }) => {
  const resolvedParams = use(params);
  const courseId = Number(resolvedParams.courseId);

  const { showToast } = useToast();
  const router = useRouter();
  
  // Redux se User details nikal rahe hain taake studentId mil sakay
  const user = useAppSelector((state) => state.auth.user);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Form Submission Logic API ke sath
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      showToast("Please upload a payment screenshot first.", "error");
      return;
    }

    if (!user?.id) {
      showToast("User session not found. Please log in again.", "error");
      return;
    }

    setUploading(true);
    
    try {
      // 1. FormData tayyar karein
      const formData = new FormData();
      formData.append('courseId', courseId.toString());
      // formData.append('studentId', user.id.toString());
      formData.append('screenshot', file);

      // 2. API Call hit karein
      await enrollWithProofAPI(formData);

      showToast("Screenshot uploaded successfully!", "success");

      // 3. Success page par bhej dein
      router.push(`/student/available-courses/${courseId}/payment/success`);
    } catch (err: any) {
      showToast(err.message || "Failed to upload proof.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main pb-20 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 space-y-8">

        {/* Navigation */}
        <Link href={`/student/available-courses/${courseId}`} className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold text-xs uppercase tracking-wider transition-colors mb-2">
          <ArrowLeft size={16} /> Back to Course
        </Link>

        {/* Flat Minimalist Header */}
        <div className="border-b border-border-subtle pb-6">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-main">Complete Enrollment</h1>
          <p className="text-text-muted mt-2 font-medium text-sm">Please transfer the fee to the account below and upload the screenshot.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Account Details Card (Clean & Professional) */}
          <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm h-fit">
            <div className="flex items-center gap-3 text-text-main mb-6 border-b border-border-subtle pb-4">
              <CreditCard size={20} className="text-accent-blue" />
              <h3 className="font-black uppercase tracking-wider text-xs">Bank Account Details</h3>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Account Title</p>
                <p className="text-sm font-black text-text-main">Academy Podium Professional</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">IBAN / Account Number</p>
                <p className="text-sm font-black text-text-main tracking-wide">PK70 PODI 0000 1234 5678 9012</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Bank Name</p>
                <p className="text-sm font-black text-text-main">Standard Chartered Bank</p>
              </div>
            </div>

            <div className="mt-8 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-amber-600/90 leading-relaxed">
                Ensure the Transaction ID and Date are clearly visible in the screenshot.
              </p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handlePaymentSubmit} className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-text-main mb-2 border-b border-border-subtle pb-4">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h3 className="font-black uppercase tracking-wider text-xs">Upload Payment Proof</h3>
              </div>

              <label className="group cursor-pointer border-2 border-dashed border-border-subtle hover:border-accent-blue rounded-xl p-8 flex flex-col items-center justify-center bg-app-bg transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                {file ? (
                  <div className="text-center w-full">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-text-main truncate px-4">{file.name}</p>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest">Click to change file</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto text-accent-blue group-hover:scale-110 transition-transform">
                      <ImageIcon size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-main">Click to browse file</p>
                      <p className="text-[10px] font-medium text-text-muted mt-1 uppercase tracking-widest">JPG, PNG allowed</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="mt-8 w-full py-3.5 bg-accent-blue text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-95"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Submit Proof</>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default EnrollmentPaymentPage;