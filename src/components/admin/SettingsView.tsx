import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Sparkles, Check, Globe, Type } from 'lucide-react';

export function SettingsView() {
  const { currentUser, askGeminiAssistant, language, setLanguage, fontSize, setFontSize, t } = useApp();
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setLoading(true);
    const resp = await askGeminiAssistant(aiPrompt, language);
    setAiResponse(resp);
    setLoading(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl pb-10">
      <div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('settings.title')}</h2>
        <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">{t('settings.subtitle')}</p>
      </div>

      {/* Typography & Readability Accessibility Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              {language === 'km' ? 'ទំហំអក្សរ និងភាពងាយអាន (Typography & Readability)' : 'Text Size & Readability'}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {language === 'km' 
                ? 'កែតម្រូវទំហំអក្សរសម្រាប់កម្មវិធីទាំងមូល (Admin, Parent, Driver) ឱ្យកាន់តែច្បាស់ និងងាយស្រួលមើល'
                : 'Choose your preferred font scale across Admin, Parent, and Driver apps for comfortable reading'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Small Option */}
          <button
            type="button"
            onClick={() => setFontSize('small')}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              fontSize === 'small'
                ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                {language === 'km' ? 'តូច' : 'Small'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/80 font-bold text-slate-700">15px Base</span>
            </div>
            <p className="text-base font-bold text-slate-900 mb-1">
              {language === 'km' ? 'ទំហំតូចល្មម' : 'Compact Layout'}
            </p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {language === 'km' ? 'ស័ក្តិសមសម្រាប់អេក្រង់តូច ឬអ្នកដែលចូលចិត្តឃើញទិន្នន័យច្រើន' : 'Best for compact displays with dense data tables'}
            </p>
          </button>

          {/* Medium Option (Recommended) */}
          <button
            type="button"
            onClick={() => setFontSize('medium')}
            className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
              fontSize === 'medium'
                ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="absolute top-3 right-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                {language === 'km' ? 'ស្តង់ដារ' : 'Default'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                {language === 'km' ? 'មធ្យម (ស្តង់ដារ)' : 'Medium (Default)'}
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 mb-1">
              {language === 'km' ? 'ទំហំស្តង់ដារ ច្បាស់ល្អ' : 'Standard Readable'}
            </p>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {language === 'km' ? 'អក្សរធំល្មម ច្បាស់ល្អ និងមានផាសុកភាពភ្នែកខ្ពស់ (17.5px Base)' : 'Bigger, crisp font size with optimized contrast and line height (17.5px)'}
            </p>
          </button>

          {/* Large Option */}
          <button
            type="button"
            onClick={() => setFontSize('large')}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              fontSize === 'large'
                ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-600/20'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                {language === 'km' ? 'ធំ' : 'Large'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">20px Base</span>
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">
              {language === 'km' ? 'ទំហំធំពិសេស' : 'Extra Large'}
            </p>
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              {language === 'km' ? 'អក្សរធំច្បាស់បំផុត ស័ក្តិសមសម្រាប់អ្នកបើកបរ ឬមើលពីចម្ងាយ' : 'Maximum visibility and readability for tablets, mobile, and drivers'}
            </p>
          </button>
        </div>

        {/* Live Typography Preview Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs uppercase font-black tracking-wider text-slate-400 mb-2">
            {language === 'km' ? 'គំរូអក្សរផ្ទាល់ (Live Text Sample Preview)' : 'Live Text Sample Preview'}
          </p>
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-slate-900">
              {language === 'km' ? 'សាលារៀនអន្តរជាតិ SchoolRoutAI — រថយន្តក្រុងលេខ 03' : 'SchoolRoutAI Smart Transit — Bus #03 Active'}
            </h4>
            <p className="text-base text-slate-700 font-medium">
              {language === 'km'
                ? 'កំពុងធ្វើដំណើរទៅសាលា៖ ទទួលសិស្សបាន 14/16 នាក់ • ល្បឿន 34 គីឡូម៉ែត្រ/ម៉ោង • ស្ថានភាពធម្មតា'
                : 'En route to Western International School • 14 of 16 students boarded • Speed: 34 km/h • Normal trip status'}
            </p>
          </div>
        </div>
      </div>

      {/* Language Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{t('settings.languageSettings')}</h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium">{t('settings.selectLanguage')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-xl">
          <button
            type="button"
            onClick={() => setLanguage('km')}
            className={`p-5 rounded-xl border-2 flex items-center justify-between transition-all text-left ${
              language === 'km'
                ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🇰🇭</span>
              <div>
                <p className="font-bold text-base sm:text-lg text-slate-900">ភាសាខ្មែរ (Khmer)</p>
                <p className="text-sm text-slate-500 font-medium">កំណត់ជាភាសាគោល</p>
              </div>
            </div>
            {language === 'km' && (
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-5 rounded-xl border-2 flex items-center justify-between transition-all text-left ${
              language === 'en'
                ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🇬🇧</span>
              <div>
                <p className="font-bold text-base sm:text-lg text-slate-900">English</p>
                <p className="text-sm text-slate-500 font-medium">International English</p>
              </div>
            </div>
            {language === 'en' && (
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="font-bold text-slate-900 text-xl sm:text-2xl flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" /> {t('settings.profileSettings')}
          </h3>

          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-base px-4 py-3 rounded-xl font-bold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" /> {t('settings.savedSuccess')}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5 text-base">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-base">{t('settings.fullName')}</label>
              <input
                type="text"
                defaultValue={currentUser?.name || ''}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-base">{t('settings.emailAddress')}</label>
              <input
                type="email"
                defaultValue={currentUser?.email || ''}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-base">{t('settings.phone')}</label>
              <input
                type="text"
                defaultValue={currentUser?.phone || ''}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-base">{t('settings.role')}</label>
              <input
                type="text"
                disabled
                value={(currentUser?.role || 'admin').toUpperCase()}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-600 font-bold capitalize cursor-not-allowed min-h-[48px]"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-md transition-colors min-h-[48px] flex items-center justify-center gap-2"
            >
              {t('settings.saveChanges')}
            </button>
          </form>
        </div>

        {/* Gemini AI Assistant */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-xl sm:text-2xl flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-600" /> {t('settings.geminiAssistant')}
            </h3>
            <p className="text-base text-slate-600 mt-2 leading-relaxed font-medium">
              {t('settings.aiAssistantSubtitle')}
            </p>

            <form onSubmit={handleAskAI} className="space-y-4 mt-5 text-base">
              <textarea
                rows={4}
                placeholder={t('settings.askAiPlaceholder')}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 min-h-[48px]"
              >
                <Sparkles className="w-5 h-5" /> {loading ? t('settings.askingAi') : t('settings.askAiButton')}
              </button>
            </form>

            {aiResponse && (
              <div className="mt-5 p-5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-base text-indigo-950 leading-relaxed">
                <p className="font-black mb-2 flex items-center gap-2 text-indigo-950 text-base">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> {t('settings.aiResponseTitle')}
                </p>
                <div className="whitespace-pre-line text-slate-800 font-medium">{aiResponse}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
