import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell } from 'lucide-react';

export function ParentNotificationsView() {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, t, language } = useApp();
  const parentNotifs = notifications.filter(n => {
    if (n.userId && currentUser?.id && n.userId !== currentUser.id) {
      return false;
    }
    return n.roleTarget === 'all' || n.roleTarget === 'parent' || n.userId === currentUser?.id;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'km' ? 'ការជូនដំណឹងសុវត្ថិភាពសម្រាប់អាណាព្យាបាល' : 'Parent Safety Notifications'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
            {language === 'km' 
              ? 'ការជូនដំណឹងពេលវេលាជាក់ស្តែងអំពីរថយន្តមកដល់ ការទទួលសិស្ស និងបច្ចុប្បន្នភាពខ្សែរត់។' 
              : 'Real-time alerts for bus arrivals, student pickups, and route updates.'}
          </p>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-5 py-3 rounded-xl shadow-md self-start min-h-[48px] cursor-pointer"
        >
          {t('header.markAllRead')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {parentNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-base font-medium">
            {t('header.noNotifications')}
          </div>
        ) : (
          parentNotifs.map((notif, idx) => (
            <div
              key={`${notif.id}-${idx}`}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg">{notif.title}</h4>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">{notif.timestamp}</span>
                </div>
                <p className="text-sm sm:text-base text-slate-700 mt-1.5 leading-relaxed font-medium">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
