import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { 
  GraduationCap, Bus, RefreshCw, Phone, CheckCircle2, 
  Calendar, ChevronDown, Bell, Clock, ArrowUpRight, Navigation, LifeBuoy, QrCode 
} from 'lucide-react';
import { DigitalStudentIDCard } from '../common/DigitalStudentIDCard';
import { ParentEmergencyAlertBanner } from './ParentEmergencyAlertBanner';

interface ParentDashboardProps {
  onNavigate: (tab: string) => void;
}

export function ParentDashboard({ onNavigate }: ParentDashboardProps) {
  const { 
    currentUser, parents, students, buses, routes, schools, notifications, 
    markNotificationRead, markAllNotificationsRead, t, localize, language, formatNumber 
  } = useApp();

  const parent = parents.find(p => p.userId === currentUser?.id) || parents[0];
  const myChildren = students.filter(s => parent?.childrenIds?.includes(s.id));
  const [selectedChildId, setSelectedChildId] = useState<string>(myChildren[0]?.id || students[0]?.id);

  const selectedChild = students.find(s => s.id === selectedChildId) || myChildren[0];
  const bus = buses.find(b => b.id === selectedChild?.busId) || buses[0];
  const school = schools.find(s => s.id === selectedChild?.schoolId) || schools[0];
  const route = routes.find(r => r.id === selectedChild?.routeId) || routes[0];

  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showIdCard, setShowIdCard] = useState(false);

  const triggerActionMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      triggerActionMessage(language === 'km' ? 'បានធ្វើបច្ចុប្បន្នភាពទីតាំង GPS ជោគជ័យ។' : 'GPS location refreshed successfully.');
    }, 800);
  };

  const handleContactDriver = () => {
    triggerActionMessage(language === 'km' ? 'កំពុងតភ្ជាប់ទៅអ្នកបើកបរ ចាន់ ដារ៉ា (+855 12 345 678)...' : 'Connecting to Driver Chan Dara (+855 12 345 678)...');
  };

  const handleContactSchool = () => {
    onNavigate('contact-school');
  };

  const parentNotifs = notifications.filter(n => {
    if (n.userId && currentUser?.id && n.userId !== currentUser.id) {
      return false;
    }
    return n.roleTarget === 'all' || n.roleTarget === 'parent' || n.userId === currentUser?.id;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Date / Live Data badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {language === 'km' ? 'ផ្ទាំងគ្រប់គ្រងអាណាព្យាបាល' : 'Parent Dashboard'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
            {language === 'km' 
              ? 'សូមស្វាគមន៍មកកាន់ SchoolRoutAI! តាមដានការធ្វើដំណើររបស់កូនលោកអ្នកដោយផ្ទាល់។' 
              : 'Welcome back, Sokha Dara! Track your child\'s school transportation and stay updated.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2.5 shadow-xs min-h-[46px]">
            <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{language === 'km' ? 'ថ្ងៃព្រហស្បតិ៍ ទី១៦ ខែតុលា ឆ្នាំ២០២៥' : 'Thu, Oct 16, 2025'}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <span className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold uppercase tracking-wide flex items-center gap-2 shadow-xs min-h-[46px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> {language === 'km' ? 'ទិន្នន័យផ្ទាល់' : 'Live Data'}
          </span>
        </div>
      </div>

      {/* Emergency Breakdown & Replacement Bus Notice Banner for Parent */}
      <ParentEmergencyAlertBanner student={selectedChild} />

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm sm:text-base px-5 py-3.5 rounded-xl font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> {actionMessage}
        </div>
      )}

      {/* 4 Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* My Children */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold truncate">{t('parentPortal.myChildren')}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 truncate">{formatNumber(myChildren.length)}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            {language === 'km' ? 'សិស្សក្នុងគណនី' : '2 children linked'}
          </p>
        </div>

        {/* Assigned Bus */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
            <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold truncate">{t('students.bus')}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 truncate">{bus?.busNumber || 'Bus 03'}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            {language === 'km' ? 'វិទ្យាស្ថានតិចណូ ITC → ទួលគោក' : 'ITC School → Royal School'}
          </p>
        </div>

        {/* Next Pickup or Picked Up status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${selectedChild?.status === 'picked_up' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center mb-2.5 sm:mb-3 shrink-0`}>
            {selectedChild?.status === 'picked_up' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold truncate">
            {selectedChild?.status === 'picked_up' 
              ? (language === 'km' ? 'បានឡើងរថយន្តនៅម៉ោង' : 'Picked Up At') 
              : (language === 'km' ? 'ម៉ោងទទួលបន្ទាប់' : 'Next Pickup')}
          </p>
          <h3 className={`text-2xl sm:text-3xl font-black mt-1 truncate ${selectedChild?.status === 'picked_up' ? 'text-emerald-700' : 'text-slate-900'}`}>
            {selectedChild?.status === 'picked_up' ? (selectedChild.pickedUpAt || '07:35 AM') : '07:30 AM'}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            {selectedChild?.name} ({selectedChild?.status === 'picked_up' ? (language === 'km' ? 'នៅលើរថយន្ត' : 'Onboard') : (language === 'km' ? 'នៅផ្ទះ' : 'At Home')})
          </p>
        </div>

        {/* Latest Trip Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 sm:mb-3 shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold truncate">{t('parentPortal.busStatus')}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 truncate">{t('routes.inProgress')}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">{bus?.busNumber} • 45% {language === 'km' ? 'បានបញ្ចប់' : 'completed'}</p>
        </div>
      </div>

      {/* Middle Grid: Left Map + Child Selector & Right Notifications Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left: Map + Child Selector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none min-h-[46px]"
              >
                {myChildren.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold px-4 py-2.5 min-h-[46px] rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 border border-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
              <span>{language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពទីតាំង' : 'Refresh Location'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <div className="h-[320px] sm:h-[420px] lg:h-[480px] w-full rounded-xl overflow-hidden">
              <InteractiveMap schools={[school]} buses={[bus]} students={[selectedChild]} routes={[route]} height="100%" />
            </div>
          </div>
        </div>

        {/* Right: Notifications Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl">{t('header.notifications')}</h3>
            <button onClick={markAllNotificationsRead} className="text-sm font-bold text-blue-600 hover:underline">
              {t('header.markAllRead')}
            </button>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto">
            {parentNotifs.map((notif, idx) => (
              <div
                key={`${notif.id}-${idx}`}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border text-sm space-y-1.5 relative cursor-pointer transition-colors ${
                  !notif.read ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                {!notif.read && <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-rose-500"></span>}
                <div className="font-bold text-slate-900 text-sm sm:text-base">{notif.title}</div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{notif.message}</p>
                <div className="flex justify-between items-center pt-1 text-xs text-slate-400 font-medium">
                  <span>{notif.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: 4 Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Child Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg sm:text-xl mb-3">
              {language === 'km' ? 'ព័ត៌មានអំពីកូន' : 'Child Information'}
            </h3>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                {selectedChild?.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base truncate">{selectedChild?.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase shrink-0">
                    {language === 'km' ? 'សកម្ម' : 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{selectedChild?.id} • {selectedChild?.grade}</p>
                <p className="text-xs text-slate-600 truncate">{school ? localize(school.name, school.nameKh) : ''}</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-3.5 text-sm sm:text-base text-slate-700 font-medium">
              <div className="flex justify-between"><span>{t('students.bus')}:</span> <strong className="text-emerald-700 font-bold">{bus?.busNumber}</strong></div>
              <div className="flex justify-between"><span>{t('students.pickup')}:</span> <strong className="text-slate-900 font-bold truncate max-w-[170px]">{selectedChild?.pickupAddress}</strong></div>
              <div className="flex justify-between"><span>{t('students.dropoff')}:</span> <strong className="text-slate-900 font-bold truncate max-w-[170px]">{school ? localize(school.name, school.nameKh) : ''}</strong></div>
              <div className="flex justify-between items-center pt-1.5">
                <span>{t('students.status')}:</span>
                <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${
                  selectedChild?.status === 'picked_up' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  selectedChild?.status === 'at_school' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                  selectedChild?.status === 'absent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                }`}>
                  {selectedChild?.status === 'picked_up' 
                    ? (selectedChild.pickedUpAt ? `${t('students.pickedUp')} (${selectedChild.pickedUpAt})` : t('students.pickedUp')) 
                    : selectedChild?.status === 'at_school' ? t('students.atSchool') 
                    : selectedChild?.status === 'absent' ? 'Absent' : t('students.waiting')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-200/80 space-y-2.5">
            <button 
              onClick={() => setShowIdCard(true)}
              className="w-full py-3 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm sm:text-base font-bold flex items-center justify-center gap-2 border border-blue-200 transition-colors cursor-pointer min-h-[48px]"
            >
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>{language === 'km' ? 'ប័ណ្ណសិស្ស & កូដ QR' : 'Digital Student ID & Boarding QR'}</span>
            </button>

            <button onClick={() => onNavigate('route-details')} className="w-full text-sm font-bold text-blue-600 hover:underline text-left flex items-center justify-between min-h-[36px]">
              <span>{language === 'km' ? 'មើលព័ត៌មានលម្អិតខ្សែរត់' : 'View Route Details'}</span> <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Route Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900 text-lg sm:text-xl">{language === 'km' ? 'ព័ត៌មានខ្សែរត់' : 'Route Information'}</h3>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                {t('routes.inProgress')}
              </span>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-900">{localize(route?.name, route?.nameKh)}</p>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs sm:text-sm text-slate-600 font-semibold">
                <span>{language === 'km' ? 'វឌ្ឍនភាព' : 'Progress'}</span>
                <span className="text-blue-700 font-bold">45%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[45%] rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3.5 text-sm">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 block font-medium">{t('driverPortal.nextStop')}</span>
                <strong className="text-slate-900 text-sm block truncate">{language === 'km' ? 'ច្បារអំពៅ' : 'Chbar Ampov'}</strong>
                <span className="text-xs text-amber-700 font-bold block">{t('dashboard.eta')}: 08:20 AM</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-xs text-slate-500 block font-medium">{language === 'km' ? 'ចំណតនៅសល់' : 'Remaining Stops'}</span>
                <strong className="text-slate-900 text-base sm:text-lg font-black block">{formatNumber(5)}</strong>
              </div>
            </div>

            <div className="pt-3.5 text-sm sm:text-base text-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">{t('routes.driver')}</span>
                <strong className="text-slate-900 font-bold">Chan Dara</strong>
              </div>
              <button
                onClick={handleContactDriver}
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-100 transition-colors cursor-pointer min-h-[36px]"
              >
                {t('parentPortal.callDriver')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-3.5 border-t border-slate-200/80">
            <button onClick={() => onNavigate('live-tracking')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-3 rounded-xl text-xs sm:text-sm text-center shadow-xs min-h-[46px] cursor-pointer">
              {language === 'km' ? 'មើលផែនទី' : 'View Full Route'}
            </button>
            <button onClick={() => onNavigate('route-details')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-3 rounded-xl text-xs sm:text-sm text-center min-h-[46px] cursor-pointer">
              {t('parentPortal.routeDetails')}
            </button>
          </div>
        </div>

        {/* 3. Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-lg sm:text-xl">{language === 'km' ? 'សកម្មភាពរហ័ស' : 'Quick Actions'}</h3>

          <div className="space-y-2.5">
            <button
              onClick={handleContactDriver}
              className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm sm:text-base shadow-md transition-colors min-h-[48px] cursor-pointer"
            >
              <Phone className="w-5 h-5" /> {t('parentPortal.callDriver')}
            </button>

            <button
              onClick={handleContactSchool}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm sm:text-base border border-slate-200 shadow-xs transition-colors min-h-[48px] cursor-pointer"
            >
              <LifeBuoy className="w-5 h-5 text-blue-600" /> {t('parentPortal.contactSchool')}
            </button>

            <button
              onClick={() => onNavigate('live-tracking')}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm sm:text-base border border-slate-200 shadow-xs transition-colors min-h-[48px] cursor-pointer"
            >
              <Navigation className="w-5 h-5 text-sky-600" /> {language === 'km' ? 'មើលខ្សែរត់' : 'View Route'}
            </button>

            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm sm:text-base border border-slate-200 shadow-xs transition-colors min-h-[48px] cursor-pointer"
            >
              <RefreshCw className="w-5 h-5 text-emerald-600" /> {language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពទីតាំង' : 'Refresh Location'}
            </button>
          </div>
        </div>

        {/* 4. Trip History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl">{t('parentPortal.tripHistory')}</h3>
            <button onClick={() => onNavigate('trip-history')} className="text-sm font-bold text-blue-600 hover:underline">
              {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="text-slate-600 font-bold border-b border-slate-200 text-xs sm:text-sm uppercase tracking-wide">
                  <th className="pb-3">{t('common.date')}</th>
                  <th className="pb-3">{language === 'km' ? 'កូន' : 'Child'}</th>
                  <th className="pb-3">{t('students.bus')}</th>
                  <th className="pb-3 text-right">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 text-slate-700">2025-10-15</td>
                  <td className="py-3 font-bold text-slate-900">Sokha Sary</td>
                  <td className="py-3 text-slate-700">Bus 03</td>
                  <td className="py-3 text-right"><span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">{t('routes.completed')}</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-slate-700">2025-10-15</td>
                  <td className="py-3 font-bold text-slate-900">Chhoun Vanna</td>
                  <td className="py-3 text-slate-700">Bus 03</td>
                  <td className="py-3 text-right"><span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">{t('routes.completed')}</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-slate-700">2025-10-14</td>
                  <td className="py-3 font-bold text-slate-900">Sokha Sary</td>
                  <td className="py-3 text-slate-700">Bus 03</td>
                  <td className="py-3 text-right"><span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">{t('routes.completed')}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Digital Student ID Card & QR Modal */}
      {showIdCard && selectedChild && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <DigitalStudentIDCard
            student={selectedChild}
            onClose={() => setShowIdCard(false)}
          />
        </div>
      )}
    </div>
  );
}
