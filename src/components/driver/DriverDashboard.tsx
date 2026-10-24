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
    <div className="space-y-6 pb-12">
      {/* Top Header & Date / On Duty pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'km' ? 'ផ្ទាំងគ្រប់គ្រងអ្នកបើកបរ' : 'Driver Dashboard'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'km' ? 'គ្រប់គ្រងខ្សែរត់ សិស្ស និងធានាសុវត្ថិភាពការធ្វើដំណើរ។' : 'Manage your route, students and keep everyone safe.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{language === 'km' ? 'ថ្ងៃព្រហស្បតិ៍ ទី១៦ ខែតុលា ឆ្នាំ២០២៥' : 'Thu, Oct 16, 2025'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t('drivers.onDuty')}
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" /> {actionMessage}
        </div>
      )}

      {/* Active Emergency Breakdown Alert Banner for Driver */}
      {activeEmergencyTrip && (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 rounded-3xl p-5 text-white shadow-xl shadow-rose-950/20 border-2 border-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  {language === 'km' ? '🚨 របាយការណ៍អាសន្នកំពុងដំណើរការ' : '🚨 ACTIVE BREAKDOWN INCIDENT'}
                </span>
                <span className="text-xs font-black text-rose-100">
                  {activeEmergencyTrip.status === 'emergency_replacement_required' 
                    ? (language === 'km' ? 'រង់ចាំរដ្ឋបាលចាត់តាំងរថយន្តជំនួស' : 'Awaiting Replacement Dispatch')
                    : (language === 'km' ? 'រថយន្តជំនួសបានចេញដំណើរ' : 'Replacement Dispatched')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                {language === 'km' ? 'រថយន្តខូចតាមផ្លូវ • រដ្ឋបាលសាលាបានទទួលដំណឹង' : 'Bus Breakdown Reported • Admin Alerted'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowBreakdownModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{language === 'km' ? 'មើលស្ថានភាពអាសន្ន & ផ្ទេរសិស្ស' : 'Emergency Status & Student Transfers'}</span>
          </button>
        </div>
      )}

      {/* Prominent Live Turn-by-Turn GPS Navigation Mode Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-blue-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-500/30">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5 text-blue-300" />
            <span>{language === 'km' ? 'ប្រព័ន្ធនាំផ្លូវ GPS & ទទួលសិស្ស' : 'Live Navigation & Pickup Console'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {language === 'km' ? 'ចាប់ផ្តើមការរុករកតាមផ្លូវ & កត់ត្រាឡើងរថយន្ត' : 'Turn-by-Turn Route Navigation & Pickup'}
          </h3>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            {language === 'km'
              ? 'ផែនទីចរាចរណ៍ភ្នំពេញផ្ទាល់ បង្ហាញទីតាំងចំណតសិស្សតាមលំដាប់ ការនាំផ្លូវមួយជំហានម្តងៗ និងប៊ូតុងធំសម្រាប់ចុចទទួលសិស្ស និងជូនដំណឹងស្វ័យប្រវត្តទៅអាណាព្យាបាល។'
              : 'Interactive Phnom Penh map, sequential student pickup order, turn-by-turn routing, large driving buttons, and automatic parent alerts.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('my-route')}
          className="w-full md:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-blue-50 text-blue-800 font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg shadow-black/20 transition-all transform active:scale-97 cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
            ▶
          </div>
          <span>{language === 'km' ? 'បើកប្រព័ន្ធនាំផ្លូវ (Launch Navigation)' : 'Start Route Navigation'}</span>
        </button>
      </div>

      {/* 6 Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Assigned Bus */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Bus className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('drivers.assignedBus')}</p>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{bus?.busNumber || 'Bus 03'}</h3>
          <p className="text-[10px] text-slate-400 truncate">{bus?.model || 'Toyota Coaster'}</p>
        </div>

        {/* Today's Route */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Navigation className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('nav.myRoute')}</p>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{localize(route?.name, route?.nameKh) || 'Route 1'}</h3>
          <p className="text-[10px] text-slate-400 truncate">{language === 'km' ? 'តិចណូ ITC → ទួលគោក' : 'ITC School → Royal School'}</p>
        </div>

        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('dashboard.totalStudents')}</p>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{formatNumber(assignedStudents.length || 12)}</h3>
          <p className="text-[10px] text-slate-400 truncate">{language === 'km' ? 'សិស្សក្នុងខ្សែរត់នេះ' : '(Assigned to this route)'}</p>
        </div>

        {/* Students Picked Up */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('students.pickedUp')}</p>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{formatNumber(pickedUpCount)} / {formatNumber(assignedStudents.length || 12)}</h3>
          <p className="text-[10px] text-emerald-600 font-semibold">{language === 'km' ? 'បានផ្ទៀងផ្ទាត់' : 'Ridership verified'}</p>
        </div>

        {/* Next Stop */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('driverPortal.nextStop')}</p>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{language === 'km' ? 'ច្បារអំពៅ' : 'Chbar Ampov'}</h3>
          <p className="text-[10px] text-amber-600 font-semibold">{t('dashboard.eta')}: 08:20 AM</p>
        </div>

        {/* Route Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-medium truncate">{t('routes.status')}</p>
          <h3 className="text-base font-bold text-emerald-600 mt-0.5 uppercase">{t('routes.inProgress')}</h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[42%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Middle Section: Interactive Map on Left & Route Information / Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map + Header Banner */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">{localize(route?.name, route?.nameKh) || 'Route 1'}</span>
              <span className="text-xs font-semibold text-slate-700">
                {language === 'km' ? 'វិទ្យាស្ថានតិចណូ ITC → សាលាទួលគោក' : 'ITC School → Royal School'}
              </span>
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
            <InteractiveMap schools={[]} buses={[bus]} students={assignedStudents} routes={[route]} height="500px" />
          </div>
        </div>

        {/* Right: Route Information & Controls */}
        <div className="space-y-6">
          {/* Route Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'km' ? 'ព័ត៌មានខ្សែរត់' : 'Route Information'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                {t('routes.inProgress')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{bus?.busNumber || 'Bus 03'}</span>
                <span className="text-xs text-slate-500">{bus?.model || 'Toyota Coaster'}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                <div className="flex justify-between"><span>{t('routes.routeName')}:</span> <strong className="text-slate-900">{localize(route?.name, route?.nameKh) || 'Route 1'}</strong></div>
                <div className="flex justify-between"><span>{t('routes.school')}:</span> <strong className="text-slate-900">{language === 'km' ? 'វិទ្យាស្ថានតិចណូ ITC' : 'ITC School'}</strong></div>
                <div className="flex justify-between"><span>{t('routes.driver')}:</span> <strong className="text-slate-900">{driver?.name || 'Chan Dara'}</strong></div>
                <div className="flex justify-between font-mono text-[11px] text-blue-600"><span>{t('drivers.phone')}:</span> <span>{driver?.phone || '+855 12 345 678'}</span></div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{language === 'km' ? 'វឌ្ឍនភាពខ្សែរត់' : 'Route Progress'}</span>
                  <span>42%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[42%] rounded-full"></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block">{t('driverPortal.nextStop')}</span>
                  <strong className="text-slate-900 text-xs">{language === 'km' ? 'ច្បារអំពៅ' : 'Chbar Ampov'}</strong>
                  <span className="text-[10px] text-amber-600 block">{t('dashboard.eta')}: 08:20 AM</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block">{language === 'km' ? 'ចំណតនៅសល់' : 'Remaining Stops'}</span>
                  <strong className="text-slate-900 text-base">{formatNumber(5)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Route Controls (8 Functional Buttons) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'km' ? 'ការបញ្ជាខ្សែរត់' : 'Route Controls'}
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowQRScanner(true)}
                className="col-span-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-400/30"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>{language === 'km' ? 'ស្កេនកូដ QR សិស្សឡើងរថយន្ត' : 'Scan Student Boarding QR Code'}</span>
              </button>

              <button
                onClick={() => setShowStickerModal(true)}
                className="col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>{language === 'km' ? 'ប័ណ្ណកូដ QR បិទលើរថយន្ត & កំណត់ចំណាំ' : 'Bus Door Sticker QR & In-App Notes'}</span>
              </button>

              <button
                onClick={() => setShowBreakdownModal(true)}
                className="col-span-2 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-700 hover:to-red-700 text-white font-black py-3 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-rose-400/40"
              >
                <AlertOctagon className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>{language === 'km' ? '🚨 អាសន្ន / រាយការណ៍រថយន្តខូច (Emergency / Breakdown)' : '🚨 Emergency / Bus Breakdown Report'}</span>
              </button>

              <button
                onClick={handleStartRoute}
                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" /> {language === 'km' ? 'ចាប់ផ្តើមខ្សែរត់' : 'Start Route'}
              </button>

              <button
                onClick={handleArrivedAtStop}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-3 rounded-xl border border-slate-200 text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> {language === 'km' ? 'បានមកដល់ចំណត' : 'Arrived at Stop'}
              </button>

              <button
                onClick={() => handleStudentPickedUp()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'km' ? 'សិស្សឡើងរថយន្ត' : 'Student Picked Up'}
              </button>

              <button
                onClick={handleStudentDroppedOff}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-3 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> {language === 'km' ? 'សិស្សចុះរថយន្ត' : 'Student Dropped Off'}
              </button>

              <button
                onClick={handleReportDelay}
                className="bg-white hover:bg-rose-50 text-rose-600 font-semibold py-2.5 px-3 rounded-xl border border-rose-200 text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> {language === 'km' ? 'រាយការណ៍យឺតយ៉ាវ' : 'Report Delay'}
              </button>

              <button
                onClick={handleReportVehicleIssue}
                className="bg-white hover:bg-purple-50 text-purple-600 font-semibold py-2.5 px-3 rounded-xl border border-purple-200 text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" /> {language === 'km' ? 'រាយការណ៍បញ្ហារថយន្ត' : 'Report Vehicle Issue'}
              </button>

              <button
                onClick={handleContactSchool}
                className="bg-white hover:bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 rounded-xl border border-blue-200 text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> {language === 'km' ? 'ទាក់ទងសាលា' : 'Contact School'}
              </button>

              <button
                onClick={handleCompleteRoute}
                className="col-span-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> {language === 'km' ? 'បញ្ចប់ខ្សែរត់' : 'Complete Route'}
              </button>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'km' ? 'ទីតាំងបច្ចុប្បន្ន' : 'Current Location'}</span>
                <strong className="text-slate-900">{language === 'km' ? 'ក្បែរច្បារអំពៅ ភ្នំពេញ' : 'Near Chbar Ampov'}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">{language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ' : 'Last Update'}</span>
                <strong className="text-slate-900">{lastUpdated}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: My Students & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: My Students Table (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-sm">{t('nav.myStudents')}</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('students.searchPlaceholder')}
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
              >
                <option value="all">{language === 'km' ? 'ស្ថានភាពទាំងអស់' : 'All Statuses'}</option>
                <option value="picked_up">{t('students.pickedUp')}</option>
                <option value="waiting">{t('students.waiting')}</option>
                <option value="dropped_off">{t('students.droppedOff')}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="pb-2.5">{t('students.studentName')}</th>
                  <th className="pb-2.5">ID</th>
                  <th className="pb-2.5">{t('students.pickup')}</th>
                  <th className="pb-2.5">{t('students.dropoff')}</th>
                  <th className="pb-2.5">{t('students.status')}</th>
                  <th className="pb-2.5 text-right">{language === 'km' ? 'សកម្មភាព' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.slice(0, 5).map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-[10px]">
                        #{s.pickupOrder || idx + 1}
                      </span>
                      <div>
                        <span>{s.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{s.grade}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-600">{s.id}</td>
                    <td className="py-3 text-slate-700 truncate max-w-[150px]">{s.pickupAddress}</td>
                    <td className="py-3 text-slate-700 truncate max-w-[120px]">{s.dropoffAddress || 'ITC School'}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        s.status === 'picked_up' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 
                        s.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.status === 'picked_up' ? (s.pickedUpAt ? `${t('students.pickedUp')} (${s.pickedUpAt})` : t('students.pickedUp')) : 
                         s.status === 'waiting' ? t('students.waiting') : 
                         s.status === 'absent' ? 'Absent' : t('students.droppedOff')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {s.status === 'waiting' ? (
                        <button
                          onClick={() => handleStudentPickedUp(s.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1"
                        >
                          <span>✓</span>
                          <span>{language === 'km' ? 'បានឡើង' : 'Pick Up'}</span>
                        </button>
                      ) : s.status === 'picked_up' ? (
                        <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{s.pickedUpAt || 'Ready'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              {language === 'km' 
                ? `បង្ហាញ ${formatNumber(Math.min(5, filteredStudents.length))} នៃ ${formatNumber(assignedStudents.length)} សិស្ស` 
                : `Showing ${Math.min(5, filteredStudents.length)} of ${assignedStudents.length} students`}
            </span>
            <button onClick={() => onNavigate('my-students')} className="font-semibold text-blue-600 hover:underline flex items-center gap-1">
              {language === 'km' ? 'មើលសិស្សទាំងអស់ →' : 'View All Students →'}
            </button>
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'km' ? 'សកម្មភាពថ្មីៗ' : 'Recent Activity'}
            </h3>
            <button onClick={() => onNavigate('trip-history')} className="text-xs font-semibold text-blue-600 hover:underline">
              {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{t('students.pickedUp')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">07:45 AM</span>
                </div>
                <p className="text-[11px] text-slate-500">Sokha Sarya • Stop 1 (ITC School)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{language === 'km' ? 'បានមកដល់ចំណត' : 'Arrived at Stop'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">08:05 AM</span>
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
