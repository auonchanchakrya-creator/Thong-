import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  gpsTrackingService, GpsLocationRecord, GpsPermissionState 
} from '../../services/gpsTrackingService';
import { 
  Radio, Play, Square, ShieldCheck, AlertTriangle, 
  MapPin, Clock, Wifi, WifiOff, Sparkles, Navigation, 
  CheckCircle2, Compass, Activity, ArrowRight, ShieldAlert
} from 'lucide-react';

interface DriverGpsConsoleProps {
  onTripStarted?: () => void;
  onTripEnded?: () => void;
}

export function DriverGpsConsole({ onTripStarted, onTripEnded }: DriverGpsConsoleProps) {
  const { 
    currentUser, drivers, buses, routes, startTrip, completeTrip,
    language, t, localize, formatNumber 
  } = useApp();

  const driver = drivers.find(d => d.userId === currentUser?.id) || drivers[0];
  const bus = buses.find(b => b.id === driver?.busId) || buses[0];
  const route = routes.find(r => r.id === driver?.routeId) || routes[0];

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [permissionState, setPermissionState] = useState<GpsPermissionState>('prompt');
  const [currentGps, setCurrentGps] = useState<GpsLocationRecord | null>(null);
  const [packetCount, setPacketCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Check initial permission & subscribe
  useEffect(() => {
    setPermissionState(gpsTrackingService.getPermissionStatus());
    setIsBroadcasting(gpsTrackingService.isTrackingActive());
    setIsSimulated(gpsTrackingService.isCurrentSimulated());

    const unsubscribe = gpsTrackingService.subscribeToBusLocation(bus.id, (record) => {
      setCurrentGps(record);
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
  }, [bus.id]);

  const handleRequestPermission = async () => {
    setErrorMessage(null);
    const status = await gpsTrackingService.checkOrRequestPermission();
    setPermissionState(status);
    if (status === 'denied') {
      setErrorMessage(
        language === 'km' 
          ? 'ការអនុញ្ញាត GPS ត្រូវបានបដិសេធ។ សូមបើកការអនុញ្ញាតទីតាំងនៅក្នុង browser setting របស់អ្នក ឬប្រើប្រាស់ Test Mode។'
          : 'Location permission was denied. Please allow location in your browser settings or use Test Mode to simulate.'
      );
    }
  };

  const handleStartTripRealGps = async () => {
    setErrorMessage(null);

    // Request permission if not already granted
    if (permissionState !== 'granted') {
      const status = await gpsTrackingService.checkOrRequestPermission();
      setPermissionState(status);
      if (status === 'denied') {
        setErrorMessage(
          language === 'km'
            ? 'មិនអាចចាប់ផ្តើមបានទេដោយសារការអនុញ្ញាត GPS ត្រូវបានបដិសេធ។ សូមប្រើប៊ូតុង Test Mode ខាងក្រោមដើម្បីសាកល្បង។'
            : 'Cannot start real GPS because permission was denied. Use Test Mode below to test the full system flow.'
        );
        return;
      }
    }

    // Start app context trip
    startTrip(route.id);

    // Start real device GPS broadcast
    const res = await gpsTrackingService.startRealDeviceGps({
      driverId: driver.id,
      driverName: driver.name,
      busId: bus.id,
      busNumber: bus.busNumber,
      plateNumber: bus.plateNumber,
      routeId: route.id,
      routeName: route.name,
      schoolId: 'sch-1',
      onError: (err) => {
        setErrorMessage(err.message || 'GPS signal error');
      }
    });

    if (res.success) {
      setIsBroadcasting(true);
      setIsSimulated(false);
      if (onTripStarted) onTripStarted();
    } else {
      setErrorMessage(res.error || 'Failed to start GPS');
    }
  };

  const handleStartTripSimulated = () => {
    setErrorMessage(null);
    startTrip(route.id);

    gpsTrackingService.startSimulatedGps({
      driverId: driver.id,
      driverName: driver.name,
      busId: bus.id,
      busNumber: bus.busNumber,
      plateNumber: bus.plateNumber,
      routeId: route.id,
      routeName: route.name,
      schoolId: 'sch-1'
    });

    setIsBroadcasting(true);
    setIsSimulated(true);
    if (onTripStarted) onTripStarted();
  };

  const handleEndTrip = () => {
    gpsTrackingService.stopGps('completed');
    completeTrip(route.id);
    setIsBroadcasting(false);
    setIsSimulated(false);
    if (onTripEnded) onTripEnded();
  };

  const getSecondsAgo = (timestamp?: number) => {
    if (!timestamp) return 'No packets yet';
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 3) return language === 'km' ? 'ទើបតែផ្សាយ' : 'Just now';
    return `${diff}s ${language === 'km' ? 'មុន' : 'ago'}`;
  };

  return (
    <div className="bg-[#101D36] text-white rounded-3xl p-5 sm:p-6 border border-slate-700/80 shadow-xl space-y-5">
      {/* Header and Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md shrink-0 ${
            isBroadcasting 
              ? (isSimulated ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-slate-950')
              : 'bg-slate-800 text-slate-400'
          }`}>
            <Radio className={`w-7 h-7 ${isBroadcasting ? 'animate-pulse' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl sm:text-2xl text-white tracking-tight">
                {language === 'km' ? 'ស្ថានីយបញ្ជូនទីតាំង GPS ជាក់ស្តែង' : 'Real-Time Device GPS Broadcasting Console'}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {bus.busNumber} ({bus.plateNumber}) • {driver.name}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {isBroadcasting ? (
            isSimulated ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>DEMO DATA (SIMULATED ROUTE)</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-2 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>REAL DEVICE GPS (LIVE BROADCAST)</span>
              </span>
            )
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              {language === 'km' ? 'មិនទាន់ចាប់ផ្តើមដំណើរ' : 'LOCATION SHARING STOPPED'}
            </span>
          )}
        </div>
      </div>

      {/* Permission Card Notice */}
      <div className="bg-[#0b1426] p-4 sm:p-5 rounded-2xl border border-slate-800 text-sm text-slate-200 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 font-bold text-slate-100 text-base">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
            <span>{language === 'km' ? 'សិទ្ធិ និងសុវត្ថិភាពទិន្នន័យ GPS' : 'Driver Permission & Location Privacy'}</span>
          </div>

          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
            permissionState === 'granted' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
            permissionState === 'denied' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
            'bg-slate-800 text-amber-300 border border-slate-700'
          }`}>
            {permissionState === 'granted' ? '✓ Permission Granted' :
             permissionState === 'denied' ? '✗ Permission Denied' : 'Pending Permission'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {language === 'km' 
            ? 'ប្រព័ន្ធ SchoolRoutAI ទាមទារការយល់ព្រមពីអ្នកបើកបរដើម្បីប្រមូល និងផ្សាយទីតាំងជាក់ស្តែងទៅកាន់រដ្ឋបាលសាលា និងអាណាព្យាបាលតែក្នុងពេលធ្វើដំណើរប៉ុណ្ណោះ។ ទីតាំងនឹងឈប់ផ្សាយភ្លាមៗនៅពេលបញ្ចប់ការធ្វើដំណើរ (End Trip)។' 
            : 'SchoolRoutAI Driver requires explicit device location permission to broadcast your live bus coordinates to school administrators and parents while the trip is active. Location sharing stops immediately when the trip ends. Drivers are never tracked secretly.'}
        </p>

        {permissionState !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            className="mt-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-colors cursor-pointer min-h-[44px]"
          >
            {language === 'km' ? 'ស្នើសុំការអនុញ្ញាត GPS លើឧបករណ៍' : 'Request Device Location Permission'}
          </button>
        )}
      </div>

      {/* Error Message if any */}
      {errorMessage && (
        <div className="bg-rose-950/70 border border-rose-500/60 text-rose-200 text-sm p-4 rounded-2xl flex items-center gap-2.5 font-medium">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Coordinates Readout */}
      {isBroadcasting && currentGps && (
        <div className="bg-[#162544] rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-3.5">
          <div className="flex items-center justify-between text-sm sm:text-base text-slate-200">
            <span className="font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              {language === 'km' ? 'ទិន្នន័យបញ្ជូនតាមពេលវេលាជាក់ស្តែង (5-10s interval)' : 'Real-Time Telemetry Feed'}
            </span>
            <span className="font-mono text-teal-300 font-bold text-sm">
              {packetCount} packets sent • {getSecondsAgo(currentGps.timestamp)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[#0b1426] p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Latitude</div>
              <div className="font-mono font-bold text-white text-base sm:text-lg mt-0.5">{currentGps.lat.toFixed(5)}</div>
            </div>

            <div className="bg-[#0b1426] p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Longitude</div>
              <div className="font-mono font-bold text-white text-base sm:text-lg mt-0.5">{currentGps.lng.toFixed(5)}</div>
            </div>

            <div className="bg-[#0b1426] p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accuracy</div>
              <div className="font-mono font-bold text-teal-300 text-base sm:text-lg mt-0.5">±{currentGps.accuracy}m</div>
            </div>

            <div className="bg-[#0b1426] p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Speed</div>
              <div className="font-mono font-bold text-blue-300 text-base sm:text-lg mt-0.5">{currentGps.speed || 0} km/h</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Start / End Controls (Minimum 54-58px height, 20-22px font) */}
      <div className="space-y-3 pt-2">
        {!isBroadcasting ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Real Device GPS Start Button */}
            <button
              onClick={handleStartTripRealGps}
              className="min-h-[58px] py-4 px-5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>{language === 'km' ? 'ចាប់ផ្តើមដំណើរ (REAL GPS)' : 'START TRIP (REAL GPS)'}</span>
            </button>

            {/* Test Simulator Start Button */}
            <button
              onClick={handleStartTripSimulated}
              className="min-h-[58px] py-4 px-5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-black rounded-2xl text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-6 h-6 text-blue-200" />
              <span>{language === 'km' ? 'សាកល្បងដំណើរការ (TEST MODE)' : 'TEST MODE: SIMULATE ROUTE'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleEndTrip}
            className="w-full min-h-[60px] py-4 px-5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-black rounded-2xl text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl shadow-rose-600/35 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Square className="w-6 h-6 fill-white" />
            <span>{language === 'km' ? 'បញ្ចប់ការធ្វើដំណើរ & បញ្ឈប់ការផ្សាយ (END TRIP)' : 'END TRIP & STOP GPS BROADCAST'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
