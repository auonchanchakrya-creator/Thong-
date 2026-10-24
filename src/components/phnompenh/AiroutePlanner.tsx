import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navigation, Sparkles, Clock, MapPin, Bus, Bike, Car, Footprints, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AiroutePlannerProps {
  initialSchoolId?: string;
  lang: 'en' | 'kh';
}

export function AiroutePlanner({ initialSchoolId, lang }: AiroutePlannerProps) {
  const { schools, askGeminiAssistant, language: contextLang, t, localize } = useApp();
  const currentLang = (lang === 'kh' || contextLang === 'km') ? 'kh' : 'en';

  const [startLocation, setStartLocation] = useState(
    currentLang === 'kh' ? 'ផ្លូវ ៣១៥ សង្កាត់បឹងកក់ ខណ្ឌទួលគោក ភ្នំពេញ' : '744 Evergreen Terrace, Tuol Kork, Phnom Penh'
  );
  const [destinationSchoolId, setDestinationSchoolId] = useState(initialSchoolId || schools[0]?.id);
  const [mode, setMode] = useState<'bus' | 'car' | 'bike' | 'walk'>('bus');
  const [priority, setPriority] = useState<'fastest' | 'safest' | 'shortest'>('safest');
  const [aiModel, setAiModel] = useState<'gemini-2.5-flash' | 'gemini-1.5-pro'>('gemini-2.5-flash');
  
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const destinationSchool = schools.find(s => s.id === destinationSchoolId) || schools[0];

  const handlePlanRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const destName = localize(destinationSchool.name, destinationSchool.nameKh);
    const prompt = currentLang === 'kh'
      ? `គណនា និងរៀបចំផ្លូវធ្វើដំណើរឆ្លាតវៃ AI សម្រាប់សិស្សានុសិស្សនៅរាជធានីភ្នំពេញ ចេញពី "${startLocation}" ទៅកាន់ "${destName}" ដោយប្រើមធ្យោបាយ "${mode}" និងអាទិភាព "${priority}"។ សូមផ្តល់៖ ចម្ងាយផ្លូវគិតជាគីឡូម៉ែត្រ, រយៈពេលធ្វើដំណើរប៉ាន់ស្មានគិតជានាទី, ចំណុចឈប់ណែនាំ ៣ ដើម្បីបញ្ចៀសការកកស្ទះមហាវិថីមុនីវង្ស និងមហាវិថីសហព័ន្ធរុស្ស៊ី, ការណែនាំល្បឿនតំបន់សាលា និងការកាត់បន្ថយការបំភាយឧស្ម័នកាបូន។`
      : `Run AI Route Optimizer for Phnom Penh school travel from "${startLocation}" to "${destinationSchool.name}" using transport mode "${mode}" with priority "${priority}" (Model: ${aiModel}). Provide distance in km, estimated travel time in minutes, 3 optimized waypoint recommendations avoiding Monivong Blvd congestion, school zone speed limit advisories, and carbon emission savings.`;
    
    const resp = await askGeminiAssistant(prompt, currentLang === 'kh' ? 'km' : 'en');
    setAiResult(resp);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl">
        <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1.5 w-fit">
          <Sparkles className="w-3.5 h-3.5" /> {t('optimizer.geminiPowered')}
        </span>
        <h2 className="text-2xl font-bold tracking-tight mt-2">
          {t('optimizer.title')}
        </h2>
        <p className="text-blue-200 text-sm mt-1">
          {t('optimizer.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Input Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">{t('optimizer.parameters')}</h3>

          <form onSubmit={handlePlanRoute} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('optimizer.startingLocation')}</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={startLocation}
                  onChange={e => setStartLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('optimizer.destinationSchool')}</label>
              <select
                value={destinationSchoolId}
                onChange={e => setDestinationSchoolId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {localize(s.name, s.nameKh)} ({localize(s.address, s.addressKh)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('optimizer.transportMode')}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bus', label: t('optimizer.bus'), icon: Bus },
                  { id: 'car', label: t('optimizer.car'), icon: Car },
                  { id: 'bike', label: t('optimizer.bike'), icon: Bike },
                  { id: 'walk', label: t('optimizer.walk'), icon: Footprints },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id as any)}
                      className={`py-2 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                        mode === m.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('optimizer.priority')}</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="safest">{t('optimizer.safest')}</option>
                <option value="fastest">{t('optimizer.fastest')}</option>
                <option value="shortest">{t('optimizer.shortest')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('optimizer.modelEngine')}</label>
              <select
                value={aiModel}
                onChange={e => setAiModel(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash ({currentLang === 'kh' ? 'ល្បឿនលឿន' : 'Ultra Fast'})</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro ({currentLang === 'kh' ? 'វិភាគស៊ីជម្រៅ' : 'Deep Analysis'})</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {loading ? t('optimizer.runningButton') : t('optimizer.runButton')}
            </button>
          </form>
        </div>

        {/* AI Route Results & Explanation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" /> {t('optimizer.resultsTitle')}
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                {t('optimizer.optimizedBadge')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block">{t('optimizer.optimizedDistance')}</span>
                <strong className="text-slate-900 text-sm">4.6 {t('common.distanceUnit')}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">{t('optimizer.estTravelTime')}</span>
                <strong className="text-emerald-600 text-sm">12 {t('common.minutesUnit')}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">{t('optimizer.safetyScore')}</span>
                <strong className="text-blue-600 text-sm">4.9 / 5.0</strong>
              </div>
            </div>

            {aiResult && (
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> {t('optimizer.aiAnalysisTitle')}
                </p>
                <div className="whitespace-pre-line text-slate-800 leading-relaxed">{aiResult}</div>
              </div>
            )}

            {!aiResult && !loading && (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl leading-relaxed">
                {t('optimizer.emptyNotice')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
