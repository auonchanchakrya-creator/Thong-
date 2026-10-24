import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Map, Building2, Users, GraduationCap, Bus, Route as RouteIcon, 
  History, FileText, Bell, Settings, ShieldAlert, UserCheck, Shield, Sparkles, Navigation 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { activeRole, t } = useApp();

  const adminNav = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'optimizer', label: t('nav.optimizer'), icon: Sparkles },
    { id: 'live-map', label: t('nav.liveMap'), icon: Map },
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
      case 'admin': return adminNav;
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

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-3.5 flex-1 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          {roleTitle}
        </p>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.id === 'notifications' && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <Bus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white leading-tight">SchoolRoutAI</h4>
            <p className="text-[10px] text-slate-400 truncate">{t('header.appTagline')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
