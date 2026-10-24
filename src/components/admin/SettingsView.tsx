import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Sparkles, Check, Globe, Send } from 'lucide-react';

export function SettingsView() {
  const { currentUser, askGeminiAssistant, language, setLanguage, t } = useApp();
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
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t('settings.title')}</h2>
        <p className="text-xs text-slate-500">{t('settings.subtitle')}</p>
      </div>

      {/* Language Selection Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{t('settings.languageSettings')}</h3>
            <p className="text-xs text-slate-500">{t('settings.selectLanguage')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
          <button
            type="button"
            onClick={() => setLanguage('km')}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all text-left ${
              language === 'km'
                ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇰🇭</span>
              <div>
                <p className="font-bold text-sm">ភាសាខ្មែរ (Khmer)</p>
                <p className="text-[11px] text-slate-500">កំណត់ជាភាសាគោល</p>
              </div>
            </div>
            {language === 'km' && (
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all text-left ${
              language === 'en'
                ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <p className="font-bold text-sm">English</p>
                <p className="text-[11px] text-slate-500">International English</p>
              </div>
            </div>
            {language === 'en' && (
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" /> {t('settings.profileSettings')}
          </h3>

          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" /> {t('settings.savedSuccess')}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('settings.fullName')}</label>
              <input
                type="text"
                defaultValue={currentUser?.name || ''}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('settings.emailAddress')}</label>
              <input
                type="email"
                defaultValue={currentUser?.email || ''}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('settings.phone')}</label>
              <input
                type="text"
                defaultValue={currentUser?.phone || ''}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('settings.role')}</label>
              <input
                type="text"
                disabled
                value={(currentUser?.role || 'admin').toUpperCase()}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 capitalize cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition-colors"
            >
              {t('settings.saveChanges')}
            </button>
          </form>
        </div>

        {/* Gemini AI Assistant */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> {t('settings.geminiAssistant')}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t('settings.aiAssistantSubtitle')}
            </p>

            <form onSubmit={handleAskAI} className="space-y-3 mt-4 text-xs">
              <textarea
                rows={4}
                placeholder={t('settings.askAiPlaceholder')}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {loading ? t('settings.askingAi') : t('settings.askAiButton')}
              </button>
            </form>

            {aiResponse && (
              <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                <p className="font-bold mb-1.5 flex items-center gap-1.5 text-indigo-950">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> {t('settings.aiResponseTitle')}
                </p>
                <div className="whitespace-pre-line text-slate-800">{aiResponse}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
