import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, ArrowRight, AlertTriangle, Eye, EyeOff, 
  Sparkles, CheckCircle2, UserCheck, Shield, Building2, Users, Bus 
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  onGoToRegister: () => void;
  onLoginSuccess: () => void;
}

export function LoginForm({ onGoToRegister, onLoginSuccess }: LoginFormProps) {
  const { login, switchUser, users, language, t } = useApp();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailOrPhone.trim()) {
      setError(language === 'km' ? 'សូមបញ្ចូលអ៊ីមែល ឬលេខទូរស័ព្ទ' : 'Please enter your email or phone.');
      return;
    }

    setLoading(true);
    const result = await login(emailOrPhone, password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(t('auth.invalidCredentials'));
    }
  };

  const handleDemoLogin = (email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      switchUser(user.id);
      onLoginSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-6 text-white text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 text-white shadow-inner">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black">{t('auth.loginBtn')}</h2>
        <p className="text-xs text-blue-200 mt-1">
          {language === 'km' ? 'ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងរបស់អ្នក' : 'Sign in to access your role dashboard'}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-5 text-xs">
        
        {resetSuccessNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('auth.resetSuccess')}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t('auth.emailOrPhone')}
            </label>
            <input
              type="text"
              required
              placeholder="admin@schoolrout.ai"
              value={emailOrPhone}
              onChange={e => setEmailOrPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">{t('auth.password')}</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 pr-9 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <span>Signing in...</span> : <span>{t('auth.loginBtn')}</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Logins Section */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            {t('auth.demoAccounts')}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('admin@schoolrout.ai')}
              className="p-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-left transition-colors flex flex-col items-center text-center gap-1"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <strong className="text-[10px] truncate block w-full">{t('auth.schoolAdminRole')}</strong>
            </button>

            <button
              onClick={() => handleDemoLogin('parent.sokha@schoolrout.ai')}
              className="p-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-left transition-colors flex flex-col items-center text-center gap-1"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <strong className="text-[10px] truncate block w-full">{t('auth.parentRole')}</strong>
            </button>

            <button
              onClick={() => handleDemoLogin('driver.chan@schoolrout.ai')}
              className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-left transition-colors flex flex-col items-center text-center gap-1"
            >
              <Bus className="w-4 h-4 text-emerald-600" />
              <strong className="text-[10px] truncate block w-full">{t('auth.driverRole')}</strong>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          {t('auth.noAccount')}{' '}
          <button
            type="button"
            onClick={onGoToRegister}
            className="text-blue-600 hover:text-blue-700 font-bold underline ml-1"
          >
            {t('auth.registerNow')}
          </button>
        </div>

      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={() => setResetSuccessNotice(true)}
      />
    </div>
  );
}
