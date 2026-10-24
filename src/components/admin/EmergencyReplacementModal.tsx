import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertOctagon, AlertTriangle, Bus as BusIcon, UserCheck, CheckCircle2, 
  MapPin, Clock, Users, ArrowRight, ShieldCheck, Phone, Check, 
  RefreshCw, X, FileText, Send, Sparkles, LifeBuoy, AlertCircle, Building2
} from 'lucide-react';
import { Bus, Driver, Student } from '../../types';

interface EmergencyReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyReplacementModal({ isOpen, onClose }: EmergencyReplacementModalProps) {
  const { 
    buses, drivers, routes, students, trips, incidents,
    assignReplacementBus, confirmStudentTransfer, completeAllStudentTransfersAndResume,
    activeEmergencyTrip, activeEmergencyIncident,
    sendNotification,
    language, formatNumber
  } = useApp();

  // Find target incident and trip
  const incident = activeEmergencyIncident || incidents.find(i => i.type === 'breakdown');
  const trip = activeEmergencyTrip || trips.find(t => 
    t.status === 'emergency_replacement_required' || 
    t.status === 'replacement_dispatched'
  );

  const brokenBus = buses.find(b => b.id === incident?.busId || b.id === trip?.busId) || buses[0];
  const originalDriver = drivers.find(d => d.id === incident?.driverId || d.id === trip?.driverId) || drivers[0];
  const route = routes.find(r => r.id === incident?.routeId || r.id === trip?.routeId) || routes[0];

  // Affected students
  const affectedStudents = students.filter(s => s.busId === brokenBus.id || s.routeId === route.id);
  const onBoardStudents = affectedStudents.filter(s => s.status === 'picked_up');
  const waitingStudents = affectedStudents.filter(s => s.status === 'waiting');

  // Available replacement buses (status !== 'maintenance' and not broken bus)
  const availableBuses = buses.filter(b => b.id !== brokenBus.id && b.status !== 'maintenance');
  
  // Available standby drivers
  const availableDrivers = drivers.filter(d => d.id !== originalDriver.id);

  // Form selections
  const [selectedBusId, setSelectedBusId] = useState<string>(
    availableBuses.find(b => b.id === 'bus-104')?.id || availableBuses[0]?.id || ''
  );
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    availableDrivers.find(d => d.id === 'drv-3')?.id || availableDrivers[0]?.id || ''
  );
  const [etaMinutes, setEtaMinutes] = useState<number>(12);
  const [customInstructions, setCustomInstructions] = useState<string>(
    'Park safely behind broken-down vehicle. Assist driver Chan Dara with student transfer checklist.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [noBusAvailableMode, setNoBusAvailableMode] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDispatched = trip?.status === 'replacement_dispatched';
  const assignedReplacementBus = buses.find(b => b.id === trip?.replacementBusId);
  const assignedReplacementDriver = drivers.find(d => d.id === trip?.replacementDriverId);
  const transferredCount = trip?.transferredStudentIds?.length || 0;

  // Handle administrator approval and dispatch (Requirement 3: Never auto-dispatch without approval)
  const handleApproveAndDispatch = async () => {
    if (!selectedBusId || !selectedDriverId) return;
    setIsSubmitting(true);

    try {
      await assignReplacementBus({
        tripId: trip?.id,
        incidentId: incident?.id,
        originalBusId: brokenBus.id,
        routeId: route.id,
        replacementBusId: selectedBusId,
        replacementDriverId: selectedDriverId,
        etaMinutes,
        customNotes: customInstructions
      });

      setActionSuccessMsg(
        language === 'km'
          ? '✓ បានអនុម័ត និងបញ្ជូនរថយន្តជំនួសជោគជ័យ! ការជូនដំណឹងបានផ្ញើទៅអ្នកបើកបរ និងអាណាព្យាបាលរួចរាល់។'
          : '✓ Replacement bus approved & dispatched! Drivers and all affected parents notified with ETA.'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle "No Replacement Bus Available" Protocol (Requirement 5)
  const handleTriggerNoBusProtocol = () => {
    sendNotification({
      roleTarget: 'admin',
      title: language === 'km' ? '🚨 ប្រកាសអាសន្ន៖ គ្មានរថយន្តជំនួសក្នុងឃ្លាំង' : '🚨 CRITICAL: No Reserve Buses Available',
      message: language === 'km'
        ? `រដ្ឋបាលបានបើកដំណើរការពិធីសារបន្ទាន់៖ បញ្ជូនតាក់ស៊ីសាលា ឬទាក់ទងអាណាព្យាបាលមកទទួលផ្ទាល់។ ទីតាំងសិស្ស៖ ${incident?.location?.address || 'ភ្នំពេញ'}`
        : `Admin emergency protocol activated: School carrier taxi fleet mobilized / Direct parent pickup rendezvous coordinated. Location: ${incident?.location?.address || 'Phnom Penh'}`,
      type: 'alert'
    });

    setActionSuccessMsg(
      language === 'km'
        ? '⚠️ បានបើកដំណើរការពិធីសារបន្ទាន់ពិសេស (តាក់ស៊ីសាលា & ទាក់ទងអាណាព្យាបាល) រួចរាល់!'
        : '⚠️ Emergency backup protocol triggered: School shuttle taxi & direct parent pickup activated.'
    );
  };

  // Complete and resume trip
  const handleCompleteAndResume = async () => {
    if (!trip?.replacementBusId) return;
    setIsSubmitting(true);
    try {
      await completeAllStudentTransfersAndResume({
        tripId: trip.id,
        routeId: route.id,
        replacementBusId: trip.replacementBusId
      });
      setActionSuccessMsg(
        language === 'km'
          ? '✓ ការផ្ទេរសិស្សបានបញ្ចប់! រថយន្តជំនួសបានបន្តដំណើរទៅសាលារៀន។'
          : '✓ Transfer completed successfully! Replacement bus has resumed transit to school.'
      );
      setTimeout(() => onClose(), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-rose-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 p-5 sm:p-6 text-white flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider mb-1">
                <span>{language === 'km' ? 'ផ្ទាំងបញ្ជារដ្ឋបាលសាលា • ការសង្គ្រោះបន្ទាន់' : 'School Admin Emergency Command Center'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {language === 'km' ? 'ចាត់តាំងរថយន្តជំនួស & គ្រប់គ្រងសុវត្ថិភាពសិស្ស' : 'Emergency Bus Replacement & Safety Dispatch'}
              </h2>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                {language === 'km' 
                  ? 'រថយន្តសាលាបានរាយការណ៍ខូចតាមផ្លូវ • ទាមទារការអនុម័តពីរដ្ឋបាលសាលាដើម្បីបញ្ជូនរថយន្តជំនួស' 
                  : 'Bus breakdown reported on active route • Requires administrator approval to dispatch replacement bus'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {actionSuccessMsg && (
          <div className="m-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* 1. BREAKDOWN DETAILS & AFFECTED BUS INFO (Requirement 2) */}
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                <span className="text-xs font-black uppercase text-rose-800 tracking-wider">
                  {language === 'km' ? 'ឧប្បត្តិហេតុបច្ចេកទេស' : 'Active Breakdown Incident'}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-xs">
                {language === 'km' ? 'ស្ថានភាព៖ អាសន្ន — ត្រូវការរថយន្តជំនួស' : 'Status: Emergency — Replacement Required'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-rose-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'រថយន្តខូច' : 'Affected Bus'}</span>
                <strong className="text-slate-900 block text-sm mt-0.5">{brokenBus.busNumber}</strong>
                <span className="text-slate-500 text-[11px] block">{brokenBus.plateNumber}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'អ្នកបើកបរដើម' : 'Original Driver'}</span>
                <strong className="text-slate-900 block text-sm mt-0.5">{originalDriver.name}</strong>
                <a href={`tel:${originalDriver.phone}`} className="text-blue-600 font-bold text-[11px] block hover:underline">
                  {originalDriver.phone}
                </a>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'ខ្សែរត់សាលា' : 'Pickup Route'}</span>
                <strong className="text-slate-900 block text-sm mt-0.5 truncate">{route.name}</strong>
                <span className="text-slate-500 text-[11px] block">{route.startTime} - {route.endTime}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-rose-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'សិស្សរងផលប៉ះពាល់' : 'Affected Students'}</span>
                <strong className="text-rose-600 block text-sm mt-0.5 font-black">{affectedStudents.length} Students</strong>
                <span className="text-slate-500 text-[11px] block">{onBoardStudents.length} on-board • {waitingStudents.length} waiting</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{language === 'km' ? 'ទីតាំងរថយន្តឈប់ខូច' : 'Breakdown Location'}:</span>
                <span className="text-slate-600 font-medium">
                  {incident?.location?.address || 'Russian Confederation Blvd, near 5 Makara Bridge, Toul Kork'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 pl-5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{language === 'km' ? 'មូលហេតុដែលបានរាយការណ៍' : 'Reported Reason'}:</span>
                <span className="text-rose-700 font-bold">
                  {incident?.description || trip?.breakdownReason || 'Engine Overheating / Radiator Failure'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. REPLACEMENT BUS ASSIGNMENT (Requirement 3) */}
          {!isDispatched ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <BusIcon className="w-4 h-4 text-blue-600" />
                    <span>{language === 'km' ? 'ជ្រើសរើសរថយន្តជំនួស & អ្នកបើកបរ (តម្រូវឱ្យមានការអនុម័ត)' : 'Select Replacement Bus & Driver (Approval Required)'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'km'
                      ? 'រថយន្តជំនួសត្រូវតែឆ្លងកាត់ការអនុម័តពីរដ្ឋបាលសាលាមុនពេលចេញដំណើរជាផ្លូវការ'
                      : 'Replacement bus will not be dispatched without administrator sign-off.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNoBusAvailableMode(!noBusAvailableMode)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                >
                  {noBusAvailableMode 
                    ? (language === 'km' ? 'ត្រឡប់មករថយន្តសាលា' : 'Show Fleet Buses')
                    : (language === 'km' ? 'គ្មានរថយន្តទំនេរ?' : 'No Spare Bus Available?')}
                </button>
              </div>

              {noBusAvailableMode ? (
                /* No replacement bus fallback protocol (Requirement 5) */
                <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
                  <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
                    <LifeBuoy className="w-5 h-5 text-amber-600" />
                    <span>{language === 'km' ? 'ពិធីសារសង្គ្រោះបន្ទាន់ពេលគ្មានរថយន្តបម្រុង' : 'Contingency Protocol: No Spare Bus Available'}</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {language === 'km'
                      ? 'ប្រសិនបើគ្មានរថយន្តសាលាទំនេរក្នុងឃ្លាំងទេ រដ្ឋបាលសាលាអាចបើកដំណើរការបញ្ជូនតាក់ស៊ីសាលាដៃគូផ្លូវការ ឬជូនដំណឹងបន្ទាន់ទៅអាណាព្យាបាលដើម្បីមកទទួលសិស្សផ្ទាល់នៅទីតាំងរថយន្តខូច។'
                      : 'When all reserve school buses are deployed, administrator can activate partner school carrier shuttle taxis or notify parents for direct roadside rendezvous.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleTriggerNoBusProtocol}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'km' ? 'បើកដំណើរការតាក់ស៊ីសាលា & ជូនដំណឹងអាណាព្យាបាល' : 'Activate Carrier Taxi & Alert Parents'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Replacement Bus */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                      {language === 'km' ? '១. ជ្រើសរើសរថយន្តបម្រុងក្នុងឃ្លាំង *' : '1. Select Available Replacement Bus *'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableBuses.map(b => {
                        const isSelected = selectedBusId === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBusId(b.id)}
                            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-300 font-bold' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <BusIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 text-xs">
                              <p className="font-extrabold text-sm truncate">{b.busNumber}</p>
                              <p className="text-slate-500">{b.plateNumber} • {b.model}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                  {b.capacity} {language === 'km' ? 'កៅអី' : 'Seats'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {b.id === 'bus-104' ? 'Standby Depot (~8m)' : 'City Reserve'}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Replacement Driver */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                      {language === 'km' ? '២. ចាត់តាំងអ្នកបើកបរជំនួស *' : '2. Assign Replacement Driver *'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableDrivers.map(d => {
                        const isSelected = selectedDriverId === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDriverId(d.id)}
                            className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-300 font-bold' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <UserCheck className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 text-xs">
                              <p className="font-extrabold text-sm truncate">{d.name}</p>
                              <p className="text-slate-500">{d.phone}</p>
                              <span className="inline-block mt-1 text-[10px] px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
                                {d.licenseNumber}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ETA & Dispatch Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                        {language === 'km' ? 'ពេលវេលាមកដល់ (ETA) *' : 'Estimated Arrival (ETA) *'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="5"
                          max="45"
                          value={etaMinutes}
                          onChange={e => setEtaMinutes(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-500">{language === 'km' ? 'នាទី' : 'mins'}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                        {language === 'km' ? 'ការណែនាំពិសេសសម្រាប់អ្នកបើកបរជំនួស' : 'Instructions for Replacement Driver'}
                      </label>
                      <input
                        type="text"
                        value={customInstructions}
                        onChange={e => setCustomInstructions(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Park behind bus, assist with luggage"
                      />
                    </div>
                  </div>

                  {/* Primary Approval Dispatch Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleApproveAndDispatch}
                      disabled={isSubmitting || !selectedBusId || !selectedDriverId}
                      className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-black py-4 px-6 rounded-2xl text-xs sm:text-sm shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-amber-300" />
                      )}
                      <span>
                        {language === 'km' 
                          ? '✓ អនុម័ត & បញ្ជូនរថយន្តជំនួសជាផ្លូវការ (ជូនដំណឹងអាណាព្យាបាល & អ្នកបើកបរ)' 
                          : '✓ Approve & Officially Dispatch Replacement Bus (Notify Parents & Driver)'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 3. DISPATCHED STATE & STUDENT TRANSFER TRACKER (Requirements 4 & 5) */
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-black text-emerald-950 text-sm">
                      {language === 'km' ? 'ស្ថានភាព៖ រថយន្តជំនួសបានចេញដំណើរ (Replacement Bus Dispatched)' : 'Status: Replacement Bus Dispatched'}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black animate-pulse">
                    ETA: ~{trip.replacementEtaMinutes || 12} mins
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'រថយន្តជំនួសដែលបានចាត់តាំង' : 'Assigned Replacement Bus'}</span>
                    <strong className="text-slate-900 block text-sm mt-0.5">{assignedReplacementBus?.busNumber || 'Bus 04'}</strong>
                    <span className="text-slate-500 text-[11px] block">{assignedReplacementBus?.plateNumber} • {assignedReplacementBus?.model}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'អ្នកបើកបរជំនួស' : 'Replacement Driver'}</span>
                    <strong className="text-slate-900 block text-sm mt-0.5">{assignedReplacementDriver?.name || 'Sok Vichea'}</strong>
                    <span className="text-blue-600 font-bold text-[11px] block">{assignedReplacementDriver?.phone || '+855 12 778 990'}</span>
                  </div>
                </div>
              </div>

              {/* Student Transfer Live Audit Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{language === 'km' ? 'វឌ្ឍនភាពផ្ទេរសិស្សឡើងរថយន្តជំនួស' : 'Student Safety Transfer Tracking'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
                      {transferredCount}/{affectedStudents.length} {language === 'km' ? 'បានឡើង' : 'Transferred'}
                    </span>
                  </h4>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  {affectedStudents.map(student => {
                    const isTransferred = trip.transferredStudentIds?.includes(student.id);
                    return (
                      <div key={student.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs truncate">{student.name}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">{student.grade}</span>
                            {student.status === 'picked_up' ? (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">{language === 'km' ? 'នៅលើរថយន្តដើម' : 'On-Board'}</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-extrabold">{language === 'km' ? 'កំពុងរង់ចាំ' : 'Waiting'}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{student.pickupAddress}</p>
                        </div>

                        <div>
                          {isTransferred ? (
                            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1 border border-emerald-200">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{language === 'km' ? 'បានផ្ទេររួច' : 'Transferred'}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                await confirmStudentTransfer({ studentId: student.id, tripId: trip.id });
                              }}
                              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer transition-colors shadow-xs"
                            >
                              {language === 'km' ? 'កត់ត្រាការផ្ទេរ' : 'Confirm Transfer'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete & Resume Trip Button */}
              {transferredCount === affectedStudents.length && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteAndResume}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-5 rounded-2xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{language === 'km' ? 'បញ្ចប់ការផ្ទេរសិស្ស & បន្តដំណើរទៅសាលា' : 'Complete All Transfers & Mark Route Resumed'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Audit trail summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-500">
            <span className="font-bold text-slate-700 block uppercase text-[10px]">{language === 'km' ? 'កំណត់ត្រាសុវត្ថិភាពផ្លូវការ (Safety & Incident Audit Trail)' : 'Safety & Incident Audit Trail'}</span>
            <p>• {language === 'km' ? 'ម៉ោងរាយការណ៍ឧប្បត្តិហេតុ៖' : 'Breakdown Reported:'} {trip?.breakdownTime || '07:35 AM'} • {originalDriver.name}</p>
            {trip?.replacementDispatchedAt && (
              <p>• {language === 'km' ? 'ម៉ោងចាត់តាំងរថយន្តជំនួស៖' : 'Replacement Dispatched:'} {trip.replacementDispatchedAt} • {assignedReplacementBus?.busNumber}</p>
            )}
            <p>• {language === 'km' ? 'ការជូនដំណឹងអាណាព្យាបាល៖' : 'Parent Alerts:'} {language === 'km' ? 'បានបញ្ជូនដោយស្វ័យប្រវត្តិតាមរយៈ SMS/In-App ទៅគ្រប់អាណាព្យាបាលសិស្សដែលរងផលប៉ះពាល់' : 'Dispatched automatically via SMS/In-App to all affected guardians.'}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
