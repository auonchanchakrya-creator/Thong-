import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, School, Student, Route } from '../../types';
import { useApp } from '../../context/AppContext';

interface InteractiveMapProps {
  schools: School[];
  buses: Bus[];
  students: Student[];
  routes: Route[];
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
  height?: string;
  showPolylines?: boolean;
}

export function InteractiveMap({
  schools,
  buses,
  students,
  routes,
  selectedBusId,
  onSelectBus,
  height = '500px',
  showPolylines = true
}: InteractiveMapProps) {
  const { language, t, localize } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered around Phnom Penh, Cambodia
      const map = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([11.5564, 104.9282], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and polylines whenever data or language changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Custom Icons
    const schoolIcon = L.divIcon({
      className: 'custom-school-marker',
      html: `<div style="background-color: #3b82f6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); font-weight: bold; font-size: 14px;">🏫</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `<div style="background-color: #10b981; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-weight: bold; font-size: 16px; border: 2px solid white;">🚌</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const pickupIcon = L.divIcon({
      className: 'custom-pickup-marker',
      html: `<div style="background-color: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📍</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // 1. Plot Schools
    schools.forEach(school => {
      if (school.lat && school.lng) {
        const marker = L.marker([school.lat, school.lng], { icon: schoolIcon });
        const schoolName = localize(school.name, school.nameKh);
        const schoolAddress = localize(school.address, school.addressKh);
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px; line-height: 1.4;">
            <strong style="font-size: 13px; color: #1e293b;">${schoolName}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${schoolAddress}</span><br/>
            <span style="font-size: 11px; color: #3b82f6;">${t('schools.principal')}: ${school.principal}</span>
          </div>
        `);
        layerGroup.addLayer(marker);
      }
    });

    // 2. Plot Buses
    buses.forEach(bus => {
      if (bus.currentLat && bus.currentLng) {
        const marker = L.marker([bus.currentLat, bus.currentLng], { icon: busIcon });
        const busStatusLabel = bus.status === 'active' 
          ? (language === 'km' ? 'សកម្ម / កំពុងរត់' : 'ACTIVE') 
          : bus.status === 'maintenance' 
          ? (language === 'km' ? 'កំពុងថែទាំ' : 'MAINTENANCE') 
          : (language === 'km' ? 'ទំនេរ' : 'IDLE');
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px; line-height: 1.4;">
            <strong style="font-size: 13px; color: #059669;">${bus.busNumber} (${bus.plateNumber})</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${t('map.model')}: ${bus.model}</span><br/>
            <span style="font-size: 11px; color: #059669; font-weight: 600;">${t('map.status')}: ${busStatusLabel}</span><br/>
            <span style="font-size: 11px; color: #475569;">${t('map.speed')}: ${bus.speed || 0} ${t('common.speedUnit')}</span>
          </div>
        `);
        marker.on('click', () => {
          if (onSelectBus) onSelectBus(bus.id);
        });
        layerGroup.addLayer(marker);
      }
    });

    // 3. Plot Student Pickups
    students.forEach(student => {
      if (student.pickupLat && student.pickupLng) {
        const marker = L.marker([student.pickupLat, student.pickupLng], { icon: pickupIcon });
        const studentStatusLabel = student.status === 'picked_up' ? t('students.pickedUp') :
          student.status === 'waiting' ? t('students.waiting') :
          student.status === 'at_school' ? t('students.atSchool') :
          student.status === 'dropped_off' ? t('students.droppedOff') : t('students.atHome');
        marker.bindPopup(`
          <div style="font-family: inherit; padding: 4px; line-height: 1.4;">
            <strong style="font-size: 13px; color: #d97706;">${t('map.pickupPoint')}: ${student.name}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${t('students.grade')}: ${student.grade}</span><br/>
            <span style="font-size: 11px; color: #475569;">${t('map.address')}: ${student.pickupAddress}</span><br/>
            <span style="font-size: 11px; font-weight: bold; color: ${student.status === 'picked_up' ? '#10b981' : '#f59e0b'};">${t('map.status')}: ${studentStatusLabel}</span>
          </div>
        `);
        layerGroup.addLayer(marker);
      }
    });

    // 4. Plot Route Polylines
    if (showPolylines) {
      routes.forEach(route => {
        if (route.polylineCoords && route.polylineCoords.length > 0) {
          const polyline = L.polyline(route.polylineCoords, {
            color: route.status === 'in_progress' ? '#3b82f6' : '#94a3b8',
            weight: 4,
            opacity: 0.8,
            dashArray: route.status === 'in_progress' ? '8, 8' : undefined
          });
          const routeTitle = localize(route.name, route.nameKh);
          const statusText = route.status === 'in_progress' ? t('routes.inProgress') : t('routes.scheduled');
          polyline.bindPopup(`<strong>${t('map.route')}: ${routeTitle}</strong><br/>${t('map.status')}: ${statusText}`);
          layerGroup.addLayer(polyline);
        }
      });
    }

  }, [schools, buses, students, routes, selectedBusId, showPolylines, language]);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-slate-700 z-20 flex items-center gap-3 border border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> {t('map.school')}</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span> {t('map.activeBus')}</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> {t('map.pickupPoint')}</div>
      </div>
    </div>
  );
}
