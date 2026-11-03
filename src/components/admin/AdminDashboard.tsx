import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { 
  Building2, GraduationCap, Bus, UserCheck, Route as RouteIcon, History, 
  ArrowUpRight, AlertTriangle, CheckCircle2, ShieldCheck, Plus, Sparkles, 
  Calendar, ChevronDown, Clock, Navigation, QrCode, Printer 
} from 'lucide-react';
import { BusBoardingStickerQRModal } from '../common/BusBoardingStickerQRModal';
import { EmergencyBreakdownBanner } from './EmergencyBreakdownBanner';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { schools, students, drivers, buses, routes, trips, notifications, t, localize, language, formatNumber } = useApp();

  const activeBusesCount = buses.filter(b => b.status === 'active').length;
  const activeRoutesCount = routes.filter(r => r.status === 'in_progress').length;
  const inProgressTripsCount = trips.filter(t => t.status === 'in_progress').length;
  const [showStickerModal, setShowStickerModal] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Date Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('dashboard.title')}</h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium mt-1 leading-relaxed">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2.5 shadow-xs hover:bg-slate-50 transition-colors">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{language === 'km' ? 'ថ្ងៃព្រហស្បតិ៍ ទី១៦ ខែតុលា ឆ្នាំ២០២៥' : 'Thu, Oct 16, 2025'}</span>
          </div>
        </div>
      </div>

      {/* Emergency Bus Breakdown & Replacement Command Banner (Requirements 2, 3, 5) */}
      <EmergencyBreakdownBanner />

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
        {/* Total Schools */}
        <div onClick={() => onNavigate('schools')} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{t('dashboard.totalSchools')}</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatNumber(schools.length)}</h3>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
              ↑ 1 <span className="text-slate-400 font-normal hidden sm:inline">{t('dashboard.thisMonth')}</span>
            </span>
          </div>
        </div>

        {/* Total Students */}
        <div onClick={() => onNavigate('students')} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{t('dashboard.totalStudents')}</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatNumber(students.length)}</h3>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
              ↑ 12 <span className="text-slate-400 font-normal hidden sm:inline">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Active Buses */}
        <div onClick={() => onNavigate('buses')} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{t('dashboard.activeBuses')}</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatNumber(activeBusesCount)}</h3>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
              ↑ 2 <span className="text-slate-400 font-normal hidden sm:inline">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Active Drivers */}
        <div onClick={() => onNavigate('drivers')} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{t('dashboard.activeDrivers')}</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatNumber(drivers.length)}</h3>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
              ↑ 1 <span className="text-slate-400 font-normal hidden sm:inline">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Active Routes */}
        <div onClick={() => onNavigate('routes')} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <RouteIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{t('dashboard.activeRoutes')}</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatNumber(routes.length)}</h3>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
              ↑ 1 <span className="text-slate-400 font-normal hidden sm:inline">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Trips in Progress */}
        <div onClick={() => onNavigate('trips')} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <History className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold truncate">{t('dashboard.inProgressTrips')}</p>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatNumber(inProgressTripsCount)}</h3>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
              ● <span className="text-slate-400 font-normal hidden sm:inline">{t('common.active')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Map on Left & Selected Route + Routes on Right (Stacked vertically on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Map Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-600 shrink-0" /> {t('dashboard.liveFleetMap')}
                </h3>
                <p className="text-sm text-slate-600 font-medium">{t('dashboard.realtimeLocations')}</p>
              </div>
              <button
                onClick={() => onNavigate('live-map')}
                className="text-sm sm:text-base text-blue-600 hover:underline font-bold min-h-[44px] px-3 flex items-center"
              >
                {t('dashboard.viewFullscreen')}
              </button>
            </div>
            <div className="h-[320px] sm:h-[440px] lg:h-[500px] w-full rounded-xl overflow-hidden">
              <InteractiveMap schools={schools} buses={buses} students={students} routes={routes} height="100%" />
            </div>
          </div>
        </div>

        {/* Right Column: Selected Route & Routes List */}
        <div className="space-y-6">
          {/* Selected Route Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">{language === 'km' ? 'ខ្សែរត់ដែលបានជ្រើស' : 'Selected Route'}</h3>
              <button onClick={() => onNavigate('routes')} className="text-sm sm:text-base font-bold text-blue-600 hover:underline">{t('common.viewAll')}</button>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs">
                  {localize(routes[0]?.name, routes[0]?.nameKh) || 'Route 1'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                  {t('routes.inProgress')}
                </span>
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-base sm:text-lg">
                  {localize('Toul Kork → ITC School', 'ទួលគោក → វិទ្យាស្ថានតិចណូ ITC')}
                </h4>
              </div>

              <div className="space-y-2 text-sm sm:text-base text-slate-700 pt-3 border-t border-slate-200/80 font-medium">
                <div className="flex justify-between"><span>{t('routes.bus')}:</span> <strong className="text-slate-900 font-bold">Bus 03 (PP-2B-8812)</strong></div>
                <div className="flex justify-between"><span>{t('routes.driver')}:</span> <strong className="text-slate-900 font-bold">Chan Dara</strong></div>
                <div className="flex justify-between"><span>{t('students.title')}:</span> <strong className="text-slate-900 font-bold">18 {t('common.studentsCount')}</strong></div>
                <div className="flex justify-between"><span>{t('routes.startTime')}:</span> <strong className="text-slate-900 font-bold">07:30 AM</strong></div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs sm:text-sm text-slate-600 font-semibold">
                  <span>{language === 'km' ? 'វឌ្ឍនភាពខ្សែរត់' : 'Route Progress'}</span>
                  <span className="text-blue-700 font-bold">45%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[45%] rounded-full"></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 text-sm sm:text-base space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{t('driverPortal.nextStop')}:</span>
                  <span className="font-bold text-slate-900">{localize('ITC School Gate A', 'ច្រកទ្វារ A វិទ្យាស្ថានតិចណូ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{t('dashboard.eta')}:</span>
                  <span className="font-black text-emerald-600 text-base sm:text-lg">10 {t('common.minutesUnit')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('routes')}
              className="w-full bg-white hover:bg-slate-50 text-blue-600 font-bold py-3 px-4 rounded-xl border border-blue-200 text-sm sm:text-base shadow-xs transition-colors min-h-[48px] flex items-center justify-center cursor-pointer"
            >
              {language === 'km' ? 'មើលព័ត៌មានលម្អិតខ្សែរត់' : 'View Route Details'}
            </button>
          </div>

          {/* Routes List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3.5">
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl">{t('nav.routes')}</h3>
            <div className="space-y-2.5">
              {routes.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => onNavigate('routes')}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-200/70 text-sm transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{localize(r.name, r.nameKh)}</p>
                      <p className="text-xs sm:text-sm text-slate-500 truncate font-medium">{r.startTime} - {r.endTime}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-xs shrink-0 ${
                    r.status === 'in_progress' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {r.status === 'in_progress' ? t('routes.inProgress') : t('routes.scheduled')}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('routes')}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold py-3 rounded-xl text-sm sm:text-base border border-slate-200 transition-colors min-h-[48px] flex items-center justify-center cursor-pointer"
            >
              {language === 'km' ? 'មើលខ្សែរត់ទាំងអស់' : 'View All Routes'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Section: Recent Trips, Recent Notifications, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl">{t('trips.title')}</h3>
            <button onClick={() => onNavigate('trips')} className="text-sm sm:text-base font-bold text-blue-600 hover:underline">{t('common.viewAll')}</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="text-slate-600 font-bold border-b border-slate-200 text-xs sm:text-sm uppercase tracking-wide">
                  <th className="pb-3">{t('common.date')}</th>
                  <th className="pb-3">{t('routes.routeName')}</th>
                  <th className="pb-3">{t('buses.busNumber')}</th>
                  <th className="pb-3 text-right">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {trips.slice(0, 5).map(trip => {
                  const targetRoute = routes.find(r => r.id === trip.routeId);
                  const targetBus = buses.find(b => b.id === trip.busId);
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50">
                      <td className="py-3 text-slate-700">{trip.date}</td>
                      <td className="py-3 font-bold text-blue-600 truncate max-w-[130px]">
                        {targetRoute ? localize(targetRoute.name, targetRoute.nameKh) : 'Route'}
                      </td>
                      <td className="py-3 text-slate-800 font-medium">{targetBus?.busNumber || 'Bus'}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                          trip.status === 'in_progress' ? 'bg-sky-100 text-sky-800' :
                          trip.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {trip.status === 'in_progress' ? t('routes.inProgress') : t('routes.completed')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl">{t('notifications.title')}</h3>
            <button onClick={() => onNavigate('notifications')} className="text-sm sm:text-base font-bold text-blue-600 hover:underline">{t('common.viewAll')}</button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif, idx) => (
              <div key={`${notif.id}-${idx}`} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-sm space-y-1.5 relative">
                {!notif.read && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-500"></span>}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{notif.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{notif.message}</p>
                <div className="flex justify-between items-center pt-1 text-xs text-slate-400 font-medium">
                  <span>{notif.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg sm:text-xl">{t('dashboard.quickActions')}</h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('schools')}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm sm:text-base font-bold text-slate-800 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-3"><Building2 className="w-5 h-5 text-blue-600 shrink-0" /> {t('schools.addSchool')}</span>
              <Plus className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            <button
              onClick={() => onNavigate('students')}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm sm:text-base font-bold text-slate-800 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-3"><GraduationCap className="w-5 h-5 text-blue-600 shrink-0" /> {t('students.addStudent')}</span>
              <Plus className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            <button
              onClick={() => onNavigate('drivers')}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm sm:text-base font-bold text-slate-800 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-3"><UserCheck className="w-5 h-5 text-emerald-600 shrink-0" /> {t('drivers.addDriver')}</span>
              <Plus className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            <button
              onClick={() => onNavigate('buses')}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm sm:text-base font-bold text-slate-800 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-3"><Bus className="w-5 h-5 text-emerald-600 shrink-0" /> {t('buses.addBus')}</span>
              <Plus className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            <button
              onClick={() => onNavigate('routes')}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm sm:text-base font-bold text-slate-800 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-3"><RouteIcon className="w-5 h-5 text-sky-600 shrink-0" /> {t('routes.addRoute')}</span>
              <Plus className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            <button
              onClick={() => setShowStickerModal(true)}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 transition-colors text-sm sm:text-base font-bold text-amber-950 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-3 truncate">
                <QrCode className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="truncate">{language === 'km' ? 'ប័ណ្ណកូដ QR រថយន្ត & កំណត់ចំណាំ' : 'Bus QR Stickers & In-App Notes'}</span>
              </span>
              <Printer className="w-4 h-4 text-amber-600 shrink-0 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('optimizer')}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors text-sm sm:text-base font-bold text-blue-700 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-blue-600 shrink-0" /> {t('dashboard.optimizeAllRoutes')}</span>
              <Plus className="w-4 h-4 text-blue-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Bus Boarding Sticker QR Modal */}
      <BusBoardingStickerQRModal
        bus={buses[0]}
        isOpen={showStickerModal}
        onClose={() => setShowStickerModal(false)}
      />
    </div>
  );
}
