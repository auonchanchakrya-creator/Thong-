import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertTriangle, CheckCircle2, Sparkles, Send } from 'lucide-react';

interface SafetyInsightsViewProps {
  lang: 'en' | 'kh';
}

export function SafetyInsightsView({ lang }: SafetyInsightsViewProps) {
  const { incidents, sendNotification, t, language } = useApp();
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReportHazard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportDesc) return;
    sendNotification({
      title: `${language === 'km' ? 'សេចក្តីរាយការណ៍គ្រោះថ្នាក់ផ្លូវ' : 'User Safety Hazard'}: ${reportTitle}`,
      message: reportDesc,
      roleTarget: 'all',
      type: 'warning'
    });
    setReportTitle('');
    setReportDesc('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {t('safety.title')}
        </h2>
        <p className="text-xs text-slate-500">
          {t('safety.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety Indicators & Hazards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> 
              {language === 'km' ? 'ស្ថានភាពសុវត្ថិភាពតំបន់សាលារៀនរាជធានីភ្នំពេញ' : 'Phnom Penh School Zone Safety Status'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 
                  {language === 'km' ? 'តំបន់សាលាទួលគោក' : 'Tuol Kork School Zone'}
                </span>
                <p className="text-emerald-700">
                  {language === 'km' ? 'ចរាចរណ៍ស្រាល • មានឆ្មាំសន្តិសុខជួយសម្រួលថ្មើរជើង' : 'Low congestion • Pedestrian guards active'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> 
                  {t('safety.monivong')}
                </span>
                <p className="text-amber-700">
                  {language === 'km' ? 'កកស្ទះមធ្យមនៅម៉ោងមមាញឹក (យឺត +៨ នាទី)' : 'Moderate peak-hour traffic delay (+8 min)'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 
                  {t('safety.kbalThnal')}
                </span>
                <p className="text-blue-700">
                  {language === 'km' ? 'លំហូរចរាចរណ៍ធម្មតា • គន្លងរថយន្តក្រុងបើកដំណើរការ' : 'Standard transit flow • Bus lanes open'}
                </p>
              </div>
            </div>
          </div>

          {/* Crowdsourced Hazard Reporting Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> 
              {language === 'km' ? 'រាយការណ៍ឧបសគ្គ ឬគ្រោះថ្នាក់ចរាចរណ៍' : 'Submit Road Hazard Report (Moderated)'}
            </h3>

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl font-semibold">
                {language === 'km' ? 'បានបញ្ជូនរបាយការណ៍ឧបសគ្គដោយជោគជ័យ។' : 'Hazard report submitted successfully and submitted for moderation.'}
              </div>
            )}

            <form onSubmit={handleReportHazard} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ចំណងជើងឧបសគ្គ / ទីតាំង' : 'Hazard Title / Location'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'km' ? 'ឧ. ការដ្ឋានជួសជុលផ្លូវនៅជិតមហាវិថីព្រះនរោត្តម' : 'e.g. Construction pothole near Norodom Blvd'}
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'km' ? 'ការពិពណ៌នា និងការណែនាំសុវត្ថិភាព' : 'Description & Safety Advisory'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={language === 'km' ? 'ពិពណ៌នាអំពីបញ្ហាផ្លូវ និងផ្លូវវាងដែលបានណែនាំ...' : 'Describe the hazard and recommended detour...'}
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" /> 
                {language === 'km' ? 'ដាក់ស្នើរបាយការណ៍' : 'Submit Report for Moderation'}
              </button>
            </form>
          </div>
        </div>

        {/* AI Safety Insights */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> 
            {language === 'km' ? 'ការវិភាគសុវត្ថិភាព AI' : 'AI Safety Advisory'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'km'
              ? 'ប្រព័ន្ធ Gemini AI វិភាគទិន្នន័យចរាចរណ៍ ប្រព័ន្ធបង្ហូរទឹកពេលភ្លៀងធ្លាក់ និងម៉ោងចេញចូលសាលានៅភ្នំពេញ ដើម្បីធានាសុវត្ថិភាពអតិបរមាដល់សិស្សានុសិស្ស។'
              : 'Gemini AI analyzes historical accident data, rainfall drainage alerts, and peak school opening times in Phnom Penh to ensure maximum student security.'}
          </p>
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
            <strong className="block font-bold text-indigo-950">
              {language === 'km' ? 'ចំណាំសុវត្ថិភាពរដូវវស្សា៖' : 'Monsoon Safety Note:'}
            </strong>
            <p className="leading-relaxed">
              {language === 'km'
                ? 'សូមបញ្ចៀសតំបន់ទំនាបនៅជិតបឹងកក់ពេលមានភ្លៀងធ្លាក់ខ្លាំង។ រថយន្តក្រុងសាលាត្រូវបានកំណត់ផ្លូវស្វ័យប្រវត្តតាមមហាវិថីខ្ពស់ៗ។'
                : 'Avoid low-lying areas near Boeung Kak during heavy downpours. School bus drivers are automatically routed via elevated arterial roads.'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
            <strong className="block font-bold text-blue-950">
              {t('safety.emergencyHotline')}
            </strong>
            <p className="text-[11px] text-blue-700">
              {t('safety.schoolZoneSpeed')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
