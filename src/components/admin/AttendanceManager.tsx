import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ClipboardCheck, Search, Filter, Calendar, CheckCircle2, Clock, 
  AlertCircle, Download, Printer, UserCheck, UserX, Bus, MapPin, 
  ChevronRight, RefreshCw, Eye, Sparkles, Check, X
} from 'lucide-react';
import { Student } from '../../types';

export function AttendanceManager() {
  const { 
    students, buses, routes, schools, parents, 
    updateStudentStatus, confirmStudentPickup, markStudentAbsent,
    language, t, localize, formatNumber 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [selectedBusId, setSelectedBusId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2025-10-16');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filter students based on selection
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoute = selectedRouteId === 'all' || student.routeId === selectedRouteId;
    const matchesBus = selectedBusId === 'all' || student.busId === selectedBusId;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

    return matchesSearch && matchesRoute && matchesBus && matchesStatus;
  });

  // Calculate statistics
  const total = students.length;
  const pickedUp = students.filter(s => s.status === 'picked_up').length;
  const atSchoolOrDropped = students.filter(s => s.status === 'at_school' || s.status === 'dropped_off').length;
  const waiting = students.filter(s => s.status === 'waiting' || s.status === 'at_home').length;
  const absent = students.filter(s => s.status === 'absent').length;

  const attendanceRate = total > 0 ? Math.round(((pickedUp + atSchoolOrDropped) / total) * 100) : 0;

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Grade', 'Route', 'Bus', 'Status', 'Boarded At', 'Dropped Off At', 'Parent Phone'];
    const rows = filteredStudents.map(s => {
      const route = routes.find(r => r.id === s.routeId)?.name || 'N/A';
      const bus = buses.find(b => b.id === s.busId)?.busNumber || 'N/A';
      return [
        s.id,
        `"${s.name}"`,
        `"${s.grade}"`,
        `"${route}"`,
        `"${bus}"`,
        s.status,
        s.pickedUpAt || 'N/A',
        s.droppedOffAt || 'N/A',
        s.parentPhone || 'N/A'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `school_attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(language === 'km' ? 'បានទាញយកឯកសារវត្តមានជា CSV ជោគជ័យ' : 'Attendance record exported as CSV');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: Student['status']) => {
    switch (status) {
      case 'picked_up':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            {language === 'km' ? 'នៅលើរថយន្ត' : 'On Board'}
          </span>
        );
      case 'at_school':
      case 'dropped_off':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {language === 'km' ? 'ដល់សាលា / ផ្ទះ' : 'Completed / Present'}
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-red-100 text-red-900 border border-red-200">
            <X className="w-4 h-4 text-red-600" />
            {language === 'km' ? 'អវត្តមាន' : 'Absent'}
          </span>
        );
      case 'waiting':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            {language === 'km' ? 'រង់ចាំការទទួល' : 'Waiting Pickup'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-base font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 sm:w-9 sm:h-9 text-teal-600 shrink-0" />
            {language === 'km' ? 'ការគ្រប់គ្រងវត្តមានសិស្ស' : 'Student Transportation Attendance'}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
            {language === 'km' 
              ? 'តាមដាន និងផ្ទៀងផ្ទាត់វត្តមានឡើង-ចុះរថយន្តសាលារបស់សិស្សទាំងអស់ក្នុងពេលជាក់ស្តែង' 
              : 'Monitor real-time boarding, drop-off verification, and daily attendance logs across all routes'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-slate-800 shadow-xs min-h-[46px] w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs text-slate-500 font-medium sm:hidden">{language === 'km' ? 'កាលបរិច្ឆេទ:' : 'Date:'}</span>
            </div>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-slate-900 text-sm sm:text-base font-bold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm sm:text-base font-bold transition-all shadow-xs min-h-[46px] cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-700" />
              <span>{language === 'km' ? 'ទាញយក CSV' : 'Export CSV'}</span>
            </button>

            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm sm:text-base font-bold transition-all shadow-xs shadow-teal-500/20 min-h-[46px] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'km' ? 'បោះពុម្ព' : 'Print'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-sm sm:text-base font-bold text-slate-600">{language === 'km' ? 'សិស្សចុះឈ្មោះសរុប' : 'Total Registered'}</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{formatNumber(total)}</div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{language === 'km' ? 'កូតារថយន្តសាលា' : 'Allocated fleet capacity'}</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="text-sm sm:text-base font-bold text-blue-800">{language === 'km' ? 'នៅលើរថយន្ត' : 'Currently On Board'}</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-1">{formatNumber(pickedUp)}</div>
          <div className="text-xs sm:text-sm text-blue-700 font-medium mt-1">{language === 'km' ? 'កំពុងធ្វើដំណើរ' : 'En route to school'}</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-sm sm:text-base font-bold text-emerald-800">{language === 'km' ? 'បានដល់សាលា / ផ្ទះ' : 'Safely Arrived'}</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">{formatNumber(atSchoolOrDropped)}</div>
          <div className="text-xs sm:text-sm text-emerald-700 font-medium mt-1">{language === 'km' ? 'បានបញ្ជាក់ដោយសុវត្ថិភាព' : 'Drop-off verified'}</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="text-sm sm:text-base font-bold text-amber-800">{language === 'km' ? 'រង់ចាំការទទួល' : 'Pending Pickup'}</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">{formatNumber(waiting)}</div>
          <div className="text-xs sm:text-sm text-amber-700 font-medium mt-1">{language === 'km' ? 'នៅចំណតផ្ទះ' : 'At designated stop'}</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-red-200 shadow-xs bg-red-50/20 sm:col-span-2 lg:col-span-1">
          <div className="text-sm sm:text-base font-bold text-red-800">{language === 'km' ? 'អវត្តមាន / ឈប់' : 'Marked Absent'}</div>
          <div className="text-2xl sm:text-3xl font-black text-red-900 mt-1">{formatNumber(absent)}</div>
          <div className="text-xs sm:text-sm text-red-700 font-medium mt-1">{language === 'km' ? 'អត្រាវត្តមានសរុប' : 'Attendance rate'}: {attendanceRate}%</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះសិស្ស ថ្នាក់ ឬអាសយដ្ឋាន...' : 'Search student, grade, stop...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition-colors min-h-[46px]"
            />
          </div>

          {/* Route filter */}
          <div>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition-colors text-slate-800 font-semibold min-h-[46px]"
            >
              <option value="all">{language === 'km' ? 'គ្រប់ខ្សែរត់ទាំងអស់ (All Routes)' : 'All Routes'}</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Bus filter */}
          <div>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition-colors text-slate-800 font-semibold min-h-[46px]"
            >
              <option value="all">{language === 'km' ? 'គ្រប់រថយន្តទាំងអស់ (All Buses)' : 'All Buses'}</option>
              {buses.map(b => (
                <option key={b.id} value={b.id}>{b.busNumber} ({b.plateNumber})</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none transition-colors text-slate-800 font-semibold min-h-[46px]"
            >
              <option value="all">{language === 'km' ? 'គ្រប់ស្ថានភាព (All Statuses)' : 'All Statuses'}</option>
              <option value="picked_up">{language === 'km' ? 'នៅលើរថយន្ត (On Board)' : 'On Board'}</option>
              <option value="at_school">{language === 'km' ? 'ដល់សាលា (At School)' : 'At School'}</option>
              <option value="waiting">{language === 'km' ? 'រង់ចាំ (Waiting)' : 'Waiting'}</option>
              <option value="absent">{language === 'km' ? 'អវត្តមាន (Absent)' : 'Absent'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base sm:text-lg text-slate-900">
              {language === 'km' ? 'កំណត់ត្រាវត្តមានលម្អិត' : 'Detailed Attendance Logs'}
            </span>
            <span className="text-sm text-slate-500 font-medium">
              ({formatNumber(filteredStudents.length)} {language === 'km' ? 'នាក់' : 'students'})
            </span>
          </div>

          <div className="text-sm text-slate-600 flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{language === 'km' ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ' : 'Auto-synced with driver in-cab scans'}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-xs sm:text-sm">
              <tr>
                <th className="py-3.5 px-4">{language === 'km' ? 'សិស្ស' : 'Student'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ថ្នាក់' : 'Grade'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ខ្សែរត់ / រថយន្ត' : 'Route & Bus'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ចំណតទទួល' : 'Pickup Stop'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ម៉ោងទទួល' : 'Boarded At'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'អាណាព្យាបាល' : 'Parent Contact'}</th>
                <th className="py-3.5 px-4 text-right">{language === 'km' ? 'សកម្មភាព' : 'Quick Override'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <ClipboardCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-base">{language === 'km' ? 'មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ' : 'No attendance records match the selected filters.'}</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const bus = buses.find(b => b.id === student.busId);
                  const route = routes.find(r => r.id === student.routeId);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm sm:text-base">{student.name}</div>
                            <div className="text-xs text-slate-400 font-medium">ID: {student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {student.grade}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{route?.name || 'Unassigned'}</div>
                        <div className="text-xs text-slate-500 font-medium">{bus?.busNumber || 'No Bus'} ({bus?.plateNumber || '-'})</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-700" title={student.pickupAddress}>
                        {localize(student.pickupAddress, student.pickupAddressKh)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-800 font-medium">
                        {student.pickedUpAt || (student.status === 'picked_up' ? '07:18 AM' : '-')}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.parentPhone || '+855 12 345 678'}</div>
                        <div className="text-xs text-slate-500">{language === 'km' ? 'ទូរស័ព្ទផ្ទាល់' : 'Emergency phone'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {student.status !== 'picked_up' && (
                            <button
                              onClick={() => {
                                confirmStudentPickup(student.id);
                                showToast(language === 'km' ? `បានកត់ត្រា ${student.name} បានឡើងរថយន្ត` : `Marked ${student.name} as On Board`);
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs sm:text-sm font-bold transition-colors min-h-[36px] cursor-pointer"
                              title={language === 'km' ? 'កត់ត្រាឡើងរថយន្ត' : 'Mark On Board'}
                            >
                              {language === 'km' ? 'ឡើង' : 'Board'}
                            </button>
                          )}
                          {student.status !== 'dropped_off' && student.status !== 'at_school' && (
                            <button
                              onClick={() => {
                                updateStudentStatus(student.id, 'at_school');
                                showToast(language === 'km' ? `បានកត់ត្រា ${student.name} បានដល់សាលា` : `Marked ${student.name} at School`);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs sm:text-sm font-bold transition-colors min-h-[36px] cursor-pointer"
                              title={language === 'km' ? 'កត់ត្រាដល់សាលា' : 'Mark Arrived'}
                            >
                              {language === 'km' ? 'ដល់សាលា' : 'Arrived'}
                            </button>
                          )}
                          {student.status !== 'absent' && (
                            <button
                              onClick={() => {
                                markStudentAbsent(student.id, 'Admin manual override');
                                showToast(language === 'km' ? `បានកត់ត្រា ${student.name} អវត្តមាន` : `Marked ${student.name} as Absent`);
                              }}
                              className="px-3 py-1.5 bg-red-50 text-red-800 hover:bg-red-100 rounded-lg text-xs sm:text-sm font-bold transition-colors min-h-[36px] cursor-pointer"
                              title={language === 'km' ? 'កត់ត្រាអវត្តមាន' : 'Mark Absent'}
                            >
                              {language === 'km' ? 'អវត្តមាន' : 'Absent'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
