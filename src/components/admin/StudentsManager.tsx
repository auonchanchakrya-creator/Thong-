import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, Plus, Search, Trash2, Edit, MapPin, QrCode } from 'lucide-react';
import { Student } from '../../types';
import { DigitalStudentIDCard } from '../common/DigitalStudentIDCard';

export function StudentsManager() {
  const { students, schools, buses, addStudent, updateStudent, deleteStudent, t, localize, language, formatNumber } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingIdCardStudent, setViewingIdCardStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    grade: '9th Grade',
    schoolId: schools[0]?.id || '',
    parentId: 'par-1',
    busId: buses[0]?.id || '',
    pickupAddress: '',
    pickupLat: 11.5683,
    pickupLng: 104.9179,
    dropoffAddress: '',
    dropoffLat: 11.5683,
    dropoffLng: 104.9179,
    status: 'at_home' as Student['status']
  });

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.grade.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      addStudent(formData);
    }
    setShowModal(false);
    setEditingStudent(null);
  };

  const openEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      name: stu.name,
      grade: stu.grade,
      schoolId: stu.schoolId,
      parentId: stu.parentId,
      busId: stu.busId || buses[0]?.id || '',
      pickupAddress: stu.pickupAddress,
      pickupLat: stu.pickupLat,
      pickupLng: stu.pickupLng,
      dropoffAddress: stu.dropoffAddress,
      dropoffLat: stu.dropoffLat,
      dropoffLng: stu.dropoffLng,
      status: stu.status
    });
    setShowModal(true);
  };

  const getStatusBadge = (status: Student['status']) => {
    switch (status) {
      case 'picked_up':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">{t('students.pickedUp')}</span>;
      case 'at_school':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700">{t('students.atSchool')}</span>;
      case 'waiting':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">{t('students.waiting')}</span>;
      case 'dropped_off':
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-800">{t('students.droppedOff')}</span>;
      default:
        return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">{t('students.atHome')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('students.title')}</h2>
          <p className="text-xs text-slate-500">{t('students.subtitle')}</p>
        </div>
        <button
          onClick={() => { setEditingStudent(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> {t('students.addStudent')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('students.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {language === 'km' ? `បង្ហាញ ${formatNumber(filtered.length)} សិស្ស` : `Showing ${filtered.length} students`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-4">{t('students.studentName')}</th>
                <th className="py-3 px-4">{t('students.grade')} & {t('students.school')}</th>
                <th className="py-3 px-4">{t('students.bus')}</th>
                <th className="py-3 px-4">{t('students.pickup')}</th>
                <th className="py-3 px-4">{t('students.status')}</th>
                <th className="py-3 px-4 text-right">{t('schools.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(student => {
                const school = schools.find(s => s.id === student.schoolId);
                const bus = buses.find(b => b.id === student.busId);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      {student.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{student.grade}</p>
                      <p className="text-[11px] text-slate-500">{school ? localize(school.name, school.nameKh) : 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-emerald-700">
                      {bus ? bus.busNumber : t('drivers.unassigned')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {student.pickupAddress}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingIdCardStudent(student)} 
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Digital Student ID Card & QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(student)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteStudent(student.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{editingStudent ? t('students.editStudent') : t('students.addStudent')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('students.studentName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('students.grade')}</label>
                  <input
                    type="text"
                    required
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('students.school')}</label>
                  <select
                    value={formData.schoolId}
                    onChange={e => setFormData({ ...formData, schoolId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {schools.map(s => <option key={s.id} value={s.id}>{localize(s.name, s.nameKh)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('students.bus')}</label>
                  <select
                    value={formData.busId}
                    onChange={e => setFormData({ ...formData, busId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {buses.map(b => <option key={b.id} value={b.id}>{b.busNumber} ({b.plateNumber})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('students.pickup')}</label>
                <input
                  type="text"
                  required
                  value={formData.pickupAddress}
                  onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('students.status')}</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="at_home">{t('students.atHome')}</option>
                  <option value="waiting">{t('students.waiting')}</option>
                  <option value="picked_up">{t('students.pickedUp')}</option>
                  <option value="at_school">{t('students.atSchool')}</option>
                  <option value="dropped_off">{t('students.droppedOff')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                >
                  {editingStudent ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Student ID Card & QR Pass Modal */}
      {viewingIdCardStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <DigitalStudentIDCard
            student={viewingIdCardStudent}
            onClose={() => setViewingIdCardStudent(null)}
          />
        </div>
      )}
    </div>
  );
}
