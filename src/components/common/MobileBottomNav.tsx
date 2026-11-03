import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Map, Route as RouteIcon, GraduationCap, 
  Menu, Navigation, UserCheck, Bus, MapPin, Globe
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

export function MobileBottomNav({ activeTab, setActiveTab, onOpenMobileMenu }: MobileBottomNavProps) {
  const { activeRole, language, setLanguage, notifications } = useApp();

  const unreadCount = notifications.filter(
    n => !n.read && (n.roleTarget === 'all' || n.roleTarget === activeRole)
  ).length;

  const toggleLanguage = () => {
    setLanguage(language === 'km' ? 'en' : 'km');
  };

  const getNavItems = () => {
    if (activeRole === 'parent') {
      return [
        {
          id: 'dashboard',
          primary: language === 'km' ? 'ទំព័រដើម' : 'Home',
          secondary: language === 'km' ? 'Home' : 'ទំព័រដើម',
          icon: LayoutDashboard,
          isMenu: false,
          isLang: false
        },
        {
          id: 'live-tracking',
          primary: language === 'km' ? 'តាមដាន' : 'Tracking',
          secondary: language === 'km' ? 'Tracking' : 'តាមដាន',
          icon: MapPin,
          isMenu: false,
          isLang: false
        },
        {
          id: 'my-children',
          primary: language === 'km' ? 'កូនខ្ញុំ' : 'Children',
          secondary: language === 'km' ? 'Children' : 'កូនខ្ញុំ',
          icon: GraduationCap,
          isMenu: false,
          isLang: false
        },
        {
          id: 'lang-toggle',
          primary: language === 'km' ? 'English' : 'ភាសាខ្មែរ',
          secondary: language === 'km' ? '🇬🇧 EN' : '🇰🇭 KH',
          icon: Globe,
          isMenu: false,
          isLang: true
        },
        {
          id: 'menu',
          primary: language === 'km' ? 'ម៉ឺនុយ' : 'Menu',
          secondary: language === 'km' ? 'Menu' : 'ម៉ឺនុយ',
          icon: Menu,
          isMenu: true,
          isLang: false
        }
      ];
    }

    if (activeRole === 'driver') {
      return [
        {
          id: 'dashboard',
          primary: language === 'km' ? 'ផ្ទាំងបញ្ជា' : 'Dashboard',
          secondary: language === 'km' ? 'Dashboard' : 'ផ្ទាំងបញ្ជា',
          icon: LayoutDashboard,
          isMenu: false,
          isLang: false
        },
        {
          id: 'my-route',
          primary: language === 'km' ? 'នាំផ្លូវ' : 'Navigate',
          secondary: language === 'km' ? 'Navigate' : 'នាំផ្លូវ',
          icon: Navigation,
          isMenu: false,
          isLang: false
        },
        {
          id: 'my-students',
          primary: language === 'km' ? 'សិស្ស' : 'Students',
          secondary: language === 'km' ? 'Students' : 'សិស្ស',
          icon: UserCheck,
          isMenu: false,
          isLang: false
        },
        {
          id: 'lang-toggle',
          primary: language === 'km' ? 'English' : 'ភាសាខ្មែរ',
          secondary: language === 'km' ? '🇬🇧 EN' : '🇰🇭 KH',
          icon: Globe,
          isMenu: false,
          isLang: true
        },
        {
          id: 'menu',
          primary: language === 'km' ? 'ម៉ឺនុយ' : 'Menu',
          secondary: language === 'km' ? 'Menu' : 'ម៉ឺនុយ',
          icon: Menu,
          isMenu: true,
          isLang: false
        }
      ];
    }

    // Admin / School Admin default
    return [
      {
        id: 'dashboard',
        primary: language === 'km' ? 'ផ្ទាំងបញ្ជា' : 'Dashboard',
        secondary: language === 'km' ? 'Dashboard' : 'ផ្ទាំងបញ្ជា',
        icon: LayoutDashboard,
        isMenu: false,
        isLang: false
      },
      {
        id: 'live-map',
        primary: language === 'km' ? 'ផែនទី' : 'Live Map',
        secondary: language === 'km' ? 'Live Map' : 'ផែនទី',
        icon: Map,
        isMenu: false,
        isLang: false
      },
      {
        id: 'routes',
        primary: language === 'km' ? 'ខ្សែរត់' : 'Routes',
        secondary: language === 'km' ? 'Routes' : 'ខ្សែរត់',
        icon: RouteIcon,
        isMenu: false,
        isLang: false
      },
      {
        id: 'lang-toggle',
        primary: language === 'km' ? 'English' : 'ភាសាខ្មែរ',
        secondary: language === 'km' ? '🇬🇧 EN' : '🇰🇭 KH',
        icon: Globe,
        isMenu: false,
        isLang: true
      },
      {
        id: 'menu',
        primary: language === 'km' ? 'ម៉ឺនុយ' : 'Menu',
        secondary: language === 'km' ? 'Menu' : 'ម៉ឺនុយ',
        icon: Menu,
        isMenu: true,
        isLang: false
      }
    ];
  };

  const items = getNavItems();

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-1 py-1 flex items-center justify-around safe-area-bottom"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = !item.isMenu && !item.isLang && activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.isLang) {
                toggleLanguage();
              } else if (item.isMenu) {
                onOpenMobileMenu();
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`flex-1 min-h-[50px] py-1 px-0.5 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer relative select-none ${
              isActive 
                ? 'text-blue-600 font-bold' 
                : item.isLang
                  ? 'text-indigo-700 font-bold hover:text-indigo-900'
                  : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-current={isActive ? 'page' : undefined}
            title={item.isLang ? (language === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ') : item.primary}
          >
            <div className={`p-1 rounded-xl transition-transform ${
              isActive 
                ? 'bg-blue-50 scale-105' 
                : item.isLang 
                  ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' 
                  : ''
            }`}>
              <Icon className="w-5 h-5" />
            </div>

            <span className={`text-[11px] leading-tight mt-0.5 tracking-tight truncate max-w-[66px] ${
              item.isLang ? 'font-extrabold text-indigo-700' : 'font-semibold'
            }`}>
              {item.primary}
            </span>

            <span className="text-[9px] text-slate-400 font-medium leading-none tracking-tighter truncate max-w-[66px]">
              {item.secondary}
            </span>

            {/* Notification badge on Menu if there are unread items */}
            {item.isMenu && unreadCount > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}

            {/* Indicator on Language switch button */}
            {item.isLang && (
              <span className="absolute -top-0.5 right-1/2 translate-x-3 text-[9px] font-bold">
                {language === 'km' ? '🇬🇧' : '🇰🇭'}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
