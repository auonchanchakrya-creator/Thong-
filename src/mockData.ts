import { User, School, Student, Parent, Driver, Bus, Route, Trip, NotificationItem, Incident } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Sokha Dara',
    email: 'admin@schoolrout.ai',
    role: 'admin',
    avatar: '/images/khmer_admin.svg',
    phone: '+855 12 345 678',
    status: 'active',
    createdAt: '2025-08-01'
  },
  {
    id: 'usr-driver-1',
    name: 'Chan Dara',
    email: 'driver.chan@schoolrout.ai',
    role: 'driver',
    avatar: '/images/khmer_driver.svg',
    phone: '+855 12 345 678',
    status: 'active',
    createdAt: '2025-08-10'
  },
  {
    id: 'usr-driver-2',
    name: 'Sok Ratha',
    email: 'driver.sok@schoolrout.ai',
    role: 'driver',
    avatar: '/images/khmer_driver2.svg',
    phone: '+855 11 988 776',
    status: 'active',
    createdAt: '2025-09-01'
  },
  {
    id: 'usr-parent-1',
    name: 'Sokha Dara',
    email: 'parent.sokha@schoolrout.ai',
    role: 'parent',
    avatar: '/images/khmer_parent.svg',
    phone: '+855 10 223 344',
    status: 'active',
    createdAt: '2025-08-15'
  },
  {
    id: 'usr-parent-2',
    name: 'Vannak Vicheka',
    email: 'parent.vannak@schoolrout.ai',
    role: 'parent',
    avatar: '/images/khmer_parent2.svg',
    phone: '+855 12 556 677',
    status: 'active',
    createdAt: '2025-08-20'
  },
  {
    id: 'usr-admin-pending',
    name: 'Khem Veasna',
    email: 'khem.admin@bak-touk.edu.kh',
    role: 'school_admin',
    avatar: '/images/khmer_admin.svg',
    phone: '+855 12 777 888',
    status: 'pending',
    createdAt: '2026-10-15',
    schoolName: 'Bak Touk High School',
    schoolAddress: 'St. 169, 7 Makara, Phnom Penh',
    schoolPhone: '+855 23 881 223',
    schoolEmail: 'admin@bak-touk.edu.kh',
    verificationCode: 'MOEYS-BT-2026'
  },
  {
    id: 'usr-driver-pending',
    name: 'Meas Borey',
    email: 'meas.borey@transit.kh',
    role: 'driver',
    avatar: '/images/khmer_driver.svg',
    phone: '+855 89 443 221',
    status: 'pending',
    createdAt: '2026-10-16',
    licenseNumber: 'KH-DL-984421',
    transportCompany: 'Phnom Penh City Transit Authority',
    vehicleType: 'School Minibus (25 seats)',
    vehiclePlate: 'PP-3B-8821'
  }
];

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-1',
    name: 'Institute of Technology of Cambodia (ITC School)',
    nameKh: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)',
    address: 'Russian Confederation Blvd, Toul Kork, Phnom Penh',
    addressKh: 'មហាវិថីសហព័ន្ធរុស្ស៊ី ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    lat: 11.5683,
    lng: 104.9179,
    phone: '+855 23 880 370',
    principal: 'Dr. Om Romny',
    totalStudents: 1250,
    area: 'Toul Kork',
    areaKh: 'ទួលគោក',
    type: 'High School'
  },
  {
    id: 'sch-2',
    name: 'Preah Sisowath High School',
    nameKh: 'វិទ្យាល័យព្រះស៊ីសុវត្ថិ',
    address: 'Preah Ang Eng St. (13), Daun Penh, Phnom Penh',
    addressKh: 'ផ្លូវព្រះអង្គអេង (១៣) ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
    lat: 11.5549,
    lng: 104.9222,
    phone: '+855 23 211 445',
    principal: 'Principal Lout Sokha',
    totalStudents: 2100,
    area: 'Daun Penh',
    areaKh: 'ដូនពេញ',
    type: 'High School'
  },
  {
    id: 'sch-3',
    name: 'Tuol Tom Poung High School',
    nameKh: 'វិទ្យាល័យទួលទំពូង',
    address: 'St. 155, Chamkar Mon, Phnom Penh',
    addressKh: 'ផ្លូវ ១៥៥ ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
    lat: 11.5420,
    lng: 104.9180,
    phone: '+855 23 218 990',
    principal: 'Principal Heng Chanthy',
    totalStudents: 1450,
    area: 'Chamkar Mon',
    areaKh: 'ចំការមន',
    type: 'High School'
  },
  {
    id: 'sch-4',
    name: 'Boeung Keng Kang High School',
    nameKh: 'វិទ្យាល័យបឹងកេងកង',
    address: 'St. 360, BKK1, Phnom Penh',
    addressKh: 'ផ្លូវ ៣៦០ សង្កាត់បឹងកេងកង១ រាជធានីភ្នំពេញ',
    lat: 11.5480,
    lng: 104.9250,
    phone: '+855 23 365 778',
    principal: 'Principal Keo Vanna',
    totalStudents: 980,
    area: 'Boeung Keng Kang',
    areaKh: 'បឹងកេងកង',
    type: 'High School'
  }
];

export const INITIAL_PARENTS: Parent[] = [
  {
    id: 'par-1',
    userId: 'usr-parent-1',
    name: 'Sokha Dara',
    email: 'parent.sokha@schoolrout.ai',
    phone: '+855 10 223 344',
    address: 'St. 315, Boeung Kak I, Toul Kork, Phnom Penh',
    childrenIds: ['stu-1', 'stu-2']
  },
  {
    id: 'par-2',
    userId: 'usr-parent-2',
    name: 'Vannak Vicheka',
    email: 'parent.vannak@schoolrout.ai',
    phone: '+855 12 556 677',
    address: 'Norodom Blvd, Daun Penh, Phnom Penh',
    childrenIds: ['stu-3', 'stu-4']
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    name: 'Sokha Sarya',
    grade: 'Grade 9A',
    schoolId: 'sch-1',
    parentId: 'par-1',
    busId: 'bus-101',
    routeId: 'rt-1',
    pickupAddress: 'St. 315, Boeung Kak I, Toul Kork, Phnom Penh',
    pickupAddressKh: 'ផ្លូវ ៣១៥ សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    pickupLat: 11.5720,
    pickupLng: 104.9080,
    dropoffAddress: 'Institute of Technology of Cambodia (ITC)',
    dropoffAddressKh: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)',
    dropoffLat: 11.5683,
    dropoffLng: 104.9179,
    status: 'waiting',
    pickupOrder: 1,
    parentPhone: '+855 10 223 344',
    notes: 'Gate #3, white building',
    qrToken: 'SR-SEC-8F29A4D1'
  },
  {
    id: 'stu-2',
    name: 'Chhoun Vanna',
    grade: 'Grade 8B',
    schoolId: 'sch-1',
    parentId: 'par-1',
    busId: 'bus-101',
    routeId: 'rt-1',
    pickupAddress: 'St. 566, Toul Kork Center, Phnom Penh',
    pickupAddressKh: 'ផ្លូវ ៥៦៦ មជ្ឈមណ្ឌលទួលគោក រាជធានីភ្នំពេញ',
    pickupLat: 11.5765,
    pickupLng: 104.8970,
    dropoffAddress: 'Institute of Technology of Cambodia (ITC)',
    dropoffAddressKh: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)',
    dropoffLat: 11.5683,
    dropoffLng: 104.9179,
    status: 'waiting',
    pickupOrder: 2,
    parentPhone: '+855 10 223 344',
    notes: 'Wait by pharmacy corner',
    qrToken: 'SR-SEC-3C71B8E5'
  },
  {
    id: 'stu-3',
    name: 'Pheakdey Rith',
    grade: 'Grade 7C',
    schoolId: 'sch-1',
    parentId: 'par-2',
    busId: 'bus-101',
    routeId: 'rt-1',
    pickupAddress: 'St. 289, Boeung Kak II, Toul Kork, Phnom Penh',
    pickupAddressKh: 'ផ្លូវ ២៨៩ សង្កាត់បឹងកក់២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    pickupLat: 11.5810,
    pickupLng: 104.9140,
    dropoffAddress: 'Institute of Technology of Cambodia (ITC)',
    dropoffAddressKh: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)',
    dropoffLat: 11.5683,
    dropoffLng: 104.9179,
    status: 'waiting',
    pickupOrder: 3,
    parentPhone: '+855 12 556 677',
    notes: 'Green gate, near coffee shop',
    qrToken: 'SR-SEC-6E14D2A9'
  },
  {
    id: 'stu-4',
    name: 'Meas Bopha',
    grade: 'Grade 8A',
    schoolId: 'sch-1',
    parentId: 'par-2',
    busId: 'bus-101',
    routeId: 'rt-1',
    pickupAddress: 'Russian Federation Blvd (near 5 Makara Bridge), Phnom Penh',
    pickupAddressKh: 'មហាវិថីសហព័ន្ធរុស្ស៊ី (ជិតស្ពានអាកាស ៥ មករា) រាជធានីភ្នំពេញ',
    pickupLat: 11.5645,
    pickupLng: 104.9015,
    dropoffAddress: 'Institute of Technology of Cambodia (ITC)',
    dropoffAddressKh: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)',
    dropoffLat: 11.5683,
    dropoffLng: 104.9179,
    status: 'waiting',
    pickupOrder: 4,
    parentPhone: '+855 12 556 677',
    notes: 'Apartment lobby entrance',
    qrToken: 'SR-SEC-9A52F7C3'
  },
  {
    id: 'stu-5',
    name: 'Rath Monika',
    grade: 'Grade 9B',
    schoolId: 'sch-1',
    parentId: 'par-2',
    busId: 'bus-102',
    routeId: 'rt-2',
    pickupAddress: 'St. 51 & St. 302, BKK1, Phnom Penh',
    pickupAddressKh: 'កែងផ្លូវ ៥១ និងផ្លូវ ៣០២ សង្កាត់បឹងកេងកង១ រាជធានីភ្នំពេញ',
    pickupLat: 11.5520,
    pickupLng: 104.9280,
    dropoffAddress: 'Institute of Technology of Cambodia (ITC)',
    dropoffAddressKh: 'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (តិចណូ)',
    dropoffLat: 11.5683,
    dropoffLng: 104.9179,
    status: 'waiting',
    pickupOrder: 1,
    parentPhone: '+855 12 556 677',
    notes: 'Registered for Bus 02 (Route 2)',
    qrToken: 'SR-SEC-1D88E3B4'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    userId: 'usr-driver-1',
    name: 'Chan Dara',
    licenseNumber: 'DL-PP-9876543',
    phone: '+855 12 345 678',
    busId: 'bus-101',
    routeId: 'rt-1',
    status: 'on_trip',
    rating: 4.9
  },
  {
    id: 'drv-2',
    userId: 'usr-driver-2',
    name: 'Sok Ratha',
    licenseNumber: 'DL-PP-5432109',
    phone: '+855 11 988 776',
    busId: 'bus-102',
    routeId: 'rt-2',
    status: 'on_duty',
    rating: 4.8
  },
  {
    id: 'drv-3',
    userId: 'usr-driver-3',
    name: 'Sok Vichea (Standby Driver)',
    licenseNumber: 'DL-PP-7788991',
    phone: '+855 12 778 990',
    busId: 'bus-104',
    status: 'available',
    rating: 4.9
  },
  {
    id: 'drv-4',
    userId: 'usr-driver-4',
    name: 'Meng Ly (Standby Driver)',
    licenseNumber: 'DL-PP-3322114',
    phone: '+855 10 445 566',
    busId: 'bus-105',
    status: 'available',
    rating: 4.85
  }
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-101',
    busNumber: 'Bus 03',
    plateNumber: 'PP-2B-8812',
    capacity: 48,
    model: 'Toyota Coaster 2020',
    status: 'active',
    driverId: 'drv-1',
    currentLat: 11.5550,
    currentLng: 104.9150,
    speed: 28,
    heading: 90
  },
  {
    id: 'bus-102',
    busNumber: 'Bus 01',
    plateNumber: 'PP-3C-4411',
    capacity: 48,
    model: 'Hyundai County',
    status: 'active',
    driverId: 'drv-2',
    currentLat: 11.5600,
    currentLng: 104.9050,
    speed: 24,
    heading: 45
  },
  {
    id: 'bus-103',
    busNumber: 'Bus 05',
    plateNumber: 'PP-1A-9922',
    capacity: 32,
    model: 'Fuso Rosa',
    status: 'active',
    currentLat: 11.5400,
    currentLng: 104.9300,
    speed: 22,
    heading: 180
  },
  {
    id: 'bus-104',
    busNumber: 'Bus 04 (Standby Replacement)',
    plateNumber: 'PP-3F-4412',
    capacity: 48,
    model: 'Toyota Coaster Executive',
    status: 'idle',
    driverId: 'drv-3',
    currentLat: 11.5650,
    currentLng: 104.9100,
    speed: 0,
    heading: 0
  },
  {
    id: 'bus-105',
    busNumber: 'Bus 02 (Standby Replacement)',
    plateNumber: 'PP-2D-5533',
    capacity: 36,
    model: 'Hyundai County Standby',
    status: 'idle',
    driverId: 'drv-4',
    currentLat: 11.5580,
    currentLng: 104.9200,
    speed: 0,
    heading: 0
  }
];

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'rt-1',
    name: 'Route 1 - Toul Kork → ITC School',
    nameKh: 'ខ្សែរត់ទី១ - ទួលគោក → វិទ្យាស្ថានតិចណូ ITC',
    schoolId: 'sch-1',
    busId: 'bus-101',
    driverId: 'drv-1',
    startTime: '07:30 AM',
    endTime: '08:15 AM',
    status: 'in_progress',
    polylineCoords: [
      [11.5620, 104.9120],
      [11.5650, 104.9150],
      [11.5683, 104.9179]
    ],
    stops: [
      {
        id: 'stp-1',
        stopName: 'Stop 1: Boeung Kak I (Sokha Sarya)',
        stopNameKh: 'ចំណតទី១៖ បឹងកក់១ (សុខា សារីយ៉ា)',
        address: 'St. 315, Boeung Kak I, Toul Kork, Phnom Penh',
        addressKh: 'ផ្លូវ ៣១៥ សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
        lat: 11.5720,
        lng: 104.9080,
        scheduledTime: '07:15 AM',
        studentIds: ['stu-1'],
        completed: false
      },
      {
        id: 'stp-2',
        stopName: 'Stop 2: Toul Kork Center (Chhoun Vanna)',
        stopNameKh: 'ចំណតទី២៖ ទួលគោកកណ្តាល (ឈួន វណ្ណា)',
        address: 'St. 566, Toul Kork Center, Phnom Penh',
        addressKh: 'ផ្លូវ ៥៦៦ មជ្ឈមណ្ឌលទួលគោក រាជធានីភ្នំពេញ',
        lat: 11.5765,
        lng: 104.8970,
        scheduledTime: '07:25 AM',
        studentIds: ['stu-2'],
        completed: false
      },
      {
        id: 'stp-3',
        stopName: 'Stop 3: Boeung Kak II (Pheakdey Rith)',
        stopNameKh: 'ចំណតទី៣៖ បឹងកក់២ (ភក្តី រិទ្ធ)',
        address: 'St. 289, Boeung Kak II, Toul Kork, Phnom Penh',
        addressKh: 'ផ្លូវ ២៨៩ សង្កាត់បឹងកក់២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
        lat: 11.5810,
        lng: 104.9140,
        scheduledTime: '07:35 AM',
        studentIds: ['stu-3'],
        completed: false
      },
      {
        id: 'stp-4',
        stopName: 'Stop 4: Russian Blvd (Meas Bopha)',
        stopNameKh: 'ចំណតទី៤៖ មហាវិថីសហព័ន្ធរុស្ស៊ី (មាស បុប្ផា)',
        address: 'Russian Federation Blvd (near 5 Makara Bridge), Phnom Penh',
        addressKh: 'មហាវិថីសហព័ន្ធរុស្ស៊ី (ជិតស្ពានអាកាស ៥ មករា) រាជធានីភ្នំពេញ',
        lat: 11.5645,
        lng: 104.9015,
        scheduledTime: '07:45 AM',
        studentIds: ['stu-4'],
        completed: false
      }
    ]
  },
  {
    id: 'rt-2',
    name: 'Route 2 - Daun Penh → Preah Sisowath HS',
    nameKh: 'ខ្សែរត់ទី២ - ដូនពេញ → វិទ្យាល័យព្រះស៊ីសុវត្ថិ',
    schoolId: 'sch-2',
    busId: 'bus-102',
    driverId: 'drv-2',
    startTime: '07:15 AM',
    endTime: '08:00 AM',
    status: 'in_progress',
    polylineCoords: [
      [11.5500, 104.9200],
      [11.5549, 104.9222]
    ],
    stops: [
      {
        id: 'stp-201',
        stopName: 'Norodom Junction',
        stopNameKh: 'ប្រសព្វមហាវិថីនរោត្តម',
        address: 'Norodom Blvd, Phnom Penh',
        addressKh: 'មហាវិថីព្រះនរោត្តម ភ្នំពេញ',
        lat: 11.5500,
        lng: 104.9200,
        scheduledTime: '07:25 AM',
        studentIds: [],
        completed: false
      }
    ]
  }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trp-1',
    routeId: 'rt-1',
    busId: 'bus-101',
    driverId: 'drv-1',
    date: '2025-10-16',
    status: 'in_progress',
    startTime: '07:30 AM',
    studentsPickedUpCount: 1,
    totalStudentsCount: 3,
    delayMinutes: 0
  },
  {
    id: 'trp-2',
    routeId: 'rt-2',
    busId: 'bus-102',
    driverId: 'drv-2',
    date: '2025-10-16',
    status: 'in_progress',
    startTime: '07:15 AM',
    studentsPickedUpCount: 2,
    totalStudentsCount: 5,
    delayMinutes: 0
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    roleTarget: 'parent',
    title: 'Bus Approaching',
    message: 'Bus 03 is 5 minutes away from your child\'s stop.',
    type: 'info',
    timestamp: '07:55 AM',
    read: false,
    relatedId: 'rt-1'
  },
  {
    id: 'notif-2',
    roleTarget: 'parent',
    title: 'Student Picked Up',
    message: 'Sokha Sary was picked up at Home.',
    type: 'success',
    timestamp: '07:42 AM',
    read: false,
    relatedId: 'stu-1'
  },
  {
    id: 'notif-3',
    roleTarget: 'all',
    title: 'Route Started',
    message: 'Bus 03 started the route to ITC School.',
    type: 'info',
    timestamp: '07:30 AM',
    read: true,
    relatedId: 'rt-1'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    driverId: 'drv-2',
    busId: 'bus-102',
    routeId: 'rt-2',
    type: 'delay',
    description: 'Traffic congestion near Monivong Blvd intersection.',
    severity: 'low',
    status: 'acknowledged',
    createdAt: '2025-10-16 07:55 AM'
  }
];
