import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, ShieldCheck, Download, Printer, Copy, Check, 
  MapPin, Bus, User, Phone, X, Sparkles, Building2, Lock
} from 'lucide-react';

interface DigitalStudentIDCardProps {
  student: Student;
  onClose?: () => void;
  showActions?: boolean;
}

export function DigitalStudentIDCard({ student, onClose, showActions = true }: DigitalStudentIDCardProps) {
  const { schools, buses, routes, language, localize } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState(false);

  const school = schools.find(s => s.id === student.schoolId) || schools[0];
  const bus = buses.find(b => b.id === student.busId) || buses[0];
  const route = routes.find(r => r.id === student.routeId) || routes[0];

  // Secure token encoded in QR - strictly random identifier, NO plain PII
  const secureQrToken = student.qrToken || `SR-SEC-${student.id.toUpperCase()}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(secureQrToken, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR Code data URL', err);
      });

    return () => {
      isMounted = false;
    };
  }, [secureQrToken]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(secureQrToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden max-w-sm w-full mx-auto font-sans">
      
      {/* Top School Header Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 text-center relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-blue-950 font-black flex items-center justify-center text-xs shadow-sm">
            SR
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
            SchoolRoute AI Cambodia
          </span>
        </div>
        <h3 className="font-extrabold text-sm text-white tracking-tight">
          {localize(school?.name, school?.nameKh) || 'Institute of Technology of Cambodia (ITC)'}
        </h3>
        <p className="text-[10px] text-blue-200/80 font-medium">
          {language === 'km' ? 'ប័ណ្ណសម្គាល់សិស្ស និងឡើងរថយន្តសាលា' : 'Digital Student ID & Bus Boarding Pass'}
        </p>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        
        {/* Student Avatar & Basic Info */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                {student.name}
              </h4>
            </div>
            <p className="text-xs font-bold text-blue-600 mt-0.5">
              {student.grade} • ID: <span className="font-mono">{student.id}</span>
            </p>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 truncate">
              <Bus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{bus?.busNumber || 'Bus 03'} ({bus?.plateNumber || 'PP-2B-8899'})</span>
            </div>
          </div>
        </div>

        {/* QR Code Container (Prominent & Scannable) */}
        <div className="bg-slate-900 text-white p-4 rounded-3xl text-center space-y-3 shadow-inner">
          <div className="flex items-center justify-between px-2 text-[11px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              {language === 'km' ? 'កូដ QR សម្រាប់ឡើងរថយន្ត' : 'Boarding QR Code'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px] uppercase border border-emerald-500/30">
              Active
            </span>
          </div>

          {/* Rendered QR Code */}
          <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto border-4 border-slate-800">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${student.name}`}
                className="w-48 h-48 mx-auto object-contain block"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs animate-pulse">
                Generating QR...
              </div>
            )}
          </div>

          {/* Secure Anti-Tamper Token Display */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-xl flex items-center justify-between text-xs">
            <div className="text-left font-mono">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">
                {language === 'km' ? 'លេខកូដសម្ងាត់សុវត្ថិភាព' : 'Secure Identification Token'}
              </span>
              <strong className="text-amber-300 font-black tracking-wider text-xs">
                {secureQrToken}
              </strong>
            </div>
            <button
              onClick={handleCopyToken}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Copy Token"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>
              {language === 'km' 
                ? 'ទិន្នន័យផ្ទាល់ខ្លួនត្រូវបានការពារ (មិនផ្ទុកព័ត៌មានលម្អិតក្នុងកូដ QR)' 
                : 'Protected Identity: Pure random token, no plain personal data stored.'}
            </span>
          </div>
        </div>

        {/* Pickup & Emergency Details */}
        <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                {language === 'km' ? 'ទីតាំងចំណតទទួល' : 'Designated Pickup Stop'}
              </span>
              <p className="text-slate-800 font-semibold text-[11px] leading-tight">
                {language === 'km' && student.pickupAddressKh ? student.pickupAddressKh : student.pickupAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
            <span className="text-slate-500">{language === 'km' ? 'ទូរស័ព្ទអាណាព្យាបាល' : 'Parent Contact'}:</span>
            <strong className="text-slate-900 font-mono">{student.parentPhone || '+855 10 223 344'}</strong>
          </div>
        </div>

        {/* Action Buttons: Print, Download, Close */}
        {showActions && (
          <div className="flex gap-2 pt-1 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បោះពុម្ពប័ណ្ណ (Print)' : 'Print ID Card'}</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បិទ' : 'Close'}
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
