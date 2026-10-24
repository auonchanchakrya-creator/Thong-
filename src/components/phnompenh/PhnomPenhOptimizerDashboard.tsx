import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GeoLocation, TravelMode, OptimizationCriteria, 
  CalculatedRouteResult, RouteComparisonResult,
  VERIFIED_PHNOM_PENH_LOCATIONS,
  searchPhnomPenhLocations,
  reverseGeocode,
  calculateRouteWithOSRM,
  optimizeRouteSequence
} from '../../services/routingService';
import { PhnomPenhRouteMap } from './PhnomPenhRouteMap';
import { 
  Navigation, Sparkles, Plus, Trash2, ArrowUpDown, RotateCcw, 
  MapPin, Clock, Gauge, Building2, User, CheckCircle2, 
  AlertTriangle, ChevronDown, ChevronUp, Search, X, 
  Maximize2, ArrowRight, Eye, ShieldCheck, Car, Bike, Footprints, Bus
} from 'lucide-react';

export function PhnomPenhOptimizerDashboard() {
  const { language, t, localize, formatNumber, schools, askGeminiAssistant } = useApp();

  // Route Planning State
  const [origin, setOrigin] = useState<GeoLocation>(VERIFIED_PHNOM_PENH_LOCATIONS[10]); // Phnom Penh Central Bus Depot
  const [stops, setStops] = useState<GeoLocation[]>([
    VERIFIED_PHNOM_PENH_LOCATIONS[0], // ITC School
    VERIFIED_PHNOM_PENH_LOCATIONS[8], // Toul Kork Student Station
    VERIFIED_PHNOM_PENH_LOCATIONS[1], // Preah Sisowath High School
    VERIFIED_PHNOM_PENH_LOCATIONS[3], // Boeung Keng Kang High School
  ]);

  const [mode, setMode] = useState<TravelMode>('driving');
  const [criteria, setCriteria] = useState<OptimizationCriteria>('time');
  const [returnToStart, setReturnToStart] = useState<boolean>(true);

  // Routing Results & State
  const [activeRoute, setActiveRoute] = useState<CalculatedRouteResult | null>(null);
  const [originalRoute, setOriginalRoute] = useState<CalculatedRouteResult | null>(null);
  const [comparison, setComparison] = useState<RouteComparisonResult | null>(null);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [showComparisonOnMap, setShowComparisonOnMap] = useState<boolean>(false);
  
  // UI Controls
  const [loading, setLoading] = useState<boolean>(false);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Search in Add Modal
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [activeAddTab, setActiveAddTab] = useState<'verified' | 'search'>('verified');

  // AI Safety Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Initial Route Calculation on mount
  useEffect(() => {
    handleCalculateRoute(false);
  }, []);

  // Recalculate route whenever mode or returnToStart changes
  useEffect(() => {
    if (activeRoute) {
      handleCalculateRoute(isOptimized);
    }
  }, [mode, returnToStart]);

  // Live Location Search in Add Modal
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchPhnomPenhLocations(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.warn('Location search error:', e);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate Route (Direct order)
  const handleCalculateRoute = async (keepOptimizedState: boolean = false) => {
    if (stops.length === 0) {
      setActiveRoute(null);
      setComparison(null);
      setIsOptimized(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const fullSequence = [origin, ...stops];
      if (returnToStart) {
        fullSequence.push({
          ...origin,
          id: `${origin.id}-return`,
          name: `${origin.name} (Return)`,
          nameKh: `${origin.nameKh || origin.name} (ត្រឡប់មកវិញ)`
        });
      }

      const calculated = await calculateRouteWithOSRM(fullSequence, mode);
      setActiveRoute(calculated);

      if (!keepOptimizedState) {
        setOriginalRoute(calculated);
        setComparison(null);
        setIsOptimized(false);
        setShowComparisonOnMap(false);
      }
    } catch (err: any) {
      console.error('Route calculation error:', err);
      setErrorMessage(t('optimizer.routeError'));
    } finally {
      setLoading(false);
    }
  };

  // Run 2-Opt Optimization
  const handleOptimizeRoute = async () => {
    if (stops.length < 2) {
      handleCalculateRoute(false);
      return;
    }

    setOptimizing(true);
    setErrorMessage(null);

    try {
      const result = await optimizeRouteSequence(origin, stops, {
        mode,
        criteria,
        returnToStart
      });

      // Filter out the return stop from the editable stops array if present
      const cleanOptimizedDestinations = result.optimizedStops
        .slice(1)
        .filter(s => !s.id.includes('-return'));

      setStops(cleanOptimizedDestinations);
      setOriginalRoute(result.originalRoute);
      setActiveRoute(result.optimizedRoute);
      setComparison(result.comparison);
      setIsOptimized(true);
      setShowComparisonOnMap(true);
    } catch (err: any) {
      console.error('Optimization failed:', err);
      setErrorMessage(err.message || t('optimizer.routeError'));
    } finally {
      setOptimizing(false);
    }
  };

  // Reordering & Stop Modification Functions
  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newStops.length) return;

    const [moved] = newStops.splice(index, 1);
    newStops.splice(targetIdx, 0, moved);
    setStops(newStops);
    setIsOptimized(false);
    setComparison(null);
    setShowComparisonOnMap(false);
  };

  const removeStop = (id: string) => {
    const newStops = stops.filter(s => s.id !== id && !s.id.startsWith(id));
    setStops(newStops);
    setIsOptimized(false);
    setComparison(null);
    setShowComparisonOnMap(false);
  };

  const reverseRoute = () => {
    const reversed = [...stops].reverse();
    setStops(reversed);
    setIsOptimized(false);
    setComparison(null);
    setShowComparisonOnMap(false);
  };

  const clearRoute = () => {
    setStops([]);
    setActiveRoute(null);
    setOriginalRoute(null);
    setComparison(null);
    setIsOptimized(false);
    setShowComparisonOnMap(false);
    setAiAnalysis(null);
  };

  const addStopToRoute = (location: GeoLocation) => {
    // Avoid exact duplicate ID
    const newId = `${location.id}-${Date.now().toString().slice(-4)}`;
    setStops([...stops, { ...location, id: newId }]);
    setShowAddModal(false);
    setSearchQuery('');
    setIsOptimized(false);
    setComparison(null);
    setShowComparisonOnMap(false);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const geo = await reverseGeocode(lat, lng);
    const newStop: GeoLocation = {
      id: `map-${Date.now()}`,
      name: geo.name,
      address: geo.address,
      lat,
      lng,
      type: 'custom'
    };
    setStops(prev => [...prev, newStop]);
    setIsOptimized(false);
    setComparison(null);
  };

  // Run AI Route Safety Analysis
  const handleRunAiSafetyAdvisor = async () => {
    setAiLoading(true);
    const stopNames = [origin.name, ...stops.map(s => s.name)].join(' -> ');
    const prompt = language === 'km'
      ? `សូមធ្វើការវិភាគសុវត្ថិភាពចរាចរណ៍ សម្រាប់ផ្លូវរថយន្តក្រុងដឹកសិស្សានុសិស្សនៅរាជធានីភ្នំពេញ៖ "${stopNames}"។
         ចម្ងាយសរុប ${(activeRoute ? activeRoute.totalDistanceMeters / 1000 : 5).toFixed(1)} គីឡូម៉ែត្រ។
         សូមផ្តល់ការណែនាំអំពី៖
         ១. ការបញ្ចៀសការកកស្ទះនៅមហាវិថីព្រះមុនីវង្ស និងមហាវិថីសហព័ន្ធរុស្ស៊ីពេលព្រឹក
         ២. សុវត្ថិភាពផ្លូវថ្មើរជើងនៅជិតសាលារៀន (ដែនកំណត់ល្បឿន ៣០ គ.ម/ម៉)
         ៣. ការណែនាំពេលមានភ្លៀងធ្លាក់នៅតំបន់ទាប
         សូមឆ្លើយជាភាសាខ្មែរខ្លីៗច្បាស់លាស់។`
      : `Provide a school transportation safety and traffic analysis for this Phnom Penh route: "${stopNames}".
         Total distance: ${(activeRoute ? activeRoute.totalDistanceMeters / 1000 : 5).toFixed(1)} km.
         Include:
         1. Rush-hour bottleneck avoidance along Monivong Blvd and Russian Blvd.
         2. School zone pedestrian protection (30 km/h advisory).
         3. Monsoon rain precautions for low-lying areas.
         Respond clearly in English.`;

    try {
      const resp = await askGeminiAssistant(prompt, language === 'km' ? 'km' : 'en');
      setAiAnalysis(resp);
    } catch (err) {
      console.error('Gemini safety advisory failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Format Helper functions
  const formatKm = (meters: number) => {
    const km = (meters / 1000).toFixed(1);
    return `${formatNumber(parseFloat(km))} ${t('common.distanceUnit')}`;
  };

  const formatMins = (seconds: number) => {
    const mins = Math.max(1, Math.round(seconds / 60));
    return `${formatNumber(mins)} ${t('common.minutesUnit')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              {t('optimizer.geminiPowered')}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
              {language === 'km' ? 'ប្រព័ន្ធបង្កើនប្រសិទ្ធភាព 2-Opt ជាក់ស្តែង' : 'Real 2-Opt TSP Optimizer'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('optimizer.title')}
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            {t('optimizer.subtitle')}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOptimizeRoute}
            disabled={optimizing || stops.length < 2}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 text-xs flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{optimizing ? t('optimizer.optimizing') : t('optimizer.optimizeRoute')}</span>
          </button>

          <button
            onClick={() => handleCalculateRoute(false)}
            disabled={loading || stops.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md text-xs flex items-center gap-2 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>{t('optimizer.calculateRoute')}</span>
          </button>
        </div>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN SPLIT-SCREEN LAYOUT: LEFT (40%) & RIGHT (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: ROUTE OPTIMIZER & CONTROLS (~40% on Desktop: 5/12 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Departure & Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {t('optimizer.startPoint')}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Phnom Penh Station
              </span>
            </div>

            {/* Departure Origin Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t('optimizer.startingLocation')}
              </label>
              <select
                value={origin.id}
                onChange={(e) => {
                  const selected = VERIFIED_PHNOM_PENH_LOCATIONS.find(l => l.id === e.target.value);
                  if (selected) {
                    setOrigin(selected);
                    setIsOptimized(false);
                    setComparison(null);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                {VERIFIED_PHNOM_PENH_LOCATIONS.filter(l => l.type === 'origin' || l.type === 'school').map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {localize(loc.name, loc.nameKh)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-slate-400">📍</span>
                <span>{localize(origin.address, origin.addressKh)}</span>
              </p>
            </div>

            {/* Mode & Optimization Criteria */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t('optimizer.transportMode')}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'driving', label: t('optimizer.bus'), icon: Bus },
                    { id: 'cycling', label: t('optimizer.bike'), icon: Bike },
                    { id: 'walking', label: t('optimizer.walk'), icon: Footprints },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id as TravelMode)}
                        className={`py-1.5 rounded-lg flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
                          mode === m.id ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t('optimizer.optimizationPreference')}
                </label>
                <select
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value as OptimizationCriteria)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium"
                >
                  <option value="time">{t('optimizer.fastestTime')}</option>
                  <option value="distance">{t('optimizer.shortestDistance')}</option>
                </select>
              </div>
            </div>

            {/* Return to Start Toggle */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={returnToStart}
                  onChange={(e) => setReturnToStart(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>{t('optimizer.returnToStart')}</span>
              </label>

              <button
                onClick={reverseRoute}
                title={t('optimizer.reverseRoute')}
                className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold text-xs"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{t('optimizer.reverseRoute')}</span>
              </button>
            </div>
          </div>

          {/* Ordered Stops List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {t('optimizer.stopListTitle')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {formatNumber(stops.length)} {language === 'km' ? 'ចំណតគោលដៅ' : 'destination stops'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('optimizer.addStop')}</span>
                </button>

                {stops.length > 0 && (
                  <button
                    onClick={clearRoute}
                    title={t('optimizer.clearRoute')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {stops.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                <p className="text-xs text-slate-400">
                  {t('optimizer.noStopsYet')}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  + {t('optimizer.addSchool')}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {stops.map((stop, index) => {
                  const isFirst = index === 0;
                  const isLast = index === stops.length - 1;

                  return (
                    <div
                      key={stop.id}
                      className="group flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all bg-white"
                    >
                      {/* Stop Number Badge */}
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {index + 1}
                      </div>

                      {/* Stop Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {localize(stop.name, stop.nameKh)}
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            stop.type === 'school' ? 'bg-blue-100 text-blue-700' :
                            stop.type === 'student_pickup' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {stop.type === 'school' ? (language === 'km' ? 'សាលា' : 'School') :
                             stop.type === 'student_pickup' ? (language === 'km' ? 'ទទួលសិស្ស' : 'Pickup') : 'Stop'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {localize(stop.address, stop.addressKh)}
                        </p>
                        {stop.studentName && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 font-medium bg-indigo-50 px-1.5 py-0.5 rounded mt-1">
                            👤 {stop.studentName}
                          </span>
                        )}
                      </div>

                      {/* Reorder & Delete Controls */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveStop(index, 'up')}
                          disabled={isFirst}
                          title={t('optimizer.moveUp')}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveStop(index, 'down')}
                          disabled={isLast}
                          title={t('optimizer.moveDown')}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeStop(stop.id)}
                          title={t('optimizer.removeStop')}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Simulated Return Point preview */}
                {returnToStart && stops.length > 0 && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-800 text-xs font-semibold">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                      ↩
                    </span>
                    <span className="truncate">
                      {language === 'km' ? 'ត្រឡប់មកកាន់៖ ' : 'Return to: '}
                      {localize(origin.name, origin.nameKh)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Route Summary Cards */}
          {activeRoute && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  {t('optimizer.routeSummary')}
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isOptimized ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {isOptimized ? '✓ 2-Opt Optimized' : 'Direct Sequence'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    {t('optimizer.totalDistance')}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                    {formatKm(activeRoute.totalDistanceMeters)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    {t('optimizer.totalDuration')}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-1 block">
                    {formatMins(activeRoute.totalDurationSeconds)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    {t('optimizer.totalStops')}
                  </span>
                  <span className="text-sm font-extrabold text-blue-600 mt-1 block">
                    {formatNumber(activeRoute.orderedStops.length)}
                  </span>
                </div>
              </div>

              {/* Comparison Section (when optimized) */}
              {comparison && (
                <div className="p-3.5 rounded-xl border bg-gradient-to-r from-emerald-50/80 to-blue-50/80 border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {t('optimizer.comparisonTitle')}
                    </strong>
                    <button
                      onClick={() => setShowComparisonOnMap(!showComparisonOnMap)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showComparisonOnMap ? 'Hide Original Line' : 'Show Original Line'}</span>
                    </button>
                  </div>

                  {comparison.isImproved ? (
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/60">
                        <span className="text-[10px] text-slate-500 block">{t('optimizer.distanceSaved')}:</span>
                        <strong className="text-emerald-700 text-xs">
                          -{(comparison.distanceSavedMeters / 1000).toFixed(2)} km
                        </strong>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/60">
                        <span className="text-[10px] text-slate-500 block">{t('optimizer.timeSaved')}:</span>
                        <strong className="text-emerald-700 text-xs">
                          -{Math.round(comparison.timeSavedSeconds / 60)} min
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {t('optimizer.alreadyOptimal')}
                    </p>
                  )}
                </div>
              )}

              {/* Collapsible Turn-by-Turn Directions */}
              <div>
                <button
                  onClick={() => setShowDirections(!showDirections)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    {t('optimizer.turnByTurn')} ({activeRoute.legs.reduce((acc, leg) => acc + leg.steps.length, 0)} steps)
                  </span>
                  {showDirections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDirections && (
                  <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1 border-t border-slate-100 pt-2 text-[11px]">
                    {activeRoute.legs.flatMap((leg, legIdx) =>
                      leg.steps.map((step, stepIdx) => (
                        <div key={`${legIdx}-${stepIdx}`} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                          <span className="text-blue-600 font-bold shrink-0 mt-0.5">↳</span>
                          <div className="flex-1 leading-snug">
                            <p className="text-slate-800 font-medium">
                              {language === 'km' && step.instructionKh ? step.instructionKh : step.instruction}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {(step.distanceMeters / 1000).toFixed(2)} km • {Math.round(step.durationSeconds / 60)} min
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* AI Safety Advisor Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleRunAiSafetyAdvisor}
                  disabled={aiLoading}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>
                    {aiLoading 
                      ? (language === 'km' ? 'កំពុងវិភាគសុវត្ថិភាពចរាចរណ៍...' : 'Analyzing Traffic Safety...')
                      : (language === 'km' ? 'វិភាគសុវត្ថិភាពផ្លូវ AI' : 'Analyze Route Safety (Gemini AI)')}
                  </span>
                </button>

                {aiAnalysis && (
                  <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 leading-relaxed space-y-1.5 animate-in fade-in">
                    <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {language === 'km' ? 'ការវាយតម្លៃសុវត្ថិភាពផ្លូវភ្នំពេញ៖' : 'Phnom Penh Route Safety Insights:'}
                    </p>
                    <div className="whitespace-pre-line text-slate-800 leading-relaxed text-[11px]">
                      {aiAnalysis}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center">
            {t('optimizer.sampleDataNotice')}
          </p>
        </div>

        {/* RIGHT PANEL: INTERACTIVE PHNOM PENH MAP (~60% on Desktop: 7/12 cols) */}
        <div className="lg:col-span-7 h-[580px] lg:h-[720px] sticky top-20">
          <PhnomPenhRouteMap
            origin={origin}
            stops={stops}
            activeRoute={activeRoute}
            originalRoute={originalRoute}
            showComparison={showComparisonOnMap}
            isLoading={loading || optimizing}
            onMapClick={handleMapClick}
            onRemoveStop={removeStop}
            onSetOrigin={(loc) => {
              setOrigin(loc);
              removeStop(loc.id);
            }}
          />
        </div>
      </div>

      {/* ADD STOP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{t('optimizer.addStop')}</h3>
                  <p className="text-[11px] text-slate-500">Phnom Penh, Cambodia</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-5 pt-2 text-xs font-semibold">
              <button
                onClick={() => setActiveAddTab('verified')}
                className={`pb-2.5 px-3 border-b-2 transition-all ${
                  activeAddTab === 'verified'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('optimizer.selectFromSchoolList')}
              </button>
              <button
                onClick={() => setActiveAddTab('search')}
                className={`pb-2.5 px-3 border-b-2 transition-all ${
                  activeAddTab === 'search'
                    ? 'border-blue-600 text-blue-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('optimizer.searchLocationPlaceholder')}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {activeAddTab === 'verified' ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {language === 'km' ? 'សាលារៀន និងចំណុចទទួលសិស្សដែលបានផ្ទៀងផ្ទាត់' : 'Verified Phnom Penh Schools & Pickup Hubs'}
                  </label>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {VERIFIED_PHNOM_PENH_LOCATIONS.map(loc => {
                      const alreadyInRoute = stops.some(s => s.lat === loc.lat && s.lng === loc.lng);
                      return (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <h4 className="font-bold text-slate-900 text-xs truncate">
                              {localize(loc.name, loc.nameKh)}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {localize(loc.address, loc.addressKh)}
                            </p>
                          </div>
                          <button
                            onClick={() => addStopToRoute(loc)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm shrink-0"
                          >
                            + {language === 'km' ? 'ជ្រើសរើស' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder={t('optimizer.searchLocationPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                  </div>

                  {searchLoading && (
                    <div className="text-center py-6 text-xs text-slate-400">
                      {language === 'km' ? 'កំពុងស្វែងរកទីតាំងនៅភ្នំពេញ...' : 'Searching Phnom Penh geocoding database...'}
                    </div>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {searchResults.map(result => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{result.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{result.address}</p>
                          </div>
                          <button
                            onClick={() => addStopToRoute(result)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400">
                      {language === 'km' ? 'រកមិនឃើញទីតាំងនេះទេ។ សូមសាកល្បងឈ្មោះផ្លូវ ឬសាលាផ្សេងទៀត។' : 'No locations found. Try searching for a school name or street in Phnom Penh.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
