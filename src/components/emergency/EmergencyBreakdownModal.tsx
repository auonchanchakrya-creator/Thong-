import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, AlertCircle, Bus as BusIcon, Phone, MapPin, 
  Clock, Users, ArrowRight, CheckCircle2, Check, RefreshCw, X, 
  FileText, Wrench, ShieldCheck, LifeBuoy, AlertOctagon, Sparkles
} from 'lucide-react';
import { Bus, Driver, Route, Student } from '../../types';

interface EmergencyBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus?: Bus;
  driver?: Driver;
  route?: Route;
}

const BREAKDOWN_REASONS = [
  { id: 'engine_overheating', label: 'Engine Overheating / Radiator Failure', labelKh: 'ម៉ាស៊ីនឡើងកម្តៅខ្លាំង / បែកធុងទឹក', icon: '🔥' },
  { id: 'flat_tire', label: 'Flat Tire / Puncture on Route', labelKh: 'បែកកង់ / ធ្លាយកង់តាមផ្លូវ', icon: '🛞' },
  { id: 'electrical_failure', label: 'Battery / Alternator / Electrical Malfunction', labelKh: 'ដាច់ភ្លើង / អាគុយអស់ ឬខូចដាយណាម៉ូ', icon: '⚡' },
  { id: 'transmission', label: 'Transmission / Brake System Hazard', labelKh: 'បញ្ហាប្រអប់លេខ ឬហ្វ្រាំងមិនដំណើរការ', icon: '⚙️' },
  { id: 'minor_collision', label: 'Road Obstruction / Minor Traffic Mishap', labelKh: 'ការស្ទះផ្លូវ ឬប៉ះទង្គិចស្រាលតាមផ្លូវ', icon: '💥' },
  { id: 'other_mechanical', label: 'Other Serious Mechanical Fault', labelKh: 'បញ្ហាមេកានិកផ្សេងៗទៀត', icon: '⚠️' }
];

export function EmergencyBreakdownModal({
  isOpen,
  onClose,
  bus: propBus,
  driver: propDriver,
  route: propRoute
}: EmergencyBreakdownModalProps) {
  const { 
    buses, drivers, routes, students, 
    reportBusBreakdown, confirmStudentTransfer, completeAllStudentTransfersAndResume,
    activeEmergencyTrip, activeEmergencyIncident,
    language, formatNumber
  } = useApp();

  // Resolve current bus, driver, route
  const currentBus = propBus || buses.find(b => b.id === 'bus-101') || buses[0];
  const currentDriver = propDriver || drivers.find(d => d.id === currentBus?.driverId) || drivers[0];
  const currentRoute = propRoute || routes.find(r => r.id === currentBus?.id || r.id === 'rt-1') || routes[0];

  // Affected students
  const affectedStudents = students.filter(s => s.busId === currentBus?.id || s.routeId === currentRoute?.id);
  const onBoardStudents = affectedStudents.filter(s => s.status === 'picked_up');
  const waitingStudents = affectedStudents.filter(s => s.status === 'waiting');

  // Breakdown report form state
  const [selectedReason, setSelectedReason] = useState<string>(BREAKDOWN_REASONS[0].id);
  const [address, setAddress] = useState<string>('Russian Confederation Blvd (near 5 Makara Bridge), Toul Kork, Phnom Penh');
  const [addressKh, setAddressKh] = useState<string>('មហាវិថីសហព័ន្ធរុស្ស៊ី (ជិតស្ពានអាកាស ៥ មករា) ខណ្ឌទួលគោក រាជធានីភ្នំពេញ');
  const [notes, setNotes] = useState<string>('Bus safely moved to roadside curb. Hazard lights flashing. Students are safe inside.');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Check if an emergency breakdown is currently reported for this bus or trip
  const isEmergencyActive = !!(
    activeEmergencyTrip && 
    (activeEmergencyTrip.busId === currentBus?.id || activeEmergencyTrip.routeId === currentRoute?.id)
  );

  const replacementBus = buses.find(b => b.id === activeEmergencyTrip?.replacementBusId);
  const replacementDriver = drivers.find(d => d.id === activeEmergencyTrip?.replacementDriverId);
  const transferredCount = activeEmergencyTrip?.transferredStudentIds?.length || 0;

  const handleSubmitBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const reasonObj = BREAKDOWN_REASONS.find(r => r.id === selectedReason);
      const reasonText = language === 'km' 
        ? `${reasonObj?.labelKh || selectedReason}` 
        : `${reasonObj?.label || selectedReason}`;

      await reportBusBreakdown({
        busId: currentBus.id,
        driverId: currentDriver.id,
        routeId: currentRoute.id,
        reason: reasonText,
        notes: notes.trim(),
        location: {
          lat: currentBus.currentLat || 11.5650,
          lng: currentBus.currentLng || 104.9100,
          address: address.trim(),
          addressKh: addressKh.trim()
        }
      });

      setActionFeedback(
        language === 'km'
          ? '🚨 បានរាយការណ៍អាសន្នជោគជ័យ! ការជូនដំណឹងបន្ទាន់ត្រូវបានបញ្ជូនទៅរដ្ឋបាលសាលា និងអាណាព្យាបាលរួចរាល់។'
          : '🚨 Emergency breakdown reported! High-priority alert sent to School Admin and Parents.'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferStudent = async (studentId: string) => {
    setTransferringId(studentId);
    try {
      await confirmStudentTransfer({
        studentId,
        tripId: activeEmergencyTrip?.id,
        transferredByDriverId: currentDriver?.id
      });
      setActionFeedback(
        language === 'km'
          ? '✓ បានផ្ទេរសិស្សឡើងរថយន្តជំនួស! អាណាព្យាបាលត្រូវបានជូនដំណឹងរួចរាល់។'
          : '✓ Student safely transferred to replacement bus! Parent notified.'
      );
      setTimeout(() => setActionFeedback(null), 3000);
    } finally {
      setTransferringId(null);
    }
  };

  const handleTransferAllStudents = async () => {
    setSubmitting(true);
    try {
      for (const student of affectedStudents) {
        if (!activeEmergencyTrip?.transferredStudentIds?.includes(student.id)) {
          await confirmStudentTransfer({
            studentId: student.id,
            tripId: activeEmergencyTrip?.id,
            transferredByDriverId: currentDriver?.id
          });
        }
      }
      setActionFeedback(
        language === 'km'
          ? '✓ បានផ្ទេរសិស្សទាំងអស់ឡើងរថយន្តជំនួសជោគជ័យ!'
          : '✓ All students transferred safely to replacement bus!'
      );
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteResume = async () => {
    if (!activeEmergencyTrip?.replacementBusId) return;
    setSubmitting(true);
    try {
      await completeAllStudentTransfersAndResume({
        tripId: activeEmergencyTrip.id,
        routeId: currentRoute.id,
        replacementBusId: activeEmergencyTrip.replacementBusId
      });
      setActionFeedback(
        language === 'km'
          ? '✓ ការផ្ទេរសិស្សបានបញ្ចប់! រថយន្តជំនួសបន្តដំណើរទៅសាលារៀន។'
          : '✓ Transfer complete! Replacement bus has resumed route to school.'
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-rose-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-5 sm:p-6 text-white relative flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider mb-1">
                <span>{language === 'km' ? 'ប្រព័ន្ធសង្គ្រោះ & រថយន្តជំនួសបន្ទាន់' : 'Emergency & Bus Breakdown Protocol'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {language === 'km' ? 'រាយការណ៍រថយន្តខូច & ស្នើសុំរថយន្តជំនួស' : 'Bus Breakdown Emergency Report'}
              </h2>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                {language === 'km' 
                  ? 'បញ្ជូនដំណឹងបន្ទាន់ភ្លាមៗទៅកាន់រដ្ឋបាលសាលា និងអាណាព្យាបាលសិស្សទាំងអស់' 
                  : 'Immediately alerts School Administrator, routes spare bus, and keeps parents informed'}
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
        {actionFeedback && (
          <div className="m-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* ACTIVE BREAKDOWN STATUS CARD (If incident already reported) */}
          {isEmergencyActive ? (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                    <span className="text-xs font-black uppercase text-rose-800 tracking-wider">
                      {language === 'km' ? 'ស្ថានភាពអាសន្នកំពុងដំណើរការ' : 'ACTIVE EMERGENCY INCIDENT'}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-200/80 text-rose-900 text-xs font-extrabold">
                    {activeEmergencyTrip?.status === 'emergency_replacement_required' && (
                      language === 'km' ? 'រង់ចាំរដ្ឋបាលចាត់តាំងរថយន្តជំនួស' : 'Emergency — Replacement Required'
                    )}
                    {activeEmergencyTrip?.status === 'replacement_dispatched' && (
                      language === 'km' ? 'រថយន្តជំនួសបានចេញដំណើរមកដល់' : 'Replacement Bus Dispatched'
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold block">{language === 'km' ? 'រថយន្តជួបឧប្បត្តិហេតុ' : 'Broken-Down Bus'}</span>
                    <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <BusIcon className="w-4 h-4 text-rose-600" />
                      <span>{currentBus.busNumber} ({currentBus.plateNumber})</span>
                    </div>
                    <span className="text-slate-500 text-[11px] block">{currentBus.model}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold block">{language === 'km' ? 'មូលហេតុ & ម៉ោងរាយការណ៍' : 'Reason & Time'}</span>
                    <strong className="text-slate-900 block truncate">{activeEmergencyTrip?.breakdownReason || 'Mechanical breakdown'}</strong>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {activeEmergencyTrip?.breakdownTime || 'Just now'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{language === 'km' ? 'ទីតាំងរថយន្តខូច (ភ្នំពេញ)' : 'Breakdown Location (Phnom Penh)'}:</span>
                  </div>
                  <p className="text-slate-600 pl-5 font-medium">
                    {language === 'km' 
                      ? (activeEmergencyTrip?.breakdownLocation?.addressKh || activeEmergencyTrip?.breakdownLocation?.address || addressKh)
                      : (activeEmergencyTrip?.breakdownLocation?.address || address)}
                  </p>
                </div>
              </div>

              {/* REPLACEMENT BUS STATUS (If dispatched by Admin) */}
              {activeEmergencyTrip?.status === 'replacement_dispatched' && replacementBus ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-black text-emerald-950 text-sm">
                        {language === 'km' ? 'រថយន្តជំនួសបានចាត់តាំងរួចរាល់!' : 'Replacement Bus Approved & Dispatched!'}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black animate-pulse">
                      ETA: ~{activeEmergencyTrip.replacementEtaMinutes || 12} mins
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'រថយន្តជំនួស' : 'Replacement Vehicle'}</span>
                      <strong className="text-slate-900 text-sm block mt-0.5">{replacementBus.busNumber}</strong>
                      <span className="text-slate-600 text-[11px] block">{replacementBus.plateNumber} • {replacementBus.model}</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{language === 'km' ? 'អ្នកបើកបរជំនួស' : 'Replacement Driver'}</span>
                      <strong className="text-slate-900 text-sm block mt-0.5">{replacementDriver?.name || 'Sok Vichea'}</strong>
                      <a 
                        href={`tel:${replacementDriver?.phone || '+85512778990'}`}
                        className="text-blue-600 font-bold text-xs inline-flex items-center gap-1 mt-1 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{replacementDriver?.phone || '+855 12 778 990'}</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800 bg-emerald-100/60 p-3 rounded-xl leading-relaxed">
                    {language === 'km'
                      ? 'អាណាព្យាបាលសិស្សទាំងអស់ត្រូវបានផ្ញើសារ SMS និងការជូនដំណឹងពីព័ត៌មានរថយន្តជំនួសរួចរាល់។ សូមរង់ចាំរថយន្តមកដល់ ដើម្បីផ្ទេរសិស្សឡើងរថយន្ត។'
                      : 'All parents have received notification with replacement bus plate and driver info. Prepare students to safely transfer upon arrival.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-amber-950">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>{language === 'km' ? 'កំពុងរង់ចាំការយល់ព្រមពីរដ្ឋបាលសាលា...' : 'Awaiting Administrator Dispatch Approval...'}</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {language === 'km'
                      ? 'សេចក្តីជូនដំណឹងអាសន្នបានទៅដល់ផ្ទាំងបញ្ជារបស់រដ្ឋបាលសាលាហើយ។ រដ្ឋបាលកំពុងជ្រើសរើសរថយន្តបម្រុងដើម្បីចេញដំណើរ។'
                      : 'The emergency alert has arrived on the School Admin dashboard. Administrator approval is required before replacement bus is dispatched.'}
                  </p>
                </div>
              )}

              {/* STUDENT TRANSFER CHECKLIST (Requirement 4 & 5) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{language === 'km' ? 'បញ្ជីផ្ទេរសិស្សឡើងរថយន្តជំនួស' : 'Student Transfer Manifest'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                      {transferredCount}/{affectedStudents.length}
                    </span>
                  </h4>

                  {activeEmergencyTrip?.status === 'replacement_dispatched' && (
                    <button
                      type="button"
                      onClick={handleTransferAllStudents}
                      disabled={submitting || transferredCount === affectedStudents.length}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-xs"
                    >
                      {language === 'km' ? 'ផ្ទេរទាំងអស់ដោយសុវត្ថិភាព' : 'Transfer All Safe'}
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  {affectedStudents.map(student => {
                    const isTransferred = activeEmergencyTrip?.transferredStudentIds?.includes(student.id);
                    return (
                      <div key={student.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs truncate">{student.name}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">{student.grade}</span>
                            {student.status === 'picked_up' ? (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">{language === 'km' ? 'នៅលើរថយន្ត' : 'On-Board'}</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-extrabold">{language === 'km' ? 'កំពុងរង់ចាំ' : 'Waiting'}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{student.pickupAddress}</p>
                        </div>

                        <div>
                          {isTransferred ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1 border border-emerald-200">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{language === 'km' ? 'បានផ្ទេររួច' : 'Transferred'}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTransferStudent(student.id)}
                              disabled={transferringId === student.id || activeEmergencyTrip?.status !== 'replacement_dispatched'}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-extrabold cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                            >
                              {transferringId === student.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <ArrowRight className="w-3 h-3" />
                              )}
                              <span>{language === 'km' ? 'ផ្ទេរឡើងរថយន្ត' : 'Confirm Transfer'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {activeEmergencyTrip?.status === 'replacement_dispatched' && transferredCount === affectedStudents.length && (
                  <button
                    type="button"
                    onClick={handleCompleteResume}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-5 rounded-2xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{language === 'km' ? 'បញ្ចប់ការផ្ទេរសិស្ស & បន្តដំណើរទៅសាលា' : 'Complete All Transfers & Resume Route to School'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 px-5 rounded-2xl text-xs cursor-pointer transition-colors text-center"
                >
                  {language === 'km' ? 'បិទផ្ទាំង' : 'Close Window'}
                </button>
              </div>
            </div>
          ) : (
            /* REPORT NEW BREAKDOWN FORM (Requirement 1) */
            <form onSubmit={handleSubmitBreakdown} className="space-y-5">
              
              {/* Trip & Bus Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">{language === 'km' ? 'រថយន្ត' : 'Vehicle'}</span>
                  <strong className="text-slate-900 font-black text-sm">{currentBus.busNumber}</strong>
                  <span className="text-slate-500 block text-[11px]">{currentBus.plateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">{language === 'km' ? 'អ្នកបើកបរ' : 'Driver'}</span>
                  <strong className="text-slate-900 font-black text-sm">{currentDriver.name}</strong>
                  <span className="text-slate-500 block text-[11px]">{currentDriver.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">{language === 'km' ? 'សិស្សប៉ះពាល់' : 'Affected Students'}</span>
                  <strong className="text-rose-600 font-black text-sm">
                    {affectedStudents.length} {language === 'km' ? 'នាក់' : 'students'}
                  </strong>
                  <span className="text-slate-500 block text-[11px]">
                    {onBoardStudents.length} {language === 'km' ? 'លើឡាន' : 'on-board'} • {waitingStudents.length} {language === 'km' ? 'រង់ចាំ' : 'waiting'}
                  </span>
                </div>
              </div>

              {/* Breakdown Reason Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  {language === 'km' ? 'ជ្រើសរើសមូលហេតុនៃការខូចរថយន្ត *' : 'Select Breakdown Reason *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BREAKDOWN_REASONS.map(reason => {
                    const isSelected = selectedReason === reason.id;
                    return (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => setSelectedReason(reason.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-300' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl shrink-0">{reason.icon}</span>
                        <div className="text-xs min-w-0">
                          <p className="font-extrabold truncate">{language === 'km' ? reason.labelKh : reason.label}</p>
                          <p className="text-[10px] text-slate-400 truncate">{language === 'km' ? reason.label : reason.labelKh}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>{language === 'km' ? 'ទីតាំងរថយន្តកំពុងឈប់នៅភ្នំពេញ *' : 'Current Breakdown Location (Phnom Penh) *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={language === 'km' ? addressKh : address}
                  onChange={e => {
                    if (language === 'km') setAddressKh(e.target.value);
                    else setAddress(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="e.g. Russian Confederation Blvd, Toul Kork"
                />
              </div>

              {/* Additional notes */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'km' ? 'ព័ត៌មានបន្ថែមសម្រាប់រដ្ឋបាលសាលា' : 'Additional Notes for School Admin'}</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="e.g. Bus parked safely on right curb. AC not working, all students calm."
                />
              </div>

              {/* Safety Instructions Checklist */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <span className="font-black text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{language === 'km' ? 'វិធានសុវត្ថិភាពជាកាតព្វកិច្ចរបស់អ្នកបើកបរ' : 'Driver Safety Check Before Submitting'}</span>
                </span>
                <ul className="text-amber-900 space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                  <li>{language === 'km' ? 'បើកភ្លើងសញ្ញាអាសន្ន (Hazard lights) និងចតកៀនចិញ្ចើមផ្លូវដោយសុវត្ថិភាព' : 'Turn on hazard lights and ensure vehicle is secured safely on the shoulder'}</li>
                  <li>{language === 'km' ? 'រក្សាសិស្សានុសិស្សទាំងអស់ក្នុងរថយន្ត ឬកន្លែងមានសុវត្ថិភាព ហាមដើររហេតរហូត' : 'Keep all children calm and seated inside the vehicle or safe walkway'}</li>
                  <li>{language === 'km' ? 'រង់ចាំរដ្ឋបាលសាលាអនុម័ត និងបញ្ជូនរថយន្តជំនួសមកដល់ទីតាំង' : 'Wait for School Admin to approve and dispatch the replacement bus'}</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-700 hover:to-red-700 text-white font-black py-3.5 px-5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-rose-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertOctagon className="w-4 h-4" />
                  )}
                  <span>{language === 'km' ? '🚨 បញ្ជាក់ & បញ្ជូនដំណឹងអាសន្នទៅរដ្ឋបាល' : '🚨 Confirm & Dispatch Emergency Alert'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 px-5 rounded-2xl text-xs cursor-pointer transition-colors text-center"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
