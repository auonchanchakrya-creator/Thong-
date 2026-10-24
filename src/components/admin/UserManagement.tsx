import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, Building2, Bus } from 'lucide-react';

export function UserManagement() {
  const { users, approveUser, rejectUser, t, language, formatNumber } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  const pendingUsers = users.filter(u => u.status === 'pending');

  const getRoleLabel = (role: string) => {
    if (role === 'admin' || role === 'school_admin') return t('auth.adminRole');
    if (role === 'driver') return t('auth.driverRole');
    if (role === 'parent') return t('auth.parentRole');
    return role;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('users.title')}</h2>
          <p className="text-xs text-slate-500">{t('users.subtitle')}</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'km' ? `អ្នកប្រើប្រាស់ទាំងអស់ (${formatNumber(users.length)})` : `All Users (${users.length})`}
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{t('auth.approvals')}</span>
            {pendingUsers.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PENDING APPROVALS TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold block">
                {language === 'km' ? 'ការផ្ទៀងផ្ទាត់សិទ្ធិអ្នកគ្រប់គ្រង និងអ្នកបើកបរ' : 'Privileged Role Verification Desk'}
              </strong>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {language === 'km'
                  ? 'អ្នកគ្រប់គ្រងសាលារៀន និងអ្នកបើកបរដែលបានចុះឈ្មោះថ្មី តម្រូវឱ្យមានការត្រួតពិនិត្យ និងអនុម័តមុនពេលទទួលបានសិទ្ធិចូលមើលទិន្នន័យសិស្ស។'
                  : 'New School Admin and Driver applications require authorization before administrative and transit privileges are granted.'}
              </p>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>{language === 'km' ? 'មិនមានគណនីរង់ចាំការអនុម័តទេ' : 'No accounts currently pending approval.'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map(user => {
                const isAdmin = user.role === 'admin' || user.role === 'school_admin';
                return (
                  <div key={user.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={(user.avatar && !user.avatar.includes('unsplash.com')) ? user.avatar : (isAdmin ? '/images/khmer_admin.svg' : '/images/khmer_driver.svg')} 
                          alt="" 
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                          <p className="text-xs text-slate-500">{user.email}</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                            isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </div>

                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Pending
                      </span>
                    </div>

                    {/* Submitted role metadata */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      {isAdmin && user.schoolName && (
                        <div>
                          <span className="text-slate-400 text-[10px] block">{t('auth.schoolName')}:</span>
                          <strong className="text-slate-800">{user.schoolName}</strong>
                        </div>
                      )}
                      {isAdmin && user.schoolAddress && (
                        <div>
                          <span className="text-slate-400 text-[10px] block">{t('auth.schoolAddress')}:</span>
                          <span className="text-slate-700 text-[11px]">{user.schoolAddress}</span>
                        </div>
                      )}
                      {!isAdmin && user.licenseNumber && (
                        <div>
                          <span className="text-slate-400 text-[10px] block">{t('auth.driverLicense')}:</span>
                          <strong className="text-slate-800 font-mono">{user.licenseNumber}</strong>
                        </div>
                      )}
                      {!isAdmin && user.vehiclePlate && (
                        <div>
                          <span className="text-slate-400 text-[10px] block">{t('auth.vehiclePlate')}:</span>
                          <strong className="text-slate-800 font-mono">{user.vehiclePlate}</strong>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 text-[10px] block">{t('drivers.phone')}:</span>
                        <span className="text-slate-700 font-mono">{user.phone}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => rejectUser(user.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('auth.reject')}</span>
                      </button>

                      <button
                        onClick={() => approveUser(user.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('auth.approve')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALL USERS TAB */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'km' ? `បញ្ជីអ្នកប្រើប្រាស់ប្រព័ន្ធ (${formatNumber(users.length)})` : `Registered System Accounts (${users.length})`}
            </h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> {language === 'km' ? 'សុវត្ថិភាព RBAC' : 'RBAC Enforced'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">{t('users.user')}</th>
                  <th className="py-3 px-4">{t('users.email')}</th>
                  <th className="py-3 px-4">{t('common.role')}</th>
                  <th className="py-3 px-4">{t('drivers.phone')}</th>
                  <th className="py-3 px-4">{t('users.status')}</th>
                  <th className="py-3 px-4 text-right">{t('users.created')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <img 
                        src={(u.avatar && !u.avatar.includes('unsplash.com')) ? u.avatar : (u.role === 'admin' || u.role === 'school_admin' ? '/images/khmer_admin.svg' : u.role === 'driver' ? '/images/khmer_driver.svg' : '/images/khmer_parent.svg')} 
                        alt="" 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span>{u.name}</span>
                        {u.schoolName && <span className="block text-[10px] text-slate-400 font-normal">{u.schoolName}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        u.role === 'admin' || u.role === 'school_admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'driver' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{u.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        u.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.status === 'active' ? (language === 'km' ? 'សកម្ម' : 'Active') :
                         u.status === 'pending' ? (language === 'km' ? 'រង់ចាំអនុម័ត' : 'Pending') : u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
