import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, Building2, Users, Globe, ArrowRight, CheckCircle2, 
  Shield, Sparkles, Navigation, ChevronDown, Check, UserCheck, Lock
} from 'lucide-react';
import { RegisterForm } from './RegisterForm';
import { LoginForm } from './LoginForm';

export function WelcomeAuthPage() {
  const { language, setLanguage, t, switchUser, users } = useApp();
  
  // View states: 'welcome' | 'register' | 'login'
  const [authView, setAuthView] = useState<'welcome' | 'register' | 'login'>('welcome');
  const [selectedRole, setSelectedRole] = useState<'school_admin' | 'parent' | 'driver'>('school_admin');

  const roleCards = [
    {
      id: 'school_admin' as const,
      title: language === 'km' ? 'អ្នកគ្រប់គ្រងសាលារៀន' : 'School Admin',
      titleSecondary: language === 'km' ? 'School Administrator' : 'អ្នកគ្រប់គ្រងសាលារៀន',
      badge: language === 'km' ? 'រដ្ឋបាលសាលា' : 'Administrative Authority',
      icon: Building2,
      image: '/images/khmer_admin.svg',
      accentColor: 'from-blue-600 to-indigo-700',
      borderColor: 'border-blue-600',
      bgColor: 'bg-blue-50/40',
      iconBg: 'bg-blue-100 text-blue-700',
      responsibilities: [
        language === 'km' ? 'គ្រប់គ្រងព័ត៌មានទូទៅរបស់សាលារៀន' : 'Manage school profile and official information',
        language === 'km' ? 'គ្រប់គ្រងអាណាព្យាបាល និងអ្នកបើកបរពាក់ព័ន្ធ' : 'Manage parents and drivers associated with the school',
        language === 'km' ? 'បង្កើត និងចាត់តាំងខ្សែរត់រថយន្តក្រុងសាលា' : 'Create and assign school routes',
        language === 'km' ? 'គ្រប់គ្រងកំណត់ត្រាដឹកជញ្ជូនសិស្សានុសិស្ស' : 'Manage student transportation records',
        language === 'km' ? 'ត្រួតពិនិត្យដំណើរការខ្សែរត់ និងមើលរបាយការណ៍' : 'Monitor route progress and view safety reports'
      ]
    },
    {
      id: 'parent' as const,
      title: language === 'km' ? 'អាណាព្យាបាលសិស្ស' : 'Parent & Guardian',
      titleSecondary: language === 'km' ? 'Parent Portal' : 'អាណាព្យាបាលសិស្ស',
      badge: language === 'km' ? 'គ្រួសារ និងសិស្ស' : 'Family & Student',
      icon: Users,
      image: '/images/khmer_parent.svg',
      accentColor: 'from-emerald-600 to-teal-700',
      borderColor: 'border-emerald-600',
      bgColor: 'bg-emerald-50/40',
      iconBg: 'bg-emerald-100 text-emerald-700',
      responsibilities: [
        language === 'km' ? 'មើលព័ត៌មានដឹកជញ្ជូនសាលារបស់កូនៗ' : 'View children\'s school transportation info',
        language === 'km' ? 'មើលអ្នកបើកបរដែលបានចាត់តាំង និងខ្សែរត់សាលា' : 'View assigned drivers and school routes',
        language === 'km' ? 'ពិនិត្យព័ត៌មាន និងម៉ោងទទួល-ទម្លាក់សិស្ស' : 'Check real-time pickup and drop-off information',
        language === 'km' ? 'ទទួលការជូនដំណឹងសុវត្ថិភាពភ្លាមៗ' : 'Receive instant transportation notifications',
        language === 'km' ? 'មើលស្ថានភាពជើងធ្វើដំណើរ និងទីតាំង GPS ជាក់ស្តែង' : 'View permitted route and live trip GPS status'
      ]
    },
    {
      id: 'driver' as const,
      title: language === 'km' ? 'អ្នកបើកបរ' : 'School Bus Driver',
      titleSecondary: language === 'km' ? 'Bus Driver Portal' : 'អ្នកបើកបរ',
      badge: language === 'km' ? 'ប្រតិបត្តិការដឹកជញ្ជូន' : 'Transit Operations',
      icon: Bus,
      image: '/images/khmer_driver.svg',
      accentColor: 'from-amber-600 to-orange-700',
      borderColor: 'border-amber-600',
      bgColor: 'bg-amber-50/40',
      iconBg: 'bg-amber-100 text-amber-700',
      responsibilities: [
        language === 'km' ? 'មើលខ្សែរត់ និងចំណតដែលបានចាត់តាំង' : 'View assigned routes and scheduled stops',
        language === 'km' ? 'មើលបញ្ជីឈ្មោះសិស្សត្រូវទទួល និងទម្លាក់' : 'View pickup and drop-off lists for authorized trips',
        language === 'km' ? 'ប្រើប្រាស់ប្រព័ន្ធនាំផ្លូវ GPS ទៅកាន់គោលដៅ' : 'Access GPS navigation to assigned destinations',
        language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពស្ថានភាព (មិនទាន់ចាប់ផ្តើម, កំពុងរត់, បានបញ្ចប់)' : 'Update trip status (Not Started, In Progress, Completed)',
        language === 'km' ? 'រាយការណ៍ការយឺតយ៉ាវ ឬឧបសគ្គចរាចរណ៍លើផ្លូវ' : 'Report delays or road transportation issues'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar Bar with Language Switcher */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 font-bold">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">
              SchoolRoute<span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium leading-none">
              Phnom Penh School Transit System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLanguage('km')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                language === 'km' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇰🇭</span>
              <span className="hidden sm:inline">ភាសាខ្មែរ</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                language === 'en' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">English</span>
            </button>
          </div>

          {authView !== 'welcome' && (
            <button
              onClick={() => setAuthView('welcome')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              {language === 'km' ? '← ទំព័រដើម' : '← Home'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        
        {authView === 'welcome' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Hero Welcome Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                {language === 'km' ? 'រាជធានីភ្នំពេញ · ប្រព័ន្ធគ្រប់គ្រងដឹកជញ្ជូនសិស្ស' : 'Phnom Penh · School Transportation AI'}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t('auth.welcomeTitle')}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {t('auth.welcomeSubtitle')}
              </p>
            </div>

            {/* Action Bar (Register & Login Buttons) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <button
                onClick={() => setAuthView('register')}
                className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-600/25 text-sm flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <span>{t('auth.createAccount')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAuthView('login')}
                className="w-full sm:w-auto flex-1 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-6 rounded-2xl border border-slate-300 shadow-sm text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>{t('auth.loginBtn')}</span>
              </button>
            </div>

            {/* Role Selection Prompt */}
            <div className="text-center pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                {t('auth.selectRolePrompt')}
              </h3>
            </div>

            {/* 3 Clickable Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roleCards.map(role => {
                const isSelected = selectedRole === role.id;
                const Icon = role.icon;

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative rounded-3xl p-6 sm:p-7 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                      isSelected
                        ? `${role.borderColor} bg-white shadow-xl ring-4 ring-blue-500/10`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Top Active Indicator */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={role.image} 
                          alt={role.title} 
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-100 shadow-md shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className={`w-8 h-8 rounded-xl ${role.iconBg} flex items-center justify-center font-bold shadow-xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                          {role.badge}
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-transparent'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Role Title & Secondary */}
                    <div>
                      <h4 className="text-lg font-black text-slate-900">
                        {role.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mb-4">
                        {role.titleSecondary}
                      </p>

                      {/* Responsibilities list */}
                      <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                        {role.responsibilities.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Select / Register Action for this Card */}
                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole(role.id);
                          setAuthView('register');
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{t('auth.registerBtn')} {role.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Demo Accounts Banner for Rapid Review */}
            <div className="bg-slate-100/80 rounded-2xl border border-slate-200 p-4 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  ⚡
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">
                    {t('auth.demoAccounts')}
                  </strong>
                  <p className="text-slate-500 text-[11px]">
                    {t('auth.demoNotice')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => switchUser('usr-admin-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs text-[11px] transition-colors flex items-center gap-1.5"
                >
                  <img src="/images/khmer_admin.svg" alt="" className="w-4 h-4 rounded-full object-cover border border-white/40" referrerPolicy="no-referrer" />
                  Admin
                </button>
                <button
                  onClick={() => switchUser('usr-parent-1')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs text-[11px] transition-colors flex items-center gap-1.5"
                >
                  <img src="/images/khmer_parent.svg" alt="" className="w-4 h-4 rounded-full border border-white/40" referrerPolicy="no-referrer" />
                  Parent
                </button>
                <button
                  onClick={() => switchUser('usr-driver-1')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs text-[11px] transition-colors flex items-center gap-1.5"
                >
                  <img src="/images/khmer_driver.svg" alt="" className="w-4 h-4 rounded-full border border-white/40" referrerPolicy="no-referrer" />
                  Driver
                </button>
              </div>
            </div>

          </div>
        )}

        {/* REGISTRATION FORM VIEW */}
        {authView === 'register' && (
          <RegisterForm
            initialRole={selectedRole}
            onBackToWelcome={() => setAuthView('welcome')}
            onGoToLogin={() => setAuthView('login')}
            onRegistrationSuccess={() => {
              // Context automatically updates currentUser and triggers redirection!
            }}
          />
        )}

        {/* LOGIN FORM VIEW */}
        {authView === 'login' && (
          <LoginForm
            onGoToRegister={() => setAuthView('register')}
            onLoginSuccess={() => {
              // Context automatically updates currentUser and triggers redirection!
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <p>© 2026 School Route AI (រាជធានីភ្នំពេញ, Cambodia). All rights reserved.</p>
      </footer>
    </div>
  );
}
