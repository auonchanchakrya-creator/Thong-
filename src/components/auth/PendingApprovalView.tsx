import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, Clock, CheckCircle2, RefreshCw, LogOut, 
  Building2, Car, UserCheck, Shield, Sparkles, ExternalLink 
} from 'lucide-react';

export function PendingApprovalView() {
  const { currentUser, logout, switchUser, users, language, t, localize } = useApp();
  const [checking, setChecking] = useState(false);

  if (!currentUser) return null;

  const isSchoolAdmin = currentUser.role === 'admin' || currentUser.role === 'school_admin';
  const isDriver = currentUser.role === 'driver';

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
    }, 600);
  };

  // Find demo admin user to offer quick test switch
  const adminUser = users.find(u => u.role === 'admin' && u.status === 'active');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-6 text-white text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {language === 'km' ? 'ស្ថានភាព៖ កំពុងរង់ចាំការផ្ទៀងផ្ទាត់' : 'Status: Verification Pending'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            {t('auth.pendingApprovalTitle')}
          </h2>
          <p className="text-amber-100 text-xs mt-1 max-w-md mx-auto">
            {isSchoolAdmin ? t('auth.pendingAdminMessage') : t('auth.pendingDriverMessage')}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* User Profile Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-600" />
              {t('auth.submittedDetails')}
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400 block">{t('auth.fullName')}</span>
                <strong className="text-slate-900">{currentUser.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">{t('users.email')}</span>
                <strong className="text-slate-900 truncate block">{currentUser.email}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">{t('common.role')}</span>
                <strong className="text-amber-700 capitalize">
                  {isSchoolAdmin ? t('auth.schoolAdminRole') : t('auth.driverRole')}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">{t('drivers.phone')}</span>
                <strong className="text-slate-900">{currentUser.phone}</strong>
              </div>

              {/* School Admin specific details */}
              {isSchoolAdmin && currentUser.schoolName && (
                <div className="col-span-2 pt-1 border-t border-slate-200/60 mt-1">
                  <span className="text-slate-400 block">{t('auth.schoolName')}</span>
                  <strong className="text-blue-700">{currentUser.schoolName}</strong>
                </div>
              )}
              {isSchoolAdmin && currentUser.schoolAddress && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">{t('auth.schoolAddress')}</span>
                  <span className="text-slate-700">{currentUser.schoolAddress}</span>
                </div>
              )}

              {/* Driver specific details */}
              {isDriver && currentUser.licenseNumber && (
                <div>
                  <span className="text-slate-400 block">{t('auth.driverLicense')}</span>
                  <strong className="text-slate-900 font-mono">{currentUser.licenseNumber}</strong>
                </div>
              )}
              {isDriver && currentUser.vehiclePlate && (
                <div>
                  <span className="text-slate-400 block">{t('auth.vehiclePlate')}</span>
                  <strong className="text-slate-900 font-mono">{currentUser.vehiclePlate}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Verification Process Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">
                {language === 'km' ? 'គោលការណ៍សុវត្ថិភាពសិស្សានុសិស្ស' : 'Student Transportation Safety Policy'}
              </strong>
              <p className="text-[11px] text-blue-800 mt-0.5">
                {language === 'km' 
                  ? 'ដើម្បីធានាសុវត្ថិភាពសិស្សានុសិស្សនៅរាជធានីភ្នំពេញ គណនីអ្នកគ្រប់គ្រង និងអ្នកបើកបរត្រូវតែឆ្លងកាត់ការផ្ទៀងផ្ទាត់ផ្លូវការមុនពេលទទួលបានសិទ្ធិចូលមើលទិន្នន័យផ្ទាល់ខ្លួនរបស់សិស្ស។'
                  : 'To safeguard student security, administrator and driver privileges are only unlocked after verified vetting by the transportation authority.'}
              </p>
            </div>
          </div>

          {/* Testing / Demo Helper Hint */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center justify-between gap-3">
            <div>
              <span className="font-bold block text-purple-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                {language === 'km' ? 'ការសាកល្បង Demo (សម្រាប់អ្នកវាយតម្លៃ)' : 'Demo Testing Shortcut'}
              </span>
              <p className="text-[11px] text-purple-800 mt-0.5">
                {language === 'km'
                  ? 'អ្នកអាចចូលជា Super Admin ដើម្បីអនុម័តគណនីនេះភ្លាមៗនៅក្នុង User Management -> Pending Approvals'
                  : 'You can sign in as Super Admin to review and approve this pending registration in User Management.'}
              </p>
            </div>
            {adminUser && (
              <button
                onClick={() => switchUser(adminUser.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm text-[11px] shrink-0 transition-colors"
              >
                {language === 'km' ? 'ចូលជា Admin' : 'Login as Admin'}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleRefresh}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{t('auth.refreshStatus')}</span>
            </button>

            <button
              onClick={logout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
