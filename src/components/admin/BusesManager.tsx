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
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">{t('buses.active')}</span>;
      case 'maintenance':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700">{t('buses.maintenance')}</span>;
      default:
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">{t('buses.idle')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('buses.title')}</h2>
          <p className="text-xs text-slate-500">{t('buses.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setSelectedStickerBus(buses[0])}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>{language === 'km' ? 'ប័ណ្ណកូដ QR រថយន្ត' : 'Bus QR Stickers'}</span>
          </button>
          <button
            onClick={() => { setEditingBus(null); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t('buses.addBus')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('buses.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'km' ? `បង្ហាញ ${formatNumber(filtered.length)} រថយន្តក្រុង` : `Showing ${filtered.length} buses`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{t('buses.busNumber')}</th>
                <th className="py-3 px-4">{t('buses.plateNumber')}</th>
                <th className="py-3 px-4">{t('buses.model')}</th>
                <th className="py-3 px-4">{t('buses.capacity')}</th>
                <th className="py-3 px-4">{t('buses.status')}</th>
                <th className="py-3 px-4 text-right">{t('schools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(bus => (
                <tr key={bus.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Bus className="w-4 h-4" />
                    </div>
                    {bus.busNumber}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{bus.plateNumber}</td>
                  <td className="py-3.5 px-4 text-slate-600">{bus.model}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{formatNumber(bus.capacity)} {language === 'km' ? 'កៅអី' : 'seats'}</td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(bus.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={() => { 
                        setEditingBus(bus); 
                        setFormData({ busNumber: bus.busNumber, plateNumber: bus.plateNumber, capacity: bus.capacity, model: bus.model, status: bus.status }); 
                        setShowModal(true); 
                      }} 
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{editingBus ? t('buses.editBus') : t('buses.addBus')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('buses.busNumber')}</label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={e => setFormData({ ...formData, busNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('buses.plateNumber')}</label>
                  <input
                    type="text"
                    required
                    value={formData.plateNumber}
                    onChange={e => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('buses.capacity')}</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 48 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('buses.status')}</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="active">{t('buses.active')}</option>
                    <option value="maintenance">{t('buses.maintenance')}</option>
                    <option value="idle">{t('buses.idle')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('buses.model')}</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
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
