import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavbar } from './components/common/TopNavbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { RoleSwitcherModal } from './components/auth/RoleSwitcherModal';
import { GpsSystemFlowTestModal } from './components/common/GpsSystemFlowTestModal';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SchoolsManager } from './components/admin/SchoolsManager';
import { StudentsManager } from './components/admin/StudentsManager';
import { DriversManager } from './components/admin/DriversManager';
import { BusesManager } from './components/admin/BusesManager';
import { RoutesManager } from './components/admin/RoutesManager';
import { ReportsManager } from './components/admin/ReportsManager';
import { AnnouncementsManager } from './components/admin/AnnouncementsManager';
import { UserManagement } from './components/admin/UserManagement';
import { SettingsView } from './components/admin/SettingsView';
import { LiveMapAdmin } from './components/admin/LiveMapAdmin';
import { AttendanceManager } from './components/admin/AttendanceManager';

// Driver views
import { DriverDashboard } from './components/driver/DriverDashboard';
import { MyRouteView } from './components/driver/MyRouteView';
import { MyStudentsView } from './components/driver/MyStudentsView';
import { MyBusView } from './components/driver/MyBusView';
import { DriverTripHistory } from './components/driver/DriverTripHistory';

// Parent views
import { ParentDashboard } from './components/parent/ParentDashboard';
import { ChildrenView } from './components/parent/ChildrenView';
import { LiveTrackingView } from './components/parent/LiveTrackingView';
import { RouteDetailsView } from './components/parent/RouteDetailsView';
import { ParentNotificationsView } from './components/parent/ParentNotificationsView';
import { ParentTripHistory } from './components/parent/ParentTripHistory';
import { ContactSchoolView } from './components/parent/ContactSchoolView';

// Tracking & Routes AI School Route Optimizer views
import { PhnomPenhApp } from './components/phnompenh/PhnomPenhApp';
import { PhnomPenhOptimizerDashboard } from './components/phnompenh/PhnomPenhOptimizerDashboard';
import { AiroutePlanner } from './components/phnompenh/AiroutePlanner';

// Auth views
import { WelcomeAuthPage } from './components/auth/WelcomeAuthPage';
import { PendingApprovalView } from './components/auth/PendingApprovalView';

function MainLayout() {
  const { currentUser, activeRole, setActiveRole, switchUser, users, language, t } = useApp();
  const [activeTab, setActiveTab] = useState(activeRole === 'admin' || activeRole === 'school_admin' ? 'optimizer' : 'dashboard');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isGpsTestModalOpen, setIsGpsTestModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleSwitchRoleFlow = (targetRole: 'admin' | 'parent' | 'driver') => {
    if (targetRole === 'admin') {
      const u = users.find(x => x.role === 'admin' || x.role === 'school_admin');
      if (u) switchUser(u.id);
      setActiveRole('school_admin');
      setActiveTab('live-map');
    } else if (targetRole === 'parent') {
      const u = users.find(x => x.role === 'parent');
      if (u) switchUser(u.id);
      setActiveRole('parent');
      setActiveTab('live-tracking');
    } else {
      const u = users.find(x => x.role === 'driver');
      if (u) switchUser(u.id);
      setActiveRole('driver');
      setActiveTab('dashboard');
    }
  };

  // 1. Unauthenticated -> Show Welcome & Registration / Login
  if (!currentUser) {
    return <WelcomeAuthPage />;
  }

  // 2. Pending Verification -> Show Pending Approval Notice
  if (currentUser.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
        <TopNavbar 
          onOpenRoleModal={() => setIsRoleModalOpen(true)} 
          isMobileNavOpen={isMobileNavOpen}
          onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
        />
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 flex items-center justify-center">
          <PendingApprovalView />
        </main>
        <RoleSwitcherModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
      </div>
    );
  }

  // 3. Approved & Active -> Render protected role dashboard
  const renderContent = () => {
    if (activeTab === 'optimizer') {
      return <PhnomPenhOptimizerDashboard />;
    }

    if (activeRole === 'phnom-penh') {
      switch (activeTab) {
        case 'dashboard':
        case 'phnom-penh-app':
          return <PhnomPenhApp />;
        case 'optimizer':
          return <PhnomPenhOptimizerDashboard />;
        case 'schools':
          return <SchoolsManager />;
        case 'settings':
          return <SettingsView />;
        default:
          return <PhnomPenhApp />;
      }
    }

    if (activeRole === 'admin' || activeRole === 'school_admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard onNavigate={setActiveTab} />;
        case 'optimizer': return <PhnomPenhOptimizerDashboard />;
        case 'live-map': return <LiveMapAdmin />;
        case 'schools': return <SchoolsManager />;
        case 'students': return <StudentsManager />;
        case 'drivers': return <DriversManager />;
        case 'parents': return (
          <div className="p-6 bg-white rounded-2xl shadow-xs border border-slate-200">
            <h3 className="font-bold text-lg mb-2 text-slate-900">{t('nav.parents')}</h3>
            <p className="text-xs text-slate-500">
              {language === 'km' ? 'ទិន្នន័យអាណាព្យាបាលត្រូវបានភ្ជាប់ដោយស្វ័យប្រវត្តទៅនឹងគណនីសិស្ស។' : 'Parent records are automatically linked to student accounts.'}
            </p>
          </div>
        );
        case 'buses': return <BusesManager />;
        case 'routes': return <RoutesManager />;
        case 'trips': return <ReportsManager />;
        case 'reports': return <ReportsManager />;
        case 'attendance': return <AttendanceManager />;
        case 'notifications': return <AnnouncementsManager />;
        case 'users': return <UserManagement />;
        case 'settings': return <SettingsView />;
        default: return <AdminDashboard onNavigate={setActiveTab} />;
      }
    }

    if (activeRole === 'driver') {
      switch (activeTab) {
        case 'dashboard': return <DriverDashboard onNavigate={setActiveTab} />;
        case 'my-route': return <MyRouteView />;
        case 'my-students': return <MyStudentsView />;
        case 'my-bus': return <MyBusView />;
        case 'trip-history': return <DriverTripHistory />;
        case 'notifications': return <ParentNotificationsView />;
        case 'report-issue': return <SettingsView />;
        case 'settings': return <SettingsView />;
        default: return <DriverDashboard onNavigate={setActiveTab} />;
      }
    }

    if (activeRole === 'parent') {
      switch (activeTab) {
        case 'dashboard': return <ParentDashboard onNavigate={setActiveTab} />;
        case 'my-children': return <ChildrenView />;
        case 'live-tracking': return <LiveTrackingView />;
        case 'route-details': return <RouteDetailsView />;
        case 'notifications': return <ParentNotificationsView />;
        case 'trip-history': return <ParentTripHistory />;
        case 'contact-school': return <ContactSchoolView />;
        case 'settings': return <SettingsView />;
        default: return <ParentDashboard onNavigate={setActiveTab} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      <TopNavbar 
        onOpenRoleModal={() => setIsRoleModalOpen(true)} 
        onOpenGpsTestModal={() => setIsGpsTestModalOpen(true)}
        isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
      />
      
      <div className="flex flex-1 min-h-0 relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenGpsTestModal={() => setIsGpsTestModalOpen(true)}
        />
        
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 w-full max-w-7xl mx-auto min-w-0 overflow-y-auto overflow-x-hidden pb-24 lg:pb-8">
          {renderContent()}
        </main>
      </div>

      {/* Dedicated Mobile Bottom Navigation Bar (Hidden on desktop lg) */}
      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenMobileMenu={() => setIsMobileNavOpen(true)} 
      />

      <RoleSwitcherModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
      <GpsSystemFlowTestModal 
        isOpen={isGpsTestModalOpen} 
        onClose={() => setIsGpsTestModalOpen(false)} 
        onSwitchRole={handleSwitchRoleFlow}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </LanguageProvider>
  );
}
