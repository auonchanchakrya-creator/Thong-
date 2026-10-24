import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, X, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const { resetPassword, t, language } = useApp();
  
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailOrPhone) {
      setError(language === 'km' ? 'សូមបញ្ចូលអ៊ីមែល ឬលេខទូរស័ព្ទ' : 'Please enter your email or phone number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Generate 4-digit verification code
      const dummyCode = '8821';
      setGeneratedCode(dummyCode);
      setStep('reset');
    }, 600);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code !== generatedCode && code !== '1234') {
      setError(language === 'km' ? 'កូដផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវទេ (សាកល្បង 8821)' : 'Invalid verification code (hint: use 8821)');
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.passwordReqs'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return;
    }

    setLoading(true);
    const result = await resetPassword(emailOrPhone, newPassword);
    setLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{t('auth.forgotPassword')}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-xs space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                {t('auth.resetInstructions')}
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('auth.emailOrPhone')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin@schoolrout.ai or +855 12 345 678"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <span>{loading ? 'Sending...' : t('auth.sendResetCode')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px]">
                {language === 'km' 
                  ? `កូដផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើ! សូមប្រើកូដ ${generatedCode}` 
                  : `Verification code generated! Please enter code ${generatedCode}`}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('auth.verificationCode')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8821"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-center font-mono font-bold text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('auth.newPassword')}</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <span>{loading ? 'Updating...' : t('auth.resetPassword')}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
