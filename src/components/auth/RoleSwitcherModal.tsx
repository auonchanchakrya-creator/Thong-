import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, X, ArrowRight, Sparkles } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSwitcherModal({ isOpen, onClose }: RoleSwitcherModalProps) {
  const { currentUser, switchUser, users, login, t, language } = useApp();
  const [customEmail, setCustomEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    login(customEmail, selectedRole);
    onClose();
  };

  const getRoleLabel = (r: UserRole) => {
    if (r === 'admin') return t('auth.adminRole');
    if (r === 'driver') return t('auth.driverRole');
    if (r === 'parent') return t('auth.parentRole');
    return t('header.phnomPenh');
  };

  const getKhmerAvatar = (u: { avatar?: string; role: UserRole; id?: string }) => {
    if (u.avatar && !u.avatar.includes('unsplash.com')) return u.avatar;
    if (u.role === 'admin' || u.role === 'school_admin') return '/images/khmer_admin.svg';
    if (u.role === 'driver') {
      return u.id === 'usr-driver-2' ? '/images/khmer_driver2.svg' : '/images/khmer_driver.svg';
    }
    return u.id === 'usr-parent-2' ? '/images/khmer_parent2.svg' : '/images/khmer_parent.svg';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">{t('auth.roleModalTitle')}</h2>
              <p className="text-xs text-slate-500">{t('auth.roleModalSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/55 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
              {t('auth.preconfiguredAccounts')}
            </label>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {users.map(user => {
                const isSelected = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => { switchUser(user.id); onClose(); }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? 'border-blue-600 bg-blue-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={getKhmerAvatar(user)} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {user.name}
                          {isSelected && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">{t('auth.active')}</span>}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'driver' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase font-semibold">{t('auth.customLogin')}</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('auth.customEmailLabel')}</label>
              <input
                type="email"
                required
                placeholder="e.g. user@schoolrout.ai"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('auth.selectRoleLabel')}</label>
              <div className="grid grid-cols-3 gap-3">
                {(['admin', 'driver', 'parent'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wide transition-all ${
                      selectedRole === role ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {getRoleLabel(role)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {t('auth.signInButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
