/**
 * Phnom Penh Routing & Optimization Service
 * Uses Open Source Routing Machine (OSRM) and OpenStreetMap Nominatim
 * with real coordinates, real road geometries, and 2-Opt TSP optimization.
 */

export interface GeoLocation {
  id: string;
  name: string;
  nameKh?: string;
  address: string;
  addressKh?: string;
  lat: number;
  lng: number;
  type: 'origin' | 'school' | 'student_pickup' | 'student_dropoff' | 'custom' | 'destination';
  studentName?: string;
  notes?: string;
}

export type TravelMode = 'driving' | 'cycling' | 'walking';
export type OptimizationCriteria = 'time' | 'distance';

export interface RouteLeg {
  distanceMeters: number;
  durationSeconds: number;
  summary: string;
  steps: {
    instruction: string;
    instructionKh?: string;
    distanceMeters: number;
    durationSeconds: number;
    name: string;
  }[];
}

export interface CalculatedRouteResult {
  polyline: [number, number][]; // [lat, lng] array for Leaflet
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  legs: RouteLeg[];
  orderedStops: GeoLocation[];
  bounds: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
}

export interface RouteComparisonResult {
  original: CalculatedRouteResult;
  optimized: CalculatedRouteResult;
  distanceSavedMeters: number;
  timeSavedSeconds: number;
  isImproved: boolean;
}

// Phnom Penh Bounding Box for Geocoding & Validation
export const PHNOM_PENH_BOUNDS = {
  minLat: 11.40,
  maxLat: 11.75,
  minLng: 104.70,
  maxLng: 105.10,
  center: [11.5564, 104.9282] as [number, number]
};

// Verified Sample Phnom Penh School and Landmark Locations
export const VERIFIED_PHNOM_PENH_LOCATIONS: GeoLocation[] = [
  {
    id: 'loc-itc',
    name: 'Institute of Technology of Cambodia (ITC)',
    nameKh: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)',
    address: 'Russian Confederation Blvd, Toul Kork, Phnom Penh',
    addressKh: 'មហាវិថីសហព័ន្ធរុស្ស៊ី សង្កាត់ទឹកល្អក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    lat: 11.5683,
    lng: 104.9179,
    type: 'school'
  },
  {
    id: 'loc-sisowath',
    name: 'Preah Sisowath High School',
    nameKh: 'វិទ្យាល័យព្រះស៊ីសុវត្ថិ',
    address: 'Preah Ang Eng St. (13), Daun Penh, Phnom Penh',
    addressKh: 'ផ្លូវព្រះអង្គអេង (១៣) សង្កាត់ជ័យជំនះ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
    lat: 11.5549,
    lng: 104.9222,
    type: 'school'
  },
  {
    id: 'loc-tuol-tompoung',
    name: 'Tuol Tom Poung High School',
    nameKh: 'វិទ្យាល័យទួលទំពូង',
    address: 'St. 155, Chamkar Mon, Phnom Penh',
    addressKh: 'ផ្លូវ ១៥៥ សង្កាត់ទួលទំពូង១ ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
    lat: 11.5420,
    lng: 104.9180,
    type: 'school'
  },
  {
    id: 'loc-bkk-high',
    name: 'Boeung Keng Kang High School',
    nameKh: 'វិទ្យាល័យបឹងកេងកង',
    address: 'St. 360, Boeung Keng Kang 1, Phnom Penh',
    addressKh: 'ផ្លូវ ៣៦០ សង្កាត់បឹងកេងកង១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
    lat: 11.5480,
    lng: 104.9250,
    type: 'school'
  },
  {
    id: 'loc-bak-touk',
    name: 'Bak Touk High School',
    nameKh: 'វិទ្យាល័យបាក់ទូក',
    address: 'St. 169, 7 Makara, Phnom Penh',
    addressKh: 'ផ្លូវ ១៦៩ សង្កាត់វាលវង់ ខណ្ឌ៧មករា រាជធានីភ្នំពេញ',
    lat: 11.5658,
    lng: 104.9152,
    type: 'school'
  },
  {
    id: 'loc-wat-phnom-sch',
    name: 'Hun Sen Wat Phnom High School',
    nameKh: 'វិទ្យាល័យ ហ៊ុន សែន វត្តភ្នំ',
    address: 'St. 47 near Wat Phnom, Daun Penh, Phnom Penh',
    addressKh: 'ផ្លូវ ៤៧ ក្បែររង្វង់មូលវត្តភ្នំ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
    lat: 11.5752,
    lng: 104.9234,
    type: 'school'
  },
  {
    id: 'loc-cia-first',
    name: 'CIA FIRST International School',
    nameKh: 'សាលាអន្តរជាតិ ស៊ីអាយអេ ហ្វឺស',
    address: 'St. 2004, Teuk Thla, Sen Sok, Phnom Penh',
    addressKh: 'ផ្លូវ ២០០៤ សង្កាត់ទឹកថ្លា ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ',
    lat: 11.5630,
    lng: 104.8770,
    type: 'school'
  },
  {
    id: 'loc-northbridge',
    name: 'Northbridge International School Cambodia',
    nameKh: 'សាលាអន្តរជាតិន័រប្រ៊ីដ កម្ពុជា',
    address: 'Northbridge St., Sen Sok, Phnom Penh',
    addressKh: 'ផ្លូវណតប្រ៊ីដ សង្កាត់ទឹកថ្លា ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ',
    lat: 11.5492,
    lng: 104.8625,
    type: 'school'
  },
  {
    id: 'loc-pickup-tk',
    name: 'Toul Kork Student Station (St. 315)',
    nameKh: 'ចំណតសិស្សទួលគោក (ផ្លូវ ៣១៥)',
    address: 'St. 315, Boeung Kak 1, Toul Kork, Phnom Penh',
    addressKh: 'ផ្លូវ ៣១៥ សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    lat: 11.5732,
    lng: 104.9080,
    type: 'student_pickup',
    studentName: 'Sokha Sarya & Chhoun Vanna'
  },
  {
    id: 'loc-pickup-bkk',
    name: 'BKK1 Central Pickup Hub',
    nameKh: 'ចំណុចទទួលសិស្សបឹងកេងកង១',
    address: 'St. 51 & St. 302, BKK1, Phnom Penh',
    addressKh: 'កែងផ្លូវ ៥១ និងផ្លូវ ៣០២ សង្កាត់បឹងកេងកង១ រាជធានីភ្នំពេញ',
    lat: 11.5520,
    lng: 104.9280,
    type: 'student_pickup',
    studentName: 'Rath Monika'
  },
  {
    id: 'loc-origin-central',
    name: 'Phnom Penh Central Bus Depot (Monivong Blvd)',
    nameKh: 'ដេប៉ូរថយន្តក្រុងកណ្តាល (មហាវិថីព្រះមុនីវង្ស)',
    address: 'Preah Monivong Blvd, Daun Penh, Phnom Penh',
    addressKh: 'មហាវិថីព្រះមុនីវង្ស ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
    lat: 11.5695,
    lng: 104.9205,
    type: 'origin'
  },
  {
    id: 'loc-origin-independence',
    name: 'Independence Monument Departure Station',
    nameKh: 'ស្ថានីយចេញដំណើរវិមានឯករាជ្យ',
    address: 'Sihanouk & Norodom Blvd, Daun Penh, Phnom Penh',
    addressKh: 'ប្រសព្វមហាវិថីព្រះសីហនុ និងព្រះនរោត្តម ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
    lat: 11.5564,
    lng: 104.9282,
    type: 'origin'
  }
];

/**
 * Geocode search using OpenStreetMap Nominatim with Phnom Penh focus
 */
export async function searchPhnomPenhLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();

  // First, check local verified locations
  const localMatches = VERIFIED_PHNOM_PENH_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
    (loc.nameKh && loc.nameKh.includes(cleanQuery)) ||
    loc.address.toLowerCase().includes(cleanQuery.toLowerCase()) ||
    (loc.addressKh && loc.addressKh.includes(cleanQuery))
  );

  // If local query found enough, return along with remote results
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery + ' Phnom Penh Cambodia'
    )}&viewbox=104.75,11.75,105.10,11.40&bounded=0&limit=6&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SchoolRoutAI-PhnomPenh/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const remoteMatches: GeoLocation[] = data.map((item: any) => ({
        id: `osm-${item.place_id}`,
        name: item.name || item.display_name.split(',')[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: 'custom' as const
      }));

      // Combine local matches (priority) and remote OSM matches, avoiding duplicates
      const seen = new Set<string>();
      const combined: GeoLocation[] = [];

      for (const loc of [...localMatches, ...remoteMatches]) {
        const key = `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(loc);
        }
      }

      return combined.slice(0, 8);
    }
  } catch (err) {
    console.warn('Nominatim geocode query failed or timed out, returning local matches:', err);
  }

  return localMatches;
}

/**
 * Reverse geocode coordinate into a readable Phnom Penh address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ name: string; address: string }> {
  // Check if near verified locations first
  const nearest = VERIFIED_PHNOM_PENH_LOCATIONS.find(loc => {
    const dLat = Math.abs(loc.lat - lat);
    const dLng = Math.abs(loc.lng - lng);
    return dLat < 0.0015 && dLng < 0.0015;
  });

  if (nearest) {
    return { name: nearest.name, address: nearest.address };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SchoolRoutAI-PhnomPenh/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const name = data.name || data.display_name.split(',')[0] || `Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      return {
        name,
        address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}, Phnom Penh`
      };
    }
  } catch (e) {
    console.warn('Reverse geocode failed:', e);
  }

  return {
    name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    address: `Phnom Penh [${lat.toFixed(4)}, ${lng.toFixed(4)}]`
  };
}

/**
 * Calculate route via OSRM between an ordered sequence of stops
 */
export async function calculateRouteWithOSRM(
  stops: GeoLocation[],
  mode: TravelMode = 'driving'
): Promise<CalculatedRouteResult> {
  if (stops.length < 2) {
    throw new Error('At least 2 points (origin and destination) are required to calculate a route.');
  }

  // Profile mapping: driving -> driving, cycling -> bike, walking -> foot
  const profileMap: Record<TravelMode, string> = {
    driving: 'driving',
    cycling: 'bike',
    walking: 'foot'
  };
  const profile = profileMap[mode] || 'driving';

  // Format coords as lng,lat;lng,lat...
  const coordString = stops.map(s => `${s.lng.toFixed(6)},${s.lat.toFixed(6)}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordString}?overview=full&geometries=geojson&steps=true&annotations=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`OSRM Routing failed with status: ${res.statusText}`);
  }

  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(data.message || 'No valid road route found between selected stops.');
  }

  const mainRoute = data.routes[0];
  
  // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
  const polyline: [number, number][] = (mainRoute.geometry?.coordinates || []).map(
    (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
  );

  // Compute bounding box
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  for (const [lat, lng] of polyline) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  // Fallback to stops bounds if polyline is somehow empty
  if (polyline.length === 0) {
    stops.forEach(s => {
      if (s.lat < minLat) minLat = s.lat;
      if (s.lat > maxLat) maxLat = s.lat;
      if (s.lng < minLng) minLng = s.lng;
      if (s.lng > maxLng) maxLng = s.lng;
    });
  }

  // Parse legs & steps
  const legs: RouteLeg[] = (mainRoute.legs || []).map((leg: any) => ({
    distanceMeters: leg.distance,
    durationSeconds: leg.duration,
    summary: leg.summary || '',
    steps: (leg.steps || []).map((step: any) => ({
      instruction: formatInstructionEn(step),
      instructionKh: formatInstructionKh(step),
      distanceMeters: step.distance,
      durationSeconds: step.duration,
      name: step.name || ''
    }))
  }));

  return {
    polyline,
    totalDistanceMeters: mainRoute.distance,
    totalDurationSeconds: mainRoute.duration,
    legs,
    orderedStops: stops,
    bounds: [[minLat, minLng], [maxLat, maxLng]]
  };
}

/**
 * Format step instructions
 */
function formatInstructionEn(step: any): string {
  const type = step.maneuver?.type || 'turn';
  const modifier = step.maneuver?.modifier || '';
  const roadName = step.name ? ` onto ${step.name}` : '';

  if (type === 'depart') return `Depart from starting point${roadName}`;
  if (type === 'arrive') return `Arrive at destination`;
  if (modifier) return `Turn ${modifier}${roadName}`;
  return `Continue straight${roadName}`;
}

function formatInstructionKh(step: any): string {
  const type = step.maneuver?.type || 'turn';
  const modifier = step.maneuver?.modifier || '';
  const roadName = step.name ? ` ទៅកាន់ផ្លូវ ${step.name}` : '';

  if (type === 'depart') return `ចាប់ផ្តើមចេញដំណើរ${roadName}`;
  if (type === 'arrive') return `មកដល់គោលដៅ`;
  if (modifier === 'left') return `បត់ឆ្វេង${roadName}`;
  if (modifier === 'right') return `បត់ស្តាំ${roadName}`;
  if (modifier === 'slight left') return `ងាកឆ្វេងបន្តិច${roadName}`;
  if (modifier === 'slight right') return `ងាកស្តាំបន្តិច${roadName}`;
  if (modifier === 'uturn') return `ត្រឡប់ក្រោយ${roadName}`;
  return `បន្តដំណើរទៅមុខត្រង់${roadName}`;
}

/**
 * Haversine distance in meters between two coordinates (for heuristic fallback)
 */
export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fetch real distance/time cost matrix from OSRM table service
 */
async function fetchOsrmDistanceMatrix(
  points: GeoLocation[],
  mode: TravelMode
): Promise<{ distances: number[][]; durations: number[][] }> {
  const profileMap: Record<TravelMode, string> = {
    driving: 'driving',
    cycling: 'bike',
    walking: 'foot'
  };
  const profile = profileMap[mode] || 'driving';
  const coords = points.map(p => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const url = `https://router.project-osrm.org/table/v1/${profile}/${coords}?annotations=distance,duration`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.distances && data.durations) {
        return {
          distances: data.distances,
          durations: data.durations
        };
      }
    }
  } catch (err) {
    console.warn('OSRM table service failed, falling back to Haversine matrix:', err);
  }

  // Fallback Haversine matrix if table service is down
  const n = points.length;
  const distances: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const durations: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  
  // Speeds: driving ~30km/h (8.3 m/s), cycling ~15km/h (4.2 m/s), walking ~4.5km/h (1.25 m/s) in Phnom Penh
  const speedMps = mode === 'driving' ? 8.3 : mode === 'cycling' ? 4.2 : 1.25;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        // Apply road tortuosity factor (~1.3x straight-line for Phnom Penh city grid)
        const d = haversineDistanceMeters(points[i].lat, points[i].lng, points[j].lat, points[j].lng) * 1.35;
        distances[i][j] = d;
        durations[i][j] = d / speedMps;
      }
    }
  }

  return { distances, durations };
}

/**
 * 2-Opt Algorithm to optimize visit sequence of destinations
 * Keeps origin as the first stop. If returnToStart is true, last stop is also origin.
 */
export async function optimizeRouteSequence(
  origin: GeoLocation,
  destinations: GeoLocation[],
  options: {
    mode: TravelMode;
    criteria: OptimizationCriteria;
    returnToStart: boolean;
  }
): Promise<{
  originalStops: GeoLocation[];
  optimizedStops: GeoLocation[];
  originalRoute: CalculatedRouteResult;
  optimizedRoute: CalculatedRouteResult;
  comparison: RouteComparisonResult;
}> {
  if (destinations.length === 0) {
    throw new Error('Please select at least one destination or school to optimize.');
  }

  // Build original stop sequence
  const originalStops: GeoLocation[] = [origin, ...destinations];
  if (options.returnToStart) {
    originalStops.push({
      ...origin,
      id: `${origin.id}-return`,
      name: `${origin.name} (Return)`,
      nameKh: `${origin.nameKh || origin.name} (ត្រឡប់មកវិញ)`
    });
  }

  // 1. Calculate original route with real OSRM road geometry
  const originalRoute = await calculateRouteWithOSRM(originalStops, options.mode);

  // If only 1 destination, no reordering is possible (sequence is already minimal)
  if (destinations.length <= 1) {
    return {
      originalStops,
      optimizedStops: originalStops,
      originalRoute,
      optimizedRoute: originalRoute,
      comparison: {
        original: originalRoute,
        optimized: originalRoute,
        distanceSavedMeters: 0,
        timeSavedSeconds: 0,
        isImproved: false
      }
    };
  }

  // 2. Fetch real cost matrix between all points
  // Points array: index 0 is origin, indices 1..N are destinations
  const points = [origin, ...destinations];
  const n = points.length;
  const matrixData = await fetchOsrmDistanceMatrix(points, options.mode);
  const costMatrix = options.criteria === 'distance' ? matrixData.distances : matrixData.durations;

  // Cost function for a permutation of indices [0, p1, p2, ..., pn]
  const calculateTotalCost = (path: number[]): number => {
    let sum = 0;
    for (let i = 0; i < path.length - 1; i++) {
      sum += costMatrix[path[i]][path[i + 1]];
    }
    if (options.returnToStart) {
      sum += costMatrix[path[path.length - 1]][path[0]];
    }
    return sum;
  };

  let bestPath: number[] = [];

  if (destinations.length <= 7) {
    // Exact Brute Force Permutation for small sets (<= 7 destinations)
    // Guarantees global optimum among the destinations!
    const destIndices = Array.from({ length: destinations.length }, (_, i) => i + 1);
    
    let minCost = Infinity;

    function permute(arr: number[], m: number[] = []) {
      if (arr.length === 0) {
        const fullPath = [0, ...m];
        const cost = calculateTotalCost(fullPath);
        if (cost < minCost) {
          minCost = cost;
          bestPath = fullPath;
        }
      } else {
        for (let i = 0; i < arr.length; i++) {
          const curr = arr.slice();
          const next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    }

    permute(destIndices);
  } else {
    // Nearest Neighbor Heuristic + 2-Opt Iterative Improvement for > 7 destinations
    const visited = new Set<number>([0]);
    let current = 0;
    const initialPath = [0];

    while (visited.size < n) {
      let nearest = -1;
      let minC = Infinity;
      for (let next = 1; next < n; next++) {
        if (!visited.has(next)) {
          const c = costMatrix[current][next];
          if (c < minC) {
            minC = c;
            nearest = next;
          }
        }
      }
      visited.add(nearest);
      initialPath.push(nearest);
      current = nearest;
    }

    // 2-Opt Improvement on intermediate destinations
    bestPath = [...initialPath];
    let improved = true;
    let iterations = 0;
    const maxIterations = 100;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      for (let i = 1; i < bestPath.length - 1; i++) {
        for (let k = i + 1; k < bestPath.length; k++) {
          // Reverse subsegment from i to k
          const newPath = [
            ...bestPath.slice(0, i),
            ...bestPath.slice(i, k + 1).reverse(),
            ...bestPath.slice(k + 1)
          ];
          if (calculateTotalCost(newPath) < calculateTotalCost(bestPath) - 1e-4) {
            bestPath = newPath;
            improved = true;
          }
        }
      }
    }
  }

  // Build the optimized stops from bestPath
  const optimizedStops: GeoLocation[] = bestPath.map(idx => points[idx]);
  if (options.returnToStart) {
    optimizedStops.push({
      ...origin,
      id: `${origin.id}-return`,
      name: `${origin.name} (Return)`,
      nameKh: `${origin.nameKh || origin.name} (ត្រឡប់មកវិញ)`
    });
  }

  // Check if order actually changed
  const orderIdentical = originalStops.every((stop, idx) => stop.id === optimizedStops[idx]?.id);

  let optimizedRoute: CalculatedRouteResult;
  if (orderIdentical) {
    optimizedRoute = originalRoute;
  } else {
    optimizedRoute = await calculateRouteWithOSRM(optimizedStops, options.mode);
  }

  const distanceSavedMeters = Math.max(0, originalRoute.totalDistanceMeters - optimizedRoute.totalDistanceMeters);
  const timeSavedSeconds = Math.max(0, originalRoute.totalDurationSeconds - optimizedRoute.totalDurationSeconds);
  const isImproved = distanceSavedMeters > 50 || timeSavedSeconds > 20;

  return {
    originalStops,
    optimizedStops,
    originalRoute,
    optimizedRoute,
    comparison: {
      original: originalRoute,
      optimized: optimizedRoute,
      distanceSavedMeters,
      timeSavedSeconds,
      isImproved
    }
  };
}
