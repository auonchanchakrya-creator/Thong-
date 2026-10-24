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
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'km' ? 'កូនៗរបស់ខ្ញុំដែលបានចុះឈ្មោះ' : 'My Registered Children'}
        </h2>
        <p className="text-xs text-slate-500">
          {language === 'km' ? 'គណនីសិស្សភ្ជាប់ និងប័ណ្ណសម្គាល់ឌីជីថលសម្រាប់ស្កេនឡើងរថយន្តសាលា។' : 'Linked student accounts and digital QR boarding passes for school bus.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myChildren.map(child => {
          const school = schools.find(s => s.id === child.schoolId);
          const bus = buses.find(b => b.id === child.busId);
          return (
            <div key={child.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{child.name}</h3>
                      <p className="text-xs text-slate-500">{child.grade} • ID: {child.id}</p>
                    </div>
                  </div>

                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    child.status === 'picked_up' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                    child.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse'
                  }`}>
                    {child.status === 'picked_up' ? (child.pickedUpAt ? `${t('students.pickedUp')} (${child.pickedUpAt})` : t('students.pickedUp')) : child.status === 'at_school' ? t('students.atSchool') : t('students.waiting')}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{t('students.school')}: <strong className="text-slate-900">{school ? localize(school.name, school.nameKh) : ''}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-emerald-600" />
                    <span>{t('students.bus')}: <strong className="text-emerald-700">{bus?.busNumber} ({bus?.plateNumber})</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{t('students.pickup')}: <strong className="text-slate-900">{child.pickupAddress}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button: Digital ID Card with QR Code */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewingIdCardChild(child)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 border border-blue-200 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
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
