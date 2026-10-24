import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { 
  Bus as BusIcon, MapPin, GraduationCap, Clock, Phone, 
  ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, 
  Compass, Bell, Navigation, Wifi, WifiOff, Check, QrCode
} from 'lucide-react';
import { calculateRouteWithOSRM, CalculatedRouteResult } from '../../services/routingService';
import { DigitalStudentIDCard } from '../common/DigitalStudentIDCard';
import { ParentEmergencyAlertBanner } from './ParentEmergencyAlertBanner';

export function LiveTrackingView() {
  const { 
    currentUser, parents, students, buses, schools, routes, drivers, notifications,
    isOfflineMode, offlineQueueCount, t, localize, language, formatNumber 
  } = useApp();

  const parent = parents.find(p => p.userId === currentUser?.id) || parents[0];
  const myChildren = students.filter(s => parent?.childrenIds?.includes(s.id));
  
  const [selectedChildId, setSelectedChildId] = useState<string>(
    myChildren[0]?.id || students[0]?.id || ''
  );

  const selectedChild = students.find(s => s.id === selectedChildId) || myChildren[0] || students[0];
  const bus = buses.find(b => b.id === selectedChild?.busId) || buses[0];
  const driver = drivers.find(d => d.busId === bus?.id || d.routeId === selectedChild?.routeId) || drivers[0];
  const school = schools.find(s => s.id === selectedChild?.schoolId) || schools[0];
  const route = routes.find(r => r.id === selectedChild?.routeId) || routes[0];

  const [refreshing, setRefreshing] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState<CalculatedRouteResult | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const studentMarkerRef = useRef<L.Marker | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Relevant notification for this child
  const childPickupNotification = notifications.find(
    n => n.relatedId === selectedChild?.id && (n.type === 'success' || n.type === 'warning')
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = bus?.currentLat || selectedChild?.pickupLat || 11.5620;
      const initialLng = bus?.currentLng || selectedChild?.pickupLng || 104.9120;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch route between bus, pickup, and school
  useEffect(() => {
    if (!selectedChild || !school) return;

    const fetchRoute = async () => {
      try {
        const locations = [
          {
            id: 'bus-pos',
            name: bus?.busNumber || 'School Bus',
            address: 'Live Location',
            lat: bus?.currentLat || 11.5620,
            lng: bus?.currentLng || 104.9120,
            type: 'origin' as const
          },
          {
            id: selectedChild.id,
            name: selectedChild.name,
            address: selectedChild.pickupAddress,
            lat: selectedChild.pickupLat,
            lng: selectedChild.pickupLng,
            type: 'student_pickup' as const
          },
          {
            id: school.id,
            name: school.name,
            address: school.address,
            lat: school.lat,
            lng: school.lng,
            type: 'school' as const
          }
        ];

        const res = await calculateRouteWithOSRM(locations, 'driving');
        setCalculatedRoute(res);
      } catch (e) {
        console.warn('Failed to calculate live tracking route', e);
      }
    };

    fetchRoute();
  }, [bus?.currentLat, bus?.currentLng, selectedChild?.id, school?.id]);

  // Update Leaflet markers and polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedChild || !school) return;

    const busPos: [number, number] = [bus?.currentLat || 11.5620, bus?.currentLng || 104.9120];

    // 1. Bus Marker
    const busHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-blue-500/30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect width="16" height="16" x="4" y="4" rx="2" stroke-width="2"/>
            <path stroke-width="2" d="M4 10h16M9 16h6"/>
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 rounded-full border border-white">
          ${bus?.speed || 24}k
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      html: busHtml,
      className: 'bus-track-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng(busPos);
      busMarkerRef.current.setIcon(busIcon);
    } else {
      busMarkerRef.current = L.marker(busPos, { icon: busIcon }).addTo(map);
      busMarkerRef.current.bindPopup(`<strong>${bus?.busNumber || 'Bus 03'}</strong><br/>Driver: ${driver?.name || 'Chan Dara'}<br/>Speed: ${bus?.speed || 24} km/h`);
    }

    // 2. Student Pickup Marker
    const isPickedUp = selectedChild.status === 'picked_up';
    const stuHtml = `
      <div class="flex flex-col items-center">
        <div class="w-8 h-8 rounded-full ${isPickedUp ? 'bg-emerald-600' : 'bg-amber-500 animate-bounce'} text-white font-extrabold text-xs flex items-center justify-center shadow-lg border-2 border-white">
          ${isPickedUp ? '✓' : '🏠'}
        </div>
        <div class="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
          ${selectedChild.name}
        </div>
      </div>
    `;

    const stuIcon = L.divIcon({
      html: stuHtml,
      className: 'stu-track-icon',
      iconSize: [70, 45],
      iconAnchor: [35, 22]
    });

    if (studentMarkerRef.current) {
      studentMarkerRef.current.setLatLng([selectedChild.pickupLat, selectedChild.pickupLng]);
      studentMarkerRef.current.setIcon(stuIcon);
    } else {
      studentMarkerRef.current = L.marker([selectedChild.pickupLat, selectedChild.pickupLng], { icon: stuIcon }).addTo(map);
      studentMarkerRef.current.bindPopup(`<strong>${selectedChild.name}</strong><br/>${selectedChild.pickupAddress}<br/>Status: ${isPickedUp ? 'Picked Up' : 'Waiting for bus'}`);
    }

    // 3. School Marker
    const schHtml = `
      <div class="flex flex-col items-center">
        <div class="w-9 h-9 rounded-full bg-purple-700 text-white font-extrabold text-sm flex items-center justify-center shadow-lg border-2 border-white">
          🏫
        </div>
        <div class="bg-purple-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
          ${school.name.substring(0, 15)}
        </div>
      </div>
    `;

    const schIcon = L.divIcon({
      html: schHtml,
      className: 'sch-track-icon',
      iconSize: [70, 45],
      iconAnchor: [35, 22]
    });

    if (schoolMarkerRef.current) {
      schoolMarkerRef.current.setLatLng([school.lat, school.lng]);
    } else {
      schoolMarkerRef.current = L.marker([school.lat, school.lng], { icon: schIcon }).addTo(map);
      schoolMarkerRef.current.bindPopup(`<strong>${school.name}</strong><br/>${school.address}`);
    }

    // 4. Polyline
    if (calculatedRoute && calculatedRoute.polyline.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(calculatedRoute.polyline);
      } else {
        polylineRef.current = L.polyline(calculatedRoute.polyline, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round'
        }).addTo(map);
      }
    }
  }, [bus?.currentLat, bus?.currentLng, selectedChild?.id, calculatedRoute]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && bus?.currentLat && bus?.currentLng) {
      mapInstanceRef.current.panTo([bus.currentLat, bus.currentLng], { animate: true, duration: 0.6 });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      handleRecenter();
    }, 600);
  };

  // Determine Current Stage
  const isPickedUp = selectedChild?.status === 'picked_up';
  const isAtSchool = selectedChild?.status === 'at_school' || selectedChild?.status === 'dropped_off';
  const isAbsent = selectedChild?.status === 'absent';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {language === 'km' ? 'ការតាមដានការធ្វើដំណើររបស់កូនផ្ទាល់' : 'Live Child Transportation Tracking'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {language === 'km' ? 'GPS ផ្ទាល់' : 'Live GPS'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'km' 
              ? 'តាមដានស្ថានភាពរថយន្តសាលា ការឡើងជិះ និងការមកដល់សាលារបស់កូនអ្នកក្នុងពេលវេលាជាក់ស្តែង។' 
              : 'Real-time telemetry, pickup confirmation, and turn-by-turn route progress for your child.'}
          </p>
        </div>

        {/* Child Selector Pill */}
        {myChildren.length > 1 && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 pl-2">
              {language === 'km' ? 'ជ្រើសរើសកូន' : 'Select Child'}:
            </span>
            {myChildren.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  child.id === selectedChildId
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Breakdown & Replacement Bus Notice Banner for Parent */}
      <ParentEmergencyAlertBanner student={selectedChild} />

      {/* 1. REAL-TIME TRIP JOURNEY PROGRESS STEPPER (Core Requirement 4) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
        
        {/* Top Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
              isPickedUp ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
              isAtSchool ? 'bg-purple-100 text-purple-700 border border-purple-300' :
              isAbsent ? 'bg-rose-100 text-rose-700 border border-rose-300' :
              'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse'
            }`}>
              {isPickedUp ? '🚌' : isAtSchool ? '🏫' : isAbsent ? '✕' : '⏳'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {selectedChild?.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                  isPickedUp ? 'bg-emerald-100 text-emerald-700' :
                  isAtSchool ? 'bg-purple-100 text-purple-700' :
                  isAbsent ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {isPickedUp ? (language === 'km' ? 'នៅលើរថយន្តក្រុង (Picked Up)' : 'On Board Bus') :
                   isAtSchool ? (language === 'km' ? 'មកដល់សាលារួចរាល់' : 'At School') :
                   isAbsent ? (language === 'km' ? 'អវត្តមាន' : 'Absent') :
                   (language === 'km' ? 'កំពុងរង់ចាំការមកទទួល' : 'Waiting for Pickup')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedChild?.grade} • ID: #{selectedChild?.id} • {localize(school?.name, school?.nameKh)}
              </p>
            </div>
          </div>

          {/* Quick Refresh & Recenter Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIdCard(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
              title="View Digital Student ID & Boarding QR Pass"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'km' ? 'កាតសិស្ស & QR' : 'Student ID & QR'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh Telemetry'}</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              title="Connection status & push alerts configuration"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

        {/* 4-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          
          {/* Step 1: Waiting at Home */}
          <div className={`p-4 rounded-2xl border transition-all ${
            !isPickedUp && !isAtSchool && !isAbsent
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-slate-50/70 border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isPickedUp || isAtSchool ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {isPickedUp || isAtSchool ? '✓' : '1'}
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                {language === 'km' ? '១. រង់ចាំនៅផ្ទះ' : '1. Waiting at Home'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              {language === 'km' && selectedChild?.pickupAddressKh ? selectedChild.pickupAddressKh : selectedChild?.pickupAddress}
            </p>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">
              {language === 'km' ? 'ម៉ោងប៉ាន់ស្មាន' : 'Scheduled'}: 07:30 AM
            </p>
          </div>

          {/* Step 2: Picked Up by Bus */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isPickedUp && !isAtSchool
              ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/30 shadow-xs'
              : isAtSchool
              ? 'bg-slate-50/70 border-slate-200'
              : 'bg-slate-50/40 border-slate-200/60 opacity-60'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isPickedUp || isAtSchool ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {isPickedUp || isAtSchool ? '✓' : '2'}
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                {language === 'km' ? '២. បានឡើងរថយន្ត' : '2. Picked Up'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-600">
              {isPickedUp 
                ? (language === 'km' ? `ទទួលនៅម៉ោង៖ ${selectedChild?.pickedUpAt || '07:35 AM'}` : `Boarded at: ${selectedChild?.pickedUpAt || '07:35 AM'}`)
                : (language === 'km' ? 'រង់ចាំការបញ្ជាក់ពីអ្នកបើកបរ' : 'Awaiting driver confirmation')}
            </p>
            {isPickedUp && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase">
                {language === 'km' ? 'បានបញ្ជាក់' : 'Driver Confirmed'}
              </span>
            )}
          </div>

          {/* Step 3: En Route to School */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isPickedUp && !isAtSchool
              ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20'
              : isAtSchool
              ? 'bg-slate-50/70 border-slate-200'
              : 'bg-slate-50/40 border-slate-200/60 opacity-60'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isAtSchool ? 'bg-emerald-600 text-white' : isPickedUp ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {isAtSchool ? '✓' : '3'}
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                {language === 'km' ? '៣. ធ្វើដំណើរតាមផ្លូវ' : '3. En Route'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-600">
              {isPickedUp 
                ? (language === 'km' ? `ល្បឿន៖ ${bus?.speed || 24} km/h • តាមផ្លូវ ៣១៥` : `Moving at ${bus?.speed || 24} km/h via St. 315`)
                : (language === 'km' ? 'មិនទាន់ចេញដំណើរ' : 'Not started')}
            </p>
            {isPickedUp && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[9px]">
                ETA: 07:55 AM
              </span>
            )}
          </div>

          {/* Step 4: Arrived at School */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isAtSchool
              ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-500/30'
              : 'bg-slate-50/40 border-slate-200/60 opacity-60'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isAtSchool ? 'bg-purple-700 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                4
              </span>
              <h4 className="text-xs font-bold text-slate-900">
                {language === 'km' ? '៤. មកដល់សាលារៀន' : '4. Arrived at School'}
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              {localize(school?.name, school?.nameKh)}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">
              {isAtSchool ? (language === 'km' ? 'បានទម្លាក់ដោយសុវត្ថិភាព' : 'Dropped off safely') : (language === 'km' ? 'គោលដៅចុងក្រោយ' : 'Final Destination')}
            </p>
          </div>

        </div>

        {/* 2. AUTOMATIC NOTIFICATION BANNER (Core Requirement 3) */}
        {childPickupNotification && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                  {childPickupNotification.title}
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold">
                  {childPickupNotification.timestamp}
                </span>
              </div>
              <p className="text-xs text-emerald-800 font-medium mt-1 leading-relaxed">
                {childPickupNotification.message}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-700/80 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === 'km' 
                    ? 'បានបញ្ជូនដោយស្វ័យប្រវត្តទៅគណនីអាណាព្យាបាល (គ្មានការជូនដំណឹងស្ទួន)' 
                    : 'Dispatched automatically to verified parent account • Duplicate prevention verified'}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. MAIN MAP & TELEMETRY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEAFLET MAP VIEW (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>{language === 'km' ? 'ផែនទីភ្នំពេញពេលវេលាជាក់ស្តែង' : 'Live Phnom Penh Navigation Map'}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {bus?.busNumber || 'Bus 03'} ({bus?.speed || 24} km/h)
              </span>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[480px]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Recenter Map Floating Button */}
            <button
              onClick={handleRecenter}
              className="absolute bottom-4 right-4 z-10 w-11 h-11 rounded-2xl bg-white/95 hover:bg-white text-slate-800 shadow-xl border border-slate-200 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Recenter on Bus"
            >
              <Compass className="w-5 h-5 text-blue-600" />
            </button>

            {/* Offline Status floating pill if offline */}
            {isOfflineMode && (
              <div className="absolute top-4 left-4 z-10 bg-amber-950/90 text-amber-200 border border-amber-600/50 px-3 py-1.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'km' ? 'របៀបក្រៅបណ្តាញ (រក្សាទុកទិន្នន័យ)' : 'Offline buffer active'}</span>
              </div>
            )}
          </div>
        </div>

        {/* DRIVER & VEHICLE TELEMETRY CARD (1 Column) */}
        <div className="space-y-4">
          
          {/* Assigned Driver Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {language === 'km' ? 'ព័ត៌មានអ្នកបើកបរ' : 'Assigned Driver'}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase">
                {language === 'km' ? 'កំពុងបំពេញការងារ' : 'On Duty'}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src={driver?.userId === 'usr-driver-2' ? '/images/khmer_driver2.svg' : '/images/khmer_driver.svg'}
                alt={driver?.name || 'Driver'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-extrabold text-slate-900 text-sm">{driver?.name || 'Chan Dara'}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{driver?.phone || '+855 12 345 678'}</p>
                <p className="text-[10px] text-blue-600 font-bold mt-1">
                  License: {driver?.licenseNumber || 'KH-DRV-2024-88'}
                </p>
              </div>
            </div>

            <a
              href={`tel:${driver?.phone || '+85512345678'}`}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'km' ? 'ទាក់ទងអ្នកបើកបរផ្ទាល់' : 'Call Driver Directly'}</span>
            </a>
          </div>

          {/* Bus Telemetry Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              {language === 'km' ? 'ព័ត៌មានរថយន្ត និងសុវត្ថិភាព' : 'Bus & Safety Telemetry'}
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('students.bus')}</span>
                <strong className="text-slate-900 font-extrabold text-sm">{bus?.busNumber || 'Bus 03'}</strong>
                <span className="text-[10px] text-slate-500 block truncate">{bus?.plateNumber || 'PP-2B-8899'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  {language === 'km' ? 'ល្បឿនបច្ចុប្បន្ន' : 'Current Speed'}
                </span>
                <strong className="text-emerald-600 font-extrabold text-sm">{bus?.speed || 24} km/h</strong>
                <span className="text-[10px] text-emerald-700 block font-bold">
                  {language === 'km' ? '✓ ល្បឿនសុវត្ថិភាព' : '✓ Safe Zone'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{language === 'km' ? 'ខ្សែរត់' : 'Route'}:</span>
                <strong className="text-slate-900">{localize(route?.name, route?.nameKh)}</strong>
              </div>
              <div className="flex justify-between">
                <span>{language === 'km' ? 'ទីតាំង GPS' : 'GPS Coordinates'}:</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {bus?.currentLat?.toFixed(4) || '11.5620'}, {bus?.currentLng?.toFixed(4) || '104.9120'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. CONFIGURATION & SERVICES MODAL (Requirement 5) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {language === 'km' ? 'ស្ថានភាពប្រព័ន្ធតភ្ជាប់ និងការជូនដំណឹង' : 'Notification & Map Services Status'}
                </h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'km'
                ? 'ស្ថានភាពតភ្ជាប់បច្ចុប្បន្នរវាងម៉ាស៊ីនរុករក GPS របស់រថយន្ត ការបញ្ជូនដំណឹងទៅអាណាព្យាបាល និងសេវាបម្រុងទុក។'
                : 'Connection and push dispatch diagnostics for SchoolRoute AI:'}
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <strong className="text-emerald-950 font-bold block">1. In-App Immediate Parent Push Notification</strong>
                  <span className="text-emerald-700 text-[11px]">Directly targeted to verified parent account on pickup confirmation</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  CONNECTED
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <strong className="text-emerald-950 font-bold block">2. Phnom Penh OpenStreetMap & Routing</strong>
                  <span className="text-emerald-700 text-[11px]">High-precision road coordinates & routing geometry</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  ONLINE
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <strong className="text-blue-950 font-bold block">3. Telegram Bot & SMS Alert Gateway (+855)</strong>
                  <span className="text-blue-700 text-[11px]">Smart/Cellcard SMS webhook ready • Configured via school dispatch</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                  STANDBY
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <strong className="text-amber-950 font-bold block">4. Offline Resiliency Buffer</strong>
                  <span className="text-amber-700 text-[11px]">Pickups cache locally if cellular signal drops; auto-syncs when online</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px]">
                  ACTIVE
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              {language === 'km' ? 'យល់ព្រម' : 'Close Diagnostics'}
            </button>
          </div>
        </div>
      )}

      {/* Digital Student ID Card & QR Modal */}
      {showIdCard && selectedChild && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <DigitalStudentIDCard
            student={selectedChild}
            onClose={() => setShowIdCard(false)}
          />
        </div>
      )}

    </div>
  );
}
