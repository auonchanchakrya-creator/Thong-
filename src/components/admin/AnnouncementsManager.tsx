import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Send } from 'lucide-react';

export function AnnouncementsManager() {
  const { sendNotification, notifications, t, language } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [roleTarget, setRoleTarget] = useState<'all' | 'parent' | 'driver'>('parent');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    sendNotification({
      title,
      message,
      roleTarget,
      type: 'info'
    });
    setTitle('');
    setMessage('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t('notifications.broadcastTitle')}</h2>
        <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">{t('notifications.broadcastSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 lg:col-span-2">
          {success && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-base px-4 py-3 rounded-xl font-bold flex items-center gap-2">
              <span>✓</span> {t('notifications.sentSuccess')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-base">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-base">{t('notifications.announcementTitle')}</label>
              <input
                type="text"
                required
                placeholder={language === 'km' ? 'ឧ. សេចក្តីជូនដំណឹងអំពីការពន្យារពេលដោយសារភ្លៀង' : 'e.g. Weather Delay Advisory'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-base">{t('notifications.targetAudience')}</label>
              <select
                value={roleTarget}
                onChange={e => setRoleTarget(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="all">{t('notifications.allUsers')}</option>
                <option value="parent">{t('notifications.parentsOnly')}</option>
                <option value="driver">{t('notifications.driversOnly')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-base">{t('notifications.messageDetails')}</label>
              <textarea
                required
                rows={4}
                placeholder={language === 'km' ? 'សរសេរសារជូនដំណឹងនៅទីនេះ...' : 'Type your message here...'}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-colors min-h-[48px] cursor-pointer"
            >
              <Send className="w-5 h-5" /> {t('notifications.broadcastButton')}
            </button>
          </form>
        </div>

        {/* Recent Broadcasts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-blue-600" /> {t('notifications.recentBroadcasts')}
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((n, idx) => (
              <div key={`${n.id}-${idx}`} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-1.5">
                <div className="flex justify-between items-start font-bold text-slate-900 text-base">
                  <span>{n.title}</span>
                  <span className="text-xs text-slate-500 font-medium shrink-0 ml-2">{n.timestamp}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
