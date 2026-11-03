import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Bus, School, Student, Route } from '../../types';
import { useApp } from '../../context/AppContext';
import { gpsTrackingService, GpsLocationRecord } from '../../services/gpsTrackingService';
import { 
  Layers, Compass, Plus, Minus, RotateCcw, 
  Navigation, Crosshair, Check, Radio
} from 'lucide-react';

interface InteractiveMapProps {
  schools: School[];
  buses: Bus[];
  students: Student[];
  routes: Route[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
  height?: string;
  showPolylines?: boolean;
  filterBusId?: string; // If set, only renders this specific bus (for parent view)
  filterStudentId?: string; // If set, only renders this student
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

export function InteractiveMap({
  schools,
  buses,
  students,
  routes,
  selectedBusId,
  onSelectBus,
  height = '500px',
  showPolylines = true,
  filterBusId,
  filterStudentId,
  defaultCenter = [11.5564, 104.9282],
  defaultZoom = 13
}: InteractiveMapProps) {
  const { language, t, localize } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Dedicated Leaflet Layer Groups for independent non-destructive updates
  const streetTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteTileLayerRef = useRef<L.TileLayer | null>(null);
  const staticLayerGroupRef = useRef<L.LayerGroup | null>(null); // Schools, students, polylines
  const busesLayerGroupRef = useRef<L.LayerGroup | null>(null);  // Live dynamic bus markers
  const busMarkersMapRef = useRef<Map<string, { marker: L.Marker; circle?: L.Circle }>>(new Map());

  // Component States
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [fleetGps, setFleetGps] = useState<Record<string, GpsLocationRecord>>({});
  const [currentZoom, setCurrentZoom] = useState<number>(defaultZoom);
  const [isFollowingBus, setIsFollowingBus] = useState<boolean>(false);

  // Active target bus to follow
  const activeFollowBusId = filterBusId || selectedBusId || buses[0]?.id;

  // Subscribe to real-time GPS fleet updates
  useEffect(() => {
    const unsubscribe = gpsTrackingService.subscribeToFleet((fleet) => {
      setFleetGps(fleet);
    });
    return unsubscribe;
  }, []);

  // 1. Initialize Map once with buttery smooth zoom and touch settings
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map with smooth wheel, pinch-to-zoom and fractional zoomSnap
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false, // We provide visible, large, accessible on-screen buttons
        zoomSnap: 0.25,     // Enables fractional zoom for ultra-smooth zoom transitions
        zoomDelta: 0.5,     // Responsive, controlled zoom steps
        wheelPxPerZoomLevel: 60, // Smooth desktop mouse-wheel zoom
        wheelDebounceTime: 20,
        touchZoom: true,    // Smooth multi-touch pinch-to-zoom on tablets and phones
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        dragging: true,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        trackResize: true
      });

      // Street & Satellite layers
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      });

      streetLayer.addTo(map);
      streetTileLayerRef.current = streetLayer;
      satelliteTileLayerRef.current = satelliteLayer;

      // Layer groups
      const staticGroup = L.layerGroup().addTo(map);
      const busesGroup = L.layerGroup().addTo(map);
      staticLayerGroupRef.current = staticGroup;
      busesLayerGroupRef.current = busesGroup;

      mapInstanceRef.current = map;

      // Track zoom level for UI display
      map.on('zoomend', () => {
        setCurrentZoom(parseFloat(map.getZoom().toFixed(1)));
      });

      // User interaction listener: If user manually drags or zooms, temporarily disable auto-follow
      const handleUserInteraction = () => {
        setIsFollowingBus(false);
      };

      map.on('dragstart', handleUserInteraction);
      map.on('zoomstart', (e: any) => {
        // Only disable follow if zoom was user-initiated (mousewheel, pinch, or custom buttons)
        if (!e.isFollowAnimation) {
          setIsFollowingBus(false);
        }
      });

      // Resize observer to maintain crispness across container size shifts
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize({ pan: false });
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        if (resizeObserver) resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
        busMarkersMapRef.current.clear();
      };
    }
  }, []);

  // 2. Handle Street / Satellite Layer Toggle without resetting position or zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !streetTileLayerRef.current || !satelliteTileLayerRef.current) return;

    if (mapType === 'satellite') {
      if (map.hasLayer(streetTileLayerRef.current)) {
        map.removeLayer(streetTileLayerRef.current);
      }
      if (!map.hasLayer(satelliteTileLayerRef.current)) {
        satelliteTileLayerRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(satelliteTileLayerRef.current)) {
        map.removeLayer(satelliteTileLayerRef.current);
      }
      if (!map.hasLayer(streetTileLayerRef.current)) {
        streetTileLayerRef.current.addTo(map);
      }
    }
  }, [mapType]);

  // 3. Render Static Map Features (Schools, Students, Polylines) independently
  useEffect(() => {
    const map = mapInstanceRef.current;
    const staticGroup = staticLayerGroupRef.current;
    if (!map || !staticGroup) return;

    staticGroup.clearLayers();

    // 1. Plot Schools
    schools.forEach(school => {
      if (school.lat && school.lng) {
        const schoolIcon = L.divIcon({
          className: 'custom-school-marker',
          html: `<div style="background-color: #2563EB; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 18px; border: 2.5px solid white; cursor: pointer;">🏫</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([school.lat, school.lng], { icon: schoolIcon });
        const schoolName = localize(school.name, school.nameKh);
        const schoolAddress = localize(school.address, school.addressKh);
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 6px; line-height: 1.4; min-width: 190px;">
            <strong style="font-size: 14px; color: #0f172a;">${schoolName}</strong><br/>
            <span style="font-size: 12px; color: #475569;">${schoolAddress}</span><br/>
            <span style="font-size: 12px; color: #2563EB; font-weight: bold;">${t('schools.principal')}: ${school.principal}</span>
          </div>
        `);
        staticGroup.addLayer(marker);
      }
    });

    // 2. Plot Student Pickup Points
    const displayedStudents = filterStudentId 
      ? students.filter(s => s.id === filterStudentId) 
      : students;

    displayedStudents.forEach(student => {
      if (student.pickupLat && student.pickupLng) {
        const isPickedUp = student.status === 'picked_up';
        const pickupIcon = L.divIcon({
          className: 'custom-pickup-marker',
          html: `<div style="background-color: ${isPickedUp ? '#10B981' : '#F59E0B'}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 3px 6px rgba(0,0,0,0.25); border: 2px solid white; cursor: pointer;">📍</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([student.pickupLat, student.pickupLng], { icon: pickupIcon });
        const studentStatusLabel = student.status === 'picked_up' ? t('students.pickedUp') :
          student.status === 'waiting' ? t('students.waiting') :
          student.status === 'at_school' ? t('students.atSchool') :
          student.status === 'dropped_off' ? t('students.droppedOff') : t('students.atHome');

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 6px; line-height: 1.4; min-width: 190px;">
            <strong style="font-size: 13px; color: #d97706;">${t('map.pickupPoint')}: ${student.name}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">${student.grade}</span><br/>
            <span style="font-size: 12px; color: #334155;">${student.pickupAddress}</span><br/>
            <span style="font-size: 12px; font-weight: bold; color: ${isPickedUp ? '#10b981' : '#f59e0b'};">
              ${t('map.status')}: ${studentStatusLabel}
            </span>
          </div>
        `);
        staticGroup.addLayer(marker);
      }
    });

    // 3. Plot Route Polylines
    if (showPolylines) {
      routes.forEach(route => {
        if (filterBusId && route.busId && route.busId !== filterBusId) return;

        if (route.polylineCoords && route.polylineCoords.length > 0) {
          const polyline = L.polyline(route.polylineCoords, {
            color: route.status === 'in_progress' ? '#2563EB' : '#94A3B8',
            weight: 4.5,
            opacity: 0.85,
            dashArray: route.status === 'in_progress' ? '8, 8' : undefined
          });
          const routeTitle = localize(route.name, route.nameKh);
          polyline.bindPopup(`<strong>${t('map.route')}: ${routeTitle}</strong>`);
          staticGroup.addLayer(polyline);
        }
      });
    }

  }, [schools, students, routes, showPolylines, language, filterBusId, filterStudentId]);

  // 4. Update Dynamic Bus Markers & Real-time GPS without rebuilding or reloading the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const busesGroup = busesLayerGroupRef.current;
    if (!map || !busesGroup) return;

    const displayedBuses = filterBusId 
      ? buses.filter(b => b.id === filterBusId) 
      : buses;

    const currentBusIds = new Set<string>();

    displayedBuses.forEach(bus => {
      currentBusIds.add(bus.id);
      const liveGps = fleetGps[bus.id];
      const lat = liveGps?.lat ?? bus.currentLat;
      const lng = liveGps?.lng ?? bus.currentLng;

      if (!lat || !lng) return;

      const isLiveBroadcasting = liveGps?.sharingStatus === 'broadcasting';
      const isDemo = liveGps?.isDemoData;
      const isStale = liveGps?.sharingStatus === 'stale';
      const isStopped = liveGps?.sharingStatus === 'stopped';
      const isSelected = bus.id === selectedBusId;

      const busColor = isStale ? '#D97706' : isStopped ? '#64748B' : isDemo ? '#2563EB' : '#10B981';
      
      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${(isLiveBroadcasting || isSelected) ? `<span style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: ${busColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
            <div style="background-color: ${busColor}; color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); font-weight: bold; font-size: 20px; border: 3px solid ${isSelected ? '#FBBF24' : 'white'}; z-index: 2;">
              🚌
            </div>
            ${liveGps?.speed !== undefined ? `
              <div style="position: absolute; top: -6px; right: -6px; background: #0f172a; color: white; font-size: 10px; font-weight: 800; padding: 1px 5px; border-radius: 9999px; border: 1.5px solid white; z-index: 3;">
                ${liveGps.speed}k
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const gpsBadge = isDemo
        ? `<span style="display: inline-block; background: #DBEAFE; color: #1E40AF; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 1px solid #93C5FD;">DEMO DATA (SIMULATED)</span>`
        : isLiveBroadcasting
        ? `<span style="display: inline-block; background: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 1px solid #6EE7B7;">● REAL DEVICE GPS (LIVE)</span>`
        : isStale
        ? `<span style="display: inline-block; background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 1px solid #FCD34D;">⚠ STALE GPS (SIGNAL WEAK)</span>`
        : `<span style="display: inline-block; background: #F1F5F9; color: #475569; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 1px solid #CBD5E1;">GPS SHARING STOPPED</span>`;

      const lastUpdated = liveGps?.timestamp 
        ? new Date(liveGps.timestamp).toLocaleTimeString() 
        : 'Active';

      const popupContent = `
        <div style="font-family: inherit; padding: 6px; line-height: 1.45; min-width: 230px;">
          <div style="margin-bottom: 5px;">${gpsBadge}</div>
          <strong style="font-size: 15px; color: #0f172a;">${bus.busNumber} (${bus.plateNumber})</strong><br/>
          <span style="font-size: 12px; color: #64748b;">Driver: <strong>${liveGps?.driverName || 'Assigned Driver'}</strong></span><br/>
          <span style="font-size: 12px; color: #64748b;">Route: <strong>${liveGps?.routeName || 'Assigned Route'}</strong></span><br/>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #334155;">
            <div>Coordinates: <code>${lat.toFixed(5)}, ${lng.toFixed(5)}</code></div>
            <div>Accuracy: <strong>±${liveGps?.accuracy || 8}m</strong> • Speed: <strong>${liveGps?.speed || bus.speed || 0} km/h</strong></div>
            <div>Last Update: <span style="color: #64748b;">${lastUpdated}</span></div>
          </div>
        </div>
      `;

      const existingRecord = busMarkersMapRef.current.get(bus.id);

      if (existingRecord) {
        // Smoothly update location and icon WITHOUT wiping the layer
        existingRecord.marker.setLatLng([lat, lng]);
        existingRecord.marker.setIcon(busIcon);
        existingRecord.marker.setPopupContent(popupContent);

        if (existingRecord.circle) {
          if (liveGps?.accuracy && liveGps.accuracy < 100) {
            existingRecord.circle.setLatLng([lat, lng]);
            existingRecord.circle.setRadius(liveGps.accuracy);
          }
        }
      } else {
        // Create new marker
        const marker = L.marker([lat, lng], { icon: busIcon });
        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectBus) onSelectBus(bus.id);
        });
        busesGroup.addLayer(marker);

        let circle: L.Circle | undefined;
        if (liveGps?.accuracy && liveGps.accuracy < 100) {
          circle = L.circle([lat, lng], {
            radius: liveGps.accuracy,
            color: isDemo ? '#3B82F6' : '#10B981',
            fillColor: isDemo ? '#60A5FA' : '#34D399',
            fillOpacity: 0.15,
            weight: 1
          });
          busesGroup.addLayer(circle);
        }

        busMarkersMapRef.current.set(bus.id, { marker, circle });
      }

      // If Follow Bus mode is enabled and this is the active follow bus, smoothly pan without changing zoom!
      if (isFollowingBus && bus.id === activeFollowBusId) {
        map.panTo([lat, lng], { animate: true, duration: 0.8 });
      }
    });

    // Remove any markers for buses no longer present
    busMarkersMapRef.current.forEach((val, id) => {
      if (!currentBusIds.has(id)) {
        busesGroup.removeLayer(val.marker);
        if (val.circle) busesGroup.removeLayer(val.circle);
        busMarkersMapRef.current.delete(id);
      }
    });

  }, [buses, fleetGps, filterBusId, selectedBusId, isFollowingBus, activeFollowBusId]);

  // 5. User Controls: Zoom In, Zoom Out, Reset View, Follow Bus
  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(0.5, { animate: true });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(0.5, { animate: true });
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setIsFollowingBus(false);

    // Calculate bounds of visible entities if present
    const latLngs: L.LatLng[] = [];
    schools.forEach(s => s.lat && s.lng && latLngs.push(L.latLng(s.lat, s.lng)));
    buses.forEach(b => {
      const gps = fleetGps[b.id];
      const lat = gps?.lat ?? b.currentLat;
      const lng = gps?.lng ?? b.currentLng;
      if (lat && lng) latLngs.push(L.latLng(lat, lng));
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 15 });
    } else {
      map.setView(defaultCenter, defaultZoom, { animate: true });
    }
  }, [schools, buses, fleetGps, defaultCenter, defaultZoom]);

  const handleToggleFollowBus = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isFollowingBus) {
      // Find position of the active bus and smoothly pan to it
      const targetBus = buses.find(b => b.id === activeFollowBusId) || buses[0];
      if (targetBus) {
        const gps = fleetGps[targetBus.id];
        const lat = gps?.lat ?? targetBus.currentLat;
        const lng = gps?.lng ?? targetBus.currentLng;
        if (lat && lng) {
          map.panTo([lat, lng], { animate: true, duration: 0.7 });
        }
      }
      setIsFollowingBus(true);
    } else {
      setIsFollowingBus(false);
    }
  }, [isFollowingBus, buses, activeFollowBusId, fleetGps]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 w-full" style={{ height }}>
      
      {/* Top Left: Street / Satellite Toggle */}
      <div className="absolute top-3 left-3 z-20 flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 text-xs font-bold">
        <button
          type="button"
          onClick={() => setMapType('street')}
          className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 min-h-[38px] ${
            mapType === 'street' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Switch to Street Map"
        >
          <Compass className="w-4 h-4" />
          <span>{language === 'km' ? 'ផែនទីផ្លូវ' : 'Street'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 min-h-[38px] ${
            mapType === 'satellite' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Switch to Satellite Map"
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'km' ? 'ផ្កាយរណប' : 'Satellite'}</span>
        </button>
      </div>

      {/* Top Right: Custom Accessible Zoom & Follow Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
        {/* Follow Bus Toggle Button */}
        <button
          type="button"
          onClick={handleToggleFollowBus}
          className={`px-3.5 py-2 rounded-xl backdrop-blur-md font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md border transition-all min-h-[44px] cursor-pointer ${
            isFollowingBus
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20 ring-2 ring-emerald-500/30'
              : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
          title={isFollowingBus ? 'Click to release auto-following' : 'Smoothly follow bus position'}
        >
          <Navigation className={`w-4 h-4 ${isFollowingBus ? 'animate-bounce text-amber-300' : 'text-blue-600'}`} />
          <span>
            {isFollowingBus 
              ? (language === 'km' ? 'កំពុងតាមដានឡាន' : 'Following Bus') 
              : (language === 'km' ? 'តាមដានឡាន (Follow)' : 'Follow Bus')}
          </span>
          {isFollowingBus && (
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
          )}
        </button>

        {/* Zoom Controls Container (+, -, Reset, Zoom level) */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/90 overflow-hidden">
          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-11 h-11 flex items-center justify-center text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors border-b border-slate-100 min-h-[44px] min-w-[44px] cursor-pointer"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>

          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-11 h-11 flex items-center justify-center text-slate-800 hover:text-blue-600 hover:bg-blue-50 transition-colors border-b border-slate-100 min-h-[44px] min-w-[44px] cursor-pointer"
            title="Zoom Out (−)"
            aria-label="Zoom Out"
          >
            <Minus className="w-5 h-5 font-bold" />
          </button>

          {/* Reset Zoom Button */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="w-11 h-11 flex items-center justify-center text-slate-800 hover:text-teal-600 hover:bg-teal-50 transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
            title="Reset Zoom & Center All"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Current Zoom Level Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm border border-slate-700">
          {currentZoom}x
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Bottom Left Legend & Status Banner */}
      <div className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md text-xs sm:text-sm text-slate-800 z-20 flex items-center gap-3.5 border border-slate-200 flex-wrap font-bold">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white"></span>
          <span>{t('map.school')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse border border-white"></span>
          <span>{language === 'km' ? 'រថយន្ត GPS ផ្ទាល់' : 'Live GPS Bus'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-white"></span>
          <span>{t('map.pickupPoint')}</span>
        </div>
        {isFollowingBus && (
          <div className="flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Radio className="w-3 h-3 animate-spin text-emerald-600" />
            <span>{language === 'km' ? 'កំពុងជាប់តាមរថយន្ត' : 'Auto-Tracking Active'}</span>
          </div>
        )}
      </div>

    </div>
  );
}
