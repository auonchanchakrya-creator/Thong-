import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, MapPin, Check, Phone, UserCheck, AlertCircle } from 'lucide-react';

export function MyStudentsView() {
  const { 
    currentUser, drivers, buses, routes, students, 
    confirmStudentPickup, t, language, formatNumber 
  } = useApp();

  const driver = drivers.find(d => d.userId === currentUser?.id) || drivers[0];
  const bus = buses.find(b => b.id === driver?.busId) || buses[0];
  const route = routes.find(r => r.id === driver?.routeId) || routes[0];

  const assignedStudents = students
    .filter(s => s.busId === bus?.id || s.routeId === route?.id)
    .sort((a, b) => (a.pickupOrder || 0) - (b.pickupOrder || 0));

  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePickUp = async (studentId: string, studentName: string) => {
    const res = await confirmStudentPickup(studentId);
    if (res.offlineQueued) {
      setFeedback(language === 'km' 
        ? `បានកត់ត្រាការឡើងរថយន្តរបស់ ${studentName} (Offline Sync)!` 
        : `${studentName} marked as Picked Up (Saved offline)!`);
    } else {
      setFeedback(language === 'km' 
        ? `បានកត់ត្រា ${studentName} ឡើងរថយន្ត និងបានជូនដំណឹងដល់អាណាព្យាបាល!` 
        : `${studentName} confirmed Picked Up & parent notified!`);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'km' ? 'បញ្ជីសិស្ស និងលំដាប់ទទួលក្នុងរថយន្ត' : 'Assigned Students & Pickup Order'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'km' 
              ? `បញ្ជីឈ្មោះសិស្សតាមលំដាប់ចំណតសម្រាប់រថយន្ត (${bus?.busNumber}) ដឹកជញ្ជូនទៅវិទ្យាស្ថានតិចណូ ITC។` 
              : `Sequential pickup manifest for Bus (${bus?.busNumber}) heading to ITC School.`}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 flex items-center gap-2">
          <span>{language === 'km' ? 'បានឡើង' : 'Picked Up'}:</span>
          <span className="font-mono text-sm">
            {formatNumber(assignedStudents.filter(s => s.status === 'picked_up').length)} / {formatNumber(assignedStudents.length)}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="font-bold text-slate-900 text-sm">
            {language === 'km' ? `បញ្ជីវត្តមានសិស្ស (${formatNumber(assignedStudents.length)})` : `Ridership Manifest (${assignedStudents.length})`}
          </h3>
          <span className="text-xs text-slate-400">
            {language === 'km' ? 'រៀបតាមលំដាប់ចំណតផ្លូវធ្វើដំណើរ' : 'Ordered by optimized route sequence'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{language === 'km' ? 'លំដាប់ / ឈ្មោះសិស្ស' : 'Stop / Student'}</th>
                <th className="py-3 px-4">{t('students.grade')}</th>
                <th className="py-3 px-4">{t('students.pickup')}</th>
                <th className="py-3 px-4">{language === 'km' ? 'អាណាព្យាបាល' : 'Parent Contact'}</th>
                <th className="py-3 px-4">{t('students.status')}</th>
                <th className="py-3 px-4 text-right">{language === 'km' ? 'សកម្មភាព' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{student.pickupOrder || idx + 1}
                    </span>
                    <div>
                      <span>{student.name}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">ID: {student.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{student.grade}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-[200px]">
                    <span className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> 
                      <span className="line-clamp-2">{student.pickupAddress}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {student.parentPhone ? (
                      <a href={`tel:${student.parentPhone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{student.parentPhone}</span>
                      </a>
                    ) : (
                      '+855 10 223 344'
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      student.status === 'picked_up' ? 'bg-emerald-100 text-emerald-700' :
                      student.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {student.status === 'picked_up' ? (student.pickedUpAt ? `${t('students.pickedUp')} (${student.pickedUpAt})` : t('students.pickedUp')) :
                       student.status === 'absent' ? 'Absent' : t('students.waiting')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {student.status === 'waiting' ? (
                      <button
                        onClick={() => handlePickUp(student.id, student.name)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <span>✓</span>
                        <span>{language === 'km' ? 'បានឡើង' : 'Picked Up'}</span>
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>{student.pickedUpAt || 'Confirmed'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
