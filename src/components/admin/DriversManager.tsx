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
        return <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800">{t('drivers.onTrip')}</span>;
      case 'on_duty':
        return <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-blue-100 text-blue-800">{t('drivers.onDuty')}</span>;
      default:
        return <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-slate-100 text-slate-700">{t('drivers.offDuty')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('drivers.title')}</h2>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">{t('drivers.subtitle')}</p>
        </div>
        <button
          onClick={() => { setEditingDriver(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-5 py-3 rounded-xl transition-colors shadow-md flex items-center gap-2.5 self-start min-h-[48px]"
        >
          <Plus className="w-5 h-5" /> {t('drivers.addDriver')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('drivers.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[46px]"
            />
          </div>
          <span className="text-sm sm:text-base text-slate-600 font-bold shrink-0">
            {language === 'km' ? `បង្ហាញ ${formatNumber(filtered.length)} អ្នកបើកបរ` : `Showing ${filtered.length} drivers`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-base">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-xs sm:text-sm border-b border-slate-200">
                <th className="py-3.5 px-4">{t('drivers.driverName')}</th>
                <th className="py-3.5 px-4">{t('drivers.license')}</th>
                <th className="py-3.5 px-4">{t('drivers.phone')}</th>
                <th className="py-3.5 px-4">{t('drivers.assignedBus')}</th>
                <th className="py-3.5 px-4">{t('drivers.rating')}</th>
                <th className="py-3.5 px-4">{t('drivers.status')}</th>
                <th className="py-3.5 px-4 text-right">{t('schools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(driver => {
                const bus = buses.find(b => b.id === driver.busId);
                return (
                  <tr key={driver.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="text-base sm:text-lg font-bold text-slate-900">{driver.name}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-800 text-base">{driver.licenseNumber}</td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {driver.phone}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-800 text-base">{bus ? bus.busNumber : t('drivers.unassigned')}</td>
                    <td className="py-4 px-4 font-black text-slate-900">
                      <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" /> {driver.rating}</span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => { 
                          setEditingDriver(driver); 
                          setFormData({ name: driver.name, licenseNumber: driver.licenseNumber, phone: driver.phone, busId: driver.busId || '', status: driver.status, rating: driver.rating }); 
                          setShowModal(true); 
                        }} 
                        className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors min-w-[40px] min-h-[40px] inline-flex items-center justify-center"
                      >
                        <Edit className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-5">{editingDriver ? t('drivers.editDriver') : t('drivers.addDriver')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-base">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('drivers.driverName')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('drivers.license')}</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('drivers.phone')}</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('drivers.assignedBus')}</label>
                  <select
                    value={formData.busId}
                    onChange={e => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {buses.map(b => <option key={b.id} value={b.id}>{b.busNumber} ({b.plateNumber})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('drivers.status')}</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="on_duty">{t('drivers.onDuty')}</option>
                  <option value="on_trip">{t('drivers.onTrip')}</option>
                  <option value="off_duty">{t('drivers.offDuty')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-base min-h-[46px]">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md text-base min-h-[46px]">
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
