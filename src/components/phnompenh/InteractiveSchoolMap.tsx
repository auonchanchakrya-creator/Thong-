import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { Search, Building2, MapPin, Phone, Filter, Sparkles, Navigation } from 'lucide-react';

interface InteractiveSchoolMapProps {
  onSelectSchoolForRoute?: (schoolId: string) => void;
  lang: 'en' | 'kh';
}

export function InteractiveSchoolMap({ onSelectSchoolForRoute, lang }: InteractiveSchoolMapProps) {
  const { schools, buses, students, routes, t, localize, language, formatNumber } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const areas = ['All', 'Daun Penh', 'Tuol Kork', 'Boeung Keng Kang', 'Dangkao', 'Chbar Ampov'];
  const types = ['All', 'High School', 'Middle Academy', 'Elementary'];

  const filteredSchools = schools.filter(school => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      school.name.toLowerCase().includes(term) || 
      (school.nameKh && school.nameKh.toLowerCase().includes(term)) ||
      school.address.toLowerCase().includes(term) ||
      (school.addressKh && school.addressKh.toLowerCase().includes(term));
    return matchesSearch;
  });

  const selectedSchool = schools.find(s => s.id === selectedSchoolId) || schools[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30">
            {language === 'km' ? 'ផែនទីសាលារៀនរាជធានីភ្នំពេញ' : 'Phnom Penh Interactive School Map'}
          </span>
          <h2 className="text-2xl font-bold tracking-tight mt-2">
            {language === 'km' ? 'ស្វែងរកសាលារៀន និងខ្សែរត់សុវត្ថិភាព' : 'Discover Phnom Penh Schools & Safe Routes'}
          </h2>
          <p className="text-blue-200 text-sm mt-1">
            {language === 'km' ? 'ស្វែងរកសាលារៀន ចំណុចទទួលសិស្ស និងបណ្តាញរថយន្តក្រុងនៅទូទាំងរាជធានីភ្នំពេញ។' : 'Explore verified school locations, pickup points, and bus transit networks across Phnom Penh.'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកសាលារៀន ឬអាសយដ្ឋាន (ជាភាសាខ្មែរ ឬអង់គ្លេស)...' : 'Search schools by name or address in Phnom Penh (English or Khmer)...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {areas.map(a => <option key={a} value={a}>{a === 'All' ? (language === 'km' ? 'តំបន់ទាំងអស់' : 'All Areas') : a}</option>)}
          </select>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {types.map(tOption => <option key={tOption} value={tOption}>{tOption === 'All' ? (language === 'km' ? 'កម្រិតទាំងអស់' : 'All Types') : tOption}</option>)}
          </select>
        </div>
      </div>

      {/* Map & School Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
          <InteractiveMap schools={filteredSchools} buses={buses} students={students} routes={routes} height="520px" />
        </div>

        {/* School Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
                {language === 'km' ? 'សាលារៀនដែលបានជ្រើស' : 'Featured School'}
              </span>
              <span className="text-xs text-slate-400 font-mono">GPS Verified</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {localize(selectedSchool.name, selectedSchool.nameKh)}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
              <span>{localize(selectedSchool.address, selectedSchool.addressKh)}</span>
            </p>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700 mt-4">
              <div className="flex justify-between"><span>{t('schools.principal')}:</span> <strong className="text-slate-900">{selectedSchool.principal}</strong></div>
              <div className="flex justify-between"><span>{t('schools.phone')}:</span> <strong className="text-slate-900">{selectedSchool.phone}</strong></div>
              <div className="flex justify-between"><span>{t('schools.students')}:</span> <strong className="text-slate-900">{formatNumber(selectedSchool.totalStudents)} {t('common.studentsCount')}</strong></div>
              <div className="flex justify-between"><span>{language === 'km' ? 'មធ្យោបាយធ្វើដំណើរ' : 'Transit Access'}:</span> <strong className="text-emerald-600">{language === 'km' ? 'មានរថយន្តក្រុងសាលា' : 'Bus Routes Available'}</strong></div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (onSelectSchoolForRoute) onSelectSchoolForRoute(selectedSchool.id);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4" /> {language === 'km' ? 'រៀបចំផ្លូវធ្វើដំណើរទៅកាន់សាលានេះ' : 'Plan Route to This School'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
