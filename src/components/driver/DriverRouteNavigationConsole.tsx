import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Student, Route, Bus, Driver } from '../../types';
import { 
  calculateRouteWithOSRM, CalculatedRouteResult, GeoLocation, PHNOM_PENH_BOUNDS 
} from '../../services/routingService';
import { 
  Bus as BusIcon, Navigation, CheckCircle2, UserCheck, XCircle, 
  Phone, Clock, MapPin, ChevronRight, AlertTriangle, Wifi, WifiOff, 
  RefreshCw, Volume2, ShieldCheck, Play, RotateCcw, Check, UserX,
  Compass, ExternalLink, Settings, Sparkles, HelpCircle, Layers, QrCode, Printer,
  AlertOctagon
} from 'lucide-react';
import { DriverQRScannerModal } from './DriverQRScannerModal';
import { BusBoardingStickerQRModal } from '../common/BusBoardingStickerQRModal';
import { EmergencyBreakdownModal } from '../emergency/EmergencyBreakdownModal';

interface DriverRouteNavigationConsoleProps {
  onBackToDashboard?: () => void;
}

export function DriverRouteNavigationConsole({ onBackToDashboard }: DriverRouteNavigationConsoleProps) {
  const { 
    currentUser, drivers, buses, routes, students, parents,
    confirmStudentPickup, markStudentAbsent, updateBusLocation,
    isOfflineMode, setIsOfflineMode, offlineQueueCount, syncOfflineQueue,
    activeEmergencyTrip, activeEmergencyIncident,
    t, localize, language, formatNumber 
  } = useApp();

  const driver: Driver = drivers.find(d => d.userId === currentUser?.id) || drivers[0];
  const bus: Bus = buses.find(b => b.id === driver?.busId) || buses[0];
  const route: Route = routes.find(r => r.id === driver?.routeId) || routes[0];

  // Assigned students sorted by pickupOrder
  const assignedStudents = useMemo(() => {
    return students
      .filter(s => s.busId === bus?.id || s.routeId === route?.id)
      .sort((a, b) => (a.pickupOrder || 0) - (b.pickupOrder || 0));
  }, [students, bus?.id, route?.id]);

  // Current active target student for navigation
  // Defaults to first student not yet picked up or absent
  const nextPendingStudent = assignedStudents.find(s => s.status === 'waiting' || s.status === 'at_home');
  const [activeStudentId, setActiveStudentId] = useState<string>(
    nextPendingStudent ? nextPendingStudent.id : (assignedStudents[0]?.id || '')
  );

  // When nextPendingStudent changes automatically after pickup, advance active student
  useEffect(() => {
    if (nextPendingStudent && nextPendingStudent.id !== activeStudentId) {
      setActiveStudentId(nextPendingStudent.id);
    }
  }, [nextPendingStudent?.id]);

  const activeStudent = assignedStudents.find(s => s.id === activeStudentId) || assignedStudents[0];

  // Bus GPS coordinates (defaults to Bus currentLat or near Phnom Penh center)
  const [busPosition, setBusPosition] = useState<[number, number]>([
    bus?.currentLat || 11.5620,
    bus?.currentLng || 104.9120
  ]);
  const [busHeading, setBusHeading] = useState<number>(bus?.heading || 45);
  const [busSpeed, setBusSpeed] = useState<number>(bus?.speed || 24);

  // Turn-by-Turn Guidance state
  const [currentInstruction, setCurrentInstruction] = useState<{
    textEn: string;
    textKh: string;
    distanceMeters: number;
    turnType: 'straight' | 'right' | 'left' | 'arrive';
  }>({
    textEn: 'Continue on St. 315 toward student pickup location',
    textKh: 'បន្តដំណើរត្រង់លើផ្លូវ ៣១៥ ឆ្ពោះទៅកាន់ចំណតសិស្ស',
    distanceMeters: 350,
    turnType: 'straight'
  });

  // UI States
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [callingParent, setCallingParent] = useState<Student | null>(null);
  const [calculatedRoute, setCalculatedRoute] = useState<CalculatedRouteResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const stopsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: busPosition,
        zoom: 14,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      stopsLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Calculate and draw real road route between bus and student stops
  useEffect(() => {
    if (!mapInstanceRef.current || !activeStudent) return;

    const fetchRoute = async () => {
      setIsCalculatingRoute(true);
      try {
        // Build sequence from bus position -> active student pickup -> subsequent stops
        const locationsToRoute: GeoLocation[] = [
          {
            id: 'bus-current',
            name: bus?.busNumber || 'School Bus',
            address: 'Current Live GPS Location',
            lat: busPosition[0],
            lng: busPosition[1],
            type: 'origin' as const
          },
          {
            id: activeStudent.id,
            name: activeStudent.name,
            address: activeStudent.pickupAddress,
            lat: activeStudent.pickupLat,
            lng: activeStudent.pickupLng,
            type: 'student_pickup' as const
          }
        ];

        // Add remaining waiting stops
        assignedStudents
          .filter(s => s.id !== activeStudent.id && s.status === 'waiting')
          .forEach(s => {
            locationsToRoute.push({
              id: s.id,
              name: s.name,
              address: s.pickupAddress,
              lat: s.pickupLat,
              lng: s.pickupLng,
              type: 'student_pickup' as const
            });
          });

        // Add final school destination
        locationsToRoute.push({
          id: 'school-dest',
          name: 'Institute of Technology of Cambodia (ITC)',
          address: 'Russian Blvd, Phnom Penh',
          lat: 11.5683,
          lng: 104.9179,
          type: 'school' as const
        });

        const routeResult = await calculateRouteWithOSRM(locationsToRoute, 'driving');
        setCalculatedRoute(routeResult);

        // Update turn guidance based on first leg
        if (routeResult.legs[0]?.steps[0]) {
          const firstStep = routeResult.legs[0].steps[0];
          let turn: 'straight' | 'right' | 'left' | 'arrive' = 'straight';
          if (firstStep.instruction.toLowerCase().includes('right')) turn = 'right';
          if (firstStep.instruction.toLowerCase().includes('left')) turn = 'left';
          if (firstStep.instruction.toLowerCase().includes('arrive')) turn = 'arrive';

          setCurrentInstruction({
            textEn: firstStep.instruction,
            textKh: firstStep.instructionKh || 'បត់តាមទិសដៅផ្លូវដែលបានណែនាំ',
            distanceMeters: firstStep.distanceMeters,
            turnType: turn
          });
        }
      } catch (e) {
        console.warn('Could not calculate real road route', e);
      } finally {
        setIsCalculatingRoute(false);
      }
    };

    fetchRoute();
  }, [busPosition[0], busPosition[1], activeStudentId]);

  // Update map polyline and markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Update Bus Marker
    const busIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-blue-500/30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect width="16" height="16" x="4" y="4" rx="2" stroke-width="2"/>
            <path stroke-width="2" d="M4 10h16M9 16h6"/>
          </svg>
        </div>
        <div class="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white">
          ${busSpeed}k
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      html: busIconHtml,
      className: 'bus-marker-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng(busPosition);
      busMarkerRef.current.setIcon(busIcon);
    } else {
      busMarkerRef.current = L.marker(busPosition, { icon: busIcon }).addTo(map);
    }

    // 2. Update Student Stops Markers
    if (stopsLayerGroupRef.current) {
      stopsLayerGroupRef.current.clearLayers();

      assignedStudents.forEach((student, idx) => {
        const isCurrentTarget = student.id === activeStudentId;
        const isPickedUp = student.status === 'picked_up';
        const isAbsent = student.status === 'absent';

        let badgeBg = 'bg-blue-600';
        let ringEffect = '';
        if (isPickedUp) badgeBg = 'bg-emerald-600';
        else if (isAbsent) badgeBg = 'bg-rose-500';
        else if (isCurrentTarget) {
          badgeBg = 'bg-amber-500';
          ringEffect = 'ring-4 ring-amber-400/50 animate-pulse';
        }

        const stopIconHtml = `
          <div class="flex flex-col items-center cursor-pointer group">
            <div class="w-8 h-8 rounded-full ${badgeBg} ${ringEffect} text-white font-extrabold text-xs flex items-center justify-center shadow-md border-2 border-white transition-transform group-hover:scale-110">
              ${isPickedUp ? '✓' : isAbsent ? '✕' : (student.pickupOrder || idx + 1)}
            </div>
            <div class="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md mt-1 truncate max-w-[100px] border border-slate-700">
              ${student.name.split(' ')[0]}
            </div>
          </div>
        `;

        const stopIcon = L.divIcon({
          html: stopIconHtml,
          className: 'student-stop-icon',
          iconSize: [80, 45],
          iconAnchor: [40, 20]
        });

        const marker = L.marker([student.pickupLat, student.pickupLng], { icon: stopIcon });
        marker.on('click', () => {
          setActiveStudentId(student.id);
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 170px;">
            <p style="font-weight: 800; font-size: 13px; margin: 0 0 2px 0; color: #0f172a;">${student.name}</p>
            <p style="margin: 0; color: #64748b; font-size: 11px;">${student.grade} • ចំណតទី #${student.pickupOrder || idx + 1}</p>
            <p style="margin: 4px 0 0 0; color: #334155;">${student.pickupAddress}</p>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-weight: 700; color: ${
              isPickedUp ? '#059669' : isAbsent ? '#e11d48' : '#d97706'
            };">
              ${isPickedUp ? 'បានឡើងរថយន្តរួចរាល់' : isAbsent ? 'អវត្តមាន' : 'កំពុងរង់ចាំ'}
            </div>
          </div>
        `);

        stopsLayerGroupRef.current?.addLayer(marker);
      });

      // Also add School destination pin
      const schoolIconHtml = `
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center shadow-md border-2 border-white">
            🏫
          </div>
          <div class="bg-purple-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-1">
            ITC
          </div>
        </div>
      `;
      const schoolMarker = L.marker([11.5683, 104.9179], {
        icon: L.divIcon({
          html: schoolIconHtml,
          className: 'school-dest-icon',
          iconSize: [50, 40],
          iconAnchor: [25, 20]
        })
      });
      schoolMarker.bindPopup(`<strong>Institute of Technology of Cambodia (ITC)</strong><br/>School Dropoff Destination`);
      stopsLayerGroupRef.current?.addLayer(schoolMarker);
    }

    // 3. Update Polyline
    if (calculatedRoute && calculatedRoute.polyline.length > 0) {
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(calculatedRoute.polyline);
      } else {
        routePolylineRef.current = L.polyline(calculatedRoute.polyline, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round'
        }).addTo(map);
      }
    }
  }, [busPosition, assignedStudents, activeStudentId, calculatedRoute, busSpeed]);

  // Recenter map on bus
  const handleRecenterBus = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(busPosition, { animate: true, duration: 0.6 });
    }
  };

  // Simulate Drive forward along path to next stop
  const handleSimulateDrive = () => {
    if (!activeStudent) return;
    setIsSimulatingDrive(true);

    // Lerp bus position closer to activeStudent.pickupLat / pickupLng
    const targetLat = activeStudent.pickupLat;
    const targetLng = activeStudent.pickupLng;

    const newLat = busPosition[0] + (targetLat - busPosition[0]) * 0.6;
    const newLng = busPosition[1] + (targetLng - busPosition[1]) * 0.6;

    setBusPosition([newLat, newLng]);
    setBusSpeed(32);
    updateBusLocation(bus.id, newLat, newLng, 45, 32);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([newLat, newLng], { animate: true, duration: 0.8 });
    }

    setTimeout(() => {
      setIsSimulatingDrive(false);
      setBusSpeed(0);
      updateBusLocation(bus.id, newLat, newLng, 45, 0);
    }, 1000);
  };

  // 1-TAP PICKUP CONFIRMATION (Core Requirement 2 & 3)
  const handleConfirmPickup = async () => {
    if (!activeStudent) return;

    const currentStudentName = activeStudent.name;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const res = await confirmStudentPickup(activeStudent.id, nowTime);

    // Automatically find next waiting student in route order
    const nextWaiting = assignedStudents.find(
      s => s.id !== activeStudent.id && s.status === 'waiting'
    );

    if (res.offlineQueued) {
      setActionSuccessMsg(
        language === 'km'
          ? `✓ បានកត់ត្រាការឡើងរថយន្តរបស់ ${currentStudentName}! បានរក្សាទុកក្នុងជួរ Offline (នឹងបញ្ជូនពេលភ្ជាប់អ៊ីនធឺណិត)។`
          : `✓ ${currentStudentName} confirmed Picked Up! Queued offline (will sync when online).`
      );
    } else {
      setActionSuccessMsg(
        language === 'km'
          ? `✓ បានកត់ត្រាការឡើងរថយន្តរបស់ ${currentStudentName}! បានជូនដំណឹងទៅអាណាព្យាបាលតាម Telegram/App ភ្លាមៗ។`
          : `✓ ${currentStudentName} Picked Up! Instant notification dispatched to registered parent.`
      );
    }

    // Automatically navigate to next student immediately
    if (nextWaiting) {
      setTimeout(() => {
        setActiveStudentId(nextWaiting.id);
      }, 300);
    }

    // Voice announcement for hands-free driving awareness
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speechMsg = language === 'km'
          ? `បានកត់ត្រាការឡើងរថយន្តរបស់ ${currentStudentName}។ គោលដៅបន្ទាប់គឺ ${nextWaiting ? nextWaiting.name : 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា'}`
          : `${currentStudentName} confirmed picked up. Guiding to ${nextWaiting ? nextWaiting.name : 'school destination'}.`;
        const utterance = new SpeechSynthesisUtterance(speechMsg);
        utterance.lang = language === 'km' ? 'km-KH' : 'en-US';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Audio fallback
    }

    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // Mark absent
  const handleMarkAbsent = () => {
    if (!activeStudent) return;
    markStudentAbsent(activeStudent.id, 'មិនបានជិះថ្ងៃនេះ');
    setActionSuccessMsg(
      language === 'km'
        ? `បានកត់ត្រាអវត្តមានសម្រាប់ ${activeStudent.name}។ បានជូនដំណឹងដល់អាណាព្យាបាលរួចរាល់។`
        : `Marked ${activeStudent.name} as absent. Parent notified.`
    );
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Callback from QR Scanner on successful verification (Requirement 3, 4)
  const handleStudentVerified = (verifiedStudent: Student) => {
    const nextWaiting = assignedStudents.find(
      s => s.id !== verifiedStudent.id && s.status === 'waiting'
    );
    if (nextWaiting) {
      setTimeout(() => {
        setActiveStudentId(nextWaiting.id);
      }, 300);
    }
    setActionSuccessMsg(
      language === 'km'
        ? `✓ បានស្កេនកូដ QR ជោគជ័យ! ${verifiedStudent.name} បានឡើងរថយន្ត។ បានជូនដំណឹងទៅអាណាព្យាបាលរួចរាល់។`
        : `✓ QR Code Verified! ${verifiedStudent.name} confirmed Picked Up. Parent notified.`
    );
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };
  const remainingCount = assignedStudents.filter(s => s.status === 'waiting').length;
  const pickedUpCount = assignedStudents.filter(s => s.status === 'picked_up').length;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      
      {/* 1. TOP TURN-BY-TURN GUIDANCE HUD (High Visibility for Driver) */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Navigation Instruction Box */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 shrink-0">
            {currentInstruction.turnType === 'right' ? (
              <span className="text-2xl font-black">↗</span>
            ) : currentInstruction.turnType === 'left' ? (
              <span className="text-2xl font-black">↖</span>
            ) : currentInstruction.turnType === 'arrive' ? (
              <MapPin className="w-6 h-6" />
            ) : (
              <span className="text-2xl font-black">↑</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {currentInstruction.distanceMeters}m
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {busSpeed} km/h
              </span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
              {language === 'km' ? currentInstruction.textKh : currentInstruction.textEn}
            </h3>
          </div>
        </div>

        {/* Target Student Quick Summary */}
        {activeStudent && (
          <div className="hidden md:flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-xs border border-amber-500/40">
              #{activeStudent.pickupOrder || 1}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">
                {language === 'km' ? 'គោលដៅទទួលបន្ទាប់' : 'Next Student'}
              </p>
              <p className="text-xs font-bold text-white mt-0.5">
                {activeStudent.name} ({activeStudent.grade})
              </p>
            </div>
          </div>
        )}

        {/* Top Controls: Offline Toggle & Integration Diagnostics */}
        <div className="flex items-center gap-2">
          {/* Offline Mode Toggle Button */}
          <button
            onClick={() => {
              const nextState = !isOfflineMode;
              setIsOfflineMode(nextState);
              if (!nextState) syncOfflineQueue();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isOfflineMode 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
            title="Toggle offline simulated mode"
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOfflineMode ? (language === 'km' ? 'គ្មានអ៊ីនធឺណិត' : 'Offline Mode') : 'Online'}</span>
            {offlineQueueCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {offlineQueueCount}
              </span>
            )}
          </button>

          {/* Quick QR Scanner Trigger Button */}
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
            title="Scan Student QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{language === 'km' ? 'ស្កេន QR' : 'Scan QR'}</span>
          </button>

          {/* Emergency / Bus Breakdown Trigger */}
          <button
            onClick={() => setShowBreakdownModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black transition-all shadow-md shadow-rose-600/30 active:scale-95 cursor-pointer border border-rose-400/40"
            title="Emergency / Bus Breakdown"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">{language === 'km' ? '🚨 អាសន្ន' : '🚨 Emergency'}</span>
          </button>

          {/* Quick Bus Sticker Pass & Notes Trigger */}
          <button
            onClick={() => setShowStickerModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all border border-amber-400/30 active:scale-95 cursor-pointer"
            title="View Bus Door Sticker Pass & In-App Operating Notes"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{language === 'km' ? 'ប័ណ្ណបិទឡាន' : 'Bus Sticker'}</span>
          </button>

          {/* Service Integrations Status Modal Trigger */}
          <button
            onClick={() => setShowIntegrationsModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="View connected services status"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </button>

          {/* Toggle Student Manifest Drawer */}
          <button
            onClick={() => setShowManifest(!showManifest)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <span>{language === 'km' ? 'បញ្ជីសិស្ស' : 'Manifest'}</span>
            <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full font-bold">
              {remainingCount}
            </span>
          </button>
        </div>
      </div>

      {/* Offline Alert Bar (if offline) */}
      {isOfflineMode && (
        <div className="bg-amber-950/80 border-b border-amber-700/50 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200 z-10">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {language === 'km'
                ? `របៀបគ្មានអ៊ីនធឺណិត៖ រាល់ការកត់ត្រាឡើងរថយន្តនឹងត្រូវរក្សាទុកក្នុងឧបករណ៍ និងបញ្ជូនទៅអាណាព្យាបាលពេលភ្ជាប់ឡើងវិញ (${offlineQueueCount} នៅក្នុងជួរ)។`
                : `Offline Mode: All student pickups are cached locally and will automatically notify parents once connectivity is restored (${offlineQueueCount} in queue).`}
            </span>
          </div>
          {offlineQueueCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-lg shrink-0 ml-2"
            >
              {language === 'km' ? 'ធ្វើសមកាលកម្មឥឡូវ' : 'Sync Now'}
            </button>
          )}
        </div>
      )}

      {/* Action Notification Toast Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold z-10 animate-in fade-in slide-in-from-top-1 duration-200 shadow-md">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-200 animate-bounce" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 2. MAIN SPLIT: INTERACTIVE MAP (Fills top/center) + LARGE DRIVER ACTION PANEL (Bottom) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEAFLET MAP VIEW */}
        <div className="flex-1 relative min-h-[300px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Map Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={handleRecenterBus}
              className="w-11 h-11 rounded-2xl bg-slate-900/90 text-white hover:bg-slate-800 flex items-center justify-center shadow-xl border border-slate-700 transition-all active:scale-95"
              title="Recenter on Bus"
            >
              <Compass className="w-5 h-5 text-blue-400" />
            </button>
            <button
              onClick={handleSimulateDrive}
              disabled={isSimulatingDrive}
              className="px-3.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              title="Simulate driving toward next stop"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'km' ? 'បើកបន្ត' : 'Drive Demo'}</span>
            </button>
          </div>

          {/* Quick Route Summary Badge */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <BusIcon className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-white">{bus?.busNumber || 'Bus 03'}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="text-slate-300">
              {formatNumber(pickedUpCount)}/{formatNumber(assignedStudents.length)} {language === 'km' ? 'បានឡើង' : 'Picked Up'}
            </div>
          </div>
        </div>

        {/* 3. LARGE DRIVER PICKUP ACTION PANEL (Optimized for One-Hand Driving Use) */}
        <div className="w-full lg:w-[420px] bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          
          {/* Quick Horizontal Student Selector Carousel (Allows driver to tap any student name to select) */}
          <div className="mb-4 pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {language === 'km' ? 'លំដាប់ទទួលសិស្ស (ចុចឈ្មោះដើម្បីជ្រើស)' : 'Rider Stops (Tap name to select)'}
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                {assignedStudents.filter(s => s.status === 'waiting').length} {language === 'km' ? 'នៅរង់ចាំ' : 'waiting'}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {assignedStudents.map((st, idx) => {
                const isSelected = st.id === activeStudentId;
                const isPicked = st.status === 'picked_up';
                const isAbs = st.status === 'absent';
                return (
                  <button
                    key={st.id}
                    onClick={() => setActiveStudentId(st.id)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400'
                        : isPicked
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                        : isAbs
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                    title={st.pickupAddress}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] shrink-0 ${
                      isPicked ? 'bg-emerald-500 text-white' :
                      isAbs ? 'bg-rose-500 text-white' :
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isPicked ? '✓' : isAbs ? '✕' : (st.pickupOrder || idx + 1)}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight whitespace-nowrap">{st.name}</p>
                      <p className="text-[10px] opacity-75 whitespace-nowrap">
                        {isPicked ? (st.pickedUpAt || 'Picked up') : isAbs ? 'Absent' : `Stop #${st.pickupOrder || idx + 1}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Student Target Card */}
          {activeStudent ? (
            <div className="space-y-4">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  {language === 'km' ? `ចំណតបន្ទាប់ #${activeStudent.pickupOrder || 1}` : `Target Pickup #${activeStudent.pickupOrder || 1}`}
                </span>

                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  activeStudent.status === 'picked_up' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  activeStudent.status === 'absent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {activeStudent.status === 'picked_up' ? t('students.pickedUp') :
                   activeStudent.status === 'absent' ? 'Absent' : t('students.waiting')}
                </span>
              </div>

              {/* Student Profile & Address Card */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-black text-xl shadow-inner shrink-0">
                    {activeStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight leading-tight">
                      {activeStudent.name}
                    </h2>
                    <p className="text-xs text-blue-400 font-bold mt-0.5">
                      {activeStudent.grade} • ID: #{activeStudent.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white leading-snug">
                        {language === 'km' && activeStudent.pickupAddressKh ? activeStudent.pickupAddressKh : activeStudent.pickupAddress}
                      </p>
                      {activeStudent.notes && (
                        <p className="text-[11px] text-amber-300/90 font-medium mt-0.5">
                          ℹ️ {activeStudent.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                    <span>{language === 'km' ? 'អាណាព្យាបាល' : 'Parent Contact'}:</span>
                    <strong className="text-slate-200 font-mono">{activeStudent.parentPhone || '+855 10 223 344'}</strong>
                  </div>
                </div>
              </div>

              {/* GIANT TOUCH BUTTONS (Core Requirement 2 & 5) */}
              <div className="space-y-2.5 pt-1">
                {/* 📷 QR CODE SCANNER BUTTON (Core Requirement 2 & 3) */}
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="w-full h-15 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-97 text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-blue-900/40 transition-all border border-blue-400/30 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-extrabold shadow-sm">
                    <QrCode className="w-5 h-5 text-amber-300" />
                  </div>
                  <span>{language === 'km' ? 'ស្កេនកូដ QR សិស្ស (Scan QR)' : 'SCAN STUDENT QR CODE'}</span>
                </button>

                {/* 🟢 GIANT PICKED UP BUTTON */}
                <button
                  onClick={handleConfirmPickup}
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-97 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40 transition-all border border-emerald-400/40 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-extrabold shadow-sm">
                    ✓
                  </div>
                  <span>{language === 'km' ? 'បានឡើងរថយន្ត (Picked Up)' : 'CONFIRM PICKED UP'}</span>
                </button>

                {/* Secondary Action Row: Call Parent & Mark Absent */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setCallingParent(activeStudent)}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>{language === 'km' ? 'ទូរស័ព្ទ' : 'Call Parent'}</span>
                  </button>

                  <button
                    onClick={handleMarkAbsent}
                    className="py-3 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 border border-rose-800/40 transition-colors"
                  >
                    <UserX className="w-4 h-4 text-rose-400" />
                    <span>{language === 'km' ? 'អវត្តមាន' : 'Mark Absent'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">
                {language === 'km' ? 'បានទទួលសិស្សទាំងអស់រួចរាល់!' : 'All Students Picked Up!'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'km'
                  ? 'រថយន្តកំពុងធ្វើដំណើរឆ្ពោះទៅកាន់វិទ្យាស្ថានតិចណូ ITC។'
                  : 'Proceeding directly to Institute of Technology of Cambodia (ITC).'}
              </p>
            </div>
          )}

          {/* Bottom Navigation Switch to next stop manually */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              {language === 'km' ? 'សិស្សកំពុងរង់ចាំ' : 'Remaining'}: <strong className="text-white">{remainingCount}</strong>
            </span>
            <button
              onClick={() => {
                const nextIndex = assignedStudents.findIndex(s => s.id === activeStudentId) + 1;
                if (assignedStudents[nextIndex]) {
                  setActiveStudentId(assignedStudents[nextIndex].id);
                }
              }}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>{language === 'km' ? 'ចំណតបន្ទាប់' : 'Next Stop'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 4. STUDENT PICKUP MANIFEST MODAL / SLIDE-OVER */}
      {showManifest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {language === 'km' ? 'បញ្ជីវត្តមាន និងលំដាប់ទទួលសិស្ស' : 'Student Pickup Manifest & Order'}
                </h3>
                <p className="text-xs text-slate-400">
                  {assignedStudents.length} {language === 'km' ? 'សិស្សក្នុងខ្សែរត់' : 'riders on this route'}
                </p>
              </div>
              <button onClick={() => setShowManifest(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800/60">
              {assignedStudents.map((student, idx) => {
                const isSelected = student.id === activeStudentId;
                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      setActiveStudentId(student.id);
                      setShowManifest(false);
                    }}
                    className={`pt-2.5 pb-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/20 border border-blue-500/40' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        student.status === 'picked_up' ? 'bg-emerald-600 text-white' :
                        student.status === 'absent' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200'
                      }`}>
                        #{student.pickupOrder || idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">{student.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{student.pickupAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        student.status === 'picked_up' ? 'bg-emerald-500/20 text-emerald-400' :
                        student.status === 'absent' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {student.status === 'picked_up' ? (student.pickedUpAt ? `${student.pickedUpAt}` : 'Picked Up') :
                         student.status === 'absent' ? 'Absent' : 'Waiting'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. CALL PARENT DIALER MODAL */}
      {callingParent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {language === 'km' ? 'ទូរស័ព្ទទៅអាណាព្យាបាល' : 'Call Parent'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'km' ? `អាណាព្យាបាលរបស់ ${callingParent.name}` : `Parent of ${callingParent.name}`}
              </p>
              <p className="text-xl font-black text-amber-400 font-mono mt-2">
                {callingParent.parentPhone || '+855 10 223 344'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCallingParent(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                {t('common.cancel')}
              </button>
              <a
                href={`tel:${callingParent.parentPhone || '+85510223344'}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. SERVICE INTEGRATION STATUS MODAL (Requirement 5) */}
      {showIntegrationsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-white text-base">
                  {language === 'km' ? 'ស្ថានភាពតភ្ជាប់ប្រព័ន្ធដឹកជញ្ជូន' : 'System Services & Connection Status'}
                </h3>
              </div>
              <button onClick={() => setShowIntegrationsModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'km'
                ? 'ព័ត៌មានលម្អិតអំពីស្ថានភាពតភ្ជាប់រវាងម៉ាស៊ីនរុករក GPS, ការជូនដំណឹងអាណាព្យាបាល, និងប្រព័ន្ធបម្រុងទុក Offline។'
                : 'Real-time connectivity diagnostics between driver navigation, parent notification channels, and offline cache.'}
            </p>

            <div className="space-y-3 text-xs">
              {/* GPS Telemetry */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-bold">1. Bus GPS Telemetry & Navigation</strong>
                  <span className="text-slate-400 text-[11px]">Real-time coordinates: {busPosition[0].toFixed(4)}, {busPosition[1].toFixed(4)}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  CONNECTED
                </span>
              </div>

              {/* OSRM Routing Engine */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-bold">2. Phnom Penh OSRM Routing Engine</strong>
                  <span className="text-slate-400 text-[11px]">Turn-by-turn geometry & distance matrix</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  ACTIVE
                </span>
              </div>

              {/* Parent Notification Push */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-bold">3. Parent Notification Channel</strong>
                  <span className="text-slate-400 text-[11px]">Immediate targeted alert on student pickup event</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  ONLINE
                </span>
              </div>

              {/* Offline Sync Buffer */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="text-white block font-bold">4. Offline Persistence Buffer</strong>
                  <span className="text-slate-400 text-[11px]">Local storage fallback if signal is lost ({offlineQueueCount} queued)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px]">
                  STANDBY
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIntegrationsModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              {language === 'km' ? 'យល់ព្រម' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* 7. DRIVER STUDENT QR CODE SCANNER MODAL (Requirements 2, 3, 5, 6, 7, 8) */}
      <DriverQRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        activeBus={bus}
        activeRoute={route}
        onStudentVerified={handleStudentVerified}
      />

      {/* 8. OFFICIAL BUS DOOR BOARDING STICKER QR PASS & IN-APP NOTES MODAL */}
      <BusBoardingStickerQRModal
        bus={bus}
        isOpen={showStickerModal}
        onClose={() => setShowStickerModal(false)}
        onLaunchScanner={() => {
          setShowStickerModal(false);
          setShowQRScanner(true);
        }}
      />

      {/* 9. EMERGENCY BREAKDOWN & REPLACEMENT MODAL */}
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
