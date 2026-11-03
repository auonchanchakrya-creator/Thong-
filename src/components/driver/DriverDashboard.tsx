import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { 
  Bus, Play, CheckCircle2, AlertTriangle, Phone, Navigation, 
  Sparkles, Calendar, ChevronDown, MapPin, RefreshCw, Check, Wrench, Clock, Users, QrCode, Printer,
  AlertOctagon, ShieldAlert
} from 'lucide-react';
import { DriverQRScannerModal } from './DriverQRScannerModal';
import { BusBoardingStickerQRModal } from '../common/BusBoardingStickerQRModal';
import { EmergencyBreakdownModal } from '../emergency/EmergencyBreakdownModal';
import { DriverGpsConsole } from './DriverGpsConsole';

interface DriverDashboardProps {
  onNavigate: (tab: string) => void;
}

export function DriverDashboard({ onNavigate }: DriverDashboardProps) {
  const { 
    currentUser, drivers, buses, routes, students, startTrip, 
    updateStudentStatus, confirmStudentPickup, reportIncident, 
    activeEmergencyTrip, activeEmergencyIncident,
    t, localize, language, formatNumber 
  } = useApp();

  const driver = drivers.find(d => d.userId === currentUser?.id) || drivers[0];
  const bus = buses.find(b => b.id === driver?.busId) || buses[0];
  const route = routes.find(r => r.id === driver?.routeId) || routes[0];

  const assignedStudents = students
    .filter(s => s.busId === bus?.id || s.routeId === route?.id)
    .sort((a, b) => (a.pickupOrder || 0) - (b.pickupOrder || 0));
  const pickedUpCount = assignedStudents.filter(s => s.status === 'picked_up').length;

  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('08:12 AM');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Action success banner state
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const triggerActionMessage = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      triggerActionMessage(language === 'km' ? 'បានធ្វើបច្ចុប្បន្នភាពទីតាំង GPS ជោគជ័យ។' : 'GPS location refreshed successfully.');
    }, 700);
  };

  const handleStartRoute = () => {
    startTrip(route.id);
    triggerActionMessage(language === 'km' ? 'បានចាប់ផ្តើមខ្សែរត់ជោគជ័យ។ បានជូនដំណឹងដល់អាណាព្យាបាល។' : 'Route started successfully. Parents notified.');
  };

  const handleArrivedAtStop = () => {
    triggerActionMessage(language === 'km' ? 'បានមកដល់ចំណតឈប់។ ត្រៀមទទួលសិស្សបន្ទាប់។' : 'Arrived at stop. Next student pickup ready.');
  };

  const handleStudentPickedUp = (studentId?: string) => {
    const target = studentId ? assignedStudents.find(s => s.id === studentId) : assignedStudents.find(s => s.status === 'waiting');
    if (target) {
      confirmStudentPickup(target.id);
      triggerActionMessage(language === 'km' 
        ? `✓ បានកត់ត្រាសិស្ស ${target.name} បានឡើងរថយន្ត! បានជូនដំណឹងទៅអាណាព្យាបាលរួចរាល់។` 
        : `✓ Student ${target.name} marked as Picked Up. Parent notified!`);
    }
  };

  const handleStudentDroppedOff = () => {
    if (assignedStudents[0]) {
      updateStudentStatus(assignedStudents[0].id, 'dropped_off');
      triggerActionMessage(language === 'km' ? `បានកត់ត្រាសិស្ស ${assignedStudents[0].name} បានចុះរថយន្តសុវត្ថិភាព។` : `Student ${assignedStudents[0].name} marked as Dropped Off.`);
    }
  };

  const handleReportDelay = () => {
    reportIncident({
      driverId: driver.id,
      busId: bus.id,
      routeId: route.id,
      type: 'delay',
      description: language === 'km' ? 'មានការកកស្ទះចរាចរណ៍ស្រាលនៅលើផ្លូវធ្វើដំណើរ។' : 'Minor traffic congestion reported on route.',
      severity: 'medium'
    });
    triggerActionMessage(language === 'km' ? 'បានរាយការណ៍ការពន្យារពេលទៅផ្នែកគ្រប់គ្រង និងអាណាព្យាបាល។' : 'Delay reported to school dispatch & parents.');
  };

  const handleReportVehicleIssue = () => {
    reportIncident({
      driverId: driver.id,
      busId: bus.id,
      routeId: route.id,
      type: 'breakdown',
      description: language === 'km' ? 'សំពាធកង់រថយន្តចុះខ្សោយស្រាល (តេស្តសាកល្បង)' : 'Low tire pressure (Demo)',
      severity: 'high'
    });
    triggerActionMessage(language === 'km' ? 'បានរាយការណ៍បញ្ហារថយន្តទៅផ្នែកបច្ចេកទេសរួចរាល់។' : 'Vehicle issue reported to dispatch.');
  };

  const handleContactSchool = () => {
    triggerActionMessage(language === 'km' ? 'កំពុងតភ្ជាប់ទៅការិយាល័យដឹកជញ្ជូនសាលា (+855 23 880 370)...' : 'Connecting to school dispatch (+855 23 880 370)...');
  };

  const handleCompleteRoute = () => {
    triggerActionMessage(language === 'km' ? 'បានបញ្ចប់ខ្សែរត់ដោយជោគជ័យ។ រាល់សិស្សានុសិស្សទាំងអស់បានមកដល់ដោយសុវត្ថិភាព!' : 'Route completed successfully. All students arrived safely!');
  };

  const filteredStudents = assignedStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchStudent.toLowerCase()) || 
      s.pickupAddress.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Top Header & Date / On Duty pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight break-words">
            {language === 'km' ? 'ផ្ទាំងគ្រប់គ្រងអ្នកបើកបរ' : 'Driver Dashboard'}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 mt-0.5 sm:mt-1 font-medium leading-relaxed">
            {language === 'km' ? 'គ្រប់គ្រងខ្សែរត់ សិស្ស និងធានាសុវត្ថិភាពការធ្វើដំណើរ។' : 'Manage your route, students and keep everyone safe.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 shadow-xs min-h-[42px] flex-1 sm:flex-initial justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="sm:hidden">{language === 'km' ? '១៦ តុលា ២០២៥' : 'Oct 16, 2025'}</span>
              <span className="hidden sm:inline">{language === 'km' ? 'ថ្ងៃព្រហស្បតិ៍ ទី១៦ ខែតុលា ឆ្នាំ២០២៥' : 'Thu, Oct 16, 2025'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <span className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wide flex items-center gap-2 shadow-xs min-h-[42px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t('drivers.onDuty')}
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm sm:text-base px-4 py-3 rounded-xl font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" /> {actionMessage}
        </div>
      )}

      {/* Active Emergency Breakdown Alert Banner for Driver */}
      {activeEmergencyTrip && (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-rose-950/20 border-2 border-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <AlertOctagon className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-black uppercase tracking-wider">
                  {language === 'km' ? '🚨 របាយការណ៍អាសន្ន' : '🚨 ACTIVE BREAKDOWN'}
                </span>
                <span className="text-xs sm:text-sm font-black text-rose-100">
                  {activeEmergencyTrip.status === 'emergency_replacement_required' 
                    ? (language === 'km' ? 'រង់ចាំរថយន្តជំនួស' : 'Awaiting Replacement')
                    : (language === 'km' ? 'រថយន្តជំនួសបានចេញដំណើរ' : 'Replacement Dispatched')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-white mt-1">
                {language === 'km' ? 'រថយន្តខូចតាមផ្លូវ • រដ្ឋបាលសាលាបានទទួលដំណឹង' : 'Bus Breakdown Reported • Admin Alerted'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowBreakdownModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[46px]"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{language === 'km' ? 'ស្ថានភាពអាសន្ន & ផ្ទេរសិស្ស' : 'Emergency Status & Student Transfers'}</span>
          </button>
        </div>
      )}

      {/* Real Device GPS Live Broadcasting Console */}
      <DriverGpsConsole 
        onTripStarted={() => triggerActionMessage(language === 'km' ? '✓ បានចាប់ផ្តើមការផ្សាយ GPS ផ្ទាល់!' : '✓ Live GPS Broadcasting active!')} 
        onTripEnded={() => triggerActionMessage(language === 'km' ? '✓ បានបញ្ចប់ការធ្វើដំណើរ និងបញ្ឈប់ការផ្សាយ GPS' : '✓ Trip ended. Location sharing stopped.')}
      />

      {/* Prominent Live Turn-by-Turn GPS Navigation Mode Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-blue-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-500/30">
        <div className="space-y-1.5 sm:space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5 text-blue-300" />
            <span>{language === 'km' ? 'ប្រព័ន្ធនាំផ្លូវ GPS & ទទួលសិស្ស' : 'Live Navigation & Pickup Console'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
            {language === 'km' ? 'ចាប់ផ្តើមការរុករកតាមផ្លូវ & កត់ត្រាឡើងរថយន្ត' : 'Turn-by-Turn Route Navigation & Pickup'}
          </h3>
          <p className="text-xs sm:text-sm lg:text-base text-blue-100/90 leading-relaxed font-normal">
            {language === 'km'
              ? 'ផែនទីចរាចរណ៍ភ្នំពេញផ្ទាល់ បង្ហាញទីតាំងចំណតសិស្សតាមលំដាប់ ការនាំផ្លូវមួយជំហានម្តងៗ និងប៊ូតុងធំសម្រាប់ចុចទទួលសិស្ស។'
              : 'Interactive Phnom Penh map, sequential student pickup order, turn-by-turn routing, large driving buttons, and automatic parent alerts.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('my-route')}
          className="w-full md:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-800 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-black/20 transition-all transform active:scale-97 cursor-pointer shrink-0 min-h-[50px]"
        >
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
            ▶
          </div>
          <span>{language === 'km' ? 'បើកប្រព័ន្ធនាំផ្លូវ' : 'Start Route Navigation'}</span>
        </button>
      </div>

      {/* 6 Top Summary Cards - Stack vertically on mobile, responsive grid on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Assigned Bus */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{bus?.model || 'Toyota Coaster'}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-snug">{t('drivers.assignedBus')}</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{bus?.busNumber || 'Bus 03'}</h3>
        </div>

        {/* Today's Route */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'km' ? 'ITC → ទួលគោក' : 'ITC → Royal'}
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-snug">{t('nav.myRoute')}</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{localize(route?.name, route?.nameKh) || 'Route 1'}</h3>
        </div>

        {/* Total Students */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{language === 'km' ? 'ខ្សែរត់នេះ' : 'Assigned'}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-snug">{t('dashboard.totalStudents')}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{formatNumber(assignedStudents.length || 12)}</h3>
        </div>

        {/* Students Picked Up */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs text-emerald-700 font-bold">{language === 'km' ? 'បានផ្ទៀងផ្ទាត់' : 'Verified'}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-snug">{t('students.pickedUp')}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {formatNumber(pickedUpCount)} / {formatNumber(assignedStudents.length || 12)}
          </h3>
        </div>

        {/* Next Stop */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs text-amber-700 font-bold">08:20 AM</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-snug">{t('driverPortal.nextStop')}</p>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{language === 'km' ? 'ច្បារអំពៅ' : 'Chbar Ampov'}</h3>
        </div>

        {/* Route Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 uppercase">{t('routes.inProgress')}</span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-snug">{t('routes.status')}</p>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[42%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Middle Section: Interactive Map on Left & Route Information / Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left: Map + Header Banner */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0">{localize(route?.name, route?.nameKh) || 'Route 1'}</span>
              <span className="text-xs font-semibold text-slate-700 truncate">
                {language === 'km' ? 'វិទ្យាស្ថានតិចណូ ITC → សាលាទួលគោក' : 'ITC School → Royal School'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 min-h-[40px] rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> 
              <span>{language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពទីតាំង' : 'Refresh Location'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4">
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-xl overflow-hidden">
              <InteractiveMap schools={[]} buses={[bus]} students={assignedStudents} routes={[route]} height="100%" />
            </div>
          </div>
        </div>

        {/* Right: Route Information & Controls */}
        <div className="space-y-6">
          {/* Route Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                {language === 'km' ? 'ព័ត៌មានខ្សែរត់' : 'Route Information'}
              </h3>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                {t('routes.inProgress')}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-base sm:text-lg">{bus?.busNumber || 'Bus 03'}</span>
                <span className="text-xs sm:text-sm text-slate-600 font-medium">{bus?.model || 'Toyota Coaster'}</span>
              </div>

              <div className="space-y-2 text-sm sm:text-base text-slate-700 pt-3 border-t border-slate-200/80 font-medium">
                <div className="flex justify-between"><span>{t('routes.routeName')}:</span> <strong className="text-slate-900 font-bold">{localize(route?.name, route?.nameKh) || 'Route 1'}</strong></div>
                <div className="flex justify-between"><span>{t('routes.school')}:</span> <strong className="text-slate-900 font-bold">{language === 'km' ? 'វិទ្យាស្ថានតិចណូ ITC' : 'ITC School'}</strong></div>
                <div className="flex justify-between"><span>{t('routes.driver')}:</span> <strong className="text-slate-900 font-bold">{driver?.name || 'Chan Dara'}</strong></div>
                <div className="flex justify-between font-mono text-xs sm:text-sm text-blue-700"><span>{t('drivers.phone')}:</span> <span className="font-bold">{driver?.phone || '+855 12 345 678'}</span></div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs sm:text-sm text-slate-600 font-semibold">
                  <span>{language === 'km' ? 'វឌ្ឍនភាពខ្សែរត់' : 'Route Progress'}</span>
                  <span className="text-blue-700 font-bold">42%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[42%] rounded-full"></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2.5 text-sm">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 block font-medium">{t('driverPortal.nextStop')}</span>
                  <strong className="text-slate-900 text-sm sm:text-base block truncate">{language === 'km' ? 'ច្បារអំពៅ' : 'Chbar Ampov'}</strong>
                  <span className="text-xs text-amber-700 font-bold block">{t('dashboard.eta')}: 08:20 AM</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 block font-medium">{language === 'km' ? 'ចំណតនៅសល់' : 'Remaining Stops'}</span>
                  <strong className="text-slate-900 text-lg sm:text-xl font-black block">{formatNumber(5)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Route Controls (8 Functional Buttons) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3.5">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl">
              {language === 'km' ? 'ការបញ្ជាខ្សែរត់' : 'Route Controls'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQRScanner(true)}
                className="col-span-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-blue-400/30 min-h-[48px]"
              >
                <QrCode className="w-5 h-5 text-amber-300" />
                <span>{language === 'km' ? 'ស្កេនកូដ QR សិស្សឡើងរថយន្ត' : 'Scan Student Boarding QR Code'}</span>
              </button>

              <button
                onClick={() => setShowStickerModal(true)}
                className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 px-4 rounded-xl text-sm sm:text-base shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-slate-700 min-h-[48px]"
              >
                <Printer className="w-5 h-5 text-amber-300" />
                <span>{language === 'km' ? 'ប័ណ្ណកូដ QR បិទលើរថយន្ត & កំណត់ចំណាំ' : 'Bus Door Sticker QR & In-App Notes'}</span>
              </button>

              <button
                onClick={() => setShowBreakdownModal(true)}
                className="col-span-2 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-700 hover:to-red-700 text-white font-black py-3.5 px-4 rounded-xl text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-rose-400/40 min-h-[50px]"
              >
                <AlertOctagon className="w-5 h-5 text-amber-300 animate-pulse" />
                <span>{language === 'km' ? '🚨 អាសន្ន / រាយការណ៍រថយន្តខូច' : '🚨 Emergency / Bus Breakdown Report'}</span>
              </button>

              <button
                onClick={handleStartRoute}
                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <Play className="w-5 h-5 fill-current" /> {language === 'km' ? 'ចាប់ផ្តើមខ្សែរត់' : 'Start Route'}
              </button>

              <button
                onClick={handleArrivedAtStop}
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-3 rounded-xl border border-slate-200 text-sm shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <MapPin className="w-4 h-4 text-blue-600" /> {language === 'km' ? 'បានមកដល់ចំណត' : 'Arrived at Stop'}
              </button>

              <button
                onClick={() => handleStudentPickedUp()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <CheckCircle2 className="w-4 h-4" /> {language === 'km' ? 'សិស្សឡើងរថយន្ត' : 'Student Picked Up'}
              </button>

              <button
                onClick={handleStudentDroppedOff}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-3 rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <Check className="w-4 h-4" /> {language === 'km' ? 'សិស្សចុះរថយន្ត' : 'Student Dropped Off'}
              </button>

              <button
                onClick={handleReportDelay}
                className="bg-white hover:bg-rose-50 text-rose-700 font-bold py-3 px-3 rounded-xl border border-rose-200 text-sm shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" /> {language === 'km' ? 'រាយការណ៍យឺតយ៉ាវ' : 'Report Delay'}
              </button>

              <button
                onClick={handleReportVehicleIssue}
                className="bg-white hover:bg-purple-50 text-purple-700 font-bold py-3 px-3 rounded-xl border border-purple-200 text-sm shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <Wrench className="w-4 h-4 text-purple-600" /> {language === 'km' ? 'រាយការណ៍បញ្ហារថយន្ត' : 'Report Issue'}
              </button>

              <button
                onClick={handleContactSchool}
                className="bg-white hover:bg-blue-50 text-blue-700 font-bold py-3 px-3 rounded-xl border border-blue-200 text-sm shadow-xs flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <Phone className="w-4 h-4 text-blue-600" /> {language === 'km' ? 'ទាក់ទងសាលា' : 'Contact School'}
              </button>

              <button
                onClick={handleCompleteRoute}
                className="col-span-2 bg-blue-900 hover:bg-blue-950 text-white font-bold py-3.5 px-4 rounded-xl text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <CheckCircle2 className="w-5 h-5" /> {language === 'km' ? 'បញ្ចប់ខ្សែរត់' : 'Complete Route'}
              </button>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex items-center justify-between text-sm sm:text-base">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block font-medium">{language === 'km' ? 'ទីតាំងបច្ចុប្បន្ន' : 'Current Location'}</span>
                <strong className="text-slate-900 font-bold">{language === 'km' ? 'ក្បែរច្បារអំពៅ ភ្នំពេញ' : 'Near Chbar Ampov'}</strong>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <Clock className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block font-medium">{language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ' : 'Last Update'}</span>
                <strong className="text-slate-900 font-bold">{lastUpdated}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: My Students & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: My Students Table (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl">{t('nav.myStudents')}</h3>
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder={t('students.searchPlaceholder')}
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 min-h-[42px]"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-semibold min-h-[42px]"
              >
                <option value="all">{language === 'km' ? 'ស្ថានភាពទាំងអស់' : 'All Statuses'}</option>
                <option value="picked_up">{t('students.pickedUp')}</option>
                <option value="waiting">{t('students.waiting')}</option>
                <option value="dropped_off">{t('students.droppedOff')}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base">
              <thead>
                <tr className="text-slate-600 font-bold border-b border-slate-200 text-xs sm:text-sm uppercase tracking-wide">
                  <th className="pb-3">{t('students.studentName')}</th>
                  <th className="pb-3">ID</th>
                  <th className="pb-3">{t('students.pickup')}</th>
                  <th className="pb-3">{t('students.dropoff')}</th>
                  <th className="pb-3">{t('students.status')}</th>
                  <th className="pb-3 text-right">{language === 'km' ? 'សកម្មភាព' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.slice(0, 5).map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center text-xs shrink-0">
                        #{s.pickupOrder || idx + 1}
                      </span>
                      <div>
                        <span className="text-sm sm:text-base font-bold">{s.name}</span>
                        <span className="block text-xs text-slate-500 font-medium">{s.grade}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-600 text-xs sm:text-sm">{s.id}</td>
                    <td className="py-3.5 text-slate-700 truncate max-w-[150px]">{s.pickupAddress}</td>
                    <td className="py-3.5 text-slate-700 truncate max-w-[120px]">{s.dropoffAddress || 'ITC School'}</td>
                    <td className="py-3.5">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        s.status === 'picked_up' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'waiting' ? 'bg-amber-100 text-amber-800' : 
                        s.status === 'absent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {s.status === 'picked_up' ? (s.pickedUpAt ? `${t('students.pickedUp')} (${s.pickedUpAt})` : t('students.pickedUp')) : 
                         s.status === 'waiting' ? t('students.waiting') : 
                         s.status === 'absent' ? 'Absent' : t('students.droppedOff')}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {s.status === 'waiting' ? (
                        <button
                          onClick={() => handleStudentPickedUp(s.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5 min-h-[38px] cursor-pointer"
                        >
                          <span>✓</span>
                          <span>{language === 'km' ? 'បានឡើង' : 'Pick Up'}</span>
                        </button>
                      ) : s.status === 'picked_up' ? (
                        <span className="text-emerald-700 font-bold text-sm inline-flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>{s.pickedUpAt || 'Ready'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2.5 text-sm text-slate-600 font-medium">
            <span>
              {language === 'km' 
                ? `បង្ហាញ ${formatNumber(Math.min(5, filteredStudents.length))} នៃ ${formatNumber(assignedStudents.length)} សិស្ស` 
                : `Showing ${Math.min(5, filteredStudents.length)} of ${assignedStudents.length} students`}
            </span>
            <button onClick={() => onNavigate('my-students')} className="font-bold text-blue-600 hover:underline flex items-center gap-1">
              {language === 'km' ? 'មើលសិស្សទាំងអស់ →' : 'View All Students →'}
            </button>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-lg sm:text-xl">
              {language === 'km' ? 'សកម្មភាពថ្មីៗ' : 'Recent Activity'}
            </h3>
            <button onClick={() => onNavigate('trip-history')} className="text-sm font-bold text-blue-600 hover:underline">
              {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 text-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{t('students.pickedUp')}</span>
                  <span className="text-xs text-slate-500 font-normal">07:45 AM</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Sokha Sarya • Stop 1 (ITC School)</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{language === 'km' ? 'បានមកដល់ចំណត' : 'Arrived at Stop'}</span>
                  <span className="text-xs text-slate-500 font-normal">08:05 AM</span>
                </div>
                <p className="text-[11px] text-slate-500">Tuol Kork</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{t('students.droppedOff')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">08:10 AM</span>
                </div>
                <p className="text-[11px] text-slate-500">Pheakdey Rith • Stop 3 (Chbar Ampov)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student QR Scanner Modal */}
      <DriverQRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        activeBus={bus}
        activeRoute={route}
        onStudentVerified={student => {
          triggerActionMessage(
            language === 'km'
              ? `✓ បានស្កេនកូដ QR ជោគជ័យ! ${student.name} បានឡើងរថយន្ត។ បានជូនដំណឹងទៅអាណាព្យាបាលរួចរាល់។`
              : `✓ QR Code Verified! ${student.name} confirmed Picked Up. Parent notified.`
          );
        }}
      />

      {/* Bus Door Boarding Pass Sticker QR Modal */}
      <BusBoardingStickerQRModal
        bus={bus}
        isOpen={showStickerModal}
        onClose={() => setShowStickerModal(false)}
        onLaunchScanner={() => {
          setShowStickerModal(false);
          setShowQRScanner(true);
        }}
      />

      {/* Emergency Bus Breakdown & Replacement Modal */}
      <EmergencyBreakdownModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        bus={bus}
        driver={driver}
        route={route}
      />
    </div>
  );
}
