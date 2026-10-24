import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoLocation, CalculatedRouteResult } from '../../services/routingService';
import { useApp } from '../../context/AppContext';
import { 
  Maximize2, RotateCcw, MapPin, Search, Plus, Trash2, 
  Layers, Check, School, User, Navigation 
} from 'lucide-react';

interface PhnomPenhRouteMapProps {
  origin: GeoLocation;
  stops: GeoLocation[];
  activeRoute: CalculatedRouteResult | null;
  originalRoute?: CalculatedRouteResult | null;
  showComparison?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onSelectLocation?: (location: GeoLocation) => void;
  onRemoveStop?: (id: string) => void;
  onSetOrigin?: (location: GeoLocation) => void;
  isLoading?: boolean;
}

export function PhnomPenhRouteMap({
  origin,
  stops,
  activeRoute,
  originalRoute,
  showComparison = false,
  onMapClick,
  onSelectLocation,
  onRemoveStop,
  onSetOrigin,
  isLoading = false
}: PhnomPenhRouteMapProps) {
  const { language, t, localize } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const comparisonLayerRef = useRef<L.Polyline | null>(null);

  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([11.5564, 104.9282], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer group for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;

      // Handle map clicks
      map.on('click', (e: L.LeafletMouseEvent) => {
        setClickedCoord({ lat: e.latlng.lat, lng: e.latlng.lng });
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fit bounds whenever active route or stops change
  const fitAllStops = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const allPoints: [number, number][] = [
      [origin.lat, origin.lng],
      ...stops.map(s => [s.lat, s.lng] as [number, number])
    ];

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  };

  const resetToPhnomPenhCenter = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([11.5564, 104.9282], 13);
    }
  };

  // Draw Route Polylines and Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markersLayerRef.current;
    if (!map || !markerGroup) return;

    // Clear previous markers
    markerGroup.clearLayers();

    // 1. Draw Comparison Original Route (if active and different)
    if (comparisonLayerRef.current) {
      map.removeLayer(comparisonLayerRef.current);
      comparisonLayerRef.current = null;
    }

    if (showComparison && originalRoute && originalRoute.polyline.length > 0) {
      const compLine = L.polyline(originalRoute.polyline, {
        color: '#94a3b8',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 8'
      }).addTo(map);
      compLine.bindPopup(
        `<div style="font-family: inherit; font-size: 12px;">
          <strong>${language === 'km' ? 'ផ្លូវដើម (មុនបង្កើនប្រសិទ្ធភាព)' : 'Original Route (Before Optimization)'}</strong><br/>
          <span>${(originalRoute.totalDistanceMeters / 1000).toFixed(2)} km • ${Math.round(originalRoute.totalDurationSeconds / 60)} min</span>
        </div>`
      );
      comparisonLayerRef.current = compLine;
    }

    // 2. Draw Active Calculated Route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (activeRoute && activeRoute.polyline.length > 0) {
      const mainLine = L.polyline(activeRoute.polyline, {
        color: '#2563eb', // Vibrant royal blue
        weight: 6,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      mainLine.bindPopup(
        `<div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="color: #1d4ed8;">${language === 'km' ? 'ផ្លូវគណនាជាក់ស្តែង' : 'Active Road Route'}</strong><br/>
          <span>${(activeRoute.totalDistanceMeters / 1000).toFixed(2)} km • ${Math.round(activeRoute.totalDurationSeconds / 60)} min</span>
        </div>`
      );
      routeLayerRef.current = mainLine;

      // Fit bounds to polyline
      const bounds = L.latLngBounds(activeRoute.polyline);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      // Just fit to markers
      fitAllStops();
    }

    // 3. Render Origin Marker (Green badge)
    const originIcon = L.divIcon({
      className: 'custom-origin-marker',
      html: `
        <div style="background-color: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4); border: 2.5px solid white; font-weight: bold; font-size: 13px;">
          🏁
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon });
    originMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 180px;">
        <span style="background: #ecfdf5; color: #047857; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
          ${language === 'km' ? 'ចំណុចចេញដំណើរ (Start)' : 'Departure Point'}
        </span>
        <h4 style="margin: 4px 0 2px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
          ${localize(origin.name, origin.nameKh)}
        </h4>
        <p style="margin: 0; color: #64748b; font-size: 11px;">
          ${localize(origin.address, origin.addressKh)}
        </p>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 10px; font-family: monospace;">
          GPS: ${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}
        </p>
      </div>
    `);
    markerGroup.addLayer(originMarker);

    // 4. Render Numbered Stop Markers (#1, #2, #3...)
    stops.forEach((stop, index) => {
      const isLast = index === stops.length - 1 && stops.length > 0;
      const isReturn = stop.id.includes('-return');
      const stopNumber = index + 1;

      // Color coding:
      // Red for final destination, emerald for return, blue/indigo for intermediate
      const bgColor = isReturn ? '#10b981' : isLast ? '#ef4444' : '#4f46e5';

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="background-color: ${bgColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25); border: 2px solid white; font-weight: bold; font-size: 12px;">
            ${isReturn ? '↩' : isLast ? '🎯' : stopNumber}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon });

      const stopTypeLabel = stop.type === 'school' 
        ? (language === 'km' ? 'សាលារៀន' : 'School Destination') 
        : stop.type === 'student_pickup' 
        ? (language === 'km' ? 'ចំណុចទទួលសិស្ស' : 'Student Pickup') 
        : (language === 'km' ? 'ចំណត' : 'Stop');

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: ${bgColor}15; color: ${bgColor}; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px;">
              #${stopNumber} • ${stopTypeLabel}
            </span>
          </div>
          <h4 style="margin: 2px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
            ${localize(stop.name, stop.nameKh)}
          </h4>
          <p style="margin: 0; color: #64748b; font-size: 11px;">
            ${localize(stop.address, stop.addressKh)}
          </p>
          ${stop.studentName ? `
            <div style="margin-top: 4px; padding: 4px 6px; background: #f8fafc; border-radius: 4px; font-size: 11px; color: #334155;">
              👤 <strong>${language === 'km' ? 'សិស្ស' : 'Student'}:</strong> ${stop.studentName}
            </div>
          ` : ''}
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #f1f5f9; display: flex; gap: 6px;">
            <button id="btn-popup-set-origin-${stop.id}" style="background: #f1f5f9; border: none; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer; color: #334155;">
              ${language === 'km' ? 'កំណត់ជាចំណុចចេញ' : 'Set as Origin'}
            </button>
            <button id="btn-popup-remove-${stop.id}" style="background: #fee2e2; border: none; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer; color: #b91c1c;">
              ${language === 'km' ? 'លុប' : 'Remove'}
            </button>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const removeBtn = document.getElementById(`btn-popup-remove-${stop.id}`);
        if (removeBtn && onRemoveStop) {
          removeBtn.onclick = () => {
            onRemoveStop(stop.id);
            map.closePopup();
          };
        }
        const originBtn = document.getElementById(`btn-popup-set-origin-${stop.id}`);
        if (originBtn && onSetOrigin) {
          originBtn.onclick = () => {
            onSetOrigin(stop);
            map.closePopup();
          };
        }
      });

      markerGroup.addLayer(marker);
    });

  }, [origin, stops, activeRoute, originalRoute, showComparison, language]);

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">
      {/* Top Map Floating Toolbar */}
      <div className="absolute top-4 left-4 right-16 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-center gap-2 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{language === 'km' ? 'ផែនទីរាជធានីភ្នំពេញ (GPS ផ្ទាល់)' : 'Phnom Penh Live GPS Map'}</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={fitAllStops}
            title={t('optimizer.fitMap')}
            className="bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-xl shadow-md border border-slate-200/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{t('optimizer.fitMap')}</span>
          </button>
          <button
            onClick={resetToPhnomPenhCenter}
            title="Reset to Phnom Penh center"
            className="bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-xl shadow-md border border-slate-200/80 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-[1001] flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
            {t('optimizer.calculatingRoute')}
          </p>
        </div>
      )}

      {/* Main Leaflet Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-10" />

      {/* Bottom Map Legend & Details */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-slate-200 text-xs text-slate-700 flex items-center gap-3 flex-wrap pointer-events-auto">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white inline-block"></span>
            <span>{t('optimizer.startPoint')}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white inline-block"></span>
            <span>{language === 'km' ? 'ចំណតតាមលំដាប់ (#)' : 'Ordered Stops (#)'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white inline-block"></span>
            <span>{t('optimizer.endPoint')}</span>
          </div>
          {showComparison && (
            <div className="flex items-center gap-1.5 font-medium text-slate-500">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400 inline-block"></span>
              <span>{t('optimizer.originalRoute')}</span>
            </div>
          )}
        </div>

        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-600 pointer-events-auto hidden md:block">
          {t('optimizer.clickMapPrompt')}
        </div>
      </div>
    </div>
  );
}
