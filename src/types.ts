export type UserRole = 'school_admin' | 'admin' | 'driver' | 'parent' | 'phnom-penh';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  passwordHash?: string;
  languagePreference?: 'km' | 'en';
  // School Admin fields
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  verificationCode?: string;
  // Parent fields
  studentName?: string;
  studentGrade?: string;
  schoolId?: string;
  studentIdCode?: string;
  // Driver fields
  licenseNumber?: string;
  transportCompany?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface School {
  id: string;
  name: string;
  nameKh?: string;
  address: string;
  addressKh?: string;
  lat: number;
  lng: number;
  phone: string;
  principal: string;
  totalStudents: number;
  area?: string;
  areaKh?: string;
  type?: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
  parentId: string;
  busId?: string;
  routeId?: string;
  pickupAddress: string;
  pickupAddressKh?: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffAddressKh?: string;
  dropoffLat: number;
  dropoffLng: number;
  status: 'at_home' | 'waiting' | 'picked_up' | 'at_school' | 'dropped_off' | 'absent';
  pickedUpAt?: string;
  droppedOffAt?: string;
  pickupOrder?: number;
  parentPhone?: string;
  notes?: string;
  qrToken?: string;
}

export interface Parent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  childrenIds: string[];
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  licenseNumber: string;
  phone: string;
  busId?: string;
  routeId?: string;
  status: 'on_duty' | 'off_duty' | 'on_trip' | 'available';
  rating: number;
}

export interface Bus {
  id: string;
  busNumber: string;
  plateNumber: string;
  capacity: number;
  model: string;
  status: 'active' | 'maintenance' | 'idle';
  driverId?: string;
  currentLat?: number;
  currentLng?: number;
  speed?: number;
  heading?: number;
}

export interface RouteStop {
  id: string;
  stopName: string;
  stopNameKh?: string;
  address: string;
  addressKh?: string;
  lat: number;
  lng: number;
  scheduledTime: string;
  studentIds: string[];
  completed?: boolean;
}

export interface Route {
  id: string;
  name: string;
  nameKh?: string;
  schoolId: string;
  busId?: string;
  driverId?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  stops: RouteStop[];
  polylineCoords?: [number, number][];
}

export type TripStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'emergency_replacement_required' 
  | 'replacement_dispatched' 
  | 'replacement_arrived'
  | 'completed' 
  | 'cancelled';

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  date: string;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  studentsPickedUpCount: number;
  totalStudentsCount: number;
  delayMinutes?: number;
  breakdownLocation?: { lat: number; lng: number; address: string; addressKh?: string };
  breakdownTime?: string;
  breakdownReason?: string;
  replacementBusId?: string;
  replacementDriverId?: string;
  replacementDispatchedAt?: string;
  replacementEtaMinutes?: number;
  transferredStudentIds?: string[];
}

export interface NotificationItem {
  id: string;
  userId?: string;
  roleTarget?: UserRole | 'all';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export interface Incident {
  id: string;
  driverId: string;
  busId: string;
  routeId: string;
  type: 'delay' | 'breakdown' | 'accident' | 'medical' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'acknowledged' | 'replacement_dispatched' | 'resolved';
  createdAt: string;
  location?: { lat: number; lng: number; address: string; addressKh?: string };
  affectedStudentIds?: string[];
  replacementBusId?: string;
  replacementDriverId?: string;
  replacementDispatchedAt?: string;
  resolvedAt?: string;
  notes?: string;
}
