import React, { useState } from 'react';
import { PhnomPenhOptimizerDashboard } from './PhnomPenhOptimizerDashboard';
import { InteractiveSchoolMap } from './InteractiveSchoolMap';
import { SchoolInfoView } from './SchoolInfoView';
import { SafetyInsightsView } from './SafetyInsightsView';
import { Map, Navigation, Building2, ShieldAlert, Globe, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function PhnomPenhApp() {
  const { language, setLanguage, t } = useApp();
  const [activeLayout, setActiveLayout] = useState<'planner' | 'map' | 'schools' | 'safety'>('planner');
  const [selectedSchoolForRoute, setSelectedSchoolForRoute] = useState<string | undefined>(undefined);

  const langCode = language === 'km' ? 'kh' : 'en';

  return (
    <div className="space-y-6 pb-12">
      {/* Phnom Penh App Subheader & Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            🇰🇭
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>{language === 'km' ? 'ប្រព័ន្ធរៀបចំផ្លូវសាលា AI រាជធានីភ្នំពេញ' : 'School Route AI Optimizer – Phnom Penh'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live GPS
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'km' 
                ? 'ការដឹកជញ្ជូនសិស្ស និងផ្លូវសុវត្ថិភាពឆ្លាតវៃនៅរាជធានីភ្នំពេញ កម្ពុជា' 
                : 'AI-powered school transportation & safe routing across Phnom Penh, Cambodia'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Layout Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveLayout('planner')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeLayout === 'planner' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('nav.optimizer')}</span>
            </button>
            <button
              onClick={() => setActiveLayout('map')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeLayout === 'map' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ផែនទីសាលា' : 'School Map'}</span>
            </button>
            <button
              onClick={() => setActiveLayout('schools')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeLayout === 'schools' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('nav.schools')}</span>
            </button>
            <button
              onClick={() => setActiveLayout('safety')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeLayout === 'safety' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t('nav.safetyInsights')}</span>
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'km' ? '🇰🇭 ភាសាខ្មែរ' : '🇬🇧 English'}</span>
          </button>
        </div>
      </div>

      {/* Active Layout Content */}
      {activeLayout === 'planner' && <PhnomPenhOptimizerDashboard />}
      {activeLayout === 'map' && (
        <InteractiveSchoolMap
          lang={langCode}
          onSelectSchoolForRoute={(schoolId) => {
            setSelectedSchoolForRoute(schoolId);
            setActiveLayout('planner');
          }}
        />
      )}
      {activeLayout === 'schools' && <SchoolInfoView lang={langCode} />}
      {activeLayout === 'safety' && <SafetyInsightsView lang={langCode} />}
    </div>
  );
}
