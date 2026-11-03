// Real-Time GPS Tracking Service for SchoolRoutAI
// Manages real device geolocation, high-accuracy broadcasts, multi-tab sync, and test simulators.

export interface GpsLocationRecord {
  driverId: string;
  driverName: string;
  busId: string;
  busNumber: string;
  plateNumber: string;
  routeId: string;
  routeName: string;
  schoolId?: string;
  lat: number;
  lng: number;
  accuracy: number; // in meters (e.g., 5.4m)
  speed: number | null; // in km/h
  heading: number | null; // 0 - 360 degrees
  timestamp: number; // epoch ms
  isoTimestamp: string;
  tripStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sharingStatus: 'broadcasting' | 'stopped' | 'stale' | 'denied' | 'demo_simulated';
  isDemoData: boolean;
  batteryLevel?: number;
}

export type GpsPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

type LocationListener = (record: GpsLocationRecord) => void;
type FleetListener = (fleet: Record<string, GpsLocationRecord>) => void;

class GpsTrackingService {
  private watchId: number | null = null;
  private simulationInterval: number | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private currentRecord: GpsLocationRecord | null = null;
  private fleetState: Record<string, GpsLocationRecord> = {};
  private busListeners: Map<string, Set<LocationListener>> = new Map();
  private fleetListeners: Set<FleetListener> = new Set();
  private updateIntervalMs: number = 5000; // 5-10 seconds per requirements
  private lastBroadcastMs: number = 0;
  private permissionStatus: GpsPermissionState = 'prompt';

  constructor() {
    // Initialize cross-tab BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('schoolroutai_gps_fleet_v1');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'GPS_LOCATION_UPDATE') {
            this.handleIncomingUpdate(event.data.payload);
          } else if (event.data && event.data.type === 'GPS_SHARING_STOPPED') {
            this.handleStopUpdate(event.data.payload);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel initialization failed, falling back to storage events', e);
      }
    }

    // Storage fallback for cross-tab sync in all browsers
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'schoolroutai_active_gps_record' && e.newValue) {
          try {
            const record = JSON.parse(e.newValue);
            this.handleIncomingUpdate(record);
          } catch {
            // Ignore parse errors
          }
        }
      });

      // Load initial cached fleet state
      this.loadCachedFleet();

      // Check initial permission status if browser supports Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName })
          .then((result) => {
            this.permissionStatus = result.state as GpsPermissionState;
            result.onchange = () => {
              this.permissionStatus = result.state as GpsPermissionState;
            };
          })
          .catch(() => {
            this.permissionStatus = 'prompt';
          });
      }
    }

    // Periodic stale checker every 5 seconds
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.checkStaleLocations();
      }, 5000);
    }
  }

  // Load cached fleet positions from localStorage
  private loadCachedFleet() {
    try {
      const saved = localStorage.getItem('schoolroutai_fleet_gps_state');
      if (saved) {
        this.fleetState = JSON.parse(saved);
      }
    } catch {
      this.fleetState = {};
    }
  }

  private saveFleetState() {
    try {
      localStorage.setItem('schoolroutai_fleet_gps_state', JSON.stringify(this.fleetState));
    } catch {
      // quota or private mode fallback
    }
  }

  // Query or request real device GPS permission
  public async checkOrRequestPermission(): Promise<GpsPermissionState> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.permissionStatus = 'unsupported';
      return 'unsupported';
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.permissionStatus = 'granted';
          resolve('granted');
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            this.permissionStatus = 'denied';
            resolve('denied');
          } else {
            // Position unavailable or timeout, but permission was granted/prompted
            this.permissionStatus = 'granted';
            resolve('granted');
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }

  public getPermissionStatus(): GpsPermissionState {
    return this.permissionStatus;
  }

  // Start Real Device GPS Broadcasting
  public async startRealDeviceGps(config: {
    driverId: string;
    driverName: string;
    busId: string;
    busNumber: string;
    plateNumber: string;
    routeId: string;
    routeName: string;
    schoolId?: string;
    onUpdate?: (record: GpsLocationRecord) => void;
    onError?: (error: GeolocationPositionError | Error) => void;
  }): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return { success: false, error: 'Geolocation is not supported by this browser.' };
    }

    // Stop existing tracking or simulation first
    this.stopGps();

    try {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.permissionStatus = 'granted';
          const now = Date.now();

          // Enforce 5-10 second throttle window
          if (now - this.lastBroadcastMs < this.updateIntervalMs) {
            return;
          }
          this.lastBroadcastMs = now;

          // Convert speed from m/s to km/h if available
          const speedKmH = position.coords.speed !== null && position.coords.speed !== undefined
            ? Math.round(position.coords.speed * 3.6)
            : 0;

          const record: GpsLocationRecord = {
            driverId: config.driverId,
            driverName: config.driverName,
            busId: config.busId,
            busNumber: config.busNumber,
            plateNumber: config.plateNumber,
            routeId: config.routeId,
            routeName: config.routeName,
            schoolId: config.schoolId,
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy || 10),
            speed: speedKmH,
            heading: position.coords.heading || 0,
            timestamp: now,
            isoTimestamp: new Date(now).toISOString(),
            tripStatus: 'in_progress',
            sharingStatus: 'broadcasting',
            isDemoData: false
          };

          this.broadcastRecord(record);
          if (config.onUpdate) config.onUpdate(record);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            this.permissionStatus = 'denied';
          }
          if (config.onError) config.onError(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to start GPS tracker' };
    }
  }

  // Start Clearly Labelled Simulated Test Mode along Phnom Penh Route
  public startSimulatedGps(config: {
    driverId: string;
    driverName: string;
    busId: string;
    busNumber: string;
    plateNumber: string;
    routeId: string;
    routeName: string;
    schoolId?: string;
    onUpdate?: (record: GpsLocationRecord) => void;
  }) {
    this.stopGps();

    // Actual coordinates along Toul Kork -> Russian Blvd -> ITC School in Phnom Penh
    const waypoints: [number, number][] = [
      [11.5742, 104.9051], // Toul Kork St. 315
      [11.5720, 104.9080], // Stop 1 (Student Pickup)
      [11.5695, 104.9125], // Toul Kork intersection
      [11.5683, 104.9150], // Russian Confederation Blvd
      [11.5683, 104.9179], // ITC School Entrance
      [11.5665, 104.9205], // Monivong Blvd approach
      [11.5620, 104.9250]  // Sisowath Quay
    ];

    let currentIndex = 0;
    const intervalMs = 5000; // 5-second updates per requirements

    const step = () => {
      const coord = waypoints[currentIndex];
      const now = Date.now();
      
      // Calculate realistic bearing between waypoints
      const nextCoord = waypoints[(currentIndex + 1) % waypoints.length];
      const heading = Math.round(
        (Math.atan2(nextCoord[1] - coord[1], nextCoord[0] - coord[0]) * 180) / Math.PI + 360
      ) % 360;

      const record: GpsLocationRecord = {
        driverId: config.driverId,
        driverName: config.driverName,
        busId: config.busId,
        busNumber: config.busNumber,
        plateNumber: config.plateNumber,
        routeId: config.routeId,
        routeName: config.routeName,
        schoolId: config.schoolId,
        lat: Number(coord[0].toFixed(6)),
        lng: Number(coord[1].toFixed(6)),
        accuracy: 6, // Simulated 6-meter GPS accuracy
        speed: 28, // Realistic 28 km/h Phnom Penh city bus speed
        heading: heading,
        timestamp: now,
        isoTimestamp: new Date(now).toISOString(),
        tripStatus: 'in_progress',
        sharingStatus: 'demo_simulated',
        isDemoData: true
      };

      this.broadcastRecord(record);
      if (config.onUpdate) config.onUpdate(record);

      currentIndex = (currentIndex + 1) % waypoints.length;
    };

    // Execute immediately and then on interval
    step();
    this.simulationInterval = window.setInterval(step, intervalMs);
  }

  // End Trip & Stop GPS Tracking
  public stopGps(finalStatus: 'completed' | 'cancelled' = 'completed') {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.simulationInterval !== null) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.currentRecord) {
      const stoppedRecord: GpsLocationRecord = {
        ...this.currentRecord,
        timestamp: Date.now(),
        isoTimestamp: new Date().toISOString(),
        tripStatus: finalStatus,
        sharingStatus: 'stopped',
        speed: 0
      };
      this.broadcastRecord(stoppedRecord);
      this.currentRecord = null;
    }
  }

  // Internal broadcaster
  private broadcastRecord(record: GpsLocationRecord) {
    this.currentRecord = record;
    this.fleetState[record.busId] = record;
    this.saveFleetState();

    // Broadcast over channel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'GPS_LOCATION_UPDATE',
        payload: record
      });
    }

    // Update storage for cross-tab fallback
    try {
      localStorage.setItem('schoolroutai_active_gps_record', JSON.stringify(record));
    } catch {
      // ignore
    }

    // Trigger local listeners
    this.notifyListeners(record);
  }

  private handleIncomingUpdate(record: GpsLocationRecord) {
    this.fleetState[record.busId] = record;
    this.saveFleetState();
    this.notifyListeners(record);
  }

  private handleStopUpdate(record: GpsLocationRecord) {
    this.fleetState[record.busId] = record;
    this.saveFleetState();
    this.notifyListeners(record);
  }

  private notifyListeners(record: GpsLocationRecord) {
    // Bus specific listeners
    const listeners = this.busListeners.get(record.busId);
    if (listeners) {
      listeners.forEach(fn => fn(record));
    }

    // Fleet wide listeners
    this.fleetListeners.forEach(fn => fn(this.fleetState));
  }

  private checkStaleLocations() {
    const now = Date.now();
    let hasChanges = false;

    Object.values(this.fleetState).forEach(rec => {
      if (rec.sharingStatus === 'broadcasting' || rec.sharingStatus === 'demo_simulated') {
        const diffMs = now - rec.timestamp;
        if (diffMs > 30000) { // 30s stale mark
          rec.sharingStatus = 'stale';
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      this.saveFleetState();
      this.fleetListeners.forEach(fn => fn(this.fleetState));
    }
  }

  // Subscriptions
  public subscribeToBusLocation(busId: string, listener: LocationListener): () => void {
    if (!this.busListeners.has(busId)) {
      this.busListeners.set(busId, new Set());
    }
    this.busListeners.get(busId)!.add(listener);

    // Provide initial state if available
    const existing = this.fleetState[busId];
    if (existing) {
      listener(existing);
    }

    return () => {
      const set = this.busListeners.get(busId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) this.busListeners.delete(busId);
      }
    };
  }

  public subscribeToFleet(listener: FleetListener): () => void {
    this.fleetListeners.add(listener);
    listener(this.fleetState);

    return () => {
      this.fleetListeners.delete(listener);
    };
  }

  public getBusLocation(busId: string): GpsLocationRecord | null {
    return this.fleetState[busId] || null;
  }

  public getAllFleet(): Record<string, GpsLocationRecord> {
    return { ...this.fleetState };
  }

  public isTrackingActive(): boolean {
    return this.watchId !== null || this.simulationInterval !== null;
  }

  public isCurrentSimulated(): boolean {
    return this.simulationInterval !== null;
  }
}

export const gpsTrackingService = new GpsTrackingService();
