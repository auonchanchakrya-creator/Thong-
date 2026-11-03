import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { GraduationCap, MapPin, Bus, Building2, QrCode } from 'lucide-react';
import { DigitalStudentIDCard } from '../common/DigitalStudentIDCard';

export function ChildrenView() {
  const { currentUser, parents, students, schools, buses, t, localize, language } = useApp();
  const parent = parents.find(p => p.userId === currentUser?.id) || parents[0];
  const myChildren = students.filter(s => parent?.childrenIds?.includes(s.id));

  const [viewingIdCardChild, setViewingIdCardChild] = useState<Student | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'km' ? 'កូនៗរបស់ខ្ញុំដែលបានចុះឈ្មោះ' : 'My Registered Children'}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
          {language === 'km' ? 'គណនីសិស្សភ្ជាប់ និងប័ណ្ណសម្គាល់ឌីជីថលសម្រាប់ស្កេនឡើងរថយន្តសាលា។' : 'Linked student accounts and digital QR boarding passes for school bus.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myChildren.map(child => {
          const school = schools.find(s => s.id === child.schoolId);
          const bus = buses.find(b => b.id === child.busId);
          return (
            <div key={child.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl sm:text-2xl">{child.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{child.grade} • ID: {child.id}</p>
                    </div>
                  </div>

                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide shrink-0 ${
                    child.status === 'picked_up' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    child.status === 'absent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                  }`}>
                    {child.status === 'picked_up' ? (child.pickedUpAt ? `${t('students.pickedUp')} (${child.pickedUpAt})` : t('students.pickedUp')) : child.status === 'at_school' ? t('students.atSchool') : t('students.waiting')}
                  </span>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-base text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                    <span>{t('students.school')}: <strong className="text-slate-900 text-base font-bold">{school ? localize(school.name, school.nameKh) : ''}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Bus className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{t('students.bus')}: <strong className="text-emerald-800 text-base font-bold">{bus?.busNumber} ({bus?.plateNumber})</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{t('students.pickup')}: <strong className="text-slate-900 text-base font-bold">{child.pickupAddress}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button: Digital ID Card with QR Code */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setViewingIdCardChild(child)}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-base flex items-center justify-center gap-2.5 border border-blue-200 transition-colors cursor-pointer min-h-[48px]"
                >
                  <QrCode className="w-5 h-5 text-blue-700" />
                  <span>{language === 'km' ? 'មើលប័ណ្ណសម្គាល់សិស្ស & កូដ QR (Student ID)' : 'View Digital ID & Boarding QR'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Digital Student ID Card Modal */}
      {viewingIdCardChild && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <DigitalStudentIDCard
            student={viewingIdCardChild}
            onClose={() => setViewingIdCardChild(null)}
          />
        </div>
      )}
    </div>
  );
}
