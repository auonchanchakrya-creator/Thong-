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
      {/* Top Header & Date / Demo Data badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'km' ? 'ផ្ទាំងគ្រប់គ្រងអាណាព្យាបាល' : 'Parent Dashboard'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'km' 
              ? 'សូមស្វាគមន៍មកកាន់ SchoolRoutAI! តាមដានការធ្វើដំណើររបស់កូនលោកអ្នកដោយផ្ទាល់។' 
              : 'Welcome back, Sokha Dara! Track your child\'s school transportation and stay updated.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{language === 'km' ? 'ថ្ងៃព្រហស្បតិ៍ ទី១៦ ខែតុលា ឆ្នាំ២០២៥' : 'Thu, Oct 16, 2025'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {language === 'km' ? 'ទិន្នន័យផ្ទាល់' : 'Live Data'}
          </span>
        </div>
      </div>

      {/* Emergency Breakdown & Replacement Bus Notice Banner for Parent */}
      <ParentEmergencyAlertBanner student={selectedChild} />

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {actionMessage}
        </div>
      )}

      {/* 4 Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Children */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">{t('parentPortal.myChildren')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{formatNumber(myChildren.length)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'km' ? 'សិស្សភ្ជាប់ក្នុងគណនីរបស់អ្នក' : '2 children linked to your account'}
          </p>
        </div>

        {/* Assigned Bus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Bus className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">{t('students.bus')}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{bus?.busNumber || 'Bus 03'}</h3>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {language === 'km' ? 'វិទ្យាស្ថានតិចណូ ITC → សាលាទួលគោក' : 'ITC School → Royal School'}
          </p>
        </div>

        {/* Next Pickup or Picked Up status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className={`w-10 h-10 rounded-xl ${selectedChild?.status === 'picked_up' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center mb-3`}>
            {selectedChild?.status === 'picked_up' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {selectedChild?.status === 'picked_up' 
              ? (language === 'km' ? 'បានឡើងរថយន្តនៅម៉ោង' : 'Picked Up At') 
              : (language === 'km' ? 'ម៉ោងទទួលបន្ទាប់' : 'Next Pickup')}
          </p>
          <h3 className={`text-2xl font-bold mt-0.5 ${selectedChild?.status === 'picked_up' ? 'text-emerald-600' : 'text-slate-900'}`}>
            {selectedChild?.status === 'picked_up' ? (selectedChild.pickedUpAt || '07:35 AM') : '07:30 AM'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {selectedChild?.name} ({selectedChild?.status === 'picked_up' ? (language === 'km' ? 'នៅលើរថយន្តក្រុង' : 'Onboard Bus') : (language === 'km' ? 'រង់ចាំនៅផ្ទះ' : 'Waiting at Home')})
          </p>
        </div>

        {/* Latest Trip Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium">{t('parentPortal.busStatus')}</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">{t('routes.inProgress')}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{bus?.busNumber} • 45% {language === 'km' ? 'បានបញ្ចប់' : 'completed'}</p>
        </div>
      </div>

      {/* Middle Grid: Left Map + Child Selector & Right Notifications Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map + Child Selector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
              >
                {myChildren.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> 
              {language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពទីតាំង' : 'Refresh Location'}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <InteractiveMap schools={[school]} buses={[bus]} students={[selectedChild]} routes={[route]} height="480px" />
          </div>
        </div>

        {/* Right: Notifications Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">{t('header.notifications')}</h3>
            <button onClick={markAllNotificationsRead} className="text-xs font-semibold text-blue-600 hover:underline">
              {t('header.markAllRead')}
            </button>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto">
            {parentNotifs.map((notif, idx) => (
              <div
                key={`${notif.id}-${idx}`}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3 rounded-xl border text-xs space-y-1 relative cursor-pointer transition-colors ${
                  !notif.read ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'
                }`}
              >
                {!notif.read && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500"></span>}
                <div className="font-bold text-slate-900">{notif.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              {language === 'km' ? 'ព័ត៌មានអំពីកូន' : 'Child Information'}
            </h3>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                {selectedChild?.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs">{selectedChild?.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px] uppercase">
                    {language === 'km' ? 'សកម្ម' : 'Active'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">{selectedChild?.id} • {selectedChild?.grade}</p>
                <p className="text-[10px] text-slate-600">{school ? localize(school.name, school.nameKh) : ''}</p>
              </div>
            </div>

            <div className="space-y-2 pt-3 text-xs text-slate-700">
              <div className="flex justify-between"><span>{t('students.bus')}:</span> <strong className="text-emerald-700">{bus?.busNumber}</strong></div>
              <div className="flex justify-between"><span>{t('students.pickup')}:</span> <strong className="text-slate-900">{selectedChild?.pickupAddress}</strong></div>
              <div className="flex justify-between"><span>{t('students.dropoff')}:</span> <strong className="text-slate-900">{school ? localize(school.name, school.nameKh) : ''}</strong></div>
              <div className="flex justify-between items-center pt-1">
                <span>{t('students.status')}:</span>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                  selectedChild?.status === 'picked_up' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                  selectedChild?.status === 'at_school' ? 'bg-purple-100 text-purple-700 border border-purple-300' :
                  selectedChild?.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse'
                }`}>
                  {selectedChild?.status === 'picked_up' 
                    ? (selectedChild.pickedUpAt ? `${t('students.pickedUp')} (${selectedChild.pickedUpAt})` : t('students.pickedUp')) 
                    : selectedChild?.status === 'at_school' ? t('students.atSchool') 
                    : selectedChild?.status === 'absent' ? 'Absent' : t('students.waiting')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button 
              onClick={() => setShowIdCard(true)}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'km' ? 'ប័ណ្ណសិស្ស & កូដ QR (Student ID Pass)' : 'Digital Student ID & Boarding QR'}</span>
            </button>

            <button onClick={() => onNavigate('route-details')} className="w-full text-xs font-semibold text-blue-600 hover:underline text-left flex items-center justify-between">
              <span>{language === 'km' ? 'មើលព័ត៌មានលម្អិតខ្សែរត់' : 'View Route Details'}</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Route Information */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">{language === 'km' ? 'ព័ត៌មានខ្សែរត់' : 'Route Information'}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px] uppercase">
                {t('routes.inProgress')}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-800">{localize(route?.name, route?.nameKh)}</p>

            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>{language === 'km' ? 'វឌ្ឍនភាព' : 'Progress'}</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[45%] rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">{t('driverPortal.nextStop')}</span>
                <strong className="text-slate-900 text-xs">{language === 'km' ? 'ច្បារអំពៅ' : 'Chbar Ampov'}</strong>
                <span className="text-[9px] text-amber-600 block">{t('dashboard.eta')}: 08:20 AM</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">{language === 'km' ? 'ចំណតនៅសល់' : 'Remaining Stops'}</span>
                <strong className="text-slate-900 text-base">{formatNumber(5)}</strong>
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{t('routes.driver')}</span>
                <strong className="text-slate-900">Chan Dara</strong>
              </div>
              <button
                onClick={handleContactDriver}
                className="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 font-bold text-[11px] hover:bg-blue-100 transition-colors"
              >
                {t('parentPortal.callDriver')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            <button onClick={() => onNavigate('live-tracking')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-2 rounded-xl text-[11px] text-center shadow-xs">
              {language === 'km' ? 'មើលផែនទី' : 'View Full Route'}
            </button>
            <button onClick={() => onNavigate('route-details')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-2 rounded-xl text-[11px] text-center">
              {t('parentPortal.routeDetails')}
            </button>
          </div>
        </div>

        {/* 3. Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">{language === 'km' ? 'សកម្មភាពរហ័ស' : 'Quick Actions'}</h3>

          <div className="space-y-2.5">
            <button
              onClick={handleContactDriver}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-colors"
            >
              <Phone className="w-4 h-4" /> {t('parentPortal.callDriver')}
            </button>

            <button
              onClick={handleContactSchool}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-xs border border-slate-200 shadow-xs transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-blue-600" /> {t('parentPortal.contactSchool')}
            </button>

            <button
              onClick={() => onNavigate('live-tracking')}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-xs border border-slate-200 shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4 text-sky-600" /> {language === 'km' ? 'មើលខ្សែរត់' : 'View Route'}
            </button>

            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-xs border border-slate-200 shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600" /> {language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពទីតាំង' : 'Refresh Location'}
            </button>
          </div>
        </div>

        {/* 4. Trip History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">{t('parentPortal.tripHistory')}</h3>
            <button onClick={() => onNavigate('trip-history')} className="text-xs font-semibold text-blue-600 hover:underline">
              {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="pb-2">{t('common.date')}</th>
                  <th className="pb-2">{language === 'km' ? 'កូន' : 'Child'}</th>
                  <th className="pb-2">{t('students.bus')}</th>
                  <th className="pb-2 text-right">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 text-slate-600">2025-10-15</td>
                  <td className="py-2 font-bold text-slate-800">Sokha Sary</td>
                  <td className="py-2 text-slate-600">Bus 03</td>
                  <td className="py-2 text-right"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">{t('routes.completed')}</span></td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600">2025-10-15</td>
                  <td className="py-2 font-bold text-slate-800">Chhoun Vanna</td>
                  <td className="py-2 text-slate-600">Bus 03</td>
                  <td className="py-2 text-right"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">{t('routes.completed')}</span></td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600">2025-10-14</td>
                  <td className="py-2 font-bold text-slate-800">Sokha Sary</td>
                  <td className="py-2 text-slate-600">Bus 03</td>
                  <td className="py-2 text-right"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px]">{t('routes.completed')}</span></td>
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
