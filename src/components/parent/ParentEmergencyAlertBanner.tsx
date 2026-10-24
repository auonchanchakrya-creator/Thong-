import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, Bus as BusIcon, Phone, Clock, ShieldCheck, 
  CheckCircle2, MapPin, UserCheck, AlertOctagon 
} from 'lucide-react';
import { Student } from '../../types';

interface ParentEmergencyAlertBannerProps {
  student?: Student;
}

export function ParentEmergencyAlertBanner({ student: propStudent }: ParentEmergencyAlertBannerProps) {
  const { 
    currentUser, parents, students, buses, drivers, routes, trips, 
    activeEmergencyTrip, activeEmergencyIncident,
    language 
  } = useApp();

  const parent = parents.find(p => p.userId === currentUser?.id) || parents[0];
  const myChildren = students.filter(s => parent?.childrenIds?.includes(s.id));
  const activeStudent = propStudent || myChildren[0] || students[0];

  // Find if activeStudent is affected by activeEmergencyTrip
  const isStudentAffected = !!(
    activeEmergencyTrip && 
    (activeEmergencyTrip.busId === activeStudent?.busId || activeEmergencyTrip.routeId === activeStudent?.routeId)
  );

  if (!isStudentAffected || !activeEmergencyTrip) return null;

  const originalBus = buses.find(b => b.id === activeEmergencyTrip.busId);
  const originalDriver = drivers.find(d => d.id === activeEmergencyTrip.driverId);
  const replacementBus = buses.find(b => b.id === activeEmergencyTrip.replacementBusId);
  const replacementDriver = drivers.find(d => d.id === activeEmergencyTrip.replacementDriverId);

  const isTransferred = activeEmergencyTrip.transferredStudentIds?.includes(activeStudent.id);
  const isDispatched = activeEmergencyTrip.status === 'replacement_dispatched';

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-rose-950/20 border-2 border-white/30 animate-in fade-in duration-300 space-y-4">
      
      {/* Top Banner Status */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
            {isTransferred ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                {language === 'km' ? 'សេចក្តីជូនដំណឹងបន្ទាន់ពីសាលា' : 'URGENT TRANSIT NOTICE'}
              </span>
              <span className="text-xs font-black text-rose-100">
                {activeStudent?.name} ({activeStudent?.grade})
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              {isTransferred
                ? (language === 'km' ? `✓ កូនរបស់លោកអ្នកបានឡើងរថយន្តជំនួស (${replacementBus?.busNumber}) រួចរាល់!` : `✓ Child Safely Boarded Replacement Bus (${replacementBus?.busNumber})!`)
                : isDispatched
                  ? (language === 'km' ? `🚌 រថយន្តជំនួស (${replacementBus?.busNumber}) កំពុងធ្វើដំណើរមកដល់!` : `🚌 Replacement Bus (${replacementBus?.busNumber}) Dispatched!`)
                  : (language === 'km' ? `⚠️ រថយន្តសាលា (${originalBus?.busNumber}) ជួបបញ្ហាបច្ចេកទេសតាមផ្លូវ` : `⚠️ School Bus (${originalBus?.busNumber}) Mechanical Breakdown`)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDispatched && !isTransferred && (
            <span className="px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-black shadow-xs animate-pulse">
              ETA: ~{activeEmergencyTrip.replacementEtaMinutes || 12} mins
            </span>
          )}
          {isTransferred && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-black shadow-xs">
              {language === 'km' ? '✓ សុវត្ថិភាពខ្ពស់' : '✓ Safe On-Board'}
            </span>
          )}
        </div>
      </div>

      {/* Reassurance text */}
      <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-xs text-white leading-relaxed">
        <p className="font-medium">
          {isTransferred ? (
            language === 'km'
              ? `កូនរបស់លោកអ្នក (${activeStudent?.name}) ត្រូវបានផ្ទេរឡើងរថយន្តជំនួសលេខ ${replacementBus?.busNumber} ដោយសុវត្ថិភាព និងកំពុងធ្វើដំណើរឆ្ពោះទៅកាន់សាលារៀន។`
              : `Your child (${activeStudent?.name}) has safely boarded replacement bus ${replacementBus?.busNumber} and is currently in transit to school.`
          ) : (
            language === 'km'
              ? `សិស្សានុសិស្សទាំងអស់មានសុវត្ថិភាពពេញលេញក្រោមការមើលថែរបស់អ្នកបើកបរ ${originalDriver?.name || 'ចាន់ ដារ៉ា'}។ រដ្ឋបាលសាលាកំពុងរៀបចំចាត់តាំងរថយន្តជំនួសមកទទួលជាបន្ទាន់។`
              : `All students are completely safe under the supervision of Driver ${originalDriver?.name || 'Chan Dara'}. School administration is actively coordinating immediate replacement transport.`
          )}
        </p>
      </div>

      {/* Replacement Bus Details Card if Dispatched */}
      {isDispatched && replacementBus && (
        <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'km' ? 'រថយន្តជំនួស' : 'Replacement Bus'}</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{replacementBus.busNumber}</strong>
            <span className="text-slate-500 text-[11px] block">{replacementBus.plateNumber} • {replacementBus.model}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'km' ? 'អ្នកបើកបរជំនួស' : 'Replacement Driver'}</span>
            <strong className="text-slate-900 text-sm block mt-0.5">{replacementDriver?.name || 'Sok Vichea'}</strong>
            <a href={`tel:${replacementDriver?.phone || '+85512778990'}`} className="text-blue-600 font-bold text-[11px] inline-flex items-center gap-1 hover:underline">
              <Phone className="w-3 h-3" />
              <span>{replacementDriver?.phone || '+855 12 778 990'}</span>
            </a>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === 'km' ? 'ស្ថានភាពឡើងរថយន្ត' : 'Boarding Status'}</span>
            {isTransferred ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'km' ? 'បានឡើងរថយន្តជំនួសរួច' : 'Transferred & On-Board'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs mt-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{language === 'km' ? 'រង់ចាំរថយន្តជំនួសមកដល់' : 'Awaiting Arrival'}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact driver or school */}
      <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2 text-white/90">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>{activeEmergencyTrip.breakdownLocation?.address || 'Russian Confederation Blvd, Toul Kork'}</span>
        </span>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${originalDriver?.phone || '+85512345678'}`}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ទូរស័ព្ទទៅអ្នកបើកបរ' : 'Call Driver'}</span>
          </a>
          <a
            href="tel:+85523880370"
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ទូរស័ព្ទទៅសាលា' : 'Call School'}</span>
          </a>
        </div>
      </div>

    </div>
  );
}
