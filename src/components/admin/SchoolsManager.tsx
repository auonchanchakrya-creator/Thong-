import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Plus, Search, Trash2, Edit, MapPin, Phone, User } from 'lucide-react';
import { School } from '../../types';

export function SchoolsManager() {
  const { schools, addSchool, updateSchool, deleteSchool, t, localize, language, formatNumber } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameKh: '',
    address: '',
    addressKh: '',
    lat: 11.5683,
    lng: 104.9179,
    phone: '',
    principal: '',
    totalStudents: 500
  });

  const filtered = schools.filter(s => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.nameKh && s.nameKh.toLowerCase().includes(term)) ||
      s.address.toLowerCase().includes(term) ||
      (s.addressKh && s.addressKh.toLowerCase().includes(term))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchool) {
      updateSchool(editingSchool.id, formData);
    } else {
      addSchool(formData);
    }
    setShowModal(false);
    setEditingSchool(null);
    setFormData({ name: '', nameKh: '', address: '', addressKh: '', lat: 11.5683, lng: 104.9179, phone: '', principal: '', totalStudents: 500 });
  };

  const openEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      nameKh: school.nameKh || '',
      address: school.address,
      addressKh: school.addressKh || '',
      lat: school.lat,
      lng: school.lng,
      phone: school.phone,
      principal: school.principal,
      totalStudents: school.totalStudents
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('schools.title')}</h2>
          <p className="text-xs text-slate-500">{t('schools.subtitle')}</p>
        </div>
        <button
          onClick={() => { 
            setEditingSchool(null); 
            setFormData({ name: '', nameKh: '', address: '', addressKh: '', lat: 11.5683, lng: 104.9179, phone: '', principal: '', totalStudents: 500 }); 
            setShowModal(true); 
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> {t('schools.addSchool')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('schools.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'km' ? `បង្ហាញ ${formatNumber(filtered.length)} សាលារៀន` : `Showing ${filtered.length} schools`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{t('schools.schoolName')}</th>
                <th className="py-3 px-4">{t('schools.address')}</th>
                <th className="py-3 px-4">{t('schools.principal')}</th>
                <th className="py-3 px-4">{t('schools.phone')}</th>
                <th className="py-3 px-4">{t('schools.students')}</th>
                <th className="py-3 px-4 text-right">{t('schools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(school => (
                <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p>{localize(school.name, school.nameKh)}</p>
                      {language === 'km' && school.name && school.name !== school.nameKh && (
                        <p className="text-[10px] text-slate-400 font-normal">{school.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{localize(school.address, school.addressKh)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {school.principal}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {school.phone}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{formatNumber(school.totalStudents)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(school)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSchool(school.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingSchool ? t('schools.editSchool') : t('schools.addSchool')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('schools.schoolName')} (English)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('schools.formNameKh')}</label>
                <input
                  type="text"
                  placeholder="ឈ្មោះសាលាជាភាសាខ្មែរ"
                  value={formData.nameKh}
                  onChange={e => setFormData({ ...formData, nameKh: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('schools.address')} (English)</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('schools.formAddressKh')}</label>
                <input
                  type="text"
                  placeholder="អាសយដ្ឋានជាភាសាខ្មែរ"
                  value={formData.addressKh}
                  onChange={e => setFormData({ ...formData, addressKh: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schools.latitude')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schools.longitude')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('schools.principal')}</label>
                <input
                  type="text"
                  required
                  value={formData.principal}
                  onChange={e => setFormData({ ...formData, principal: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schools.phone')}</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schools.totalStudents')}</label>
                  <input
                    type="number"
                    required
                    value={formData.totalStudents}
                    onChange={e => setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                >
                  {editingSchool ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
