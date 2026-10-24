import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Users, Bus, ArrowLeft, ArrowRight, CheckCircle2, 
  AlertTriangle, Shield, Eye, EyeOff, Sparkles, Phone, Mail, Lock 
} from 'lucide-react';
import { validateEmailOrPhone, validatePasswordStrength } from '../../services/authService';

interface RegisterFormProps {
  initialRole?: 'school_admin' | 'parent' | 'driver';
  onBackToWelcome: () => void;
  onGoToLogin: () => void;
  onRegistrationSuccess: () => void;
}

export function RegisterForm({
  initialRole = 'parent',
  onBackToWelcome,
  onGoToLogin,
  onRegistrationSuccess
}: RegisterFormProps) {
  const { registerUser, schools, language, setLanguage, t, localize } = useApp();

  const [selectedRole, setSelectedRole] = useState<'school_admin' | 'parent' | 'driver'>(initialRole);
  
  // Common Fields
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLang, setPreferredLang] = useState<'km' | 'en'>(language);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // School Admin Fields
  const [schoolName, setSchoolName] = useState(schools[0]?.name || 'Institute of Technology of Cambodia');
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('Russian Blvd, Toul Kork, Phnom Penh');
  const [schoolPhone, setSchoolPhone] = useState('+855 23 880 370');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolVerificationCode, setSchoolVerificationCode] = useState('');

  // Parent Fields
  const [studentName, setStudentName] = useState('');
  const [parentSchoolId, setParentSchoolId] = useState(schools[0]?.id || 'sch-1');
  const [studentGrade, setStudentGrade] = useState('Grade 8');
  const [studentIdCode, setStudentIdCode] = useState('');

  // Driver Fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [transportCompany, setTransportCompany] = useState('Phnom Penh School Transit Network');
  const [vehicleType, setVehicleType] = useState('School Bus (35 Seats)');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // UI & Error State
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validate common fields
    if (!fullName.trim()) {
      setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះពេញ' : 'Please enter your full name.');
      return;
    }

    const contactValidation = validateEmailOrPhone(emailOrPhone);
    if (!contactValidation.valid) {
      setError(contactValidation.error || 'Please enter a valid email or phone number.');
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      setError(t('auth.passwordReqs'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'));
      return;
    }

    if (!acceptedTerms) {
      setError(t('auth.termsRequired'));
      return;
    }

    // 2. Validate role-specific requirements
    if (selectedRole === 'school_admin') {
      const activeSchool = customSchoolName.trim() || schoolName;
      if (!activeSchool) {
        setError(language === 'km' ? 'សូមបញ្ជាក់ឈ្មោះសាលារៀន' : 'Please provide the school name.');
        return;
      }
    } else if (selectedRole === 'parent') {
      if (!studentName.trim()) {
        setError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះសិស្ស' : 'Please enter the student\'s full name.');
        return;
      }
    } else if (selectedRole === 'driver') {
      if (!licenseNumber.trim()) {
        setError(language === 'km' ? 'សូមបញ្ចូលលេខប័ណ្ណបើកបរ' : 'Please enter your driver license number.');
        return;
      }
      if (!vehiclePlate.trim()) {
        setError(language === 'km' ? 'សូមបញ្ចូលស្លាកលេខយានយន្ត' : 'Please enter your vehicle plate number.');
        return;
      }
    }

    setLoading(true);

    try {
      const result = await registerUser({
        fullName: fullName.trim(),
        emailOrPhone: emailOrPhone.trim(),
        password,
        role: selectedRole,
        preferredLanguage: preferredLang,
        // School Admin
        schoolName: customSchoolName.trim() || schoolName,
        schoolAddress,
        schoolPhone,
        schoolEmail,
        verificationCode: schoolVerificationCode,
        // Parent
        studentName: studentName.trim(),
        studentGrade,
        schoolId: parentSchoolId,
        studentIdCode: studentIdCode.trim(),
        // Driver
        licenseNumber: licenseNumber.trim(),
        transportCompany: transportCompany.trim(),
        vehicleType,
        vehiclePlate: vehiclePlate.trim()
      });

      if (result.success) {
        if (preferredLang !== language) {
          setLanguage(preferredLang);
        }
        onRegistrationSuccess();
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      
      {/* Form Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToWelcome}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              {t('auth.createAccount')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              {t('auth.registerBtn')} {selectedRole === 'school_admin' ? t('auth.schoolAdminRole') : selectedRole === 'driver' ? t('auth.driverRole') : t('auth.parentRole')}
            </h2>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Phnom Penh</span>
        </div>
      </div>

      {/* Role Switcher Tabs */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-2">
          {t('auth.selectRolePrompt')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'school_admin' as const, label: t('auth.schoolAdminRole'), icon: Building2 },
            { id: 'parent' as const, label: t('auth.parentRole'), icon: Users },
            { id: 'driver' as const, label: t('auth.driverRole'), icon: Bus },
          ].map(r => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
        
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: COMMON CREDENTIALS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            1. {language === 'km' ? 'ព័ត៌មានផ្ទាល់ខ្លួន និងគណនី' : 'Account Credentials'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('auth.fullName')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sokha Dara"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('auth.emailOrPhone')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. sokha@gmail.com or +855 12 345 678"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('auth.password')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t('auth.confirmPassword')} <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div className="pt-2">
            <label className="block font-bold text-slate-700 mb-1.5">
              {t('auth.preferredLang')}
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setPreferredLang('km')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                  preferredLang === 'km' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span>🇰🇭</span>
                <span>ភាសាខ្មែរ (Khmer)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                  preferredLang === 'en' ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span>🇬🇧</span>
                <span>English (UK)</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: ROLE-SPECIFIC FIELDS */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>
              2. {selectedRole === 'school_admin' ? (language === 'km' ? 'ព័ត៌មានរដ្ឋបាលសាលារៀន' : 'School Administration Details') :
                  selectedRole === 'parent' ? (language === 'km' ? 'ព័ត៌មានសិស្ស និងអាណាព្យាបាល' : 'Student & Family Details') :
                  (language === 'km' ? 'ព័ត៌មានអ្នកបើកបរ និងយានយន្ត' : 'Driver & Vehicle Records')}
            </span>
            <span className="text-[10px] text-blue-600 lowercase font-medium">required fields</span>
          </h3>

          {/* SCHOOL ADMIN FIELDS */}
          {selectedRole === 'school_admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{t('auth.adminApprovalNotice')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.schoolName')}</label>
                  <select
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.name}>
                        {localize(s.name, s.nameKh)}
                      </option>
                    ))}
                    <option value="other">+ {language === 'km' ? 'សាលារៀនផ្សេងទៀត...' : 'Other Phnom Penh School...'}</option>
                  </select>
                </div>

                {schoolName === 'other' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'km' ? 'បញ្ចូលឈ្មោះសាលារៀនផ្ទាល់ខ្លួន' : 'Custom School Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phnom Penh Academy"
                      value={customSchoolName}
                      onChange={e => setCustomSchoolName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.schoolPhone')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +855 23 880 370"
                    value={schoolPhone}
                    onChange={e => setSchoolPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.schoolAddress')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Russian Blvd, Toul Kork, Phnom Penh"
                    value={schoolAddress}
                    onChange={e => setSchoolAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.schoolEmail')}</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@itc.edu.kh"
                    value={schoolEmail}
                    onChange={e => setSchoolEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.schoolVerificationCode')}</label>
                  <input
                    type="text"
                    placeholder="e.g. MOEYS-PP-8821"
                    value={schoolVerificationCode}
                    onChange={e => setSchoolVerificationCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PARENT FIELDS */}
          {selectedRole === 'parent' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{t('auth.parentPrivacyNotice')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('auth.studentName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sokha Sarya"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.selectSchool')}</label>
                  <select
                    value={parentSchoolId}
                    onChange={e => setParentSchoolId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>
                        {localize(s.name, s.nameKh)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.studentGrade')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 9A"
                    value={studentGrade}
                    onChange={e => setStudentGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.studentIdCode')}</label>
                  <input
                    type="text"
                    placeholder="e.g. STU-8849"
                    value={studentIdCode}
                    onChange={e => setStudentIdCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DRIVER FIELDS */}
          {selectedRole === 'driver' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{t('auth.driverApprovalNotice')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('auth.driverLicense')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KH-DL-98214"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.transportCompany')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Phnom Penh City Bus Authority"
                    value={transportCompany}
                    onChange={e => setTransportCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('auth.vehicleType')}</label>
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="School Bus (35 Seats)">School Bus (35 Seats)</option>
                    <option value="School Minibus (20 Seats)">School Minibus (20 Seats)</option>
                    <option value="Transit Van (12 Seats)">Transit Van (12 Seats)</option>
                    <option value="Student Shuttle">Student Shuttle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('auth.vehiclePlate')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phnom Penh 3B-4491"
                    value={vehiclePlate}
                    onChange={e => setVehiclePlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 text-xs">
            <input
              type="checkbox"
              required
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="leading-relaxed">{t('auth.acceptTerms')}</span>
          </label>
        </div>

        {/* Submit & Links */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 text-sm flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('auth.createAccount')}</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            {t('auth.haveAccount')}{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-blue-600 hover:text-blue-700 font-bold underline ml-1"
            >
              {t('auth.loginBtn')}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
