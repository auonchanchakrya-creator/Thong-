import React from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';

export function LiveMapAdmin() {
  const { schools, buses, students, routes, t, language } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('map.fleetRadarTitle')}</h2>
          <p className="text-xs text-slate-500">{t('map.fleetRadarSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
            {language === 'km' ? 'GPS ភ្ជាប់ដំណើរការ' : 'GPS Connected'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
        <InteractiveMap schools={schools} buses={buses} students={students} routes={routes} height="650px" />
      </div>
    </div>
  );
}
