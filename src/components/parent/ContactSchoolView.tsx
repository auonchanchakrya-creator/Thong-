import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Check } from 'lucide-react';

export function ContactSchoolView() {
  const { schools, localize, language, t } = useApp();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSent(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'km' ? 'ទាក់ទងរដ្ឋបាលសាលារៀន និងផ្នែកដឹកជញ្ជូន' : 'Contact School & Dispatch'}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mt-1 font-medium">
          {language === 'km' ? 'ផ្ញើសំណើរសុំច្បាប់អវត្តមាន ការផ្លាស់ប្តូរម៉ោង ឬជំនួយការដឹកជញ្ជូន។' : 'Send inquiries regarding absences, schedule changes, or transportation assistance.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
        {sent && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-base px-4 py-3 rounded-xl font-bold flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" /> 
            {language === 'km' ? 'សារត្រូវបានបញ្ជូនទៅការិយាល័យដឹកជញ្ជូនសាលាដោយជោគជ័យ។' : 'Message successfully dispatched to school transportation desk.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-base">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-base">
              {language === 'km' ? 'ជ្រើសរើសសាលារៀន' : 'Select School'}
            </label>
            <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              {schools.map(s => (
                <option key={s.id} value={s.id}>
                  {localize(s.name, s.nameKh)} ({s.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-base">
              {language === 'km' ? 'ប្រធានបទ' : 'Subject'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'km' ? 'ឧ. ការជូនដំណឹងសុំច្បាប់សម្រាប់ថ្ងៃនេះ' : 'e.g. Absence Notice for Today'}
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-base">
              {language === 'km' ? 'ខ្លឹមសារសារ' : 'Message'}
            </label>
            <textarea
              required
              rows={4}
              placeholder={language === 'km' ? 'សូមបញ្ជាក់ខ្លឹមសាររបស់អ្នកយ៉ាងលម្អិត...' : 'State your message clearly...'}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-base text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-colors min-h-[48px] cursor-pointer"
          >
            <Send className="w-5 h-5" /> {language === 'km' ? 'ផ្ញើសារ' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
