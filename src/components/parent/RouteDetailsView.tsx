import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { 
  Clock, MapPin, Bus as BusIcon, QrCode, ShieldCheck, 
  Bell, Building2, UserCheck, CheckCircle2, ExternalLink, Printer 
} from 'lucide-react';
import { BusBoardingStickerQRModal } from '../common/BusBoardingStickerQRModal';

export function RouteDetailsView() {
  const { currentUser, parents, students, routes, buses, drivers, t, localize, language, formatNumber } = useApp();
  const parent = parents.find(p => p.userId === currentUser?.id) || parents[0];
  const child = students.find(s => parent?.childrenIds?.includes(s.id)) || students[0];
  const route = routes.find(r => r.id === child?.routeId) || routes[0];
  const bus = buses.find(b => b.id === child?.busId) || buses[0];
  const driver = drivers.find(d => d.busId === bus?.id) || drivers[0];

  const [showStickerModal, setShowStickerModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const busToken = `SR-BUS-${bus?.busNumber.replace(/\s+/g, '').toUpperCase() || 'BUS03'}-${bus?.id || 'bus-101'}`;
  const verificationPayload = `https://schoolrout.ai/bus/boarding?busId=${bus?.id}&busNum=${encodeURIComponent(bus?.busNumber || '')}&plate=${encodeURIComponent(bus?.plateNumber || '')}&routeId=${route?.id || 'rt-1'}&token=${busToken}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(verificationPayload, {
      width: 220,
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
        console.error('Error generating QR', err);
      });

    return () => {
      isMounted = false;
    };
  }, [verificationPayload]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'km' ? 'ព័ត៌មានលម្អិតខ្សែរត់ & ប័ណ្ណកូដ QR លើរថយន្ត' : 'Route Schedule & Bus Door QR Pass'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'km' 
              ? `កាលវិភាគចំណតសម្រាប់ ${localize(route?.name, route?.nameKh)} និងប័ណ្ណសុវត្ថិភាពបិទលើរថយន្ត។` 
              : `Ordered stop schedule for ${route?.name} and official door sticker boarding pass.`}
          </p>
        </div>

        <button
          onClick={() => setShowStickerModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-amber-300" />
          <span>{language === 'km' ? 'ពិនិត្យប័ណ្ណកូដ QR លើឡាន' : 'View Bus Door Sticker'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Route Details and Ordered Stops */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{localize(route?.name, route?.nameKh)}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> {t('common.time')}: {route?.startTime} - {route?.endTime}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase border border-emerald-200">
                {bus?.busNumber}
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {language === 'km' ? 'លំដាប់ចំណតឈប់ទាំងអស់' : 'Ordered Route Stops'}
              </h4>
              <div className="space-y-3">
                {route?.stops.map((stop, index) => {
                  const isChildStop = stop.studentIds.includes(child?.id || '');
                  return (
                    <div 
                      key={stop.id} 
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        isChildStop 
                          ? 'bg-blue-50/70 border-blue-300 shadow-xs' 
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        isChildStop ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {formatNumber(index + 1)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{localize(stop.stopName, stop.stopNameKh)}</span>
                            {isChildStop && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase">
                                {language === 'km' ? `ចំណតរបស់ ${child?.name}` : `${child?.name}'s Stop`}
                              </span>
                            )}
                          </p>
                          <span className="text-xs font-bold text-blue-600">{stop.scheduledTime}</span>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {localize(stop.address, stop.addressKh)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bus Door Sticker Pass & Parent Alert Explanatory Note */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Official Sticker Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BusIcon className="w-4 h-4 text-blue-600" />
                {language === 'km' ? `ប័ណ្ណបិទលើរថយន្តលេខ ${bus?.busNumber}` : `Affixed to Bus ${bus?.busNumber}`}
              </span>
              <button
                onClick={() => setShowStickerModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'km' ? 'មើលប័ណ្ណ' : 'Full Pass'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-950 text-white p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  KINGDOM OF CAMBODIA
                </span>
                <h4 className="text-lg font-black text-white">{bus?.busNumber} ({bus?.plateNumber})</h4>
                <p className="text-[11px] text-slate-300">
                  Driver: {driver?.name || 'Chan Dara'} • {driver?.phone || '+855 12 345 678'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border-4 border-amber-400 shadow-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Bus QR" className="w-32 h-32 object-contain block mx-auto" />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs">Generating...</div>
                )}
                <span className="text-[9px] font-black text-slate-900 font-mono block mt-1 uppercase">
                  SCAN UPON BOARDING
                </span>
              </div>

              <button
                onClick={() => setShowStickerModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'មើលប័ណ្ណពេញលេញ & កំណត់ចំណាំ' : 'Open Sticker & Operating Notes'}
              </button>
            </div>
          </div>

          {/* Explicit In-App Note for Parents */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {language === 'km' ? 'កំណត់ចំណាំស្តីពីការជូនដំណឹង (Parent Alert Rules)' : 'How Boarding Alerts Work for You'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'km' ? 'ដឹងច្បាស់ថាកូននៅលើរថយន្ត ឬមិនបានឡើង' : 'Know whether your child is on the bus'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-slate-700 leading-relaxed">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <strong className="block font-black text-xs text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {language === 'km' ? 'នៅពេលកូនឡើងរថយន្ត (On Bus Alert)' : 'When Child Boards Bus:'}
                </strong>
                <p className="text-[11px] text-emerald-900">
                  {language === 'km'
                    ? 'អ្នកបើកបរស្កេនកាតកូដ QR របស់កូន ឬកូដ QR លើទ្វាររថយន្ត។ លោកអ្នកនឹងទទួលបានសារដាស់តឿនភ្លាមៗ៖ "កូនរបស់អ្នកបានឡើងរថយន្តក្រុងនៅម៉ោង..."។'
                    : 'The driver scans your child’s QR pass at the bus door. You receive an instant alert: "Your child boarded Bus 03 at [Time]. The bus is en route to school."'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                <strong className="block font-black text-xs text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  {language === 'km' ? 'ករណីកូនមិនបានឡើងរថយន្ត (Not On Bus Alert)' : 'If Child Does Not Board:'}
                </strong>
                <p className="text-[11px] text-amber-900">
                  {language === 'km'
                    ? 'ប្រសិនបើកូនមិនបានមកចំណត ឬអវត្តមាន លោកអ្នក និងរដ្ឋបាលសាលានឹងទទួលបានសារដាស់តឿនភ្លាមៗ ដើម្បីបញ្ជាក់ និងធានាសុវត្ថិភាព។'
                    : 'If your child is not at the pickup stop, driver marks absent and you receive an immediate alert that child did not board, with dispatch cross-check.'}
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
      />
    </div>
  );
}
