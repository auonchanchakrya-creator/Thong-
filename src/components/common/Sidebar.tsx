import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Map, Building2, Users, GraduationCap, Bus, Route as RouteIcon, 
  History, FileText, Bell, Settings, ShieldAlert, UserCheck, Shield, Sparkles, Navigation, X 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const { activeRole, t, language } = useApp();

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpenMobile && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  const adminNav = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'optimizer', label: t('nav.optimizer'), icon: Sparkles },
    { id: 'live-map', label: t('nav.liveMap'), icon: Map },
    { id: 'attendance', label: language === 'km' ? 'កំណត់ត្រាវត្តមាន' : 'Attendance Logs', icon: FileText },
    { id: 'schools', label: t('nav.schools'), icon: Building2 },
    { id: 'students', label: t('nav.students'), icon: GraduationCap },
    { id: 'drivers', label: t('nav.drivers'), icon: UserCheck },
    { id: 'parents', label: t('nav.parents'), icon: Users },
    { id: 'buses', label: t('nav.buses'), icon: Bus },
    { id: 'routes', label: t('nav.routes'), icon: RouteIcon },
    { id: 'trips', label: t('nav.trips'), icon: History },
    { id: 'reports', label: t('nav.reports'), icon: FileText },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell },
    { id: 'users', label: t('nav.users'), icon: Shield },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const driverNav = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'my-route', label: t('nav.myRoute'), icon: Map },
    { id: 'my-students', label: t('nav.myStudents'), icon: GraduationCap },
    { id: 'my-bus', label: t('nav.myBus'), icon: Bus },
    { id: 'trip-history', label: t('nav.trips'), icon: History },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell },
    { id: 'report-issue', label: t('nav.reportIssue'), icon: ShieldAlert },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const parentNav = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'my-children', label: t('nav.myChildren'), icon: GraduationCap },
    { id: 'live-tracking', label: t('nav.liveTracking'), icon: Map },
    { id: 'route-details', label: t('nav.routeDetails'), icon: RouteIcon },
    { id: 'notifications', label: t('nav.notifications'), icon: Bell },
    { id: 'trip-history', label: t('nav.trips'), icon: History },
    { id: 'contact-school', label: t('nav.contactSchool'), icon: Bell },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const phnomPenhNav = [
    { id: 'phnom-penh-app', label: t('nav.phnomPenhHub'), icon: Navigation },
    { id: 'optimizer', label: t('nav.optimizer'), icon: Sparkles },
    { id: 'schools', label: t('nav.schools'), icon: Building2 },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const getNavItems = () => {
    switch (activeRole) {
      case 'admin':
      case 'school_admin':
        return adminNav;
      case 'driver': return driverNav;
      case 'parent': return parentNav;
      case 'phnom-penh': return phnomPenhNav;
      default: return adminNav;
    }
  };

  const items = getNavItems();

  const roleTitle = activeRole === 'parent' 
    ? t('header.parent') 
    : activeRole === 'driver' 
    ? t('header.driver') 
    : activeRole === 'phnom-penh'
    ? t('header.phnomPenh')
    : t('header.admin');

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <>
      <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2.5 flex items-center justify-between">
          <span>{roleTitle}</span>
          <span className="text-[11px] bg-slate-800 text-teal-300 font-bold px-2 py-0.5 rounded-full">
            {items.length} {t('common.active')}
          </span>
        </div>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 min-h-[48px] rounded-xl text-base font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate text-left leading-normal">{item.label}</span>
              {item.id === 'notifications' && (
                <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                  3
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white leading-tight">SchoolRouteAI</h4>
            <p className="text-xs text-slate-400 truncate">{t('header.appTagline')}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar (Visible on lg and above: >= 1024px) */}
      <aside className="hidden lg:flex w-72 bg-slate-900 text-slate-300 flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
        {navContent}
      </aside>

      {/* 2. Mobile / Tablet Collapsible Slide-Over Drawer (< 1024px) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 z-50 flex flex-col shadow-2xl h-full animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight">
                    SchoolRoute<span className="text-blue-500">AI</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-none">{roleTitle}</p>
                </div>
              </div>

              {/* Close Button with generous touch hitbox */}
              <button
                onClick={onCloseMobile}
                className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links & footer */}
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
