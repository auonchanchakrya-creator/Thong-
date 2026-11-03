import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Printer } from 'lucide-react';

export function ReportsManager() {
  const { students, buses, routes, trips, t, language, formatNumber } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('reports.title')}</h2>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">{t('reports.subtitle')}</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-5 py-3 rounded-xl transition-colors shadow-md flex items-center gap-2.5 self-start min-h-[48px]"
        >
          <Printer className="w-5 h-5" /> {t('reports.printButton')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fleet Summary Report */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xl sm:text-2xl flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-blue-600" /> {t('reports.fleetReport')}
            </h3>
            <span className="text-xs sm:text-sm bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase">
              {language === 'km' ? 'បញ្ជាក់ត្រឹមត្រូវ' : 'Certified'}
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {language === 'km' 
              ? 'សេចក្តីសង្ខេបស្តីពីរថយន្តក្រុងសាលា ការប្រើប្រាស់ចំណុះកៅអី និងកំណត់ត្រាអ្នកបើកបរនៅតាមសាលារៀនរាជធានីភ្នំពេញ។'
              : 'Summary of active school buses, passenger capacity utilization, and driver assignment records across all regional school campuses.'}
          </p>
          <div className="space-y-3 pt-3 border-t border-slate-100 text-base text-slate-700">
            <div className="flex justify-between py-1">
              <span className="font-medium">{t('dashboard.activeBuses')}:</span> 
              <strong className="text-slate-900 text-lg font-black">{formatNumber(buses.length)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">{t('dashboard.totalStudents')}:</span> 
              <strong className="text-slate-900 text-lg font-black">{formatNumber(students.length)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">{t('dashboard.activeRoutes')}:</span> 
              <strong className="text-slate-900 text-lg font-black">{formatNumber(routes.length)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">{language === 'km' ? 'កម្រិតសុវត្ថិភាពមធ្យម' : 'Safety Rating Average'}:</span> 
              <strong className="text-emerald-700 text-lg font-black">4.9 / 5.0</strong>
            </div>
          </div>
        </div>

        {/* Daily Trip Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xl sm:text-2xl flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-indigo-600" /> {t('reports.tripProgressLog')}
            </h3>
            <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full uppercase">
              {language === 'km' ? 'ពេលវេលាជាក់ស្តែង' : 'Real-Time'}
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {language === 'km'
              ? 'កំណត់ត្រាធ្វើដំណើរថ្ងៃនេះ ព្រឹត្តិការណ៍ទទួល និងទម្លាក់សិស្ស ម៉ោងធ្វើដំណើរ និងសូចនាករសុវត្ថិភាព។'
              : 'Audit log of today\'s transit trips, pickup events, drop-off timestamps, and incident response metrics.'}
          </p>
          <div className="space-y-3 pt-3 border-t border-slate-100 text-base text-slate-700">
            <div className="flex justify-between py-1">
              <span className="font-medium">{language === 'km' ? 'ជើងធ្វើដំណើរសរុប' : 'Total Scheduled Trips'}:</span> 
              <strong className="text-slate-900 text-lg font-black">{formatNumber(trips.length)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">{language === 'km' ? 'ជើងធ្វើដំណើរបានបញ្ចប់' : 'Completed Trips'}:</span> 
              <strong className="text-slate-900 text-lg font-black">{formatNumber(trips.filter(t => t.status === 'completed').length)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">{language === 'km' ? 'ជើងកំពុងធ្វើដំណើរ' : 'In-Progress Trips'}:</span> 
              <strong className="text-slate-900 text-lg font-black">{formatNumber(trips.filter(t => t.status === 'in_progress').length)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium">{language === 'km' ? 'អត្រាទៀងពេល' : 'On-Time Performance'}:</span> 
              <strong className="text-emerald-700 text-lg font-black">99.2%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
