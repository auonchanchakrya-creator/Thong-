import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { 
  Bus as BusIcon, CheckCircle2, QrCode, Printer, Download, 
  FileText, ShieldCheck, Bell, Building2, UserCheck, Smartphone, ExternalLink 
} from 'lucide-react';
import { BusBoardingStickerQRModal } from '../common/BusBoardingStickerQRModal';
import { DriverQRScannerModal } from './DriverQRScannerModal';

export function MyBusView() {
  const { currentUser, drivers, buses, routes, t, language, formatNumber } = useApp();
  const driver = drivers.find(d => d.userId === currentUser?.id) || drivers[0];
  const bus = buses.find(b => b.id === driver?.busId) || buses[0];
  const route = routes.find(r => r.busId === bus?.id || r.driverId === driver?.id) || routes[0];

  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const busToken = `SR-BUS-${bus?.busNumber.replace(/\s+/g, '').toUpperCase() || 'BUS03'}-${bus?.id || 'bus-101'}`;
  const verificationPayload = `https://schoolrout.ai/bus/boarding?busId=${bus?.id}&busNum=${encodeURIComponent(bus?.busNumber || '')}&plate=${encodeURIComponent(bus?.plateNumber || '')}&routeId=${route?.id || 'rt-1'}&token=${busToken}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(verificationPayload, {
      width: 260,
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
        console.error('Error generating bus QR', err);
      });

    return () => {
      isMounted = false;
    };
  }, [verificationPayload]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'km' ? 'ព័ត៌មានលម្អិតអំពីរថយន្ត & ប័ណ្ណកូដ QR បិទលើរថយន្ត' : 'Assigned Bus & Door Boarding Sticker QR'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'km' 
              ? 'ប័ណ្ណកូដ QR សម្រាប់បោះពុម្ពបិទលើរថយន្ត និងកំណត់ចំណាំអំពីការជូនដំណឹងអាណាព្យាបាល & រដ្ឋបាលសាលា។' 
              : 'Printable vehicle entrance sticker pass, scanner console, and parent/admin alert rules.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowStickerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>{language === 'km' ? 'បោះពុម្ពប័ណ្ណបិទលើឡាន' : 'Print Bus Sticker'}</span>
          </button>
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>{language === 'km' ? 'បើកម៉ាស៊ីនស្កេន' : 'Open Scanner'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Bus Specifications & Status Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <BusIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {language === 'km' ? 'រថយន្តផ្លូវការ' : 'Designated Vehicle'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{bus?.busNumber}</h3>
                <p className="text-xs text-slate-500 font-mono font-bold">{bus?.plateNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">{t('buses.capacity')}:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{formatNumber(bus?.capacity || 29)} {language === 'km' ? 'កៅអី' : 'Seats'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">{t('buses.model')}:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5 truncate">{bus?.model || 'Toyota Coaster'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">{t('buses.status')}:</span>
                <p className="font-bold text-emerald-600 text-sm mt-0.5 uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {bus?.status === 'active' ? t('buses.active') : bus?.status}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">{language === 'km' ? 'សុវត្ថិភាពបច្ចេកទេស' : 'Safety Check'}:</span>
                <p className="font-bold text-emerald-600 text-sm mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'km' ? 'ជាប់ស្តង់ដារ' : 'Certified Safe'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'km' ? 'ខ្សែរត់ដែលបានចាត់តាំង' : 'Assigned Route'}:</span>
                <strong className="text-slate-800">{route?.name || 'Route 1'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'km' ? 'អ្នកបើកបរទទួលខុសត្រូវ' : 'Primary Driver'}:</span>
                <strong className="text-slate-800">{driver?.name || 'Chan Dara'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">QR Security Ref:</span>
                <span className="font-mono text-[11px] text-blue-600 font-bold">{busToken}</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-5 space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-extrabold text-amber-950">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{language === 'km' ? 'ការណែនាំស្តីពីការបិទប័ណ្ណលើរថយន្ត' : 'Driver Reminder on Sticker Affixing'}</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              {language === 'km'
                ? 'សូមបោះពុម្ពប័ណ្ណកូដ QR នេះ (ទំហំ A4 ឬ A5) ហើយបិទនៅមាត់ទ្វារខាងស្តាំដៃដែលសិស្សឡើងរថយន្ត ដើម្បីធានាភាពងាយស្រួលក្នុងការស្កេន និងអនុញ្ញាតឱ្យប្រព័ន្ធបញ្ជូនដំណឹងទៅអាណាព្យាបាល និងរដ្ឋបាលសាលាបានរហ័ស។'
                : 'Affix this official laminated QR pass near the passenger boarding door for optimal scanning speed, instantaneous parent boarding confirmation, and live fleet telemetry synchronization.'}
            </p>
          </div>
        </div>

        {/* Right Column: Physical Sticker Preview & Comprehensive In-App Notes */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sticker Preview Box */}
          <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-amber-300 font-black text-xs uppercase">
                  {bus?.busNumber}
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {language === 'km' ? 'ប័ណ្ណផ្លូវការបិទលើរថយន្ត (Vehicle Door Pass)' : 'Official Vehicle Boarding Sticker'}
                </span>
              </div>
              <button
                onClick={() => setShowStickerModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'km' ? 'មើលពេញលេញ & បោះពុម្ព' : 'Full Screen & Print'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 text-white p-5 rounded-2xl shadow-inner">
              <div className="space-y-2 text-center sm:text-left flex-1">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  KINGDOM OF CAMBODIA • ព្រះរាជាណាចក្រកម្ពុជា
                </span>
                <h4 className="text-xl font-black text-white">{bus?.busNumber} — {bus?.plateNumber}</h4>
                <p className="text-xs text-slate-300">
                  {language === 'km' ? 'ស្កេននៅមាត់ទ្វាររថយន្ត ដើម្បីបញ្ជាក់ការឡើងជិះ និងជូនដំណឹងអាណាព្យាបាល' : 'Scan at vehicle entrance to confirm student boarding & trigger parent alerts'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300">Driver: {driver?.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300">Capacity: {bus?.capacity} Seats</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border-4 border-amber-400 shadow-md shrink-0 text-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Bus QR Code" className="w-36 h-36 object-contain block mx-auto" />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">Generating...</div>
                )}
                <span className="text-[9px] font-black text-slate-900 font-mono block mt-1 uppercase">
                  SCAN TO BOARD
                </span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => setShowStickerModal(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>{language === 'km' ? 'បោះពុម្ពប័ណ្ណស្ទីគ័រ (A4 / A5)' : 'Print Sticker Pass'}</span>
              </button>

              <button
                onClick={() => setShowStickerModal(true)}
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>{language === 'km' ? '🖼️ មើលរូបភាពប័ណ្ណ' : '🖼️ View Image of It'}</span>
              </button>

              <button
                onClick={() => setShowScannerModal(true)}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>{language === 'km' ? 'សាកល្បងស្កេន' : 'Test Scanner'}</span>
              </button>
            </div>
          </div>

          {/* Detailed In-App Operating Protocol & Alert Rules */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {language === 'km' ? 'កំណត់ចំណាំក្នុងកម្មវិធី (In-App Operating Protocol Notes)' : 'Official In-App Notes & Alert Protocol'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'km' ? 'គោលការណ៍សម្រាប់អ្នកបើកបរ អាណាព្យាបាល និងរដ្ឋបាលសាលា' : 'Three-way synchronization guidelines'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              {/* Note 1: Driver */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-blue-900 text-xs uppercase">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'km' ? '១. អ្នកបើកបរ' : '1. Driver Scan'}</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-snug">
                  {language === 'km'
                    ? 'ស្កេនប័ណ្ណកាតសិស្សពេលឡើងរថយន្ត ដើម្បីកត់ត្រាម៉ោង និងប្តូរគោលដៅទៅសិស្សបន្ទាប់ស្វ័យប្រវត្ត។'
                    : 'Scan student QR upon boarding to record pickup timestamp and auto-advance route.'}
                </p>
              </div>

              {/* Note 2: Parent */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-emerald-900 text-xs uppercase">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'km' ? '២. អាណាព្យាបាល' : '2. Parent Alert'}</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  {language === 'km'
                    ? 'ទទួលបានសារដាស់តឿនភ្លាមៗបញ្ជាក់ថាកូននៅលើរថយន្ត ឬអវត្តមាន និងតាមដានទីតាំង GPS ផ្ទាល់។'
                    : 'Instant notification on phone whether child is on the bus or absent, with live map tracking.'}
                </p>
              </div>

              {/* Note 3: Admin */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-purple-900 text-xs uppercase">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>{language === 'km' ? '៣. រដ្ឋបាលសាលា' : '3. School Admin'}</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-snug">
                  {language === 'km'
                    ? 'តាមដានចំនួនសិស្សលើរថយន្ត ល្បឿន និងទទួលការព្រមានភ្លាមៗករណីឡើងខុសរថយន្ត។'
                    : 'Real-time telemetry, passenger counts, transit safety, and wrong-bus alerts.'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bus Boarding Sticker QR Modal */}
      <BusBoardingStickerQRModal
        bus={bus}
        isOpen={showStickerModal}
        onClose={() => setShowStickerModal(false)}
        onLaunchScanner={() => {
          setShowStickerModal(false);
          setShowScannerModal(true);
        }}
      />

      {/* Driver QR Scanner Modal */}
      <DriverQRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        activeBus={bus}
        activeRoute={route}
      />
    </div>
  );
}
