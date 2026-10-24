import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, Plus, Search, Edit, Phone, Award } from 'lucide-react';
import { Driver } from '../../types';

export function DriversManager() {
  const { drivers, buses, addDriver, updateDriver, t, language, formatNumber } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    busId: buses[0]?.id || '',
    status: 'on_duty' as Driver['status'],
    rating: 4.9
  });

  const filtered = drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateDriver(editingDriver.id, formData);
    } else {
      addDriver({ ...formData, userId: `usr-drv-${Date.now()}` });
    }
    setShowModal(false);
    setEditingDriver(null);
  };

  const getStatusBadge = (status: Driver['status']) => {
    switch (status) {
      case 'on_trip':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">{t('drivers.onTrip')}</span>;
      case 'on_duty':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700">{t('drivers.onDuty')}</span>;
      default:
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">{t('drivers.offDuty')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('drivers.title')}</h2>
          <p className="text-xs text-slate-500">{t('drivers.subtitle')}</p>
        </div>
        <button
          onClick={() => { setEditingDriver(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> {t('drivers.addDriver')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('drivers.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'km' ? `បង្ហាញ ${formatNumber(filtered.length)} អ្នកបើកបរ` : `Showing ${filtered.length} drivers`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{t('drivers.driverName')}</th>
                <th className="py-3 px-4">{t('drivers.license')}</th>
                <th className="py-3 px-4">{t('drivers.phone')}</th>
                <th className="py-3 px-4">{t('drivers.assignedBus')}</th>
                <th className="py-3 px-4">{t('drivers.rating')}</th>
                <th className="py-3 px-4">{t('drivers.status')}</th>
                <th className="py-3 px-4 text-right">{t('schools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(driver => {
                const bus = buses.find(b => b.id === driver.busId);
                return (
                  <tr key={driver.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      {driver.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{driver.licenseNumber}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {driver.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">{bus ? bus.busNumber : t('drivers.unassigned')}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500" /> {driver.rating}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => { 
                          setEditingDriver(driver); 
                          setFormData({ name: driver.name, licenseNumber: driver.licenseNumber, phone: driver.phone, busId: driver.busId || '', status: driver.status, rating: driver.rating }); 
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{editingDriver ? t('drivers.editDriver') : t('drivers.addDriver')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('drivers.driverName')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('drivers.license')}</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('drivers.phone')}</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('drivers.assignedBus')}</label>
                  <select
                    value={formData.busId}
                    onChange={e => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {buses.map(b => <option key={b.id} value={b.id}>{b.busNumber} ({b.plateNumber})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('drivers.status')}</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="on_duty">{t('drivers.onDuty')}</option>
                  <option value="on_trip">{t('drivers.onTrip')}</option>
                  <option value="off_duty">{t('drivers.offDuty')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
                  {editingDriver ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
