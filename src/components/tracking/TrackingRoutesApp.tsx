import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { 
  Navigation, Sliders, Sparkles, Globe, RotateCcw 
} from 'lucide-react';

export function TrackingRoutesApp() {
  const { schools, buses, students, routes, askGeminiAssistant, language, setLanguage, t, localize, formatNumber } = useApp();
  
  // Active Layout tab
  const [activeTab, setActiveTab] = useState<'optimizer' | 'gps' | 'pickup' | 'analytics'>('optimizer');

  // Optimizer Parameters state
  const [stopsCount, setStopsCount] = useState<number>(7);
  const [trafficWeight, setTrafficWeight] = useState<number>(85);
  const [safeHubClustering, setSafeHubClustering] = useState<boolean>(true);

  // Calculation state
  const [calculating, setCalculating] = useState<boolean>(false);
  const [optimizedResult, setOptimizedResult] = useState<{
    distance: string;
    duration: string;
    stops: number;
    savings: string;
    aiExplanation: string;
  } | null>(null);

  const handleReset = () => {
    setStopsCount(7);
    setTrafficWeight(85);
    setSafeHubClustering(true);
    setOptimizedResult(null);
  };

  const handleCalculateRoute = async () => {
    setCalculating(true);
    const prompt = language === 'km'
      ? `ការបង្កើនប្រសិទ្ធភាពផ្លូវធ្វើដំណើររថយន្តសាលា AI សម្រាប់រាជធានីភ្នំពេញ៖ ចំនួនចំណត៖ ${stopsCount}, ទម្ងន់បញ្ចៀសការកកស្ទះចរាចរណ៍៖ ${trafficWeight}%, ការប្រមូលផ្តុំចំណតសុវត្ថិភាព (១៥០ម)៖ ${safeHubClustering ? 'បើក' : 'បិទ'}។ សូមប្រៀបធៀបផ្លូវចាស់ និងផ្លូវឆ្លាតវៃ AI ដោយបញ្ចៀសការកកស្ទះមហាវិថីមុនីវង្ស និងមហាវិថីសហព័ន្ធរុស្ស៊ី។ ផ្តល់នូវការវិភាគចម្ងាយ រយៈពេល និងការពន្យល់ជាភាសាខ្មែរ។`
      : `AI Route Optimization for Phnom Penh: Waypoint stops: ${stopsCount}, Traffic Avoidance Weight: ${trafficWeight}%, Safe Hub Clustering (150m): ${safeHubClustering}. Compare legacy fixed-schedule route against dynamic AI routing avoiding Monivong and Russian Confederation Blvd. Provide estimated distance, travel duration, and optimization explanation in English.`;
    
    const aiText = await askGeminiAssistant(prompt, language);
    
    setOptimizedResult({
      distance: `${(stopsCount * 0.7 + 3.2).toFixed(1)} km`,
      duration: `${Math.round(stopsCount * 1.8 + 8)} mins`,
      stops: stopsCount,
      savings: language === 'km' 
        ? `លឿនជាងមុន ${Math.round(stopsCount * 1.5 + 4)} នាទី` 
        : `${Math.round(stopsCount * 1.5 + 4)} mins faster than legacy`,
      aiExplanation: aiText
    });
    setCalculating(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans p-4 md:p-6 space-y-6">
      {/* Top Navigation Bar */}
      <nav className="bg-[#10182D] text-white rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between shadow-lg gap-4 border border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF9D00] text-[#10182D] font-bold flex items-center justify-center shadow-md">
            <Navigation className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">
              {language === 'km' ? 'ការតាមដាន និងខ្សែរត់ធ្វើដំណើរ' : 'Tracking & Routes'}
            </h1>
            <p className="text-[11px] text-[#8297B7]">
              {language === 'km' ? 'ផែនទី GPS ផ្ទាល់ និងប្រព័ន្ធរៀបចំផ្លូវ AI' : 'Live GPS fleet map & AI route planner'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1E293B] p-1.5 rounded-xl border border-slate-700/50 flex-wrap">
          <button
            onClick={() => setActiveTab('gps')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'gps' ? 'bg-[#FF9D00] text-[#10182D] shadow-md' : 'text-[#8297B7] hover:text-white'
            }`}
          >
            {language === 'km' ? 'តាមដាន GPS ផ្ទាល់' : 'Live GPS Tracking'}
          </button>
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'optimizer' ? 'bg-[#FF9D00] text-[#10182D] shadow-md' : 'text-[#8297B7] hover:text-white'
            }`}
          >
            {language === 'km' ? 'កម្មវិធីរៀបចំផ្លូវ AI' : 'AI Route Optimizer'}
          </button>
          <button
            onClick={() => setActiveTab('pickup')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pickup' ? 'bg-[#FF9D00] text-[#10182D] shadow-md' : 'text-[#8297B7] hover:text-white'
            }`}
          >
            {language === 'km' ? 'សាលារៀន និងចំណត' : 'School & Pickup'}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics' ? 'bg-[#FF9D00] text-[#10182D] shadow-md' : 'text-[#8297B7] hover:text-white'
            }`}
          >
            {language === 'km' ? 'ការវិភាគ និងរបាយការណ៍' : 'Analytics & Reports'}
          </button>
        </div>
      </nav>

      {/* Main Page Header */}
      <div className="space-y-1">
        <p className="text-[#FF9D00] text-xs font-bold uppercase tracking-wider">
          {language === 'km' ? 'ភស្តុភារក្បួនដោះស្រាយ · ការកកស្ទះចរាចរណ៍រាជធានីភ្នំពេញ' : 'ALGORITHMIC LOGISTICS · PHNOM PENH CONGESTION HEURISTIC'}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-[#10182D] tracking-tight">
          {language === 'km' ? 'មន្ទីរពិសោធន៍បង្កើនប្រសិទ្ធភាពផ្លូវធ្វើដំណើរពហុឈប់ AI' : 'AI Multi-Stop Route Optimization Lab'}
        </h2>
        <p className="text-slate-600 text-xs md:text-sm max-w-3xl leading-relaxed">
          {language === 'km' 
            ? 'ប្រៀបធៀបកាលវិភាគចាស់ជាមួយប្រព័ន្ធ AI ស្វ័យប្រវត្តដែលត្រូវនឹងការកកស្ទះម៉ោងចូលរៀននៅរាជធានីភ្នំពេញ។' 
            : 'Compare legacy fixed-schedule loops against dynamic AI routing that adapts to morning school rush-hour bottlenecks.'}
        </p>
        <div className="border-t border-slate-200 pt-3"></div>
      </div>

      {/* Conditional Layout Rendering */}
      {activeTab === 'optimizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Optimizer Parameters Panel */}
          <div className="bg-[#10182D] text-white rounded-2xl p-6 shadow-xl space-y-6 border border-[#1E293B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#FF9D00]" />
                <h3 className="font-bold text-sm tracking-wide text-white">
                  {language === 'km' ? 'ប៉ារ៉ាម៉ែត្ររៀបចំផ្លូវ' : 'OPTIMIZER PARAMETERS'}
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-[#8297B7] hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset'}
              </button>
            </div>

            {/* Parameter A: Waypoint Pickup Stops */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8297B7] font-medium">{language === 'km' ? 'ចំនួនចំណតទទួលសិស្ស' : 'Waypoint Pickup Stops'}</span>
                <span className="text-white font-bold">{formatNumber(stopsCount)} {language === 'km' ? 'ចំណត' : 'Stops'}</span>
              </div>
              <input
                type="range"
                min="5"
                max="14"
                step="1"
                value={stopsCount}
                onChange={e => setStopsCount(parseInt(e.target.value))}
                className="w-full accent-[#FF9D00] bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8297B7]">
                <span>5 {language === 'km' ? 'រហ័ស' : 'Express'}</span>
                <span>9 {language === 'km' ? 'ធម្មតា' : 'Standard'}</span>
                <span>14 {language === 'km' ? 'គ្រប់ជ្រុងជ្រោយ' : 'Comprehensive'}</span>
              </div>
            </div>

            {/* Parameter B: Peak Traffic Avoidance Weight */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8297B7] font-medium">{language === 'km' ? 'ទម្ងន់បញ្ចៀសការកកស្ទះ' : 'Peak Traffic Avoidance Weight'}</span>
                <span className="text-[#FF9D00] font-bold">{trafficWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={trafficWeight}
                onChange={e => setTrafficWeight(parseInt(e.target.value))}
                className="w-full accent-[#FF9D00] bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <p className="text-[11px] text-[#8297B7] leading-relaxed">
                {language === 'km' ? 'កាត់បន្ថយការកកស្ទះតាមបណ្តោយមហាវិថីព្រះមុនីវង្ស និងមហាវិថីសហព័ន្ធរុស្ស៊ី។' : 'Penalizes heavy chokepoints along Monivong & Russian Confederation Blvd.'}
              </p>
            </div>

            {/* Parameter C: Safe Hub Clustering (150m) */}
            <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safeHubClustering}
                    onChange={e => setSafeHubClustering(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#FF9D00]"
                  />
                  {language === 'km' ? 'ប្រមូលផ្តុំចំណតសុវត្ថិភាព (១៥០ម)' : 'Safe Hub Clustering (150m)'}
                </label>
              </div>
              <p className="text-[11px] text-[#8297B7] leading-relaxed pl-6">
                {language === 'km' ? 'ប្រមូលផ្តុំគ្រួសារនៅក្បែរគ្នា ដើម្បីកាត់បន្ថយពេលវេលាឈប់ចាំតាមផ្ទះ។' : 'Groups neighboring families to reduce door-to-door stopping time.'}
              </p>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleCalculateRoute}
              disabled={calculating}
              className="w-full bg-[#FF9D00] hover:bg-[#e08a00] text-[#10182D] font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              {calculating 
                ? (language === 'km' ? 'កំពុងគណនាផ្លូវ AI...' : 'CALCULATING AI ROUTE...') 
                : (language === 'km' ? '✦ គណនាផ្លូវធ្វើដំណើរឆ្លាតវៃ AI' : '✦ CALCULATE AI OPTIMIZED ROUTE')}
            </button>
          </div>

          {/* Right: Interactive Map & Results Comparison */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'km' ? 'ផែនទីចរាចរណ៍សាលារាជធានីភ្នំពេញ' : 'Phnom Penh Interactive Transit Map'}
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full uppercase">
                  {safeHubClustering ? (language === 'km' ? 'ប្រមូលផ្តុំចំណតសកម្ម' : 'Hub Clustering Active') : (language === 'km' ? 'ចំណតធម្មតា' : 'Standard Stops')}
                </span>
              </div>
              <InteractiveMap schools={schools} buses={buses} students={students} routes={routes} height="440px" />
            </div>

            {/* Results Comparison Card */}
            {optimizedResult && (
              <div className="bg-[#10182D] text-white rounded-2xl p-6 shadow-xl space-y-4 border border-[#1E293B] animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#FF9D00] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> {language === 'km' ? 'លទ្ធផលផ្លូវធ្វើដំណើរ AI រាជធានីភ្នំពេញ' : 'AI Optimized Route Results (Phnom Penh)'}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    {optimizedResult.savings}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-[#1E293B] text-xs">
                  <div>
                    <span className="text-[#8297B7] block">{language === 'km' ? 'ចម្ងាយសរុប' : 'Total Distance'}</span>
                    <strong className="text-white text-base">{optimizedResult.distance}</strong>
                  </div>
                  <div>
                    <span className="text-[#8297B7] block">{language === 'km' ? 'រយៈពេលធ្វើដំណើរ' : 'Travel Duration'}</span>
                    <strong className="text-[#FF9D00] text-base">{optimizedResult.duration}</strong>
                  </div>
                  <div>
                    <span className="text-[#8297B7] block">{language === 'km' ? 'ចំណុចឈប់សកម្ម' : 'Active Waypoints'}</span>
                    <strong className="text-white text-base">{formatNumber(optimizedResult.stops)} {language === 'km' ? 'ចំណត' : 'Stops'}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  <strong className="text-[#FF9D00] block mb-1">
                    {language === 'km' ? 'ការពន្យល់ និងការណែនាំពី Gemini AI:' : 'Gemini AI Optimization Explanation:'}
                  </strong>
                  {optimizedResult.aiExplanation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gps' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'km' ? 'ការតាមដានរថយន្ត GPS ផ្ទាល់ — រាជធានីភ្នំពេញ' : 'Live GPS Fleet Tracking — Phnom Penh'}
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
              {language === 'km' ? 'RTK ពេលវេលាជាក់ស្តែងសកម្ម' : 'Real-time RTK Active'}
            </span>
          </div>
          <InteractiveMap schools={schools} buses={buses} students={students} routes={routes} height="600px" />
        </div>
      )}

      {activeTab === 'pickup' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <h3 className="font-bold text-slate-900 text-base">
            {language === 'km' ? 'ការគ្រប់គ្រងសាលារៀន និងចំណតទទួលសិស្ស (រាជធានីភ្នំពេញ)' : 'School & Pickup Stop Management (Phnom Penh)'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'km' ? 'គ្រប់គ្រងសាលារៀន ចំណត និងការកំណត់សិស្សដោយសុវត្ថិភាព។' : 'Manage verified schools, pickup hubs, and student assignments securely.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schools.map(s => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
                  {localize(s.area, s.areaKh) || 'Phnom Penh'}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{localize(s.name, s.nameKh)}</h4>
                <p className="text-slate-600">{localize(s.address, s.addressKh)}</p>
                <p className="text-[11px] text-slate-500 font-medium">{t('schools.principal')}: {s.principal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <h3 className="font-bold text-slate-900 text-base">
            {language === 'km' ? 'ការវិភាគ និងរបាយការណ៍ខ្សែរត់' : 'Analytics & Route Reports'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'km' ? 'សូចនាករប្រតិបត្តិការ ការសន្សំសំចៃប្រេង និងប្រសិទ្ធភាពការដឹកជញ្ជូន។' : 'Performance metrics, fuel savings, and historical transit efficiency.'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">{language === 'km' ? 'រយៈពេលមធ្យមនៃខ្សែរត់' : 'Avg Route Duration'}</span>
              <strong className="text-xl font-bold text-slate-900">18.4 {language === 'km' ? 'នាទី' : 'mins'}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">{language === 'km' ? 'ចម្ងាយសន្សំបានសរុប' : 'Total Distance Saved'}</span>
              <strong className="text-xl font-bold text-emerald-600">24.6 {language === 'km' ? 'គ.ម/ថ្ងៃ' : 'km/day'}</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">{language === 'km' ? 'អត្រាមកដល់ទៀងទាត់' : 'On-Time Arrival Rate'}</span>
              <strong className="text-xl font-bold text-blue-600">99.4%</strong>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">{language === 'km' ? 'ការកាត់បន្ថយកាបូន' : 'Carbon Reduction'}</span>
              <strong className="text-xl font-bold text-purple-600">18% CO2</strong>
            </div>
          </div>
        </div>
      )}

      {/* Floating Language Selector at Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 bg-[#10182D] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#1E293B] flex items-center gap-3">
        <span className="text-xs text-[#8297B7] font-medium flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-[#FF9D00]" /> {t('header.switchLang')}:
        </span>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            language === 'en' ? 'bg-[#FF9D00] text-[#10182D]' : 'text-white hover:bg-slate-800'
          }`}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => setLanguage('km')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            language === 'km' ? 'bg-[#FF9D00] text-[#10182D]' : 'text-white hover:bg-slate-800'
          }`}
        >
          🇰🇭 ភាសាខ្មែរ
        </button>
      </div>
    </div>
  );
}
