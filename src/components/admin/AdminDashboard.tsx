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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.title')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{language === 'km' ? 'ថ្ងៃព្រហស្បតិ៍ ទី១៦ ខែតុលា ឆ្នាំ២០២៥' : 'Thu, Oct 16, 2025'}</span>
          </div>
        </div>
      </div>

      {/* Emergency Bus Breakdown & Replacement Command Banner (Requirements 2, 3, 5) */}
      <EmergencyBreakdownBanner />

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Schools */}
        <div onClick={() => onNavigate('schools')} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('dashboard.totalSchools')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{formatNumber(schools.length)}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              ↑ 1 <span className="text-slate-400 font-normal">{t('dashboard.thisMonth')}</span>
            </span>
          </div>
        </div>

        {/* Total Students */}
        <div onClick={() => onNavigate('students')} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('dashboard.totalStudents')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{formatNumber(students.length)}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              ↑ 12 <span className="text-slate-400 font-normal">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Active Buses */}
        <div onClick={() => onNavigate('buses')} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('dashboard.activeBuses')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{formatNumber(activeBusesCount)}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              ↑ 2 <span className="text-slate-400 font-normal">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Active Drivers */}
        <div onClick={() => onNavigate('drivers')} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('dashboard.activeDrivers')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{formatNumber(drivers.length)}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              ↑ 1 <span className="text-slate-400 font-normal">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Active Routes */}
        <div onClick={() => onNavigate('routes')} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <RouteIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('dashboard.activeRoutes')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{formatNumber(routes.length)}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              ↑ 1 <span className="text-slate-400 font-normal">{t('dashboard.thisWeek')}</span>
            </span>
          </div>
        </div>

        {/* Trips in Progress */}
        <div onClick={() => onNavigate('trips')} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('dashboard.inProgressTrips')}</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{formatNumber(inProgressTripsCount)}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
              ● <span className="text-slate-400 font-normal">{t('common.active')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Map on Left & Selected Route + Routes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" /> {t('dashboard.liveFleetMap')}
                </h3>
                <p className="text-[11px] text-slate-500">{t('dashboard.realtimeLocations')}</p>
              </div>
              <button
                onClick={() => onNavigate('live-map')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                {t('dashboard.viewFullscreen')}
              </button>
            </div>
            <InteractiveMap schools={schools} buses={buses} students={students} routes={routes} height="500px" />
          </div>
        </div>

        {/* Right Column: Selected Route & Routes List */}
        <div className="space-y-6">
          {/* Selected Route Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">{language === 'km' ? 'ខ្សែរត់ដែលបានជ្រើស' : 'Selected Route'}</h3>
              <button onClick={() => onNavigate('routes')} className="text-xs font-semibold text-blue-600 hover:underline">{t('common.viewAll')}</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">
                  {localize(routes[0]?.name, routes[0]?.nameKh) || 'Route 1'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                  {t('routes.inProgress')}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {localize('Toul Kork → ITC School', 'ទួលគោក → វិទ្យាស្ថានតិចណូ ITC')}
                </h4>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                <div className="flex justify-between"><span>{t('routes.bus')}:</span> <strong className="text-slate-900">Bus 03 (PP-2B-8812)</strong></div>
                <div className="flex justify-between"><span>{t('routes.driver')}:</span> <strong className="text-slate-900">Chan Dara</strong></div>
                <div className="flex justify-between"><span>{t('students.title')}:</span> <strong className="text-slate-900">18 {t('common.studentsCount')}</strong></div>
                <div className="flex justify-between"><span>{t('routes.startTime')}:</span> <strong className="text-slate-900">07:30 AM</strong></div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{language === 'km' ? 'វឌ្ឍនភាពខ្សែរត់' : 'Route Progress'}</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[45%] rounded-full"></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('driverPortal.nextStop')}:</span>
                  <span className="font-bold text-slate-900">{localize('ITC School Gate A', 'ច្រកទ្វារ A វិទ្យាស្ថានតិចណូ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('dashboard.eta')}:</span>
                  <span className="font-bold text-emerald-600">10 {t('common.minutesUnit')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('routes')}
              className="w-full bg-white hover:bg-slate-50 text-blue-600 font-semibold py-2.5 rounded-xl border border-blue-200 text-xs shadow-xs transition-colors"
            >
              {language === 'km' ? 'មើលព័ត៌មានលម្អិតខ្សែរត់' : 'View Route Details'}
            </button>
          </div>

          {/* Routes List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">{t('nav.routes')}</h3>
            <div className="space-y-2">
              {routes.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => onNavigate('routes')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{localize(r.name, r.nameKh)}</p>
                      <p className="text-[11px] text-slate-500 truncate">{r.startTime} - {r.endTime}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                    r.status === 'in_progress' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {r.status === 'in_progress' ? t('routes.inProgress') : t('routes.scheduled')}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('routes')}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl text-xs border border-slate-200 transition-colors"
            >
              {language === 'km' ? 'មើលខ្សែរត់ទាំងអស់' : 'View All Routes'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Section: Recent Trips, Recent Notifications, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">{t('trips.title')}</h3>
            <button onClick={() => onNavigate('trips')} className="text-xs font-semibold text-blue-600 hover:underline">{t('common.viewAll')}</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="pb-2">{t('common.date')}</th>
                  <th className="pb-2">{t('routes.routeName')}</th>
                  <th className="pb-2">{t('buses.busNumber')}</th>
                  <th className="pb-2 text-right">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.slice(0, 5).map(trip => {
                  const targetRoute = routes.find(r => r.id === trip.routeId);
                  const targetBus = buses.find(b => b.id === trip.busId);
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50">
                      <td className="py-2.5 text-slate-600">{trip.date}</td>
                      <td className="py-2.5 font-bold text-blue-600 truncate max-w-[120px]">
                        {targetRoute ? localize(targetRoute.name, targetRoute.nameKh) : 'Route'}
                      </td>
                      <td className="py-2.5 text-slate-700">{targetBus?.busNumber || 'Bus'}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          trip.status === 'in_progress' ? 'bg-sky-100 text-sky-700' :
                          trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">{t('notifications.title')}</h3>
            <button onClick={() => onNavigate('notifications')} className="text-xs font-semibold text-blue-600 hover:underline">{t('common.viewAll')}</button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif, idx) => (
              <div key={`${notif.id}-${idx}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 relative">
                {!notif.read && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500"></span>}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{notif.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{notif.message}</p>
                <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
                  <span>{notif.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">{t('dashboard.quickActions')}</h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('schools')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex items-center gap-2.5"><Building2 className="w-4 h-4 text-blue-600" /> {t('schools.addSchool')}</span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('students')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex items-center gap-2.5"><GraduationCap className="w-4 h-4 text-blue-600" /> {t('students.addStudent')}</span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('drivers')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex items-center gap-2.5"><UserCheck className="w-4 h-4 text-emerald-600" /> {t('drivers.addDriver')}</span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('buses')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex items-center gap-2.5"><Bus className="w-4 h-4 text-emerald-600" /> {t('buses.addBus')}</span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('routes')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex items-center gap-2.5"><RouteIcon className="w-4 h-4 text-sky-600" /> {t('routes.addRoute')}</span>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setShowStickerModal(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 transition-colors text-xs font-bold text-amber-950 shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-amber-600" />
                {language === 'km' ? 'ប័ណ្ណកូដ QR រថយន្ត & កំណត់ចំណាំ' : 'Bus QR Stickers & In-App Notes'}
              </span>
              <Printer className="w-3.5 h-3.5 text-amber-600" />
            </button>

            <button
              onClick={() => onNavigate('optimizer')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors text-xs font-semibold text-blue-700 shadow-xs"
            >
              <span className="flex items-center gap-2.5"><Sparkles className="w-4 h-4 text-blue-600" /> {t('dashboard.optimizeAllRoutes')}</span>
              <Plus className="w-3.5 h-3.5 text-blue-400" />
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
