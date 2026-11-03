import React from 'react';
import { useApp } from '../../context/AppContext';

export function ParentTripHistory() {
  const { trips, routes, t, localize, language } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'km' ? 'ប្រវត្តិជើងធ្វើដំណើររបស់កូន' : 'Child Trip & Ridership History'}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
          {language === 'km' ? 'កំណត់ត្រាពេលវេលាទទួល និងទម្លាក់សិស្សកន្លងមក។' : 'Historical logs of pickup and drop-off timestamps.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
            {language === 'km' ? 'កំណត់ត្រាធ្វើដំណើរពីមុន' : 'Past Trip Records'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-base">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-xs sm:text-sm border-b border-slate-200">
                <th className="py-3.5 px-4">{t('common.date')}</th>
                <th className="py-3.5 px-4">{t('routes.routeName')}</th>
                <th className="py-3.5 px-4">{t('routes.startTime')}</th>
                <th className="py-3.5 px-4">{t('routes.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map(trip => {
                const route = routes.find(r => r.id === trip.routeId);
                return (
                  <tr key={trip.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{trip.date}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{route ? localize(route.name, route.nameKh) : 'Route'}</td>
                    <td className="py-4 px-4 text-slate-700 font-medium">{trip.startTime || '07:18 AM'}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800">
                        {trip.status === 'completed' ? t('routes.completed') : t('routes.inProgress')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
