import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, Bell, Search, LogOut, Shield, ChevronDown, CheckCircle2, 
  AlertTriangle, Sparkles, Globe, Activity, Type, User
} from 'lucide-react';
import { UserRole } from '../../types';

interface TopNavbarProps {
  onOpenRoleModal: () => void;
  onOpenGpsTestModal?: () => void;
  isMobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
}

export function TopNavbar({ 
  onOpenRoleModal, 
  onOpenGpsTestModal, 
  isMobileNavOpen = false, 
  onToggleMobileNav 
}: TopNavbarProps) {
  const { 
    currentUser, logout, notifications, markNotificationRead, markAllNotificationsRead, 
    activeRole, language, setLanguage, t, fontSize, setFontSize 
  } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(
    n => !n.read && (n.roleTarget === 'all' || n.roleTarget === activeRole)
  ).length;
  const filteredNotifications = notifications.filter(
    n => n.roleTarget === 'all' || n.roleTarget === activeRole
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = currentUser 
    ? (activeRole === 'parent' ? currentUser.name || 'Sokha Dara' : currentUser.name) 
    : 'User';

  const roleLabel = activeRole === 'parent' 
    ? (language === 'km' ? 'អាណាព្យាបាល' : 'Parent')
    : activeRole === 'driver' 
    ? (language === 'km' ? 'អ្នកបើកបរ' : 'Driver')
    : activeRole === 'phnom-penh'
    ? (language === 'km' ? 'ភ្នំពេញ' : 'Phnom Penh')
    : (language === 'km' ? 'រដ្ឋបាល' : 'Admin');

  const searchPlaceholder = activeRole === 'parent' 
    ? t('header.searchParent') 
    : activeRole === 'driver' 
    ? t('header.searchDriver') 
    : t('header.searchAdmin');

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-2.5 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs w-full max-w-full overflow-hidden">
      {/* Left: Hamburger + Brand */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Navigation Button */}
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[44px] min-w-[44px] flex items-center justify-center lg:hidden shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileNavOpen}
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
              <span className={`block h-0.5 w-5 bg-slate-800 rounded-full transition-transform duration-200 ${isMobileNavOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-800 rounded-full transition-opacity duration-200 ${isMobileNavOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block h-0.5 w-5 bg-slate-800 rounded-full transition-transform duration-200 ${isMobileNavOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        )}

        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Bus className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 max-w-[110px] sm:max-w-none">
            <h1 className="font-bold text-slate-900 text-sm sm:text-base lg:text-lg leading-tight tracking-tight truncate">
              SchoolRoute<span className="text-blue-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium leading-none hidden md:block truncate">
              {t('header.appTagline')}
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex items-center ml-4 relative w-64 xl:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Role, GPS, Notification Bell, Profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        
        {/* Role Switcher Pill/Button (Visible on ALL screen sizes, compact on mobile) */}
        <button
          onClick={onOpenRoleModal}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 min-h-[40px] rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 transition-colors text-xs font-bold shrink-0 cursor-pointer active:scale-95 shadow-2xs"
          title="Switch User Role"
          aria-label="Switch User Role"
        >
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate max-w-[65px] sm:max-w-none capitalize">{roleLabel}</span>
          <ChevronDown className="w-3 h-3 text-blue-500 shrink-0" />
        </button>

        {/* GPS Live System Test Bench Trigger */}
        {onOpenGpsTestModal && (
          <button
            onClick={onOpenGpsTestModal}
            className="flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 min-h-[40px] rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 shadow-2xs"
            title="Open Real GPS Live Tracking Test Bench"
            aria-label="GPS Live Test"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
            <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="hidden sm:inline font-mono">GPS</span>
          </button>
        )}

        {/* Language Switcher (Visible on all screens: 1-tap quick toggle on mobile, dropdown on desktop) */}
        <div className="relative">
          {/* Mobile 1-tap toggle */}
          <button
            onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}
            className="md:hidden flex items-center justify-center gap-1 px-2 py-1.5 min-h-[40px] rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 transition-colors text-xs font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95"
            title={language === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{language === 'km' ? '🇬🇧 EN' : '🇰🇭 ខ្មែរ'}</span>
          </button>

          {/* Desktop dropdown toggle */}
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
            title={t('header.switchLang')}
            aria-label={t('header.switchLang')}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{language === 'km' ? '🇰🇭 ភាសាខ្មែរ' : '🇬🇧 EN'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {t('header.switchLang')}
              </div>
              <button
                onClick={() => {
                  setLanguage('km');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between font-medium transition-colors ${
                  language === 'km' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🇰🇭</span>
                  <span>ភាសាខ្មែរ (Khmer)</span>
                </span>
                {language === 'km' && <span className="text-blue-600 text-xs">✓</span>}
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between font-medium transition-colors ${
                  language === 'en' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🇬🇧</span>
                  <span>English</span>
                </span>
                {language === 'en' && <span className="text-blue-600 text-xs">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Readability Font Size Selector (Desktop >= lg, also accessible inside User Menu) */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer"
            title="Text Size Setting"
            aria-label="Text Size Setting"
          >
            <Type className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-bold">
              {fontSize === 'small' ? 'Text: S' : fontSize === 'large' ? 'Text: L' : 'Text: M'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showFontSizeMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {language === 'km' ? 'ទំហំអក្សរ' : 'Text Size'}
              </div>
              <button
                onClick={() => { setFontSize('small'); setShowFontSizeMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between font-medium transition-colors ${
                  fontSize === 'small' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{language === 'km' ? 'តូច (Small)' : 'Small (15px)'}</span>
                {fontSize === 'small' && <span className="text-blue-600 font-bold">✓</span>}
              </button>
              <button
                onClick={() => { setFontSize('medium'); setShowFontSizeMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between font-medium transition-colors ${
                  fontSize === 'medium' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{language === 'km' ? 'មធ្យម (Medium)' : 'Medium (17.5px)'}</span>
                {fontSize === 'medium' && <span className="text-blue-600 font-bold">✓</span>}
              </button>
              <button
                onClick={() => { setFontSize('large'); setShowFontSizeMenu(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between font-bold transition-colors ${
                  fontSize === 'large' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{language === 'km' ? 'ធំ (Large)' : 'Large (20px)'}</span>
                {fontSize === 'large' && <span className="text-blue-600 font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/70 shrink-0 cursor-pointer active:scale-95"
            aria-label={t('header.notifications')}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown (Fixed position on mobile, absolute on desktop) */}
          {showNotifications && (
            <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-18 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-w-[calc(100vw-16px)]">
              <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">{t('header.notifications')}</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} {t('header.newNotifs')}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-blue-600 hover:underline font-medium min-h-[32px] flex items-center cursor-pointer"
                  >
                    {t('header.markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">{t('header.noNotifications')}</div>
                ) : (
                  filteredNotifications.map((notif, idx) => (
                    <div
                      key={`${notif.id}-${idx}`}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                        notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                        notif.type === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {notif.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         notif.type === 'warning' || notif.type === 'alert' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                         <Sparkles className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 min-h-[40px] rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer active:scale-95"
            aria-label="User Account"
          >
            {currentUser?.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={displayName} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials(displayName)}
              </div>
            )}
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">{displayName}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate capitalize">{roleLabel}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {/* User Account Dropdown Menu */}
          {showUserMenu && (
            <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-18 sm:top-full sm:mt-2 w-auto sm:w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-w-[calc(100vw-16px)]">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || ''}</p>
                <span className="inline-block px-2 py-0.5 mt-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md capitalize">
                  {roleLabel}
                </span>
              </div>

              {/* Switch Role Option */}
              <div className="p-1 border-b border-slate-100">
                <button
                  onClick={() => { setShowUserMenu(false); onOpenRoleModal(); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-semibold min-h-[40px] cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>{language === 'km' ? 'ប្តូរតួនាទី (Switch Role)' : 'Switch Role'}</span>
                </button>
              </div>

              {/* Mobile Quick Settings: Language & Font Size */}
              <div className="p-2 border-b border-slate-100 space-y-1 md:hidden">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'km' ? 'ភាសា & ទំហំអក្សរ' : 'Language & Display'}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setLanguage('km')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                      language === 'km' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>🇰🇭 ខ្មែរ</span>
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                      language === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                  </button>
                </div>
              </div>

              {/* Logout Option */}
              <div className="p-1">
                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 font-semibold min-h-[40px] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Quick Logout Button */}
        <button
          onClick={logout}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 min-h-[40px] rounded-xl border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors text-xs font-semibold shrink-0 cursor-pointer"
          title={t('common.logout')}
          aria-label={t('common.logout')}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden lg:inline">{t('common.logout')}</span>
        </button>
      </div>
    </header>
  );
}
