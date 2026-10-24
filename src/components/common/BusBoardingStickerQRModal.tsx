import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Bus, Route, Driver, School, Student } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Bus as BusIcon, QrCode, Printer, Download, Copy, Check, 
  ShieldCheck, Phone, MapPin, X, Building2, Bell, AlertTriangle, 
  UserCheck, ExternalLink, Sparkles, FileText, Info, Eye, CheckCircle2,
  ChevronDown, Send, Smartphone, Image as ImageIcon, Camera, ArrowRight, Layers
} from 'lucide-react';

interface BusBoardingStickerQRModalProps {
  bus?: Bus;
  isOpen: boolean;
  onClose: () => void;
  onLaunchScanner?: () => void;
}

export function BusBoardingStickerQRModal({
  bus: propBus,
  isOpen,
  onClose,
  onLaunchScanner
}: BusBoardingStickerQRModalProps) {
  const { 
    buses, drivers, routes, schools, students, 
    confirmStudentPickup, markStudentAbsent,
    language, localize, formatNumber 
  } = useApp();

  const [selectedBusId, setSelectedBusId] = useState<string>(propBus?.id || buses[0]?.id || 'bus-101');
  const [activeTab, setActiveTab] = useState<'image' | 'sticker' | 'notes' | 'simulate'>('image');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [fullStickerImageUrl, setFullStickerImageUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [simulatedAlertSuccess, setSimulatedAlertSuccess] = useState<string | null>(null);

  // Sync selected bus if prop changes
  useEffect(() => {
    if (propBus?.id) {
      setSelectedBusId(propBus.id);
    }
  }, [propBus?.id]);

  const bus = buses.find(b => b.id === selectedBusId) || buses[0] || {
    id: 'bus-101',
    busNumber: 'Bus 03',
    plateNumber: 'Phnom Penh 3E-8921',
    capacity: 29,
    model: 'Toyota Coaster VIP',
    status: 'active'
  };

  const driver = drivers.find(d => d.busId === bus.id) || drivers[0];
  const route = routes.find(r => r.busId === bus.id || r.driverId === driver?.id) || routes[0];
  const school = schools.find(s => s.id === route?.schoolId) || schools[0];
  const busStudents = students.filter(s => s.busId === bus.id || s.routeId === route?.id);

  // Bus Verification Token & URL
  const busToken = `SR-BUS-${bus.busNumber.replace(/\s+/g, '').toUpperCase()}-${bus.id}`;
  const verificationPayload = `https://schoolrout.ai/bus/boarding?busId=${bus.id}&busNum=${encodeURIComponent(bus.busNumber)}&plate=${encodeURIComponent(bus.plateNumber)}&routeId=${route?.id || 'rt-1'}&token=${busToken}`;

  // 1. Generate Raw QR Code Data URL
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(verificationPayload, {
      width: 440,
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
        console.error('Failed to generate bus sticker QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [verificationPayload]);

  // 2. Render Full High-Resolution Sticker Graphic to Canvas Image
  useEffect(() => {
    if (!qrDataUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1260;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 900, 1260);

    // Outer Dark Slate Border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 12;
    ctx.strokeRect(24, 24, 852, 1212);

    // Dashed Cut Line
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(40, 40, 820, 1180);
    ctx.setLineDash([]);

    // Cut Guideline Banner
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('✂️ STICK ON BUS PASSENGER DOOR OR DASHBOARD • បិទលើទ្វារឡើងរថយន្ត', 55, 64);
    ctx.fillText(`REF: ${busToken}`, 660, 64);

    // Top Header Banner
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(50, 80, 800, 90, 16);
    ctx.fill();

    // Kingdom of Cambodia Crest text
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 16px sans-serif';
    ctx.fillText('KINGDOM OF CAMBODIA • ព្រះរាជាណាចក្រកម្ពុជា', 75, 115);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('SchoolRoute AI — School Transportation Management & Safety Authority', 75, 145);

    // Official Title
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(language === 'km' ? 'ប័ណ្ណកូដ QR សុវត្ថិភាពឡើងរថយន្តសាលា' : 'Official Bus Boarding & Safety Pass', 450, 215);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(localize(school?.name, school?.nameKh) || 'Institute of Technology of Cambodia (ITC)', 450, 245);

    // Vehicle Info Card Box (Navy Dark)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(50, 270, 800, 360, 24);
    ctx.fill();

    // Bus Number Pill
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(80, 298, 160, 44, 12);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bus.busNumber, 160, 330);

    // Left Column Info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('LICENSE PLATE / ស្លាកលេខរថយន្ត', 80, 380);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px monospace';
    ctx.fillText(bus.plateNumber, 80, 420);

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${bus.model} • ${bus.capacity || 29} Seats`, 80, 455);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 475);
    ctx.lineTo(470, 475);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Route: ${localize(route?.name, route?.nameKh) || 'Route 1: Toul Kork → ITC'}`, 80, 505);
    ctx.fillText(`Driver: ${driver?.name || 'Chan Dara'} (${driver?.phone || '+855 12 345 678'})`, 80, 535);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('✓ Active Verified Boarding Terminal', 80, 570);

    // Scannable QR Badge on Canvas
    const qrImage = new Image();
    qrImage.onload = () => {
      // White Card for QR
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(510, 295, 315, 315, 20);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.stroke();

      // QR Image
      ctx.drawImage(qrImage, 535, 315, 265, 265);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN FOR BOARDING & ALERTS', 667, 595);

      // 3 Notes Section
      // Note 1: Driver
      ctx.fillStyle = '#eff6ff';
      ctx.beginPath();
      ctx.roundRect(50, 660, 250, 240, 20);
      ctx.fill();
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e3a8a';
      ctx.font = '900 15px sans-serif';
      ctx.fillText('1. DRIVER SCAN', 70, 695);
      ctx.fillStyle = '#1e40af';
      ctx.font = '13px sans-serif';
      ctx.fillText('Scan student pass at bus', 70, 730);
      ctx.fillText('door upon boarding.', 70, 755);
      ctx.fillText('Automatically logs', 70, 790);
      ctx.fillText('pickup timestamp and', 70, 815);
      ctx.fillText('advances route GPS.', 70, 840);

      // Note 2: Parent
      ctx.fillStyle = '#ecfdf5';
      ctx.beginPath();
      ctx.roundRect(325, 660, 250, 240, 20);
      ctx.fill();
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#065f46';
      ctx.font = '900 15px sans-serif';
      ctx.fillText('2. PARENT ALERT', 345, 695);
      ctx.fillStyle = '#047857';
      ctx.font = '13px sans-serif';
      ctx.fillText('Instant alert on phone', 345, 730);
      ctx.fillText('confirming whether child', 345, 755);
      ctx.fillText('is on the bus or absent.', 345, 780);
      ctx.fillText('Includes live GPS map', 345, 815);
      ctx.fillText('& real-time school ETA.', 345, 840);

      // Note 3: School Admin
      ctx.fillStyle = '#faf5ff';
      ctx.beginPath();
      ctx.roundRect(600, 660, 250, 240, 20);
      ctx.fill();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#581c87';
      ctx.font = '900 15px sans-serif';
      ctx.fillText('3. SCHOOL ADMIN', 620, 695);
      ctx.fillStyle = '#6b21a8';
      ctx.font = '13px sans-serif';
      ctx.fillText('Real-time passenger', 620, 730);
      ctx.fillText('count & occupancy sync.', 620, 755);
      ctx.fillText('Instant alerts if student', 620, 790);
      ctx.fillText('boards the wrong bus.', 620, 815);
      ctx.fillText('Full safety audit logs.', 620, 840);

      // Bottom Footer Hotline
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(50, 930, 800, 110, 18);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('🛡️ Official Certified Transit Pass • SchoolRoute AI Cambodia', 75, 968);
      ctx.fillStyle = '#475569';
      ctx.font = '13px sans-serif';
      ctx.fillText('Ministry of Education & Transport Compliant  |  Dispatch Hotline: +855 23 880 370', 75, 1000);

      setFullStickerImageUrl(canvas.toDataURL('image/png'));
    };
    qrImage.src = qrDataUrl;
  }, [qrDataUrl, bus, driver, route, school, language]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationPayload);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadFullStickerImage = () => {
    const url = fullStickerImageUrl || qrDataUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `SchoolRoute_AI_${bus.busNumber.replace(/\s+/g, '_')}_Official_Door_Sticker_Pass.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Test Simulation Alert
  const handleTriggerSimulation = async (type: 'on_bus' | 'not_on_bus') => {
    const sampleStudent = busStudents[0] || students[0];
    if (!sampleStudent) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (type === 'on_bus') {
      await confirmStudentPickup(sampleStudent.id, timeStr);
      setSimulatedAlertSuccess(
        language === 'km'
          ? `✓ បានផ្ញើសារជូនដំណឹងជោគជ័យ៖ សិស្ស "${sampleStudent.name}" បានឡើង ${bus.busNumber} នៅម៉ោង ${timeStr}! (បានបញ្ជូនទៅអាណាព្យាបាល និងរដ្ឋបាលសាលា)`
          : `✓ Alert Dispatched: "${sampleStudent.name}" is ON ${bus.busNumber} at ${timeStr}! (Dispatched to Parent and School Admin)`
      );
    } else {
      markStudentAbsent(sampleStudent.id, language === 'km' ? 'មិនបានជិះថ្ងៃនេះ' : 'Missed boarding');
      setSimulatedAlertSuccess(
        language === 'km'
          ? `✓ បានផ្ញើសារជូនដំណឹងអវត្តមាន៖ សិស្ស "${sampleStudent.name}" មិនបានឡើង ${bus.busNumber} ទេ! (បានបញ្ជូនទៅអាណាព្យាបាល និងរដ្ឋបាលសាលា)`
          : `✓ Absence Alert Dispatched: "${sampleStudent.name}" is NOT ON ${bus.busNumber}! (Dispatched to Parent and School Admin)`
      );
    }

    setTimeout(() => setSimulatedAlertSuccess(null), 6000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-hidden flex flex-col font-sans text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <BusIcon className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  {language === 'km' 
                    ? `រូបភាពប័ណ្ណកូដ QR បិទលើរថយន្ត & កំណត់ចំណាំ (${bus.busNumber})` 
                    : `Bus Door Sticker QR Image & In-App Notes (${bus.busNumber})`}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-xs">
                  {language === 'km' ? 'រូបភាពផ្លូវការ' : 'Official Image'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {language === 'km' 
                  ? 'បិទលើទ្វារឡើងរថយន្ត សម្រាប់អ្នកបើកបរស្កេន ផ្ញើសារដាស់តឿនអាណាព្យាបាល និងរដ្ឋបាលសាលា' 
                  : 'Affix to bus door for driver boarding scans, alerting parents and school admin whether child is on the bus.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bus Selector Header Bar */}
        <div className="bg-slate-800/95 text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              {language === 'km' ? 'ជ្រើសរើសរថយន្តក្រុង' : 'Select Fleet Bus'}:
            </span>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-amber-300 font-black text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber} • {b.plateNumber} ({b.model})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{busStudents.length} {language === 'km' ? 'សិស្សជិះរថយន្តនេះ' : 'registered riders'}</span>
          </div>
        </div>

        {/* 4 Tabs Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'image'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>{language === 'km' ? 'រូបភាពជាក់ស្តែង (Image of It & Mockup)' : 'Image of It & Real Mockup'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sticker')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sticker'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{language === 'km' ? 'ប័ណ្ណបោះពុម្ព (Printable Sticker Pass)' : 'Printable Sticker Pass'}</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'km' ? 'កំណត់ចំណាំក្នុង App (In-App Notes)' : 'In-App Protocol Notes'}</span>
          </button>

          <button
            onClick={() => setActiveTab('simulate')}
            className={`pb-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'simulate'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{language === 'km' ? 'តេស្តផ្ញើសារ (Test Alerts)' : 'Test Alert Dispatch'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/60">
          
          {/* =========================================================================
             TAB 1: IMAGE OF IT (High-Resolution Graphic Image + Realistic Bus Door Mockup)
             ========================================================================= */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              
              {/* Top Banner explaining the image */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-500/30 shadow-lg">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Official High-Resolution Image</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    {language === 'km' ? `រូបភាពប័ណ្ណកូដ QR បិទលើរថយន្តលេខ ${bus.busNumber}` : `Official Bus Door Boarding QR Sticker Pass Image (${bus.busNumber})`}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {language === 'km'
                      ? 'រូបភាពកម្រិតខ្ពស់សម្រាប់បោះពុម្ពបិទលើរថយន្ត ជាមួយកូដ QR អាចស្កេនបានពិតៗ និងកំណត់ចំណាំទាំង ៣'
                      : 'High-resolution graphic image ready to save, print, or laminate for the bus entrance door.'}
                  </p>
                </div>

                <button
                  onClick={handleDownloadFullStickerImage}
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span>{downloadSuccess ? 'Downloaded Image!' : (language === 'km' ? 'ទាញយករូបភាព (.PNG)' : 'Download Image (.PNG)')}</span>
                </button>
              </div>

              {/* A. REALISTIC BUS DOOR SCANNING MOCKUP SCENE */}
              <div className="bg-slate-900 rounded-3xl border-2 border-slate-800 p-6 shadow-xl space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-amber-300">
                      {language === 'km' ? 'ទិដ្ឋភាពជាក់ស្តែងពេលបិទលើរថយន្ត & អ្នកបើកបរស្កេន' : 'Real-World Bus Door Installation & Scanning View'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Location: ITC Phnom Penh Stop
                  </span>
                </div>

                {/* Illustrated Bus Entrance Door with Affixed Sticker */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-slate-800 shadow-inner min-h-[300px]">
                  
                  {/* Bus Exterior & Door Glass Frame */}
                  <div className="relative w-full md:w-3/5 bg-slate-900/90 backdrop-blur-sm rounded-2xl border-4 border-amber-400 p-5 shadow-2xl flex flex-col justify-between">
                    
                    {/* Bus Header Light Bar */}
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                        <span className="font-black text-amber-400 text-xs tracking-wider">
                          SCHOOL BUS {bus.busNumber} • {bus.plateNumber}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                        DOOR GLASS
                      </span>
                    </div>

                    {/* Affixed Sticker Preview on the Door Glass */}
                    <div className="bg-white text-slate-900 rounded-xl p-3 border-2 border-slate-900 shadow-2xl space-y-2 transform hover:scale-102 transition-transform">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="text-[8px] font-black uppercase text-blue-900">
                          KINGDOM OF CAMBODIA • SchoolRoute AI
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 font-bold">
                          {busToken}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white p-1 rounded-lg border-2 border-amber-400 shadow-sm shrink-0">
                          {qrDataUrl && <img src={qrDataUrl} alt="Bus QR" className="w-full h-full object-contain" />}
                        </div>
                        <div className="space-y-0.5 text-left flex-1">
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                            {bus.busNumber}
                          </span>
                          <strong className="block text-xs font-black">{bus.plateNumber}</strong>
                          <p className="text-[9px] text-slate-600 font-medium leading-tight">
                            Driver: {driver?.name} • Route: {localize(route?.name, route?.nameKh)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 text-[8px] font-bold">
                        <div className="bg-blue-50 text-blue-800 p-1 rounded text-center">1. Driver Scan</div>
                        <div className="bg-emerald-50 text-emerald-800 p-1 rounded text-center">2. Parent Alert</div>
                        <div className="bg-purple-50 text-purple-800 p-1 rounded text-center">3. Admin Sync</div>
                      </div>
                    </div>

                    {/* Door Handle & Steps indicator */}
                    <div className="mt-4 pt-2 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                      <span>🚪 Passenger Entrance Door Handle</span>
                      <span className="text-amber-300 font-bold">Laminated Weatherproof Sticker</span>
                    </div>
                  </div>

                  {/* Driver Smartphone Scanning Viewfinder Overlay */}
                  <div className="w-full md:w-2/5 flex flex-col items-center">
                    <div className="w-48 bg-slate-950 rounded-3xl p-3 border-4 border-slate-700 shadow-2xl space-y-2 text-center text-white relative">
                      {/* Phone Speaker */}
                      <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2"></div>
                      
                      {/* Phone Screen Viewfinder */}
                      <div className="relative bg-slate-900 rounded-2xl p-3 aspect-[9/14] flex flex-col items-center justify-between border border-slate-800 overflow-hidden">
                        
                        {/* Status bar */}
                        <div className="w-full flex justify-between items-center text-[8px] text-slate-400">
                          <span>07:15 AM</span>
                          <span className="text-emerald-400 font-bold">GPS Active</span>
                        </div>

                        {/* Scanner Target Box */}
                        <div className="relative w-28 h-28 border-2 border-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-300"></span>
                          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-300"></span>
                          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-300"></span>
                          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-300"></span>
                          
                          {/* Animated Scan Line */}
                          <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce"></div>
                          
                          <span className="text-[7px] font-mono text-emerald-300 absolute bottom-1 font-bold">
                            SCANNING QR...
                          </span>
                        </div>

                        {/* Real-time Alert Notification Pop-up */}
                        <div className="w-full bg-emerald-950/90 border border-emerald-500 rounded-xl p-1.5 text-left space-y-0.5">
                          <span className="text-[7px] font-black text-emerald-300 uppercase block">
                            ✓ PARENT & ADMIN ALERT SENT
                          </span>
                          <p className="text-[8px] text-white leading-tight font-bold">
                            Sokha Sarya Boarded {bus.busNumber}
                          </p>
                        </div>
                      </div>

                      <span className="text-[9px] text-slate-400 block font-bold">
                        Driver Phone Scanner
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* B. THE FULL HIGH-RESOLUTION STICKER GRAPHIC IMAGE */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {language === 'km' ? 'រូបភាពប័ណ្ណកូដ QR ផ្លូវការកម្រិតច្បាស់ (Full Graphic Image)' : 'Full Graphic Sticker Image (800 × 1100 px)'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {language === 'km' ? 'ចុចប៊ូតុងទាញយក ឬចុចកណ្តុរស្តាំដើម្បី Save រូបភាព' : 'Right-click to save or click Download PNG below'}
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadFullStickerImage}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>{language === 'km' ? 'ទាញយករូបភាព' : 'Download PNG'}</span>
                  </button>
                </div>

                <div className="flex justify-center p-4 bg-slate-100 rounded-2xl border border-slate-200">
                  {fullStickerImageUrl ? (
                    <img
                      src={fullStickerImageUrl}
                      alt={`Full Official Sticker Image for Bus ${bus.busNumber}`}
                      className="max-w-full sm:max-w-md rounded-2xl shadow-2xl border-4 border-slate-900 transition-all"
                    />
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                      <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                      <span>Generating high-resolution sticker image...</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
             TAB 2: PRINTABLE OFFICIAL STICKER PASS
             ========================================================================= */}
          {activeTab === 'sticker' && (
            <div className="space-y-4">
              
              {/* Placement Guide Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900 print:hidden">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black flex items-center justify-center shrink-0 text-xs">
                  📌
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-amber-950">
                    {language === 'km' ? 'ការណែនាំអំពីការបិទប័ណ្ណកូដ QR លើរថយន្តសាលា' : 'Physical Bus Sticker Placement Notice'}
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {language === 'km'
                      ? 'បោះពុម្ពប័ណ្ណនេះនៅលើក្រដាសស្ទីគ័រ (A4 ឬ A5) ហើយបិទនៅមាត់ទ្វារខាងមុខដែលសិស្សឡើងរថយន្ត ឬក្បែរតាប្លូរបស់អ្នកបើកបរ ដើម្បីងាយស្រួលស្កេន និងធានាថាអាណាព្យាបាល និងរដ្ឋបាលសាលាដឹងច្បាស់ថាកូនបានឡើងរថយន្ត ឬអវត្តមាន។'
                      : 'Print on adhesive paper (A4 / A5) and affix prominently to the passenger boarding door or driver dashboard for immediate scanning and parent/admin alert synchronization.'}
                  </p>
                </div>
              </div>

              {/* Outer Sticker Badge Frame (Designed for printing and sticking on bus) */}
              <div 
                id="bus-sticker-printable" 
                className="bg-white rounded-3xl border-4 border-slate-900 shadow-xl overflow-hidden p-6 sm:p-7 space-y-5 relative"
              >
                {/* Cut Lines & Top Header Notice */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    {language === 'km' ? '✂️ កាត់តាមបន្ទាត់នេះ • បិទនៅមាត់ទ្វារឡើងរថយន្ត ឬក្បែរតាប្លូអ្នកបើកបរ' : '✂️ CUT HERE • STICK ON BUS PASSENGER DOOR OR DASHBOARD'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    REF: {busToken}
                  </span>
                </div>

                {/* Kingdom of Cambodia & School Route AI Header */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-blue-950 text-amber-400 font-black flex items-center justify-center text-sm shadow-md">
                      SR
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-950 leading-tight">
                        KINGDOM OF CAMBODIA • ព្រះរាជាណាចក្រកម្ពុជា
                      </h4>
                      <p className="text-[10px] font-bold text-amber-600">
                        SchoolRoute AI — School Transportation Management & Safety Authority
                      </p>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {language === 'km' ? 'ប័ណ្ណកូដ QR សុវត្ថិភាពឡើងរថយន្តសាលាផ្លូវការ' : 'Official Bus Boarding & Verification Pass'}
                  </h2>
                  <p className="text-xs font-bold text-slate-600">
                    {localize(school?.name, school?.nameKh) || 'Institute of Technology of Cambodia (ITC)'}
                  </p>
                </div>

                {/* Main Vehicle Spotlight & Big QR Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center bg-slate-900 text-white p-5 rounded-3xl shadow-inner">
                  
                  {/* Left: Big Bus Identity */}
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
                      <BusIcon className="w-4 h-4" />
                      <span>{bus.busNumber}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {language === 'km' ? 'ស្លាកលេខរថយន្ត (License Plate)' : 'License Plate'}
                      </span>
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        {bus.plateNumber}
                      </h3>
                      <p className="text-xs text-blue-300 font-bold mt-0.5">
                        {bus.model} • {formatNumber(bus.capacity || 29)} {language === 'km' ? 'កៅអីសុវត្ថិភាព' : 'Seats'}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">{language === 'km' ? 'ខ្សែរត់ (Assigned Route)' : 'Assigned Route'}:</span>
                        <strong className="text-white">{localize(route?.name, route?.nameKh) || 'Route 1: Toul Kork → ITC'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">{language === 'km' ? 'អ្នកបើកបរ (Driver)' : 'Assigned Driver'}:</span>
                        <strong className="text-emerald-400">{driver?.name || 'Chan Dara'}</strong> ({driver?.phone || '+855 12 345 678'})
                      </div>
                    </div>
                  </div>

                  {/* Right: Scannable Bus Station QR Code */}
                  <div className="text-center bg-white p-4 rounded-2xl shadow-lg border-4 border-amber-400">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR Code for Bus ${bus.busNumber}`}
                        className="w-48 h-48 mx-auto object-contain block"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs animate-pulse">
                        Generating High-Resolution QR...
                      </div>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block mt-2 font-mono bg-amber-100 py-1 px-2 rounded-md">
                      SCAN FOR BOARDING & ALERTS
                    </span>
                  </div>

                </div>

                {/* 3 Explicit Instruction Notes on the Physical Sticker (Requirement) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  
                  {/* Note 1: Driver */}
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-blue-900 text-xs uppercase">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>{language === 'km' ? '១. អ្នកបើកបរ (Driver)' : '1. Driver Scan'}</span>
                    </div>
                    <p className="text-[11px] text-blue-900 leading-snug">
                      {language === 'km'
                        ? 'ស្កេនកាតសិស្សពេលឡើងរថយន្ត ដើម្បីកត់ត្រាវត្តមាន ម៉ោងឡើង និងបញ្ជូនដំណឹងទៅអាណាព្យាបាលភ្លាមៗ។'
                        : 'Scan student pass at bus entrance to confirm boarding and record pickup timestamp.'}
                    </p>
                  </div>

                  {/* Note 2: Parent */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-emerald-900 text-xs uppercase">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'km' ? '២. អាណាព្យាបាល (Parent)' : '2. Parent Alert'}</span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-snug">
                      {language === 'km'
                        ? 'ទទួលបានសារដាស់តឿនភ្លាមៗបញ្ជាក់ថាកូននៅលើរថយន្ត ឬអវត្តមាន និងតាមដានទីតាំង GPS ផ្ទាល់។'
                        : 'Instant phone alert informing whether child is on the bus or not, with real-time GPS map.'}
                    </p>
                  </div>

                  {/* Note 3: School Admin */}
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-purple-900 text-xs uppercase">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span>{language === 'km' ? '៣. រដ្ឋបាលសាលា (Admin)' : '3. School Admin'}</span>
                    </div>
                    <p className="text-[11px] text-purple-900 leading-snug">
                      {language === 'km'
                        ? 'តាមដានចំនួនសិស្សលើរថយន្ត ល្បឿន និងទទួលការព្រមានភ្លាមៗបើឡើងខុសរថយន្ត។'
                        : 'Central dispatch monitors live passenger count, transit safety, and wrong-bus alerts.'}
                    </p>
                  </div>

                </div>

                {/* Bottom Footer Emergency Note */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'km' 
                        ? 'ប្រព័ន្ធសុវត្ថិភាពដឹកជញ្ជូនសិស្សសាលា SchoolRoute AI Cambodia' 
                        : 'Official SchoolRoute AI Certified Transit Security Pass'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-700 font-bold">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dispatch Hotline: +855 23 880 370</span>
                  </div>
                </div>

              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap gap-2.5 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex-1 min-w-[140px] py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>{language === 'km' ? 'បោះពុម្ពប័ណ្ណបិទលើរថយន្ត (Print A4/A5)' : 'Print Bus Sticker (A4 / A5)'}</span>
                </button>

                <button
                  onClick={handleDownloadFullStickerImage}
                  className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  <span>{downloadSuccess ? 'Downloaded!' : (language === 'km' ? 'ទាញយករូបភាព PNG' : 'Download PNG Image')}</span>
                </button>

                {onLaunchScanner && (
                  <button
                    onClick={onLaunchScanner}
                    className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{language === 'km' ? 'បើកម៉ាស៊ីនស្កេន' : 'Open Scanner'}</span>
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied Link' : 'Copy Verification Link'}</span>
                </button>
              </div>

            </div>
          )}

          {/* =========================================================================
             TAB 3: NOTES & ALERT RULES VIEW
             ========================================================================= */}
          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs">
              
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-5 space-y-2 border border-blue-500/30 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'km' ? 'កំណត់ចំណាំក្នុងកម្មវិធី (In-App Operating Protocol)' : 'Official In-App Operational Protocol'}</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  {language === 'km' 
                    ? `គោលការណ៍កូដ QR បិទលើរថយន្ត សម្រាប់អ្នកបើកបរស្កេន ផ្ញើសារដាស់តឿនអាណាព្យាបាល & រដ្ឋបាលសាលា`
                    : `Bus Door Sticker Scanning & Real-Time Alert System Rules`}
                </h4>
                <p className="text-xs text-blue-100/90 leading-relaxed">
                  {language === 'km'
                    ? 'កំណត់ចំណាំនេះបញ្ជាក់លម្អិតអំពីរបៀបដែលកូដ QR ត្រូវបិទលើរថយន្ត និងរបៀបដែលអ្នកបើកបរត្រូវស្កេន ដើម្បីផ្ញើសារដាស់តឿនភ្លាមៗទៅកាន់អាណាព្យាបាល (ថាតើកូនបានឡើងរថយន្ត ឬមិនបានឡើង) និងធ្វើសមកាលកម្មជាមួយរដ្ឋបាលសាលា។'
                    : 'This protocol governs how the QR sticker affixed to the bus door functions, directing driver scans, real-time alerts to parents (confirming whether their child is on the bus or absent), and live supervision for school administration.'}
                </p>
              </div>

              {/* Note Section 1: For Driver */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                      🚌
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        {language === 'km' ? '១. កំណត់ចំណាំសម្រាប់អ្នកបើកបរ (Driver Boarding Duty)' : '1. Driver Boarding & Scanning Duty'}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-semibold">Standard Operating Procedure</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                    Driver Rule
                  </span>
                </div>

                <ul className="space-y-2.5 text-slate-700 pl-4 list-disc text-xs leading-relaxed">
                  <li>
                    <strong>{language === 'km' ? 'បិទប័ណ្ណកូដ QR នៅច្រកទ្វារ' : 'Affix Sticker at Passenger Entrance'}:</strong>{' '}
                    {language === 'km'
                      ? 'ត្រូវប្រាកដថាប័ណ្ណកូដ QR នេះត្រូវបានបិទជាប់យ៉ាងស្អាតនៅលើកញ្ចក់ទ្វារឡើង ឬក្បែរតាប្លូ ងាយស្រួលមើល និងមានពន្លឺគ្រប់គ្រាន់។'
                      : 'Ensure the laminated official QR sticker is firmly posted on the passenger boarding door or front dashboard in clear view.'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'ស្កេនពេលសិស្សឈានជើងឡើងរថយន្ត' : 'Scan at Every Student Stop'}:</strong>{' '}
                    {language === 'km'
                      ? 'នៅពេលរថយន្តមកដល់ចំណតនីមួយៗ អ្នកបើកបរត្រូវបើកម៉ាស៊ីនស្កេនក្នុង App ហើយស្កេនកាតកូដ QR របស់សិស្សភ្លាមៗ។'
                      : 'Upon reaching each stop, the driver opens the in-app scanner to scan each student’s digital QR pass as they board.'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'ការប្តូរទៅចំណតបន្ទាប់ស្វ័យប្រវត្ត' : 'Automatic Navigation Advance'}:</strong>{' '}
                    {language === 'km'
                      ? 'ពេលស្កេនជោគជ័យ ប្រព័ន្ធនឹងកត់ត្រាម៉ោងឡើងរថយន្ត ប្តូរស្ថានភាពសិស្សទៅ "Picked Up" និងនាំផ្លូវទៅកាន់ចំណតបន្ទាប់ភ្លាម។'
                      : 'Upon verification, the app marks the student "Picked Up", records timestamp, and immediately plots navigation to the next student stop.'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'ករណីសិស្សមិនបានជិះ (អវត្តមាន)' : 'If Student is Absent / Not Boarding'}:</strong>{' '}
                    {language === 'km'
                      ? 'ប្រសិនបើសិស្សមិនបានមកចំណត អ្នកបើកបរចុច "Mark Absent" ដើម្បីផ្ញើសារដាស់តឿនទៅអាណាព្យាបាល និងរដ្ឋបាលសាលាថា សិស្សមិនបានឡើងរថយន្តទេ។'
                      : 'If student is not present, driver taps "Mark Absent", instantly dispatching alerts that the child did NOT board the bus today.'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'ជម្រើសចុចបញ្ជាក់ដោយដៃ (Manual Option)' : 'Manual Tap Confirmation'}:</strong>{' '}
                    {language === 'km'
                      ? 'ប្រសិនបើកាមេរ៉ារអាក់រអួល ឬសិស្សភ្លេចកាត អ្នកបើកបរអាចចុចឈ្មោះសិស្សដោយផ្ទាល់លើបញ្ជីផ្លូវ ដើម្បីបញ្ជាក់ការឡើងរថយន្ត។'
                      : 'If camera is smudged or student forgot their card, driver taps the student card in the manifest for 1-tap manual confirmation.'}
                  </li>
                </ul>
              </div>

              {/* Note Section 2: For Parents */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                      👨‍👩‍👧
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        {language === 'km' ? '២. កំណត់ចំណាំសម្រាប់អាណាព្យាបាល (Parent Notification & Peace of Mind)' : '2. Parent Notification Protocol'}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-semibold">Real-Time Transparency</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                    Parent Rule
                  </span>
                </div>

                <ul className="space-y-2.5 text-slate-700 pl-4 list-disc text-xs leading-relaxed">
                  <li>
                    <strong>{language === 'km' ? 'ដឹងច្បាស់ថាកូននៅលើរថយន្ត ឬអត់' : 'Know Whether Child is on Bus or Not'}:</strong>{' '}
                    {language === 'km'
                      ? 'ភ្លាមៗនៅពេលអ្នកបើកបរស្កេន អាណាព្យាបាលនឹងទទួលបានសារ Push Notification & SMS៖ "កូនរបស់អ្នក [ឈ្មោះ] បានឡើងរថយន្តក្រុងលេខ ០៣ នៅម៉ោង... រថយន្តកំពុងបន្តដំណើរ"។'
                      : 'The instant driver scans, parent receives immediate push & SMS: "Your child [Name] is safely on Bus 03 at [Time]. The bus is heading to school."'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'សារដាស់តឿនពេលមិនបានឡើងរថយន្ត' : 'Instant Alert if Not On Bus'}:</strong>{' '}
                    {language === 'km'
                      ? 'ប្រសិនបើសិស្សមិនបានឡើងរថយន្ត អាណាព្យាបាលទទួលបានសារព្រមានភ្លាមៗដើម្បីផ្ទៀងផ្ទាត់សុវត្ថិភាព។'
                      : 'If child missed the pickup, parent receives instant warning: "Alert: [Name] did NOT board the bus today."'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'តាមដានផែនទី GPS ផ្ទាល់' : 'Live Interactive Map Telemetry'}:</strong>{' '}
                    {language === 'km'
                      ? 'អាណាព្យាបាលអាចបើកទំព័រ Live Tracking ដើម្បីមើលទីតាំងរថយន្ត ល្បឿន និងម៉ោងមកដល់សាលា (ETA) ដោយផ្ទាល់។'
                      : 'Parents can monitor real-time bus GPS movements, vehicle speed, and estimated arrival time directly on the map.'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'គ្មានការផ្ញើសារស្ទួន' : 'Zero Duplicate Notifications'}:</strong>{' '}
                    {language === 'km'
                      ? 'ប្រព័ន្ធការពារការផ្ញើសារស្ទួន (Duplicate Prevention) ធានាថាមិនមានការរំខានសារដដែលៗឡើយ។'
                      : 'Built-in deduplication prevents multiple notifications for the same boarding event.'}
                  </li>
                </ul>
              </div>

              {/* Note Section 3: For School Admin */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base">
                      🏫
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        {language === 'km' ? '៣. កំណត់ចំណាំសម្រាប់រដ្ឋបាលសាលា (School Admin Fleet Dispatch)' : '3. School Administration Dispatch Oversight'}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-semibold">Fleet Governance</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px] uppercase">
                    Admin Rule
                  </span>
                </div>

                <ul className="space-y-2.5 text-slate-700 pl-4 list-disc text-xs leading-relaxed">
                  <li>
                    <strong>{language === 'km' ? 'ការគ្រប់គ្រងវត្តមានតាមរថយន្តនីមួយៗ' : 'Real-Time Bus Rider Manifest'}:</strong>{' '}
                    {language === 'km'
                      ? 'រដ្ឋបាលសាលាមើលឃើញចំនួនសិស្សដែលបានឡើងរថយន្ត សិស្សដែលកំពុងរង់ចាំ និងទំហំផ្ទុកកៅអីក្នុងពេលជាក់ស្តែង។'
                      : 'School dispatchers see exact real-time passenger counts, completed stops, and seat occupancy across the fleet.'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'ការព្រមានករណីឡើងខុសរថយន្ត (Wrong Bus Conflict)' : 'Wrong Bus Detection & Warnings'}:</strong>{' '}
                    {language === 'km'
                      ? 'ប្រសិនបើសិស្សស្កេនឡើងខុសរថយន្ត ប្រព័ន្ធនឹងរោទ៍ព្រមានភ្លាមៗ និងទាមទារការផ្ទៀងផ្ទាត់ពីអ្នកបើកបរ/រដ្ឋបាល។'
                      : 'If a student boards the wrong bus, an immediate high-priority warning is raised requiring driver and admin verification.'}
                  </li>
                  <li>
                    <strong>{language === 'km' ? 'កំណត់ត្រាសុវត្ថិភាពស្របតាមក្រសួង' : 'Ministry Compliance & Audit Logs'}:</strong>{' '}
                    {language === 'km'
                      ? 'រក្សាទុកទិន្នន័យម៉ោងឡើងរថយន្ត ទីតាំង GPS និងរបាយការណ៍ធ្វើដំណើរស្របតាមស្តង់ដារក្រសួងអប់រំ និងសាធារណការ។'
                      : 'Complete timestamped audit trails of boarding events, GPS logs, and safety reports for administrative records.'}
                  </li>
                </ul>
              </div>

            </div>
          )}

          {/* =========================================================================
             TAB 4: SIMULATE BOARDING ALERTS VIEW
             ========================================================================= */}
          {activeTab === 'simulate' && (
            <div className="space-y-4 text-xs">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase">
                  <Smartphone className="w-4 h-4" />
                  <span>{language === 'km' ? 'សាកល្បងដំណើរការផ្ញើសារដាស់តឿន' : 'Simulate Boarding Alert Trigger'}</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {language === 'km'
                    ? `ផ្ទៀងផ្ទាត់ការផ្ញើសារជូនដំណឹងទៅអាណាព្យាបាល និងរដ្ឋបាលសាលា (${bus.busNumber})`
                    : `Test Real-Time Parent & Admin Alert Dispatch for ${bus.busNumber}`}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'km'
                    ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីសាកល្បងមុខងារផ្ញើសារដាស់តឿន។ អ្នកនឹងឃើញសារជូនដំណឹងបង្ហាញលើកណ្តឹង (Notification Bell) សម្រាប់ទាំងអាណាព្យាបាល និងរដ្ឋបាលសាលា។'
                    : 'Click below to test the automatic alert dispatch. Alerts will be recorded and visible in the in-app notification center for both Parent and School Admin.'}
                </p>

                {simulatedAlertSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{simulatedAlertSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleTriggerSimulation('on_bus')}
                    className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex flex-col items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                    <span className="text-sm">
                      {language === 'km' ? 'តេស្ត៖ សិស្សបានឡើងរថយន្ត' : 'Test: Child IS ON the Bus'}
                    </span>
                    <span className="text-[10px] text-emerald-100 font-normal">
                      {language === 'km' ? 'ជូនដំណឹងអាណាព្យាបាល & រដ្ឋបាល (Boarded)' : 'Alerts Parent & Admin (Picked Up)'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleTriggerSimulation('not_on_bus')}
                    className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold flex flex-col items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
                  >
                    <AlertTriangle className="w-6 h-6 text-amber-200" />
                    <span className="text-sm">
                      {language === 'km' ? 'តេស្ត៖ សិស្សមិនបានឡើងរថយន្ត' : 'Test: Child NOT ON Bus'}
                    </span>
                    <span className="text-[10px] text-amber-100 font-normal">
                      {language === 'km' ? 'ជូនដំណឹងអវត្តមាន (Absent Alert)' : 'Alerts Parent & Admin (Absent Notice)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Registered Riders List on this Bus */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs">
                    {language === 'km' ? `បញ្ជីសិស្សក្នុងរថយន្ត ${bus.busNumber}` : `Registered Student Manifest for ${bus.busNumber}`}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {busStudents.length} {language === 'km' ? 'សិស្ស' : 'Students'}
                  </span>
                </div>

                <div className="space-y-2">
                  {busStudents.map((student, idx) => (
                    <div 
                      key={student.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <strong className="text-slate-900 block font-bold">{student.name}</strong>
                          <span className="text-[10px] text-slate-500 truncate block max-w-[200px] sm:max-w-xs">
                            {student.pickupAddress}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          student.status === 'picked_up' ? 'bg-emerald-100 text-emerald-700' :
                          student.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {student.status === 'picked_up' ? (language === 'km' ? 'នៅលើរថយន្ត' : 'On Bus') :
                           student.status === 'absent' ? (language === 'km' ? 'អវត្តមាន' : 'Not on Bus') :
                           (language === 'km' ? 'រង់ចាំ' : 'Waiting')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">
              {language === 'km' ? 'កូដ QR សម្គាល់រថយន្តផ្លូវការ • បិទលើរថយន្តលេខ' : 'Official Vehicle Pass • Bus Number'}: <strong className="text-slate-900">{bus.busNumber}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            {language === 'km' ? 'បិទ (Close)' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
