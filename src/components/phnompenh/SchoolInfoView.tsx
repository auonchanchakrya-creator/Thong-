import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Search, MapPin, Phone, User } from 'lucide-react';

interface SchoolInfoViewProps {
  lang: 'en' | 'kh';
}

export function SchoolInfoView({ lang }: SchoolInfoViewProps) {
  const { schools, t, localize, language, formatNumber } = useApp();
  const [search, setSearch] = useState('');

  const filtered = schools.filter(s => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.nameKh && s.nameKh.toLowerCase().includes(term)) ||
      s.address.toLowerCase().includes(term) ||
      (s.addressKh && s.addressKh.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'km' ? 'ព័ត៌មានសាលារៀន និងមធ្យោបាយធ្វើដំណើរ' : 'School & Transportation Directory'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'km' ? 'បញ្ជីសាលារៀន ចំណតរថយន្ត និងទំនាក់ទំនងនៅរាជធានីភ្នំពេញ។' : 'Comprehensive school facilities, bus stops, and contact records in Phnom Penh.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'km' ? 'ស្វែងរកសាលារៀនភ្នំពេញ (ខ្មែរ ឬ English)...' : 'Search Phnom Penh schools (English or Khmer)...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                <th className="py-3 px-4 text-right">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(school => (
                <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span>{localize(school.name, school.nameKh)}</span>
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
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{formatNumber(school.totalStudents)} {t('common.studentsCount')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                      {language === 'km' ? 'មានរថយន្តសកម្ម' : 'Bus Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
