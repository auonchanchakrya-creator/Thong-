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
        <h2 className="text-xl font-bold text-slate-900">{t('notifications.broadcastTitle')}</h2>
        <p className="text-xs text-slate-500">{t('notifications.broadcastSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:col-span-2">
          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl font-semibold">
              {t('notifications.sentSuccess')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('notifications.announcementTitle')}</label>
              <input
                type="text"
                required
                placeholder={language === 'km' ? 'ឧ. សេចក្តីជូនដំណឹងអំពីការពន្យារពេលដោយសារភ្លៀង' : 'e.g. Weather Delay Advisory'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('notifications.targetAudience')}</label>
              <select
                value={roleTarget}
                onChange={e => setRoleTarget(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              >
                <option value="all">{t('notifications.allUsers')}</option>
                <option value="parent">{t('notifications.parentsOnly')}</option>
                <option value="driver">{t('notifications.driversOnly')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t('notifications.messageDetails')}</label>
              <textarea
                required
                rows={4}
                placeholder={language === 'km' ? 'សរសេរសារជូនដំណឹងនៅទីនេះ...' : 'Type your message here...'}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> {t('notifications.broadcastButton')}
            </button>
          </form>
        </div>

        {/* Recent Broadcasts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> {t('notifications.recentBroadcasts')}
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((n, idx) => (
              <div key={`${n.id}-${idx}`} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
