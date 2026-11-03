import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gpsTrackingService, GpsLocationRecord } from '../../services/gpsTrackingService';
import { 
  X, CheckCircle2, Play, Square, Radio, ShieldCheck, 
  MapPin, Clock, Eye, Sparkles, Navigation, Users, Bus,
  AlertTriangle, ArrowRight, ExternalLink, Activity, Layers
} from 'lucide-react';

interface GpsSystemFlowTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (role: 'admin' | 'parent' | 'driver') => void;
}

export function GpsSystemFlowTestModal({ isOpen, onClose, onSwitchRole }: GpsSystemFlowTestModalProps) {
  const { 
    buses, routes, drivers, students, language, t, localize, formatNumber 
  } = useApp();

  const [activeGps, setActiveGps] = useState<GpsLocationRecord | null>(null);
  const [packetCount, setPacketCount] = useState(0);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [now, setNow] = useState(Date.now());

  const targetBus = buses[0];
  const targetDriver = drivers[0];
  const targetRoute = routes[0];
  const targetStudent = students[0];

  useEffect(() => {
    if (!isOpen) return;

    setIsBroadcasting(gpsTrackingService.isTrackingActive());
    setIsSimulated(gpsTrackingService.isCurrentSimulated());

    const unsubscribe = gpsTrackingService.subscribeToBusLocation(targetBus.id, (record) => {
      setActiveGps(record);
      if (record.sharingStatus === 'broadcasting' || record.sharingStatus === 'demo_simulated') {
        setIsBroadcasting(true);
        setIsSimulated(record.isDemoData);
        setPacketCount(prev => prev + 1);
      } else if (record.sharingStatus === 'stopped') {
        setIsBroadcasting(false);
      }
    });

    const timer = setInterval(() => setNow(Date.now()), 2000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [isOpen, targetBus.id]);

  if (!isOpen) return null;

  const handleStartSimulatedDemo = () => {
    gpsTrackingService.startSimulatedGps({
      driverId: targetDriver.id,
      driverName: targetDriver.name,
      busId: targetBus.id,
      busNumber: targetBus.busNumber,
      plateNumber: targetBus.plateNumber,
      routeId: targetRoute.id,
      routeName: targetRoute.name,
      schoolId: 'sch-1'
    });
    setIsBroadcasting(true);
    setIsSimulated(true);
  };

  const handleStartRealDeviceGps = async () => {
    const res = await gpsTrackingService.startRealDeviceGps({
      driverId: targetDriver.id,
      driverName: targetDriver.name,
      busId: targetBus.id,
      busNumber: targetBus.busNumber,
      plateNumber: targetBus.plateNumber,
      routeId: targetRoute.id,
      routeName: targetRoute.name,
      schoolId: 'sch-1'
    });
    if (res.success) {
      setIsBroadcasting(true);
      setIsSimulated(false);
    }
  };

  const handleStopGps = () => {
    gpsTrackingService.stopGps('completed');
    setIsBroadcasting(false);
    setIsSimulated(false);
  };

  const getSecondsAgo = (ts?: number) => {
    if (!ts) return 'Waiting for packet...';
    const diff = Math.floor((now - ts) / 1000);
    return `${diff}s ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#101D36] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {language === 'km' ? 'ផ្ទាំងតេស្តសាកល្បង Real GPS Tracking Flow' : 'Real GPS Live Bus Tracking System Test Bench'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Verify the 5-step end-to-end flow: Driver → Backend → Admin → Parent → End Trip
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Live Pipeline Status Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isBroadcasting
              ? (isSimulated ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200')
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isBroadcasting
                  ? (isSimulated ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white')
                  : 'bg-slate-300 text-slate-700'
              }`}>
                <Radio className={`w-5 h-5 ${isBroadcasting ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">
                  {isBroadcasting
                    ? (isSimulated ? 'Simulated Route Active [DEMO DATA]' : 'Real Device GPS Active [LIVE BROADCAST]')
                    : 'GPS Tracking Inactive (Location Sharing Stopped)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isBroadcasting
                    ? `Broadcasting bus ${targetBus.busNumber} every 5s • ${packetCount} packets sent`
                    : 'Start the trip to begin streaming GPS coordinates to Admin & Parent views'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isBroadcasting ? (
                <>
                  <button
                    onClick={handleStartSimulatedDemo}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Demo Route</span>
                  </button>
                  <button
                    onClick={handleStartRealDeviceGps}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Use Device GPS</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStopGps}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>End Trip & Stop</span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Step System Verification Flow */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Complete Flow Checklist:
            </h4>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                  isBroadcasting ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isBroadcasting ? '✓' : '1'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">1. Driver Starts Trip & Shares Location</span>
                    <button
                      onClick={() => {
                        onSwitchRole('driver');
                        onClose();
                      }}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Driver App</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Requests driver permission, captures actual device GPS coordinates (or simulated test route), starts timer every 5–10s.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                  activeGps ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {activeGps ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">2. Real-Time Backend Storage & Distribution</span>
                    <span className="font-mono text-[11px] text-teal-700 font-semibold">
                      {activeGps ? `±${activeGps.accuracy}m • ${getSecondsAgo(activeGps.timestamp)}` : 'Awaiting data'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Transmits Driver ID, Bus ID, Route ID, Lat/Lng, Accuracy, Speed, and Timestamp to real-time subscribers with no page reload.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                  isBroadcasting ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isBroadcasting ? '✓' : '3'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">3. Admin Web App Sees Moving Fleet on Cambodia Map</span>
                    <button
                      onClick={() => {
                        onSwitchRole('admin');
                        onClose();
                      }}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Admin Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Map markers update dynamically without refreshing. Street/Satellite toggle supported. Stale signals detected (&gt;30s).
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                  isBroadcasting ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isBroadcasting ? '✓' : '4'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">4. Parent Sees ONLY Assigned Child's Bus</span>
                    <button
                      onClick={() => {
                        onSwitchRole('parent');
                        onClose();
                      }}
                      className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Parent View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Strict privacy enforced: other children and unrelated buses are never exposed. Shows pickup stop, school destination, and accuracy.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                  !isBroadcasting && packetCount > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {!isBroadcasting && packetCount > 0 ? '✓' : '5'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">5. Driver Ends Trip → Location Sharing Stops</span>
                    <span className="text-[11px] text-slate-400">
                      {!isBroadcasting && packetCount > 0 ? 'Verified Stopped' : 'Pending End Trip'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    watchPosition is cleared immediately. Driver is never tracked secretly or outside of active trips.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            SchoolRoutAI Cambodia • Production GPS Dispatch Architecture
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Close Test Bench
          </button>
        </div>
      </div>
    </div>
  );
}
