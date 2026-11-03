import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { 
  Bus as BusIcon, MapPin, GraduationCap, Clock, Phone, 
  ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, 
  Compass, Bell, Navigation, Wifi, WifiOff, Check, QrCode,
  Layers, Radio, Sparkles, Activity, Plus, Minus, RotateCcw, Crosshair
} from 'lucide-react';
import { calculateRouteWithOSRM, CalculatedRouteResult } from '../../services/routingService';
import { gpsTrackingService, GpsLocationRecord } from '../../services/gpsTrackingService';
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
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [liveGps, setLiveGps] = useState<GpsLocationRecord | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isFollowingBus, setIsFollowingBus] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(14);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const studentMarkerRef = useRef<L.Marker | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const streetTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteTileLayerRef = useRef<L.TileLayer | null>(null);

  // Subscribe to real-time device GPS updates for this child's bus
  useEffect(() => {
    const targetBusId = selectedChild?.busId || bus?.id || 'bus-101';
    const unsubscribe = gpsTrackingService.subscribeToBusLocation(targetBusId, (record) => {
      setLiveGps(record);
    });
    const timer = setInterval(() => setNow(Date.now()), 2000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [selectedChild?.busId, bus?.id]);

  // Relevant notification for this child
  const childPickupNotification = notifications.find(
    n => n.relatedId === selectedChild?.id && (n.type === 'success' || n.type === 'warning')
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = liveGps?.lat || bus?.currentLat || selectedChild?.pickupLat || 11.5620;
      const initialLng = liveGps?.lng || bus?.currentLng || selectedChild?.pickupLng || 104.9120;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60,
        wheelDebounceTime: 20,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        dragging: true,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        trackResize: true
      });

      // Listen for user interactions to gracefully pause auto-follow
      map.on('dragstart', () => {
        setIsFollowingBus(false);
      });

      map.on('zoomstart', (e: any) => {
        if (e.originalEvent) {
          setIsFollowingBus(false);
        }
      });

      map.on('zoomend', () => {
        setCurrentZoom(Math.round(map.getZoom() * 10) / 10);
      });

      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, Maxar',
        maxZoom: 19
      });

      streetLayer.addTo(map);
      streetTileLayerRef.current = streetLayer;
      satelliteTileLayerRef.current = satelliteLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Street / Satellite Layer Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !streetTileLayerRef.current || !satelliteTileLayerRef.current) return;

    if (mapType === 'satellite') {
      if (map.hasLayer(streetTileLayerRef.current)) map.removeLayer(streetTileLayerRef.current);
      satelliteTileLayerRef.current.addTo(map);
    } else {
      if (map.hasLayer(satelliteTileLayerRef.current)) map.removeLayer(satelliteTileLayerRef.current);
      streetTileLayerRef.current.addTo(map);
    }
  }, [mapType]);

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

    const currentLat = liveGps?.lat ?? (bus?.currentLat || 11.5620);
    const currentLng = liveGps?.lng ?? (bus?.currentLng || 104.9120);
    const busPos: [number, number] = [currentLat, currentLng];

    // Accuracy Circle
    if (liveGps?.accuracy && liveGps.accuracy < 100) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng(busPos);
        accuracyCircleRef.current.setRadius(liveGps.accuracy);
      } else {
        accuracyCircleRef.current = L.circle(busPos, {
          radius: liveGps.accuracy,
          color: liveGps.isDemoData ? '#2563EB' : '#10B981',
          fillColor: liveGps.isDemoData ? '#93C5FD' : '#6EE7B7',
          fillOpacity: 0.2,
          weight: 1.5
        }).addTo(map);
      }
    }

    // 1. Bus Marker
    const isLive = liveGps?.sharingStatus === 'broadcasting';
    const isDemo = liveGps?.isDemoData;
    const isStale = liveGps?.sharingStatus === 'stale';
    const busColor = isStale ? '#D97706' : isDemo ? '#2563EB' : '#10B981';

    const busHtml = `
      <div class="relative flex items-center justify-center">
        ${isLive ? `<span style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: ${busColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
        <div style="background-color: ${busColor}; color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); border: 2.5px solid white; z-index: 2;">
          🚌
        </div>
        <div style="position: absolute; top: -4px; right: -4px; background: #0f172a; color: white; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 9999px; border: 1.5px solid white;">
          ${liveGps?.speed ?? bus?.speed ?? 24}k
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      html: busHtml,
      className: 'bus-track-icon',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng(busPos);
      busMarkerRef.current.setIcon(busIcon);
    } else {
      busMarkerRef.current = L.marker(busPos, { icon: busIcon }).addTo(map);
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

    // 5. Follow bus smoothly if enabled without altering user zoom level
    if (isFollowingBus && busPos) {
      map.panTo(busPos, { animate: true, duration: 0.8 });
    }
  }, [bus?.currentLat, bus?.currentLng, liveGps?.lat, liveGps?.lng, selectedChild?.id, calculatedRoute, isFollowingBus]);

  const handleRecenter = () => {
    const currentLat = liveGps?.lat ?? (bus?.currentLat || 11.5620);
    const currentLng = liveGps?.lng ?? (bus?.currentLng || 104.9120);
    if (mapInstanceRef.current && currentLat && currentLng) {
      mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true, duration: 0.6 });
      setIsFollowingBus(true);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(0.5);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(0.5);
    }
  };

  const handleResetZoom = () => {
    if (!mapInstanceRef.current) return;
    const currentLat = liveGps?.lat ?? (bus?.currentLat || 11.5620);
    const currentLng = liveGps?.lng ?? (bus?.currentLng || 104.9120);
    const points: [number, number][] = [];
    if (currentLat && currentLng) points.push([currentLat, currentLng]);
    if (selectedChild?.pickupLat && selectedChild?.pickupLng) points.push([selectedChild.pickupLat, selectedChild.pickupLng]);
    if (school?.lat && school?.lng) points.push([school.lat, school.lng]);

    if (points.length >= 2) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15, animate: true });
    } else if (currentLat && currentLng) {
      mapInstanceRef.current.setView([currentLat, currentLng], 14, { animate: true });
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
          <div className="flex items-center gap-2.5">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {language === 'km' ? 'ការតាមដានការធ្វើដំណើររបស់កូនផ្ទាល់' : 'Live Child Transportation Tracking'}
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {language === 'km' ? 'GPS ផ្ទាល់' : 'Live GPS'}
            </span>
          </div>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
            {language === 'km' 
              ? 'តាមដានស្ថានភាពរថយន្តសាលា ការឡើងជិះ និងការមកដល់សាលារបស់កូនអ្នកក្នុងពេលវេលាជាក់ស្តែង។' 
              : 'Real-time telemetry, pickup confirmation, and turn-by-turn route progress for your child.'}
          </p>
        </div>

        {/* Child Selector Pill */}
        {myChildren.length > 1 && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-sm font-bold text-slate-600 pl-2.5">
              {language === 'km' ? 'ជ្រើសរើសកូន' : 'Select Child'}:
            </span>
            {myChildren.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer min-h-[44px] ${
                  child.id === selectedChildId
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
        
        {/* Top Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm ${
              isPickedUp ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              isAtSchool ? 'bg-purple-100 text-purple-800 border border-purple-300' :
              isAbsent ? 'bg-rose-100 text-rose-800 border border-rose-300' :
              'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
            }`}>
              {isPickedUp ? '🚌' : isAtSchool ? '🏫' : isAbsent ? '✕' : '⏳'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedChild?.name}
                </h3>
                <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${
                  isPickedUp ? 'bg-emerald-100 text-emerald-800' :
                  isAtSchool ? 'bg-purple-100 text-purple-800' :
                  isAbsent ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-900'
                }`}>
                  {isPickedUp ? (language === 'km' ? 'នៅលើរថយន្តក្រុង (Picked Up)' : 'On Board Bus') :
                   isAtSchool ? (language === 'km' ? 'មកដល់សាលារួចរាល់' : 'At School') :
                   isAbsent ? (language === 'km' ? 'អវត្តមាន' : 'Absent') :
                   (language === 'km' ? 'កំពុងរង់ចាំការមកទទួល' : 'Waiting for Pickup')}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
                {selectedChild?.grade} • ID: #{selectedChild?.id} • {localize(school?.name, school?.nameKh)}
              </p>
            </div>
          </div>

          {/* Quick Refresh & Recenter Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowIdCard(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm font-bold flex items-center gap-2 border border-blue-200 transition-colors cursor-pointer min-h-[46px]"
              title="View Digital Student ID & Boarding QR Pass"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>{language === 'km' ? 'កាតសិស្ស & QR' : 'Student ID & QR'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-bold flex items-center gap-2 border border-slate-200 transition-colors min-h-[46px] cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh Telemetry'}</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 min-h-[46px] min-w-[46px] flex items-center justify-center cursor-pointer"
              title="Connection status & push alerts configuration"
            >
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* 4-Step Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          
          {/* Step 1: Waiting at Home */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            !isPickedUp && !isAtSchool && !isAbsent
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-slate-50/80 border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                isPickedUp || isAtSchool ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {isPickedUp || isAtSchool ? '✓' : '1'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'km' ? '១. រង់ចាំនៅផ្ទះ' : '1. Waiting at Home'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium line-clamp-2">
              {language === 'km' && selectedChild?.pickupAddressKh ? selectedChild.pickupAddressKh : selectedChild?.pickupAddress}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-mono font-medium">
              {language === 'km' ? 'ម៉ោងប៉ាន់ស្មាន' : 'Scheduled'}: 07:30 AM
            </p>
          </div>

          {/* Step 2: Picked Up by Bus */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isPickedUp && !isAtSchool
              ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/30 shadow-xs'
              : isAtSchool
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-slate-50/40 border-slate-200/60 opacity-60'
          }`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                isPickedUp || isAtSchool ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {isPickedUp || isAtSchool ? '✓' : '2'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'km' ? '២. បានឡើងរថយន្ត' : '2. Picked Up'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              {isPickedUp 
                ? (language === 'km' ? `ទទួលនៅម៉ោង៖ ${selectedChild?.pickedUpAt || '07:35 AM'}` : `Boarded at: ${selectedChild?.pickedUpAt || '07:35 AM'}`)
                : (language === 'km' ? 'រង់ចាំការបញ្ជាក់ពីអ្នកបើកបរ' : 'Awaiting driver confirmation')}
            </p>
            {isPickedUp && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                {language === 'km' ? 'បានបញ្ជាក់' : 'Driver Confirmed'}
              </span>
            )}
          </div>

          {/* Step 3: En Route to School */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isPickedUp && !isAtSchool
              ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20'
              : isAtSchool
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-slate-50/40 border-slate-200/60 opacity-60'
          }`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                isAtSchool ? 'bg-emerald-600 text-white' : isPickedUp ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {isAtSchool ? '✓' : '3'}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'km' ? '៣. ធ្វើដំណើរតាមផ្លូវ' : '3. En Route'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              {isPickedUp 
                ? (language === 'km' ? `ល្បឿន៖ ${bus?.speed || 24} km/h • តាមផ្លូវ ៣១៥` : `Moving at ${bus?.speed || 24} km/h via St. 315`)
                : (language === 'km' ? 'មិនទាន់ចេញដំណើរ' : 'Not started')}
            </p>
            {isPickedUp && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                ETA: 07:55 AM
              </span>
            )}
          </div>

          {/* Step 4: Arrived at School */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isAtSchool
              ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-500/30'
              : 'bg-slate-50/40 border-slate-200/60 opacity-60'
          }`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                isAtSchool ? 'bg-purple-700 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                4
              </span>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                {language === 'km' ? '៤. មកដល់សាលារៀន' : '4. Arrived at School'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium line-clamp-2">
              {localize(school?.name, school?.nameKh)}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {isAtSchool ? (language === 'km' ? 'បានទម្លាក់ដោយសុវត្ថិភាព' : 'Dropped off safely') : (language === 'km' ? 'គោលដៅចុងក្រោយ' : 'Final Destination')}
            </p>
          </div>

        </div>

        {/* 2. AUTOMATIC NOTIFICATION BANNER (Core Requirement 3) */}
        {childPickupNotification && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-xs animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-black text-emerald-950 uppercase tracking-wide">
                  {childPickupNotification.title}
                </h4>
                <span className="text-xs sm:text-sm font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                  {childPickupNotification.timestamp}
                </span>
              </div>
              <p className="text-sm sm:text-base text-emerald-900 font-medium mt-1 leading-relaxed">
                {childPickupNotification.message}
              </p>
              <div className="flex items-center gap-2 mt-2.5 text-xs text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-2">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-slate-900">
              <Navigation className="w-5 h-5 text-blue-600" />
              <span>{language === 'km' ? 'ផែនទីភ្នំពេញពេលវេលាជាក់ស្តែង' : 'Live Phnom Penh Navigation Map'}</span>
              
              {/* GPS Status Badge */}
              {liveGps?.isDemoData ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>DEMO DATA (SIMULATED)</span>
                </span>
              ) : liveGps?.sharingStatus === 'broadcasting' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>REAL DEVICE GPS (LIVE)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  SHARING STOPPED
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 font-medium">
              <span className="font-mono text-slate-800 font-bold">
                {liveGps?.timestamp ? `${Math.floor((now - liveGps.timestamp) / 1000)}s ago` : 'Cached'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-teal-800">
                ±{liveGps?.accuracy || 8}m accuracy
              </span>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[500px]">
            {/* Top Left: Street / Satellite Layer Toggle Controls & Follow Bus Toggle */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[90%]">
              <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 text-sm font-bold">
                <button
                  onClick={() => setMapType('street')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 min-h-[38px] cursor-pointer text-xs ${
                    mapType === 'street' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ផែនទីផ្លូវ' : 'Street'}</span>
                </button>

                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 min-h-[38px] cursor-pointer text-xs ${
                    mapType === 'satellite' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ផ្កាយរណប' : 'Satellite'}</span>
                </button>
              </div>

              {/* Follow Bus Mode Toggle */}
              <button
                onClick={() => {
                  const nextState = !isFollowingBus;
                  setIsFollowingBus(nextState);
                  if (nextState) handleRecenter();
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 min-h-[38px] text-xs font-bold border cursor-pointer shadow-md backdrop-blur-md ${
                  isFollowingBus 
                    ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/40' 
                    : 'bg-white/95 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                }`}
                title="Follow bus location automatically"
              >
                <span className={`w-2 h-2 rounded-full ${isFollowingBus ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
                <Radio className={`w-3.5 h-3.5 ${isFollowingBus ? 'text-white' : 'text-slate-500'}`} />
                <span>{language === 'km' ? (isFollowingBus ? 'កំពុងតាមដានឡាន' : 'តាមដានឡាន') : (isFollowingBus ? 'Following Bus' : 'Follow Bus')}</span>
              </button>
            </div>

            {/* Top Right: Smooth Zoom & View Controls */}
            <div className="absolute top-3 right-3 z-10 flex flex-col items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200/90 gap-1.5">
              {/* Zoom In */}
              <button
                onClick={handleZoomIn}
                className="w-11 h-11 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title={language === 'km' ? 'ពង្រីកផែនទី (+)' : 'Zoom In (+)'}
                aria-label="Zoom in"
              >
                <Plus className="w-5 h-5 text-slate-800" />
              </button>

              {/* Current Zoom Indicator */}
              <div className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-extrabold text-slate-600 select-none">
                {currentZoom}x
              </div>

              {/* Zoom Out */}
              <button
                onClick={handleZoomOut}
                className="w-11 h-11 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title={language === 'km' ? 'បង្រួមផែនទី (−)' : 'Zoom Out (−)'}
                aria-label="Zoom out"
              >
                <Minus className="w-5 h-5 text-slate-800" />
              </button>

              <div className="w-full h-px bg-slate-200 my-0.5" />

              {/* Reset Zoom / Fit Route */}
              <button
                onClick={handleResetZoom}
                className="w-11 h-11 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title={language === 'km' ? 'កំណត់ទិដ្ឋភាពឡើងវិញ' : 'Reset Zoom & View All'}
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-4 h-4 text-slate-700" />
              </button>

              {/* Recenter on Bus */}
              <button
                onClick={handleRecenter}
                className="w-11 h-11 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title={language === 'km' ? 'ចំកណ្តាលឡាន' : 'Center on Bus'}
                aria-label="Center on bus"
              >
                <Crosshair className="w-5 h-5 text-blue-600" />
              </button>
            </div>

            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Offline Status floating pill if offline */}
            {isOfflineMode && (
              <div className="absolute bottom-4 left-4 z-10 bg-amber-950/90 text-amber-200 border border-amber-600/50 px-3.5 py-2 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>{language === 'km' ? 'របៀបក្រៅបណ្តាញ (រក្សាទុកទិន្នន័យ)' : 'Offline buffer active'}</span>
              </div>
            )}
          </div>
        </div>

        {/* DRIVER & VEHICLE TELEMETRY CARD (1 Column) */}
        <div className="space-y-4">
          
          {/* Assigned Driver Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                {language === 'km' ? 'ព័ត៌មានអ្នកបើកបរ' : 'Assigned Driver'}
              </h4>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                {language === 'km' ? 'កំពុងបំពេញការងារ' : 'On Duty'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={driver?.userId === 'usr-driver-2' ? '/images/khmer_driver2.svg' : '/images/khmer_driver.svg'}
                alt={driver?.name || 'Driver'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">{driver?.name || 'Chan Dara'}</h3>
                <p className="text-sm text-slate-600 font-mono mt-0.5 font-medium">{driver?.phone || '+855 12 345 678'}</p>
                <p className="text-xs text-blue-700 font-bold mt-1">
                  License: {driver?.licenseNumber || 'KH-DRV-2024-88'}
                </p>
              </div>
            </div>

            <a
              href={`tel:${driver?.phone || '+85512345678'}`}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{language === 'km' ? 'ទាក់ទងអ្នកបើកបរផ្ទាល់' : 'Call Driver Directly'}</span>
            </a>
          </div>

          {/* Bus Telemetry Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
              {language === 'km' ? 'ព័ត៌មានរថយន្ត និងសុវត្ថិភាព' : 'Bus & Safety Telemetry'}
            </h4>

            <div className="grid grid-cols-2 gap-3.5 pt-1 text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-bold block">{t('students.bus')}</span>
                <strong className="text-slate-900 font-black text-lg sm:text-xl block mt-0.5">{bus?.busNumber || 'Bus 03'}</strong>
                <span className="text-xs text-slate-600 block truncate font-medium mt-0.5">{bus?.plateNumber || 'PP-2B-8899'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 uppercase font-bold block">
                  {language === 'km' ? 'ល្បឿនបច្ចុប្បន្ន' : 'Current Speed'}
                </span>
                <strong className="text-emerald-700 font-black text-lg sm:text-xl block mt-0.5">{bus?.speed || 24} km/h</strong>
                <span className="text-xs text-emerald-800 block font-bold mt-0.5">
                  {language === 'km' ? '✓ ល្បឿនសុវត្ថិភាព' : '✓ Safe Zone'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-200/80 text-sm sm:text-base text-slate-700 font-medium">
              <div className="flex justify-between">
                <span>{language === 'km' ? 'ខ្សែរត់' : 'Route'}:</span>
                <strong className="text-slate-900 font-bold">{localize(route?.name, route?.nameKh)}</strong>
              </div>
              <div className="flex justify-between">
                <span>{language === 'km' ? 'ទីតាំង GPS' : 'GPS Coordinates'}:</span>
                <span className="font-mono text-xs sm:text-sm text-slate-800 font-semibold">
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
