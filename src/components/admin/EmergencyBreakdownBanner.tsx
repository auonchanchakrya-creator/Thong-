import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertOctagon, AlertTriangle, Bus as BusIcon, ShieldAlert, 
  ArrowRight, Clock, Users, MapPin, CheckCircle2, LifeBuoy, Sparkles
} from 'lucide-react';
import { EmergencyReplacementModal } from './EmergencyReplacementModal';

export function EmergencyBreakdownBanner() {
  const { 
    buses, routes, students, 
    activeEmergencyTrip, activeEmergencyIncident,
    reportBusBreakdown,
    language
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // If there's an active emergency trip or incident
  const hasEmergency = !!(activeEmergencyTrip || (activeEmergencyIncident && activeEmergencyIncident.status !== 'resolved'));

  const brokenBus = buses.find(b => b.id === (activeEmergencyTrip?.busId || activeEmergencyIncident?.busId)) || buses[0];
  const affectedRoute = routes.find(r => r.id === (activeEmergencyTrip?.routeId || activeEmergencyIncident?.routeId)) || routes[0];
  const affectedCount = students.filter(s => s.busId === brokenBus.id || s.routeId === affectedRoute.id).length;

  const handleSimulateEmergencyBreakdown = async () => {
    setIsSimulating(true);
    try {
      await reportBusBreakdown({
        busId: 'bus-101',
        driverId: 'drv-1',
        routeId: 'rt-1',
        reason: language === 'km' ? 'ម៉ាស៊ីនឡើងកម្តៅខ្លាំង / បែកធុងទឹក' : 'Engine Overheating / Radiator Failure',
        notes: 'Simulated breakdown during morning run on Russian Confederation Blvd.',
        location: {
          lat: 11.5645,
          lng: 104.9015,
          address: 'Russian Confederation Blvd (near 5 Makara Bridge), Toul Kork, Phnom Penh',
          addressKh: 'មហាវិថីសហព័ន្ធរុស្ស៊ី (ជិតស្ពានអាកាស ៥ មករា) ខណ្ឌទួលគោក រាជធានីភ្នំពេញ'
        }
      });
      setIsModalOpen(true);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <>
      {hasEmergency ? (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-rose-950/20 border-2 border-rose-400/40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[11px] font-black uppercase tracking-wider">
                    {language === 'km' ? '🚨 ការប្រកាសអាសន្នផ្ទាល់' : '🚨 LIVE EMERGENCY ALERT'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-200 text-[11px] font-black">
                    {activeEmergencyTrip?.status === 'emergency_replacement_required' && (
                      language === 'km' ? 'ទាមទារការចាត់តាំងរថយន្តជំនួស' : 'Replacement Bus Required'
                    )}
                    {activeEmergencyTrip?.status === 'replacement_dispatched' && (
                      language === 'km' ? 'រថយន្តជំនួសបានចេញដំណើរ (Dispatched)' : 'Replacement Bus Dispatched'
                    )}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {language === 'km'
                    ? `រថយន្តលេខ ${brokenBus.busNumber} បានរាយការណ៍ខូចតាមផ្លូវធ្វើដំណើរ!`
                    : `Emergency: Bus ${brokenBus.busNumber} Breakdown Reported on Route!`}
                </h3>

                <p className="text-xs text-rose-100 font-medium flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-200" />
                    <span>{activeEmergencyTrip?.breakdownLocation?.address || 'Russian Confederation Blvd, Toul Kork'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-rose-200" />
                    <span>{affectedCount} {language === 'km' ? 'សិស្សប៉ះពាល់' : 'Students Affected'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-200" />
                    <span>{activeEmergencyTrip?.breakdownTime || 'Just now'}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-white hover:bg-rose-50 text-rose-950 font-black py-3 px-5 rounded-2xl text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all border border-white/50"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>
                  {activeEmergencyTrip?.status === 'replacement_dispatched'
                    ? (language === 'km' ? 'តាមដានការផ្ទេរសិស្ស' : 'Track Student Transfers')
                    : (language === 'km' ? 'ចាត់តាំងរថយន្តជំនួសជាបន្ទាន់' : 'Assign Replacement Bus')}
                </span>
                <ArrowRight className="w-4 h-4 text-rose-600" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Standby Quick Emergency Test / Readiness Card */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">
                {language === 'km' ? 'ប្រព័ន្ធត្រៀមឆ្លើយតបអាសន្ន & រថយន្តជំនួស' : 'Emergency Replacement Bus Readiness'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {language === 'km' 
                  ? 'រថយន្តបម្រុង Bus 04 និង Bus 02 ត្រៀមខ្លួនជាស្រេចនៅឃ្លាំងរង់ចាំការចាត់តាំង។' 
                  : 'Standby fleet (Bus 04 & Bus 02) primed for instant emergency dispatch upon breakdown.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimulateEmergencyBreakdown}
            disabled={isSimulating}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'km' ? 'សាកល្បងរាយការណ៍រថយន្តខូច (Simulate Breakdown)' : 'Simulate Breakdown Drill'}</span>
          </button>
        </div>
      )}

      {/* Admin Emergency Modal */}
      <EmergencyReplacementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
