import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Route as RouteIcon, Plus, Search, Edit, Clock } from 'lucide-react';
import { Route, RouteStop } from '../../types';

export function RoutesManager() {
  const { routes, schools, buses, drivers, addRoute, updateRoute, t, localize, language, formatNumber } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameKh: '',
    schoolId: schools[0]?.id || '',
    busId: buses[0]?.id || '',
    driverId: drivers[0]?.id || '',
    startTime: '07:15 AM',
    endTime: '08:05 AM',
    status: 'scheduled' as Route['status'],
    stops: [
      { id: 'stp-1', stopName: 'First Stop', address: 'Toul Kork, Phnom Penh', lat: 11.5683, lng: 104.9179, scheduledTime: '07:20 AM', studentIds: [] as string[] },
      { id: 'stp-2', stopName: 'School Arrival', address: schools[0]?.address || 'School', lat: 11.5700, lng: 104.9200, scheduledTime: '08:00 AM', studentIds: [] as string[] }
    ] as RouteStop[]
  });

  const filtered = routes.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    (r.nameKh && r.nameKh.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoute) {
      updateRoute(editingRoute.id, formData);
    } else {
      addRoute(formData);
    }
    setShowModal(false);
    setEditingRoute(null);
  };

  const getStatusBadge = (status: Route['status']) => {
    switch (status) {
      case 'in_progress':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-sky-100 text-sky-700">{t('routes.inProgress')}</span>;
      case 'completed':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">{t('routes.completed')}</span>;
      case 'delayed':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700">{t('routes.delayed')}</span>;
      default:
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">{t('routes.scheduled')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('routes.title')}</h2>
          <p className="text-xs text-slate-500">{t('routes.subtitle')}</p>
        </div>
        <button
          onClick={() => { setEditingRoute(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> {t('routes.addRoute')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('routes.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'km' ? `បង្ហាញ ${formatNumber(filtered.length)} ខ្សែរត់` : `Showing ${filtered.length} routes`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{t('routes.routeName')}</th>
                <th className="py-3 px-4">{t('routes.school')}</th>
                <th className="py-3 px-4">{t('routes.bus')} & {t('routes.driver')}</th>
                <th className="py-3 px-4">{t('common.time')}</th>
                <th className="py-3 px-4">{t('routes.stops')}</th>
                <th className="py-3 px-4">{t('routes.status')}</th>
                <th className="py-3 px-4 text-right">{t('schools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(route => {
                const school = schools.find(s => s.id === route.schoolId);
                const bus = buses.find(b => b.id === route.busId);
                const driver = drivers.find(d => d.id === route.driverId);
                return (
                  <tr key={route.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <RouteIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p>{localize(route.name, route.nameKh)}</p>
                        {language === 'km' && route.name && route.name !== route.nameKh && (
                          <p className="text-[10px] text-slate-400 font-normal">{route.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {school ? localize(school.name, school.nameKh) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-emerald-700">{bus?.busNumber || t('drivers.unassigned')}</p>
                      <p className="text-[11px] text-slate-500">{driver?.name || t('drivers.unassigned')}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {route.startTime} - {route.endTime}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNumber(route.stops.length)} {language === 'km' ? 'ចំណត' : 'stops'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(route.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => { 
                          setEditingRoute(route); 
                          setFormData({ 
                            name: route.name, 
                            nameKh: route.nameKh || '',
                            schoolId: route.schoolId, 
                            busId: route.busId || '', 
                            driverId: route.driverId || '', 
                            startTime: route.startTime, 
                            endTime: route.endTime, 
                            status: route.status, 
                            stops: route.stops.map(s => ({ ...s, studentIds: s.studentIds || [] })) 
                          }); 
                          setShowModal(true); 
                        }} 
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{editingRoute ? t('routes.editRoute') : t('routes.addRoute')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('routes.routeName')} (English)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'km' ? 'ឈ្មោះខ្សែរត់ជាភាសាខ្មែរ' : 'Khmer Route Name (optional)'}</label>
                <input
                  type="text"
                  placeholder="ឈ្មោះខ្សែរត់ជាភាសាខ្មែរ"
                  value={formData.nameKh}
                  onChange={e => setFormData({ ...formData, nameKh: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('routes.school')}</label>
                  <select
                    value={formData.schoolId}
                    onChange={e => setFormData({ ...formData, schoolId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {schools.map(s => <option key={s.id} value={s.id}>{localize(s.name, s.nameKh)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('routes.bus')}</label>
                  <select
                    value={formData.busId}
                    onChange={e => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {buses.map(b => <option key={b.id} value={b.id}>{b.busNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('routes.driver')}</label>
                  <select
                    value={formData.driverId}
                    onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('routes.startTime')}</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('routes.endTime')}</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
                  {editingRoute ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
