import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, School, Student, Parent, Driver, Bus, Route, Trip, NotificationItem, Incident, UserRole 
} from '../types';
import { useLanguage } from './LanguageContext';
import { 
  INITIAL_USERS, INITIAL_SCHOOLS, INITIAL_STUDENTS, INITIAL_PARENTS, 
  INITIAL_DRIVERS, INITIAL_BUSES, INITIAL_ROUTES, INITIAL_TRIPS, 
  INITIAL_NOTIFICATIONS, INITIAL_INCIDENTS 
} from '../mockData';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  schools: School[];
  students: Student[];
  parents: Parent[];
  drivers: Driver[];
  buses: Bus[];
  routes: Route[];
  trips: Trip[];
  notifications: NotificationItem[];
  incidents: Incident[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  login: (emailOrPhone: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  registerUser: (data: {
    fullName: string;
    emailOrPhone: string;
    password: string;
    role: 'school_admin' | 'parent' | 'driver';
    preferredLanguage: 'km' | 'en';
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    schoolEmail?: string;
    verificationCode?: string;
    studentName?: string;
    studentGrade?: string;
    schoolId?: string;
    studentIdCode?: string;
    licenseNumber?: string;
    transportCompany?: string;
    vehicleType?: string;
    vehiclePlate?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string, reason?: string) => void;
  resetPassword: (emailOrPhone: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (userId: string, profile: Partial<User>) => void;
  
  // Admin CRUD / Actions
  addSchool: (school: Omit<School, 'id'>) => void;
  updateSchool: (id: string, school: Partial<School>) => void;
  deleteSchool: (id: string) => void;

  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;

  addBus: (bus: Omit<Bus, 'id'>) => void;
  updateBus: (id: string, bus: Partial<Bus>) => void;

  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;

  sendNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Driver Actions & Live Route Navigation
  startTrip: (routeId: string) => void;
  updateStudentStatus: (studentId: string, status: Student['status']) => void;
  confirmStudentPickup: (studentId: string, customTime?: string) => Promise<{ success: boolean; offlineQueued?: boolean; error?: string }>;
  markStudentAbsent: (studentId: string, reason?: string) => void;
  updateBusLocation: (busId: string, lat: number, lng: number, heading?: number, speed?: number) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;
  reportIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'status'>) => void;
  completeTrip: (routeId: string) => void;

  // Emergency Bus Replacement & Breakdown Management
  reportBusBreakdown: (params: {
    busId: string;
    driverId: string;
    routeId: string;
    reason: string;
    notes?: string;
    location: { lat: number; lng: number; address: string; addressKh?: string };
  }) => Promise<{ success: boolean; incidentId: string }>;
  assignReplacementBus: (params: {
    tripId?: string;
    incidentId?: string;
    originalBusId: string;
    routeId: string;
    replacementBusId: string;
    replacementDriverId: string;
    etaMinutes?: number;
    customNotes?: string;
  }) => Promise<{ success: boolean }>;
  confirmStudentTransfer: (params: {
    studentId: string;
    tripId?: string;
    transferredByDriverId?: string;
  }) => Promise<{ success: boolean }>;
  completeAllStudentTransfersAndResume: (params: {
    tripId?: string;
    routeId: string;
    replacementBusId: string;
  }) => Promise<{ success: boolean }>;
  activeEmergencyTrip?: Trip;
  activeEmergencyIncident?: Incident;

  // Gemini AI Helper
  askGeminiAssistant: (prompt: string, overrideLang?: 'km' | 'en') => Promise<string>;

  // Language & i18n
  language: 'km' | 'en';
  setLanguage: (lang: 'km' | 'en') => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localize: (enValue?: string, kmValue?: string) => string;
  formatNumber: (num: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const getKhmerAvatarForRole = (role?: string, id?: string) => {
    if (role === 'admin' || role === 'school_admin') return '/images/khmer_admin.svg';
    if (role === 'driver') {
      return id === 'usr-driver-2' ? '/images/khmer_driver2.svg' : '/images/khmer_driver.svg';
    }
    return id === 'usr-parent-2' ? '/images/khmer_parent2.svg' : '/images/khmer_parent.svg';
  };

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('schoolrout_users');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        return parsed.map(u => ({
          ...u,
          avatar: (!u.avatar || u.avatar.includes('unsplash.com')) ? getKhmerAvatarForRole(u.role, u.id) : u.avatar
        }));
      }
    } catch (e) {
      console.warn('Could not read users from storage', e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('schoolrout_current_user');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed: User = JSON.parse(saved);
        if (!parsed.avatar || parsed.avatar.includes('unsplash.com')) {
          parsed.avatar = getKhmerAvatarForRole(parsed.role, parsed.id);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read user from storage', e);
    }
    // Default to unauthenticated / first-time visitor so Welcome screen displays
    return null;
  });

  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('schoolrout_schools');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('schoolrout_students');
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        if (parsed.length >= 4 && parsed.some(s => s.pickupOrder)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read students from storage', e);
    }
    return INITIAL_STUDENTS;
  });

  const [parents, setParents] = useState<Parent[]>(() => {
    const saved = localStorage.getItem('schoolrout_parents');
    return saved ? JSON.parse(saved) : INITIAL_PARENTS;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('schoolrout_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [buses, setBuses] = useState<Bus[]>(() => {
    const saved = localStorage.getItem('schoolrout_buses');
    return saved ? JSON.parse(saved) : INITIAL_BUSES;
  });

  const [routes, setRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem('schoolrout_routes');
    return saved ? JSON.parse(saved) : INITIAL_ROUTES;
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('schoolrout_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('schoolrout_notifications');
      if (saved) {
        const parsed: NotificationItem[] = JSON.parse(saved);
        const seenIds = new Set<string>();
        return parsed.map((n, idx) => {
          if (!n.id || seenIds.has(n.id)) {
            const uniqueId = `notif-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`;
            seenIds.add(uniqueId);
            return { ...n, id: uniqueId };
          }
          seenIds.add(n.id);
          return n;
        });
      }
    } catch (e) {
      console.warn('Could not read notifications from storage', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('schoolrout_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(currentUser ? currentUser.role : 'parent');

  // Keep activeRole in sync with currentUser
  useEffect(() => {
    if (currentUser) {
      setActiveRole(currentUser.role);
    }
  }, [currentUser]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('schoolrout_users', JSON.stringify(users));
    if (currentUser) {
      localStorage.setItem('schoolrout_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('schoolrout_current_user');
    }
    localStorage.setItem('schoolrout_schools', JSON.stringify(schools));
    localStorage.setItem('schoolrout_students', JSON.stringify(students));
    localStorage.setItem('schoolrout_parents', JSON.stringify(parents));
    localStorage.setItem('schoolrout_drivers', JSON.stringify(drivers));
    localStorage.setItem('schoolrout_buses', JSON.stringify(buses));
    localStorage.setItem('schoolrout_routes', JSON.stringify(routes));
    localStorage.setItem('schoolrout_trips', JSON.stringify(trips));
    localStorage.setItem('schoolrout_notifications', JSON.stringify(notifications));
    localStorage.setItem('schoolrout_incidents', JSON.stringify(incidents));
  }, [users, currentUser, schools, students, parents, drivers, buses, routes, trips, notifications, incidents]);

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setActiveRole(found.role);
    }
  };

  const login = async (emailOrPhone: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const clean = emailOrPhone.trim().toLowerCase();
    const found = users.find(u => 
      u.email.toLowerCase() === clean || 
      u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
    );

    if (!found) {
      return { success: false, error: 'auth.invalidCredentials' };
    }

    // Password verification using SHA-256 if user has passwordHash
    if (found.passwordHash && password) {
      const { verifyPassword } = await import('../services/authService');
      const valid = await verifyPassword(password, found.passwordHash);
      if (!valid) {
        return { success: false, error: 'auth.invalidCredentials' };
      }
    }

    setCurrentUser(found);
    setActiveRole(found.role);
    return { success: true, user: found };
  };

  const registerUser = async (data: {
    fullName: string;
    emailOrPhone: string;
    password: string;
    role: 'school_admin' | 'parent' | 'driver';
    preferredLanguage: 'km' | 'en';
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    schoolEmail?: string;
    verificationCode?: string;
    studentName?: string;
    studentGrade?: string;
    schoolId?: string;
    studentIdCode?: string;
    licenseNumber?: string;
    transportCompany?: string;
    vehicleType?: string;
    vehiclePlate?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    const cleanContact = data.emailOrPhone.trim();
    const isEmail = cleanContact.includes('@');
    
    // Check if user already exists
    const existing = users.find(u => 
      (isEmail && u.email.toLowerCase() === cleanContact.toLowerCase()) ||
      (!isEmail && u.phone.replace(/\s+/g, '') === cleanContact.replace(/\s+/g, ''))
    );

    if (existing) {
      return { success: false, error: 'User with this email or phone already exists.' };
    }

    const { hashPassword } = await import('../services/authService');
    const passwordHash = await hashPassword(data.password);

    // School Admin and Driver accounts require verification before administrative/trip privileges are activated!
    const initialStatus = (data.role === 'school_admin' || data.role === 'driver') ? 'pending' : 'active';
    const userId = `usr-${Date.now()}`;

    const newUser: User = {
      id: userId,
      name: data.fullName,
      email: isEmail ? cleanContact : `${cleanContact.replace(/[^0-9]/g, '')}@schoolrout.ai`,
      phone: !isEmail ? cleanContact : '+855 12 000 000',
      role: data.role === 'school_admin' ? 'admin' : data.role,
      status: initialStatus,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash,
      languagePreference: data.preferredLanguage,
      schoolName: data.schoolName,
      schoolAddress: data.schoolAddress,
      schoolPhone: data.schoolPhone,
      schoolEmail: data.schoolEmail,
      verificationCode: data.verificationCode,
      studentName: data.studentName,
      studentGrade: data.studentGrade,
      schoolId: data.schoolId,
      studentIdCode: data.studentIdCode,
      licenseNumber: data.licenseNumber,
      transportCompany: data.transportCompany,
      vehicleType: data.vehicleType,
      vehiclePlate: data.vehiclePlate,
      avatar: getKhmerAvatarForRole(data.role)
    };

    // If parent registered student, link student and parent entity
    if (data.role === 'parent' && data.studentName) {
      const studentId = `stu-${Date.now()}`;
      const parentId = `par-${Date.now()}`;
      
      const newStudent: Student = {
        id: studentId,
        name: data.studentName,
        grade: data.studentGrade || 'Grade 7',
        schoolId: data.schoolId || schools[0]?.id || 'sch-1',
        parentId: parentId,
        pickupAddress: 'Toul Kork, Phnom Penh',
        pickupLat: 11.5620,
        pickupLng: 104.9120,
        dropoffAddress: data.schoolName || 'ITC School, Phnom Penh',
        dropoffLat: 11.5683,
        dropoffLng: 104.9179,
        status: 'at_home'
      };

      const newParent: Parent = {
        id: parentId,
        userId: userId,
        name: data.fullName,
        email: newUser.email,
        phone: newUser.phone,
        address: 'Phnom Penh, Cambodia',
        childrenIds: [studentId]
      };

      setStudents(prev => [...prev, newStudent]);
      setParents(prev => [...prev, newParent]);
    }

    // If driver registered, create driver entity
    if (data.role === 'driver') {
      const newDriver: Driver = {
        id: `drv-${Date.now()}`,
        userId: userId,
        name: data.fullName,
        phone: newUser.phone,
        licenseNumber: data.licenseNumber || 'KH-DL-00000',
        status: 'off_duty',
        rating: 5.0
      };
      setDrivers(prev => [...prev, newDriver]);
    }

    // Save user
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveRole(newUser.role);

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('schoolrout_current_user');
  };

  const approveUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'active', verifiedAt: new Date().toISOString() };
      }
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, status: 'active', verifiedAt: new Date().toISOString() } : null);
    }

    // Send confirmation alert
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: 'Account Verification Approved',
      message: 'Your registration has been verified and your portal privileges are now active.',
      timestamp: 'Just now',
      read: false,
      roleTarget: 'all',
      type: 'success'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const rejectUser = (userId: string, reason?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'inactive', rejectionReason: reason || 'Application details could not be verified.' };
      }
      return u;
    }));
  };

  const resetPassword = async (emailOrPhone: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const clean = emailOrPhone.trim().toLowerCase();
    const found = users.find(u => 
      u.email.toLowerCase() === clean || 
      u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
    );

    if (!found) {
      return { success: false, error: 'No user registered with this email or phone.' };
    }

    const { hashPassword } = await import('../services/authService');
    const passwordHash = await hashPassword(newPassword);

    setUsers(prev => prev.map(u => u.id === found.id ? { ...u, passwordHash } : u));
    return { success: true };
  };

  const updateUserProfile = (userId: string, profile: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...profile } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...profile } : null);
    }
  };

  // Admin Actions
  const addSchool = (schoolData: Omit<School, 'id'>) => {
    const newSchool: School = { ...schoolData, id: `sch-${Date.now()}` };
    setSchools(prev => [...prev, newSchool]);
  };

  const updateSchool = (id: string, schoolData: Partial<School>) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, ...schoolData } : s));
  };

  const deleteSchool = (id: string) => {
    setSchools(prev => prev.filter(s => s.id !== id));
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...studentData, id: `stu-${Date.now()}` };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, studentData: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = { ...driverData, id: `drv-${Date.now()}` };
    setDrivers(prev => [...prev, newDriver]);
  };

  const updateDriver = (id: string, driverData: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...driverData } : d));
  };

  const addBus = (busData: Omit<Bus, 'id'>) => {
    const newBus: Bus = { ...busData, id: `bus-${Date.now()}` };
    setBuses(prev => [...prev, newBus]);
  };

  const updateBus = (id: string, busData: Partial<Bus>) => {
    setBuses(prev => prev.map(b => b.id === id ? { ...b, ...busData } : b));
  };

  const addRoute = (routeData: Omit<Route, 'id'>) => {
    const newRoute: Route = { ...routeData, id: `rt-${Date.now()}` };
    setRoutes(prev => [...prev, newRoute]);
  };

  const updateRoute = (id: string, routeData: Partial<Route>) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, ...routeData } : r));
  };

  const deleteRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  const sendNotification = (notifData: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Driver Actions
  const startTrip = (routeId: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'in_progress' } : r));
    const targetRoute = routes.find(r => r.id === routeId);
    if (targetRoute) {
      setBuses(prev => prev.map(b => b.id === targetRoute.busId ? { ...b, status: 'active' } : b));
      sendNotification({
        roleTarget: 'parent',
        title: 'Route Trip Started',
        message: `Route "${targetRoute.name}" has started. Bus is on the way.`,
        type: 'info',
        relatedId: routeId
      });
    }
  };

  const playPickupChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.48);
    } catch {
      // Audio autoplay policy
    }
  };

  // Offline queue & duplicate prevention
  const [offlinePickupQueue, setOfflinePickupQueue] = useState<{ studentId: string; timestamp: string }[]>(() => {
    try {
      const saved = localStorage.getItem('schoolrout_offline_pickups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifiedPickupIds, setNotifiedPickupIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('schoolrout_notified_pickups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => !navigator.onLine);

  const dispatchParentPickupNotification = (studentId: string, timeStr: string) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    // Duplicate prevention
    if (notifiedPickupIds.includes(studentId)) {
      console.log(`Duplicate prevention: Notification already sent for ${targetStudent.name}`);
      return;
    }

    const parent = parents.find(p => p.id === targetStudent.parentId || p.childrenIds.includes(studentId));
    const targetUserId = parent?.userId;

    const notifTitle = language === 'km' 
      ? `ការទទួលសិស្ស៖ ${targetStudent.name}` 
      : `Student Picked Up: ${targetStudent.name}`;

    const notifMessage = language === 'km'
      ? `កូនរបស់អ្នក ${targetStudent.name} ត្រូវបានរថយន្តក្រុងសាលាទទួលនៅវេលាម៉ោង ${timeStr}។ រថយន្តកំពុងបន្តដំណើរទៅកាន់ទីតាំងចំណតបន្ទាប់។`
      : `Your child, ${targetStudent.name}, has been picked up by the school bus at ${timeStr}. The bus is now heading to the next pickup location.`;

    sendNotification({
      userId: targetUserId,
      roleTarget: 'parent',
      title: notifTitle,
      message: notifMessage,
      type: 'success',
      relatedId: studentId
    });

    // Also dispatch real-time boarding alert to School Admin
    sendNotification({
      roleTarget: 'admin',
      title: language === 'km' 
        ? `វត្តមានឡើងរថយន្ត៖ ${targetStudent.name} (${targetStudent.busId || 'Bus 03'})` 
        : `Boarding Alert: ${targetStudent.name} (${targetStudent.busId || 'Bus 03'})`,
      message: language === 'km'
        ? `សិស្ស ${targetStudent.name} (ថ្នាក់ ${targetStudent.grade}) បានឡើងរថយន្ត ${targetStudent.busId || 'Bus 03'} នៅម៉ោង ${timeStr}។ ចំណត៖ ${targetStudent.pickupAddress}។ អាណាព្យាបាលបានទទួលដំណឹងរួចរាល់។`
        : `Student ${targetStudent.name} (${targetStudent.grade}) boarded ${targetStudent.busId || 'Bus 03'} at ${timeStr}. Stop: ${targetStudent.pickupAddress}. Parent alert dispatched.`,
      type: 'info',
      relatedId: studentId
    });

    setNotifiedPickupIds(prev => {
      const updated = [...prev, studentId];
      localStorage.setItem('schoolrout_notified_pickups', JSON.stringify(updated));
      return updated;
    });
  };

  const syncOfflineQueue = () => {
    try {
      const saved = localStorage.getItem('schoolrout_offline_pickups');
      const queue: { studentId: string; timestamp: string }[] = saved ? JSON.parse(saved) : offlinePickupQueue;
      if (!queue || queue.length === 0) return;

      queue.forEach(item => {
        dispatchParentPickupNotification(item.studentId, item.timestamp);
      });

      setOfflinePickupQueue([]);
      localStorage.removeItem('schoolrout_offline_pickups');
    } catch (e) {
      console.warn('Error syncing offline queue', e);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOfflineMode(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlinePickupQueue]);

  const confirmStudentPickup = async (studentId: string, customTime?: string): Promise<{ success: boolean; offlineQueued?: boolean }> => {
    const timeStr = customTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    playPickupChime();

    // 1. Update Student status
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'picked_up', pickedUpAt: timeStr } : s));

    // 2. Mark corresponding route stop completed
    setRoutes(prev => prev.map(r => ({
      ...r,
      stops: r.stops.map(st => st.studentIds.includes(studentId) ? { ...st, completed: true } : st)
    })));

    // 3. Update trip count
    setTrips(prev => prev.map(t => ({
      ...t,
      studentsPickedUpCount: t.studentsPickedUpCount + 1
    })));

    // 4. Offline or Online dispatch
    if (isOfflineMode || !navigator.onLine) {
      setOfflinePickupQueue(prev => {
        const updated = [...prev.filter(item => item.studentId !== studentId), { studentId, timestamp: timeStr }];
        localStorage.setItem('schoolrout_offline_pickups', JSON.stringify(updated));
        return updated;
      });
      return { success: true, offlineQueued: true };
    } else {
      dispatchParentPickupNotification(studentId, timeStr);
      return { success: true, offlineQueued: false };
    }
  };

  const markStudentAbsent = (studentId: string, reason?: string) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'absent' } : s));

    const parent = parents.find(p => p.id === targetStudent.parentId || p.childrenIds.includes(studentId));
    const targetUserId = parent?.userId;

    const notifTitle = language === 'km' 
      ? `ការជូនដំណឹងអវត្តមាន៖ ${targetStudent.name}` 
      : `Absence Notice: ${targetStudent.name}`;

    const notifMessage = language === 'km'
      ? `សិស្ស ${targetStudent.name} ត្រូវបានកត់ត្រាថាអវត្តមានសម្រាប់ការធ្វើដំណើរថ្ងៃនេះ (${reason || 'មិនបានជិះ'})។`
      : `Student ${targetStudent.name} has been marked absent for today's bus trip (${reason || 'not riding'}).`;

    sendNotification({
      userId: targetUserId,
      roleTarget: 'parent',
      title: notifTitle,
      message: notifMessage,
      type: 'warning',
      relatedId: studentId
    });

    // Also dispatch rider alert to School Admin
    sendNotification({
      roleTarget: 'admin',
      title: language === 'km' 
        ? `ការព្រមានអវត្តមាន៖ ${targetStudent.name} មិនបានឡើងរថយន្ត` 
        : `Rider Alert: ${targetStudent.name} NOT on Bus`,
      message: language === 'km'
        ? `សិស្ស ${targetStudent.name} មិនបានឡើងរថយន្ត ${targetStudent.busId || 'Bus 03'} ទេ។ មូលហេតុ៖ ${reason || 'មិនបានជិះ'}។ អាណាព្យាបាលបានទទួលដំណឹងរួចរាល់។`
        : `Dispatch Notice: Student ${targetStudent.name} did NOT board ${targetStudent.busId || 'Bus 03'}. Reason: ${reason || 'not riding'}. Parent alerted.`,
      type: 'warning',
      relatedId: studentId
    });
  };

  const updateBusLocation = (busId: string, lat: number, lng: number, heading?: number, speed?: number) => {
    setBuses(prev => prev.map(b => b.id === busId ? {
      ...b,
      currentLat: lat,
      currentLng: lng,
      heading: heading ?? b.heading,
      speed: speed ?? b.speed
    } : b));
  };

  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
    const student = students.find(s => s.id === studentId);
    if (student) {
      const statusText = status === 'picked_up' ? 'picked up from home' : status === 'dropped_off' ? 'dropped off safely' : status;
      sendNotification({
        roleTarget: 'parent',
        title: `Student Update: ${student.name}`,
        message: `${student.name} has been ${statusText}.`,
        type: 'success',
        relatedId: studentId
      });
    }
  };

  const reportIncident = (incidentData: Omit<Incident, 'id' | 'createdAt' | 'status'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `inc-${Date.now()}`,
      status: 'reported',
      createdAt: new Date().toLocaleString()
    };
    setIncidents(prev => [newIncident, ...prev]);
    sendNotification({
      roleTarget: 'admin',
      title: `Incident Reported (${incidentData.type.toUpperCase()})`,
      message: `${incidentData.description} (Severity: ${incidentData.severity})`,
      type: 'warning',
      relatedId: incidentData.routeId
    });
  };

  const completeTrip = (routeId: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: 'completed' } : r));
    const targetRoute = routes.find(r => r.id === routeId);
    if (targetRoute) {
      sendNotification({
        roleTarget: 'parent',
        title: 'Route Completed',
        message: `Route "${targetRoute.name}" has successfully completed its trip.`,
        type: 'success',
        relatedId: routeId
      });
    }
  };

  const { language, setLanguage, t, localize, formatNumber } = useLanguage();

  const askGeminiAssistant = async (prompt: string, overrideLang?: 'km' | 'en'): Promise<string> => {
    const activeLang = overrideLang || language;
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        if (activeLang === 'km') {
          return `[ជំនួយការឆ្លាតវៃ Gemini AI - រាជធានីភ្នំពេញ]\nផ្អែកលើទិន្នន័យចរាចរណ៍ជាក់ស្តែង ផ្លូវសហព័ន្ធរុស្ស៊ី និងផ្លូវកម្ពុជាក្រោមមានលំហូរចរាចរណ៍ល្អធម្មតា។ ចំណុចប្រសព្វមហាវិថីមុនីវង្ស និងស្តុបបូកគោអាចមានការកកស្ទះបន្តិចបន្តួចនៅម៉ោង ៧:១៥ - ៧:៤៥ ព្រឹក។\n\nវិធានការណែនាំ៖\n• រក្សាកាលវិភាគរថយន្តសាលាតាមស្តង់ដារ\n• កំណត់ល្បឿនអតិបរមា ៣០ គីឡូម៉ែត្រ/ម៉ោង នៅតំបន់ជុំវិញច្រកទ្វារសាលា\n• ប្រសិនបើចេញដំណើរពីទួលគោក គួរជ្រើសរើសផ្លូវលេខ ៣១៥ កាត់តាមបឹងកក់ ដើម្បីបញ្ចៀសការកកស្ទះ។`;
        }
        return `[Gemini AI Transit Coordinator - Phnom Penh]\nBased on real-time routing telemetry, traffic on Russian Confederation Blvd and Kampuchea Krom is flowing smoothly. Monivong Blvd / Bokor intersection indicates standard morning rush-hour congestion between 07:15 - 07:45 AM.\n\nRecommended Action:\n• Maintain standard dispatch schedules\n• Adhere strictly to 30 km/h speed limits in school buffer zones\n• For Toul Kork departures, routing via St. 315 avoids Monivong chokepoints and saves 8-12 minutes.`;
      }
      
      const systemInstruction = activeLang === 'km'
        ? 'You are SchoolRoutAI assistant, an expert school transportation and safe routing AI coordinator for Phnom Penh, Cambodia. Always reply in clear, professional Khmer (ភាសាខ្មែរ). Use proper Khmer script without breaking words. You can understand queries in both English and Khmer. Provide accurate recommendations referencing real Phnom Penh districts, boulevards, and school zones.'
        : 'You are SchoolRoutAI assistant, an expert school transportation and safe routing AI coordinator for Phnom Penh, Cambodia. Respond in clear, helpful English. You can understand queries in both English and Khmer. Provide accurate recommendations referencing real Phnom Penh districts, boulevards, and school zones.';

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemInstruction}\n\nUser Query: ${prompt}` }]
          }]
        })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || (activeLang === 'km' ? 'មិនមានការឆ្លើយតបពី AI ទេ។' : 'No AI response generated.');
    } catch (err) {
      console.error(err);
      return activeLang === 'km' ? 'ប្រព័ន្ធជំនួយការ AI កំពុងរវល់ សូមព្យាយាមម្តងទៀត។' : 'AI assistant is temporarily unavailable.';
    }
  };

  const playEmergencyAlarm = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(850, now);
      osc1.frequency.setValueAtTime(450, now + 0.15);
      osc1.frequency.setValueAtTime(850, now + 0.3);
      osc2.frequency.setValueAtTime(870, now);
      osc2.frequency.setValueAtTime(460, now + 0.15);
      osc2.frequency.setValueAtTime(870, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.58);
      osc2.stop(now + 0.58);
    } catch {
      // Audio autoplay policy
    }
  };

  const reportBusBreakdown = async (params: {
    busId: string;
    driverId: string;
    routeId: string;
    reason: string;
    notes?: string;
    location: { lat: number; lng: number; address: string; addressKh?: string };
  }): Promise<{ success: boolean; incidentId: string }> => {
    playEmergencyAlarm();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetBus = buses.find(b => b.id === params.busId);
    const targetDriver = drivers.find(d => d.id === params.driverId);
    const targetRoute = routes.find(r => r.id === params.routeId);

    // Affected students: all students assigned to this bus or route
    const affectedStudents = students.filter(s => s.busId === params.busId || s.routeId === params.routeId);
    const affectedStudentIds = affectedStudents.map(s => s.id);
    const onBoardStudents = affectedStudents.filter(s => s.status === 'picked_up');
    const waitingStudents = affectedStudents.filter(s => s.status === 'waiting');

    // 1. Mark bus as maintenance
    setBuses(prev => prev.map(b => b.id === params.busId ? { ...b, status: 'maintenance' } : b));

    // 2. Create Incident Record
    const incidentId = `inc-breakdown-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newIncident: Incident = {
      id: incidentId,
      driverId: params.driverId,
      busId: params.busId,
      routeId: params.routeId,
      type: 'breakdown',
      description: `${params.reason} — ${params.notes || 'Mechanical breakdown reported en route.'}`,
      severity: 'critical',
      status: 'reported',
      createdAt: `${new Date().toLocaleDateString()} ${timeStr}`,
      location: params.location,
      affectedStudentIds,
      notes: params.notes
    };
    setIncidents(prev => [newIncident, ...prev]);

    // 3. Update or create Trip with emergency status
    setTrips(prev => {
      const existingTrip = prev.find(t => t.routeId === params.routeId && (t.status === 'in_progress' || t.status === 'scheduled'));
      if (existingTrip) {
        return prev.map(t => t.id === existingTrip.id ? {
          ...t,
          status: 'emergency_replacement_required',
          breakdownLocation: params.location,
          breakdownTime: timeStr,
          breakdownReason: params.reason,
          transferredStudentIds: []
        } : t);
      } else {
        const newTrip: Trip = {
          id: `trp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          routeId: params.routeId,
          busId: params.busId,
          driverId: params.driverId,
          date: new Date().toISOString().split('T')[0],
          status: 'emergency_replacement_required',
          startTime: '07:30 AM',
          studentsPickedUpCount: onBoardStudents.length,
          totalStudentsCount: affectedStudents.length,
          breakdownLocation: params.location,
          breakdownTime: timeStr,
          breakdownReason: params.reason,
          transferredStudentIds: []
        };
        return [newTrip, ...prev];
      }
    });

    // 4. Update route status
    setRoutes(prev => prev.map(r => r.id === params.routeId ? { ...r, status: 'delayed' } : r));

    // 5. High-Priority Alert to School Administrator (Requirement 1 & 2)
    sendNotification({
      roleTarget: 'admin',
      title: language === 'km' 
        ? `🚨 អាសន្ន៖ រថយន្តលេខ ${targetBus?.busNumber || 'Bus 03'} ខូចតាមផ្លូវ!` 
        : `🚨 EMERGENCY: Bus ${targetBus?.busNumber || 'Bus 03'} Breakdown Reported`,
      message: language === 'km'
        ? `អ្នកបើកបរ ${targetDriver?.name} បានរាយការណ៍រថយន្តខូចនៅ "${params.location.addressKh || params.location.address}" នៅម៉ោង ${timeStr}។ មូលហេតុ៖ ${params.reason}។ ប៉ះពាល់សិស្ស ${affectedStudents.length} នាក់ (${onBoardStudents.length} នាក់នៅលើឡាន, ${waitingStudents.length} នាក់រង់ចាំ)។ ត្រូវការចាត់តាំងរថយន្តជំនួសជាបន្ទាន់!`
        : `Driver ${targetDriver?.name} reported breakdown at "${params.location.address}" at ${timeStr}. Reason: ${params.reason}. ${affectedStudents.length} students affected (${onBoardStudents.length} on-board, ${waitingStudents.length} waiting). Immediate replacement bus assignment required!`,
      type: 'alert',
      relatedId: incidentId
    });

    // 6. Notify Parents of affected students (Requirement 4)
    affectedStudents.forEach(stu => {
      const parent = parents.find(p => p.id === stu.parentId || p.childrenIds.includes(stu.id));
      const targetUserId = parent?.userId;
      sendNotification({
        userId: targetUserId,
        roleTarget: 'parent',
        title: language === 'km' 
          ? `⚠️ ការជូនដំណឹងបន្ទាន់៖ រថយន្តសាលាជួបឧប្បត្តិហេតុបច្ចេកទេស` 
          : `⚠️ Urgent Transit Notice: School Bus Mechanical Breakdown`,
        message: language === 'km'
          ? `រថយន្តសាលា (${targetBus?.busNumber}) របស់កូនលោកអ្នក (${stu.name}) បានជួបបញ្ហាបច្ចេកទេសនៅម្តុំ ${params.location.addressKh || params.location.address}។ សិស្សានុសិស្សទាំងអស់មានសុវត្ថិភាពក្រោមការមើលថែរបស់អ្នកបើកបរ ${targetDriver?.name}។ រដ្ឋបាលសាលាកំពុងរៀបចំចាត់តាំងរថយន្តជំនួសជាបន្ទាន់។`
          : `Your child's (${stu.name}) school bus (${targetBus?.busNumber}) has experienced a breakdown near ${params.location.address}. All students are safe with driver ${targetDriver?.name}. School administration is currently preparing an emergency replacement bus.`,
        type: 'warning',
        relatedId: stu.id
      });
    });

    return { success: true, incidentId };
  };

  const assignReplacementBus = async (params: {
    tripId?: string;
    incidentId?: string;
    originalBusId: string;
    routeId: string;
    replacementBusId: string;
    replacementDriverId: string;
    etaMinutes?: number;
    customNotes?: string;
  }): Promise<{ success: boolean }> => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const etaMins = params.etaMinutes || 12;
    const originalBus = buses.find(b => b.id === params.originalBusId);
    const replacementBus = buses.find(b => b.id === params.replacementBusId);
    const replacementDriver = drivers.find(d => d.id === params.replacementDriverId);
    const targetRoute = routes.find(r => r.id === params.routeId);
    const affectedStudents = students.filter(s => s.busId === params.originalBusId || s.routeId === params.routeId);

    // 1. Activate Replacement Bus and Driver
    setBuses(prev => prev.map(b => b.id === params.replacementBusId ? { ...b, status: 'active' } : b));
    setDrivers(prev => prev.map(d => d.id === params.replacementDriverId ? { ...d, status: 'on_trip', busId: params.replacementBusId, routeId: params.routeId } : d));

    // 2. Update Trip
    setTrips(prev => prev.map(t => (t.routeId === params.routeId || t.id === params.tripId) ? {
      ...t,
      status: 'replacement_dispatched',
      replacementBusId: params.replacementBusId,
      replacementDriverId: params.replacementDriverId,
      replacementDispatchedAt: timeStr,
      replacementEtaMinutes: etaMins
    } : t));

    // 3. Update Incident
    if (params.incidentId) {
      setIncidents(prev => prev.map(inc => inc.id === params.incidentId ? {
        ...inc,
        status: 'replacement_dispatched',
        replacementBusId: params.replacementBusId,
        replacementDriverId: params.replacementDriverId,
        replacementDispatchedAt: timeStr,
        notes: params.customNotes || inc.notes
      } : inc));
    }

    // 4. Send Notification to Replacement Driver (Requirement 3)
    sendNotification({
      roleTarget: 'driver',
      userId: replacementDriver?.userId,
      title: language === 'km' ? `🚨 បញ្ជាចាត់តាំងរថយន្តជំនួសបន្ទាន់!` : `🚨 Emergency Replacement Dispatch Order`,
      message: language === 'km'
        ? `លោកអ្នកត្រូវបានចាត់តាំងឱ្យបើករថយន្ត ${replacementBus?.busNumber} ទៅជំនួសរថយន្ត ${originalBus?.busNumber} លើខ្សែរត់ ${targetRoute?.name}។ ទីតាំងសិស្សកំពុងរង់ចាំ៖ សិស្ស ${affectedStudents.length} នាក់។ សូមចេញដំណើរជាបន្ទាន់!`
        : `You have been officially assigned to drive ${replacementBus?.busNumber} to replace broken-down ${originalBus?.busNumber} on ${targetRoute?.name}. ${affectedStudents.length} students waiting. Proceed to breakdown site immediately!`,
      type: 'alert',
      relatedId: params.routeId
    });

    // 5. Send Notification to Original Driver
    sendNotification({
      roleTarget: 'driver',
      title: language === 'km' ? `✓ រដ្ឋបាលសាលាបានបញ្ជូនរថយន្តជំនួសរួចរាល់` : `✓ Replacement Bus Dispatched by Admin`,
      message: language === 'km'
        ? `រថយន្តជំនួសលេខ ${replacementBus?.busNumber} (${replacementBus?.plateNumber}) បើកបរដោយ ${replacementDriver?.name} (ទូរស័ព្ទ៖ ${replacementDriver?.phone}) កំពុងធ្វើដំណើរមកដល់ក្នុងរយៈពេលប្រហែល ${etaMins} នាទី។`
        : `Replacement Bus ${replacementBus?.busNumber} (${replacementBus?.plateNumber}) driven by ${replacementDriver?.name} (${replacementDriver?.phone}) has been dispatched. Estimated arrival in ~${etaMins} mins.`,
      type: 'info',
      relatedId: params.routeId
    });

    // 6. Notify School Admin Log
    sendNotification({
      roleTarget: 'admin',
      title: language === 'km' ? `✓ បានចាត់តាំងរថយន្តជំនួសជោគជ័យ` : `✓ Replacement Bus Dispatched Successfully`,
      message: language === 'km'
        ? `រថយន្តជំនួស ${replacementBus?.busNumber} ត្រូវបានចាត់តាំងជំនួស ${originalBus?.busNumber}។ បានជូនដំណឹងទៅអ្នកបើកបរ និងអាណាព្យាបាលសិស្ស ${affectedStudents.length} នាក់រួចរាល់។`
        : `Replacement Bus ${replacementBus?.busNumber} assigned for ${originalBus?.busNumber}. Dispatched to breakdown location. All ${affectedStudents.length} parents updated with ETA.`,
      type: 'success',
      relatedId: params.routeId
    });

    // 7. Notify Parents of Affected Students with Replacement Bus Details (Requirement 4)
    affectedStudents.forEach(stu => {
      const parent = parents.find(p => p.id === stu.parentId || p.childrenIds.includes(stu.id));
      const targetUserId = parent?.userId;
      sendNotification({
        userId: targetUserId,
        roleTarget: 'parent',
        title: language === 'km' 
          ? `🚌 ព័ត៌មានរថយន្តជំនួស៖ ${replacementBus?.busNumber} កំពុងធ្វើដំណើរមកទទួល` 
          : `🚌 Replacement Bus Dispatched: ${replacementBus?.busNumber}`,
        message: language === 'km'
          ? `រដ្ឋបាលសាលាបានចាត់តាំងរថយន្តជំនួសលេខ ${replacementBus?.busNumber} (ស្លាកលេខ៖ ${replacementBus?.plateNumber}, អ្នកបើកបរ៖ ${replacementDriver?.name}, លេខទូរស័ព្ទ៖ ${replacementDriver?.phone}) មកទទួលសិស្ស (${stu.name})។ មកដល់ក្នុងរយៈពេលប្រហែល ${etaMins} នាទី។`
          : `School administration has dispatched Replacement Bus ${replacementBus?.busNumber} (Plate: ${replacementBus?.plateNumber}, Driver: ${replacementDriver?.name}, Phone: ${replacementDriver?.phone}) to pick up students including ${stu.name}. Estimated arrival in ~${etaMins} minutes.`,
        type: 'info',
        relatedId: stu.id
      });
    });

    return { success: true };
  };

  const confirmStudentTransfer = async (params: {
    studentId: string;
    tripId?: string;
    transferredByDriverId?: string;
  }): Promise<{ success: boolean }> => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const student = students.find(s => s.id === params.studentId);
    if (!student) return { success: false };

    const activeTrip = trips.find(t => t.id === params.tripId || t.status === 'replacement_dispatched' || t.status === 'emergency_replacement_required');
    const replacementBus = buses.find(b => b.id === activeTrip?.replacementBusId) || buses.find(b => b.id === 'bus-104') || buses[0];
    const school = schools[0];

    // 1. Record transferred student ID in Trip
    setTrips(prev => prev.map(t => (t.id === params.tripId || t.id === activeTrip?.id) ? {
      ...t,
      transferredStudentIds: Array.from(new Set([...(t.transferredStudentIds || []), params.studentId]))
    } : t));

    // 2. Update Student status and assign to replacement bus
    setStudents(prev => prev.map(s => s.id === params.studentId ? {
      ...s,
      status: 'picked_up',
      busId: replacementBus.id,
      pickedUpAt: timeStr
    } : s));

    // 3. Notify Parent (Requirement 4: Notify parents again when child boards replacement bus)
    const parent = parents.find(p => p.id === student.parentId || p.childrenIds.includes(student.id));
    const targetUserId = parent?.userId;
    sendNotification({
      userId: targetUserId,
      roleTarget: 'parent',
      title: language === 'km' 
        ? `✓ បញ្ជាក់សុវត្ថិភាព៖ កូនបានឡើងរថយន្តជំនួស (${replacementBus.busNumber})` 
        : `✓ Safety Confirmation: Child Boarded Replacement Bus (${replacementBus.busNumber})`,
      message: language === 'km'
        ? `កូនរបស់អ្នក (${student.name}) បានឡើងរថយន្តជំនួស ${replacementBus.busNumber} ដោយសុវត្ថិភាពនៅវេលាម៉ោង ${timeStr}។ រថយន្តកំពុងបន្តដំណើរឆ្ពោះទៅកាន់ ${school?.name || 'សាលារៀន'}។`
        : `Your child, ${student.name}, has been safely transferred and boarded Replacement Bus ${replacementBus.busNumber} at ${timeStr}. The bus has resumed transit to ${school?.name || 'school'}.`,
      type: 'success',
      relatedId: student.id
    });

    // 4. Log to School Admin
    sendNotification({
      roleTarget: 'admin',
      title: language === 'km' ? `ការផ្ទេរសិស្ស៖ ${student.name}` : `Student Transfer Log: ${student.name}`,
      message: language === 'km'
        ? `សិស្ស ${student.name} បានផ្ទេរឡើងរថយន្តជំនួស ${replacementBus.busNumber} រួចរាល់នៅម៉ោង ${timeStr}។`
        : `Student ${student.name} confirmed safely transferred to Replacement Bus ${replacementBus.busNumber} at ${timeStr}.`,
      type: 'info',
      relatedId: student.id
    });

    return { success: true };
  };

  const completeAllStudentTransfersAndResume = async (params: {
    tripId?: string;
    routeId: string;
    replacementBusId: string;
  }): Promise<{ success: boolean }> => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replacementBus = buses.find(b => b.id === params.replacementBusId) || buses[0];
    const school = schools[0];

    // 1. Update Trip to in_progress with replacement bus
    setTrips(prev => prev.map(t => (t.id === params.tripId || t.routeId === params.routeId) ? {
      ...t,
      status: 'in_progress',
      busId: params.replacementBusId
    } : t));

    // 2. Update route status
    setRoutes(prev => prev.map(r => r.id === params.routeId ? {
      ...r,
      status: 'in_progress',
      busId: params.replacementBusId
    } : r));

    // 3. Mark incident resolved
    setIncidents(prev => prev.map(inc => (inc.routeId === params.routeId && inc.status !== 'resolved') ? {
      ...inc,
      status: 'resolved',
      resolvedAt: timeStr
    } : inc));

    // 4. Notify School Admin
    sendNotification({
      roleTarget: 'admin',
      title: language === 'km' ? `✓ ការផ្ទេរសិស្សបញ្ចប់៖ រថយន្តជំនួសបន្តដំណើរ` : `✓ Student Transfers Complete: Trip Resumed`,
      message: language === 'km'
        ? `សិស្សានុសិស្សទាំងអស់ត្រូវបានផ្ទេរឡើងរថយន្តជំនួស ${replacementBus.busNumber} ដោយសុវត្ថិភាព។ រថយន្តបានបន្តដំណើរឆ្ពោះទៅកាន់សាលារៀន។`
        : `All students safely transferred to Replacement Bus ${replacementBus.busNumber}. Route resumed toward ${school?.name || 'school'}.`,
      type: 'success',
      relatedId: params.routeId
    });

    return { success: true };
  };

  const activeEmergencyTrip = trips.find(t => 
    t.status === 'emergency_replacement_required' || 
    t.status === 'replacement_dispatched' || 
    t.status === 'replacement_arrived'
  );

  const activeEmergencyIncident = incidents.find(inc => 
    inc.type === 'breakdown' && inc.status !== 'resolved'
  );

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated: !!currentUser, users, schools, students, parents, drivers, buses, routes, trips, notifications, incidents,
      activeRole, setActiveRole, switchUser, login, registerUser, logout, approveUser, rejectUser, resetPassword, updateUserProfile,
      addSchool, updateSchool, deleteSchool,
      addStudent, updateStudent, deleteStudent,
      addDriver, updateDriver,
      addBus, updateBus,
      addRoute, updateRoute, deleteRoute,
      sendNotification, markNotificationRead, markAllNotificationsRead,
      startTrip, updateStudentStatus, confirmStudentPickup, markStudentAbsent, updateBusLocation,
      isOfflineMode, setIsOfflineMode, offlineQueueCount: offlinePickupQueue.length, syncOfflineQueue,
      reportIncident, completeTrip,
      reportBusBreakdown, assignReplacementBus, confirmStudentTransfer, completeAllStudentTransfersAndResume,
      activeEmergencyTrip, activeEmergencyIncident,
      askGeminiAssistant,
      language, setLanguage, t, localize, formatNumber
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
