import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bus, Plus, Search, Edit, QrCode } from 'lucide-react';
import { Bus as BusType } from '../../types';
import { BusBoardingStickerQRModal } from '../common/BusBoardingStickerQRModal';

export function BusesManager() {
  const { buses, addBus, updateBus, t, language, formatNumber } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  const [selectedStickerBus, setSelectedStickerBus] = useState<BusType | null>(null);

  const [formData, setFormData] = useState({
    busNumber: '',
    plateNumber: '',
    capacity: 48,
    model: 'Toyota Coaster VIP',
    status: 'active' as BusType['status']
  });

  const filtered = buses.filter(b => b.busNumber.toLowerCase().includes(search.toLowerCase()) || b.plateNumber.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBus) {
      updateBus(editingBus.id, formData);
    } else {
      addBus(formData);
    }
    setShowModal(false);
    setEditingBus(null);
  };

  const getStatusBadge = (status: BusType['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800">{t('buses.active')}</span>;
      case 'maintenance':
        return <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-rose-100 text-rose-800">{t('buses.maintenance')}</span>;
      default:
        return <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide bg-slate-100 text-slate-700">{t('buses.idle')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('buses.title')}</h2>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">{t('buses.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedStickerBus(buses[0])}
            className="min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white text-base font-bold px-5 py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto"
          >
            <QrCode className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{language === 'km' ? 'ប័ណ្ណកូដ QR រថយន្ត' : 'Bus QR Stickers'}</span>
          </button>
          <button
            onClick={() => { setEditingBus(null); setShowModal(true); }}
            className="min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-5 py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2.5 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 shrink-0" /> {t('buses.addBus')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('buses.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[46px]"
            />
          </div>
          <span className="text-sm sm:text-base text-slate-600 font-bold shrink-0">
            {language === 'km' ? `បង្ហាញ ${formatNumber(filtered.length)} រថយន្តក្រុង` : `Showing ${filtered.length} buses`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-base">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-xs sm:text-sm border-b border-slate-200">
                <th className="py-3.5 px-4">{t('buses.busNumber')}</th>
                <th className="py-3.5 px-4">{t('buses.plateNumber')}</th>
                <th className="py-3.5 px-4">{t('buses.model')}</th>
                <th className="py-3.5 px-4">{t('buses.capacity')}</th>
                <th className="py-3.5 px-4">{t('buses.status')}</th>
                <th className="py-3.5 px-4 text-right">{t('schools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(bus => (
                <tr key={bus.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900">{bus.busNumber}</span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-800 text-base">{bus.plateNumber}</td>
                  <td className="py-4 px-4 text-slate-700 font-medium">{bus.model}</td>
                  <td className="py-4 px-4 font-black text-slate-900 text-base">{formatNumber(bus.capacity)} {language === 'km' ? 'កៅអី' : 'seats'}</td>
                  <td className="py-4 px-4">
                    {getStatusBadge(bus.status)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => { 
                        setEditingBus(bus); 
                        setFormData({ busNumber: bus.busNumber, plateNumber: bus.plateNumber, capacity: bus.capacity, model: bus.model, status: bus.status }); 
                        setShowModal(true); 
                      }} 
                      className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors min-w-[40px] min-h-[40px] inline-flex items-center justify-center"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-5">{editingBus ? t('buses.editBus') : t('buses.addBus')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-base">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('buses.busNumber')}</label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={e => setFormData({ ...formData, busNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('buses.plateNumber')}</label>
                  <input
                    type="text"
                    required
                    value={formData.plateNumber}
                    onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('buses.capacity')}</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 48 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('buses.status')}</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="active">{t('buses.active')}</option>
                    <option value="maintenance">{t('buses.maintenance')}</option>
                    <option value="idle">{t('buses.idle')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">{t('buses.model')}</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[46px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-base min-h-[46px]">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md text-base min-h-[46px]">
                  {editingBus ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
