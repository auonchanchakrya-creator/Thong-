import React from 'react';
import { useApp } from '../../context/AppContext';

export function DriverTripHistory() {
  const { trips, routes, t, localize, language, formatNumber } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'km' ? 'ប្រវត្តិជើងធ្វើដំណើរដែលបានបញ្ចប់' : 'Completed Trip History'}
        </h2>
        <p className="text-xs text-slate-500">
          {language === 'km' ? 'កំណត់ត្រាជើងធ្វើដំណើរកន្លងមក និងការផ្ទៀងផ្ទាត់ការទទួលសិស្ស។' : 'Log of past route runs and student pickup verifications.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            {language === 'km' ? 'កំណត់ត្រាធ្វើដំណើរ' : 'Trip Logs'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{t('common.date')}</th>
                <th className="py-3 px-4">{t('routes.routeName')}</th>
                <th className="py-3 px-4">{t('routes.startTime')}</th>
                <th className="py-3 px-4">{t('students.pickedUp')}</th>
                <th className="py-3 px-4">{t('routes.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map(trip => {
                const route = routes.find(r => r.id === trip.routeId);
                return (
                  <tr key={trip.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{trip.date}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{route ? localize(route.name, route.nameKh) : 'Route'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{trip.startTime || '07:15 AM'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatNumber(trip.studentsPickedUpCount)} / {formatNumber(trip.totalStudentsCount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
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
