import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { gpsTrackingService, GpsLocationRecord } from '../../services/gpsTrackingService';
import { 
  Bus, Radio, MapPin, Clock, ShieldCheck, AlertTriangle, 
  Wifi, WifiOff, RefreshCw, Compass, Users, CheckCircle2,
  Navigation, Sparkles, Activity
} from 'lucide-react';

export function LiveMapAdmin() {
  const { schools, buses, students, routes, drivers, t, language, formatNumber } = useApp();
  const [fleetGps, setFleetGps] = useState<Record<string, GpsLocationRecord>>({});
  const [selectedBusId, setSelectedBusId] = useState<string>('all');
  const [now, setNow] = useState(Date.now());

  // Subscribe to real-time GPS fleet updates
  useEffect(() => {
    const unsubscribe = gpsTrackingService.subscribeToFleet((fleet) => {
      setFleetGps({ ...fleet });
    });
    return unsubscribe;
  }, []);

  // Timer to re-render relative seconds ago
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 3000);
    return () => clearInterval(timer);
  }, []);

  const totalBuses = buses.length;
  const activeBuses = buses.filter(b => {
    const gps = fleetGps[b.id];
    return gps && (gps.sharingStatus === 'broadcasting' || gps.sharingStatus === 'demo_simulated');
  });

  const getStatusBadge = (busId: string) => {
    const gps = fleetGps[busId];
    if (!gps || gps.sharingStatus === 'stopped') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          {language === 'km' ? 'មិនដំណើរការ' : 'Inactive / Parked'}
        </span>
      );
    }

    if (gps.sharingStatus === 'stale') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {language === 'km' ? 'សញ្ញាខ្សោយ (Stale)' : 'Signal Stale (>30s)'}
        </span>
      );
    }

    if (gps.isDemoData) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Sparkles className="w-3 h-3 text-blue-600" />
          {language === 'km' ? 'ទិន្នន័យសាកល្បង (Demo)' : 'DEMO DATA (SIMULATED)'}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        {language === 'km' ? 'GPS ផ្ទាល់ (Real GPS)' : 'REAL DEVICE GPS (LIVE)'}
      </span>
    );
  };

  const getSecondsAgo = (timestamp?: number) => {
    if (!timestamp) return 'No signal';
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 5) return language === 'km' ? 'ទើបតែធ្វើបច្ចុប្បន្នភាព' : 'Just now';
    if (diff < 60) return `${diff}s ${language === 'km' ? 'មុន' : 'ago'}`;
    return `${Math.floor(diff / 60)}m ${language === 'km' ? 'មុន' : 'ago'}`;
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <Radio className="w-6 h-6 text-teal-600 animate-pulse shrink-0" />
            <span className="break-words">{language === 'km' ? 'ប្រព័ន្ធតាមដានរថយន្តសាលាផ្ទាល់' : 'Real GPS Live Bus Tracking System'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
            {language === 'km' 
              ? 'ត្រួតពិនិត្យទីតាំងជាក់ស្តែងរបស់រថយន្តសាលា ល្បឿន និងស្ថានភាពចរាចរណ៍នៅរាជធានីភ្នំពេញ' 
              : 'Authorized real-time device GPS coordinates, speeds, and transit tracking across Phnom Penh, Cambodia'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
            <span>
              {formatNumber(activeBuses.length)} / {formatNumber(totalBuses)} {language === 'km' ? 'រថយន្តសកម្ម' : 'Buses Live'}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{language === 'km' ? 'រៀងរាល់ ៥-១០ វិនាទី' : 'Auto-syncs 5-10s'}</span>
          </div>
        </div>
      </div>

      {/* Main Map with Street & Satellite Switching */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-5 space-y-4">
        <div className="h-[320px] sm:h-[450px] lg:h-[600px] w-full rounded-2xl overflow-hidden">
          <InteractiveMap 
            schools={schools} 
            buses={buses} 
            students={students} 
            routes={routes} 
            selectedBusId={selectedBusId !== 'all' ? selectedBusId : undefined}
            height="100%" 
          />
        </div>

        {/* Fleet Telemetry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {buses.map((bus) => {
            const gps = fleetGps[bus.id];
            const driver = drivers.find(d => d.busId === bus.id);
            const route = routes.find(r => r.busId === bus.id || r.id === bus.id);
            const isBroadcasting = gps?.sharingStatus === 'broadcasting' || gps?.sharingStatus === 'demo_simulated';

            return (
              <div 
                key={bus.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  isBroadcasting 
                    ? 'bg-emerald-50/20 border-emerald-200 shadow-xs' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isBroadcasting ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{bus.busNumber}</div>
                      <div className="text-[11px] text-slate-500">{bus.plateNumber}</div>
                    </div>
                  </div>
                  {getStatusBadge(bus.id)}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>{language === 'km' ? 'អ្នកបើកបរ' : 'Driver'}:</span>
                    <strong className="text-slate-800">{driver?.name || 'Chan Dara'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'km' ? 'ខ្សែរត់' : 'Route'}:</span>
                    <span className="font-semibold text-slate-800">{route?.name || 'Route 1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'km' ? 'កូអរដោនេ GPS' : 'GPS Coordinates'}:</span>
                    <span className="font-mono text-slate-700">
                      {gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : `${bus.currentLat?.toFixed(4)}, ${bus.currentLng?.toFixed(4)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'km' ? 'ភាពជាក់លាក់ / ល្បឿន' : 'Accuracy / Speed'}:</span>
                    <span className="font-semibold text-teal-700">
                      ±{gps?.accuracy || 8}m • {gps?.speed ?? bus.speed ?? 0} km/h
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 text-slate-400">
                    <span>{language === 'km' ? 'ទទួលចុងក្រោយ' : 'Last update'}:</span>
                    <span className="font-medium text-slate-500">{getSecondsAgo(gps?.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
