import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../../context/AppContext';
import { Student, Bus, Route, Driver } from '../../types';
import { 
  Camera, QrCode, X, CheckCircle2, AlertTriangle, XCircle, 
  UserCheck, ShieldCheck, RefreshCw, Volume2, Search, ArrowRight,
  MapPin, Phone, AlertCircle, Zap, Keyboard, HelpCircle, FileText, Bus as BusIcon
} from 'lucide-react';
import { BusBoardingStickerQRModal } from '../common/BusBoardingStickerQRModal';

interface DriverQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentVerified?: (student: Student) => void;
  activeBus?: Bus;
  activeRoute?: Route;
}

export function DriverQRScannerModal({
  isOpen,
  onClose,
  onStudentVerified,
  activeBus,
  activeRoute
}: DriverQRScannerModalProps) {
  const { 
    students, buses, routes, confirmStudentPickup, markStudentAbsent,
    language, localize, t, formatNumber 
  } = useApp();

  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showStickerModal, setShowStickerModal] = useState(false);

  // Verification Result State
  const [verificationResult, setVerificationResult] = useState<{
    type: 'success' | 'already_picked_up' | 'wrong_bus' | 'invalid_token' | 'bus_sticker_verified';
    student?: Student;
    matchedBus?: Bus;
    messageKm: string;
    messageEn: string;
    details?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const busId = activeBus?.id || 'bus-101';
  const routeId = activeRoute?.id || 'rt-1';

  // Sound generator
  const playSound = (type: 'success' | 'warning' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(370, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio fallback
    }
  };

  // Start Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API unavailable in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unsupported, using interactive fallback:', err);
      setCameraError(err.message || 'Camera inaccessible');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode]);

  // QR Code Frame Analysis Loop
  const tickScan = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tickScan);
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleProcessScannedToken(code.data);
          return; // pause scan while displaying result
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  // Process & Verify Scanned Token (Requirement 3, 5, 6, 7)
  const handleProcessScannedToken = async (rawToken: string, forceOverride = false) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const cleanToken = rawToken.trim().toUpperCase();

    // Check if token is a Bus Door Boarding Sticker QR Code
    if (cleanToken.includes('SR-BUS') || cleanToken.includes('SCHOOLROUT.AI/BUS') || cleanToken.startsWith('BUS-')) {
      playSound('success');
      const matchedBus = buses.find(b => 
        cleanToken.includes(b.id.toUpperCase()) || 
        cleanToken.includes(b.busNumber.replace(/\s+/g, '').toUpperCase())
      ) || activeBus || buses[0];

      setVerificationResult({
        type: 'bus_sticker_verified',
        matchedBus,
        messageKm: `✓ បានផ្ទៀងផ្ទាត់ប័ណ្ណកូដ QR រថយន្តជោគជ័យ! ${matchedBus.busNumber} (${matchedBus.plateNumber}) កំពុងដំណើរការទទួលសិស្ស។`,
        messageEn: `✓ Bus Door QR Sticker Verified! ${matchedBus.busNumber} (${matchedBus.plateNumber}) active for boarding.`,
        details: `Assigned: ${activeRoute?.name || 'Route 1'} • Capacity: ${matchedBus.capacity || 29} Seats • Parent & Admin Live Alert Sync Active`
      });
      setIsProcessing(false);
      return;
    }

    // 7. Secure Token Lookup: Retrieve student record from database by random token
    const student = students.find(s => 
      (s.qrToken && s.qrToken.toUpperCase() === cleanToken) ||
      s.id.toUpperCase() === cleanToken
    );

    // Case 1: Invalid Token
    if (!student) {
      playSound('error');
      setVerificationResult({
        type: 'invalid_token',
        messageKm: 'កូដ QR មិនត្រឹមត្រូវ ឬមិនស្គាល់អត្តសញ្ញាណសិស្ស!',
        messageEn: 'Invalid QR Code: Identifier not recognized in database.',
        details: `Scanned Token: ${cleanToken}`
      });
      setIsProcessing(false);
      return;
    }

    // Case 2: Duplicate Scan (Requirement 5)
    if (student.status === 'picked_up' && !forceOverride) {
      playSound('warning');
      setVerificationResult({
        type: 'already_picked_up',
        student,
        messageKm: `សិស្ស ${student.name} បានឡើងរថយន្តរួចរាល់ហើយនៅម៉ោង ${student.pickedUpAt || '07:35 AM'}។ បានទប់ស្កាត់ការស្កេនស្ទួន។`,
        messageEn: `${student.name} was already marked as Picked Up at ${student.pickedUpAt || '07:35 AM'}. Duplicate scan prevented.`,
        details: `Stop: ${student.pickupAddress}`
      });
      setIsProcessing(false);
      return;
    }

    // Case 3: Wrong Bus / Wrong Route Warning (Requirement 6)
    const isWrongBus = student.busId && student.busId !== busId;
    const isWrongRoute = student.routeId && student.routeId !== routeId;
    if ((isWrongBus || isWrongRoute) && !forceOverride) {
      playSound('warning');
      setVerificationResult({
        type: 'wrong_bus',
        student,
        messageKm: `ការព្រមាន៖ សិស្ស ${student.name} មិនត្រូវបានចាត់តាំងសម្រាប់រថយន្តនេះទេ (រថយន្តកំណត់៖ ${student.busId || 'Bus 02'})! ត្រូវការការផ្ទៀងផ្ទាត់ពីអ្នកបើកបរ។`,
        messageEn: `Warning: ${student.name} is registered for ${student.busId || 'Bus 02'} (Route ${student.routeId || '2'}), not this bus (${activeBus?.busNumber || 'Bus 03'})! Verification required.`,
        details: `Assigned Bus: ${student.busId} • Current Bus: ${activeBus?.busNumber || 'Bus 03'}`
      });
      setIsProcessing(false);
      return;
    }

    // Case 4: Successful Verification (Requirement 3, 4)
    playSound('success');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await confirmStudentPickup(student.id, nowTime);

    setVerificationResult({
      type: 'success',
      student,
      messageKm: `✓ បានផ្ទៀងផ្ទាត់ជោគជ័យ! ${student.name} បានឡើងរថយន្តនៅម៉ោង ${nowTime}។ បានជូនដំណឹងទៅអាណាព្យាបាលរួចរាល់។`,
      messageEn: `✓ Verified successfully! ${student.name} boarded at ${nowTime}. Instant parent notification sent.`,
      details: `${student.grade} • Stop #${student.pickupOrder || 1}: ${student.pickupAddress}`
    });

    if (onStudentVerified) {
      onStudentVerified(student);
    }

    setIsProcessing(false);
  };

  // Reset Scanner for next student
  const handleResetScan = () => {
    setVerificationResult(null);
    setManualInput('');
    if (scanMode === 'camera' && cameraActive) {
      requestAnimationFrame(tickScan);
    }
  };

  // Quick Demo Simulator Scans
  const handleSimulateScan = (token: string) => {
    handleProcessScannedToken(token);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-white">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span>{language === 'km' ? 'ប្រព័ន្ធស្កេនកូដ QR ទទួលសិស្ស' : 'Student QR Code Boarding Scanner'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30">
                  {activeBus?.busNumber || 'Bus 03'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'km' 
                  ? 'ស្កេនកាតសិស្សពេលឡើងរថយន្ត ដើម្បីកត់ត្រាវត្តមាន និងជូនដំណឹងអាណាព្យាបាលស្វ័យប្រវត្ត' 
                  : 'Scan digital student ID pass on bus boarding for automated attendance & parent alert.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStickerModal(true)}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <BusIcon className="w-4 h-4" />
              <span>{language === 'km' ? 'ប័ណ្ណបិទលើឡាន & កំណត់ចំណាំ' : 'Bus Sticker & Notes'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Camera Scanner vs Manual Confirmation (Requirement 8) */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'km' ? 'កាមេរ៉ាស្កេន (Camera Scanner)' : 'Live Camera Scanner'}</span>
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              scanMode === 'manual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>{language === 'km' ? 'ផ្ទៀងផ្ទាត់ដោយដៃ (Manual Entry)' : 'Manual Confirmation'}</span>
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* A. If Verification Result is Active */}
          {verificationResult ? (
            <div className={`p-5 rounded-3xl border space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
              verificationResult.type === 'success' ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200' :
              verificationResult.type === 'bus_sticker_verified' ? 'bg-indigo-950/70 border-amber-400/50 text-indigo-100 shadow-xl' :
              verificationResult.type === 'wrong_bus' ? 'bg-amber-950/50 border-amber-500/50 text-amber-200' :
              verificationResult.type === 'already_picked_up' ? 'bg-blue-950/50 border-blue-500/50 text-blue-200' :
              'bg-rose-950/50 border-rose-500/50 text-rose-200'
            }`}>
              
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-lg ${
                  verificationResult.type === 'success' ? 'bg-emerald-600 text-white' :
                  verificationResult.type === 'bus_sticker_verified' ? 'bg-amber-400 text-slate-950' :
                  verificationResult.type === 'wrong_bus' ? 'bg-amber-500 text-white animate-pulse' :
                  verificationResult.type === 'already_picked_up' ? 'bg-blue-600 text-white' :
                  'bg-rose-600 text-white'
                }`}>
                  {verificationResult.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
                  {verificationResult.type === 'bus_sticker_verified' && <BusIcon className="w-8 h-8" />}
                  {verificationResult.type === 'wrong_bus' && <AlertTriangle className="w-8 h-8" />}
                  {verificationResult.type === 'already_picked_up' && <UserCheck className="w-8 h-8" />}
                  {verificationResult.type === 'invalid_token' && <XCircle className="w-8 h-8" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10">
                      {verificationResult.type === 'bus_sticker_verified' ? 'BUS DOOR STICKER ACTIVE' : verificationResult.type.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono opacity-70">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white mt-1 leading-snug">
                    {language === 'km' ? verificationResult.messageKm : verificationResult.messageEn}
                  </h4>
                  
                  {verificationResult.details && (
                    <p className="text-xs opacity-90 mt-1 font-mono">
                      {verificationResult.details}
                    </p>
                  )}
                </div>
              </div>

              {/* If Bus Door Sticker is Verified, Show Quick Boarding Actions for Students on this Bus */}
              {verificationResult.type === 'bus_sticker_verified' && verificationResult.matchedBus && (
                <div className="space-y-3 pt-2 border-t border-slate-700/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      {language === 'km' 
                        ? `បញ្ជីសិស្សឡើងរថយន្ត ${verificationResult.matchedBus.busNumber} (ជូនដំណឹងអាណាព្យាបាល & រដ្ឋបាល)`
                        : `Assigned Students for ${verificationResult.matchedBus.busNumber} (Alerts Parents & Admin)`}
                    </span>
                    <button
                      onClick={() => setShowStickerModal(true)}
                      className="text-xs text-blue-300 hover:text-white underline font-bold"
                    >
                      {language === 'km' ? 'មើលប័ណ្ណបិទលើរថយន្ត' : 'View Printable Door Sticker'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {students
                      .filter(s => s.busId === verificationResult.matchedBus?.id || s.routeId === activeRoute?.id)
                      .map((stu, sIdx) => (
                        <div key={stu.id} className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-bold font-mono">#{sIdx + 1}</span>
                              <strong className="text-white font-extrabold">{stu.name}</strong>
                              <span className="text-slate-400 text-[10px]">({stu.grade})</span>
                            </div>
                            <span className="text-slate-400 text-[10px] truncate block max-w-[210px]">{stu.pickupAddress}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {stu.status === 'picked_up' ? (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                                {language === 'km' ? `✓ លើរថយន្ត (${stu.pickedUpAt || '07:35'})` : `✓ On Bus (${stu.pickedUpAt || '07:35'})`}
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={async () => {
                                    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    await confirmStudentPickup(stu.id, timeStr);
                                    playSound('success');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] cursor-pointer shadow-sm active:scale-95"
                                  title="Mark student boarded bus (alerts parent & admin)"
                                >
                                  {language === 'km' ? 'ឡើងរថយន្ត' : 'Mark On Bus'}
                                </button>
                                <button
                                  onClick={() => {
                                    markStudentAbsent(stu.id, 'អវត្តមានមិនបានជិះ');
                                    playSound('warning');
                                  }}
                                  className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold text-[10px] cursor-pointer"
                                  title="Mark student absent (alerts parent & admin)"
                                >
                                  {language === 'km' ? 'អវត្តមាន' : 'Absent'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Student Verified Profile Card */}
              {verificationResult.student && (
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-white space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-sm font-extrabold text-white block">
                        {verificationResult.student.name}
                      </strong>
                      <span className="text-slate-400">
                        {verificationResult.student.grade} • ID: #{verificationResult.student.id}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Token ID</span>
                      <span className="font-mono text-amber-300 font-bold text-xs">
                        {verificationResult.student.qrToken || 'SR-SEC-PASS'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300 pt-1 border-t border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{verificationResult.student.pickupAddress}</span>
                  </div>
                </div>
              )}

              {/* Buttons: Wrong Bus Override option or Next Scan */}
              <div className="flex gap-2 pt-2">
                {verificationResult.type === 'wrong_bus' && verificationResult.student && (
                  <button
                    onClick={() => handleProcessScannedToken(verificationResult.student!.qrToken || verificationResult.student!.id, true)}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{language === 'km' ? 'អនុញ្ញាតឡើងរថយន្ត (Override & Board)' : 'Override & Permit Boarding'}</span>
                  </button>
                )}

                <button
                  onClick={handleResetScan}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'km' ? 'ស្កេនសិស្សបន្ទាប់ (Scan Next Student)' : 'Scan Next Student'}</span>
                </button>
              </div>

            </div>
          ) : (
            <>
              {/* B. Camera Viewfinder Mode */}
              {scanMode === 'camera' && (
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-slate-800 shadow-inner">
                    {/* Real Video Element */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Laser Scanner Viewfinder Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-56 border-2 border-blue-500 rounded-3xl relative shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                        {/* Target Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>
                        
                        {/* Animated Laser Scan Line */}
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#38bdf8] animate-bounce absolute top-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>

                    {/* Camera Status Label */}
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-slate-300 flex items-center gap-1.5 border border-slate-800">
                      <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                      <span>{cameraActive ? 'Camera Active' : 'Standby / Interactive Mode'}</span>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="bg-amber-950/40 border border-amber-800/40 p-3 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {language === 'km' 
                          ? 'កាមេរ៉ាមិនអាចប្រើបានក្នុងបរិស្ថាននេះទេ។ សូមប្រើប៊ូតុងតេស្តស្កេនរហ័សខាងក្រោម ឬបញ្ចូលលេខកូដដោយដៃ។' 
                          : 'Camera access unavailable in preview iframe. Use one-tap test scan simulator buttons below or manual entry.'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* C. Manual Confirmation Mode (Requirement 8) */}
              {scanMode === 'manual' && (
                <div className="space-y-4 bg-slate-950/70 p-4 rounded-3xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      {language === 'km' ? 'បញ្ចូលលេខកូដសម្ងាត់សិស្ស ឬលេខសម្គាល់' : 'Enter Student Security Token or ID'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={e => setManualInput(e.target.value)}
                        placeholder="e.g. SR-SEC-8F29A4D1 or stu-1"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono font-bold"
                      />
                      <button
                        onClick={() => handleProcessScannedToken(manualInput)}
                        disabled={!manualInput.trim()}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        {language === 'km' ? 'ផ្ទៀងផ្ទាត់' : 'Verify'}
                      </button>
                    </div>
                  </div>

                  {/* Manual Quick Rider Checklist Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">
                      {language === 'km' ? 'ឬចុចជ្រើសរើសសិស្សដោយផ្ទាល់' : 'Or select student directly from route checklist'}:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {students
                        .filter(s => s.busId === busId || s.routeId === routeId)
                        .map((st, idx) => {
                          const isPicked = st.status === 'picked_up';
                          return (
                            <button
                              key={st.id}
                              onClick={() => handleProcessScannedToken(st.qrToken || st.id)}
                              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                            >
                              <div>
                                <strong className="text-white block font-bold">#{st.pickupOrder || idx + 1} {st.name}</strong>
                                <span className="text-[10px] text-slate-400">{st.grade}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                isPicked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {isPicked ? 'Boarded' : 'Waiting'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* D. ONE-TAP TEST SCANNER SIMULATOR BUTTONS (Requirement 2, 5, 6) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'km' ? 'តេស្តស្កេនកូដ QR សាកល្បងរហ័ស (Interactive Test Scanner)' : 'One-Tap Test Scanners (Simulate QR Scan)'}
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">1-Tap Testing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Test 1: Stop #1 Sokha Sarya (Valid) */}
                  <button
                    onClick={() => handleSimulateScan('SR-SEC-8F29A4D1')}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center justify-between transition-all cursor-pointer group active:scale-98"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold block">✓ VALID STOP #1</span>
                      <strong className="text-white text-xs block group-hover:text-blue-300">Sokha Sarya (Grade 9A)</strong>
                      <span className="text-[10px] text-slate-400 font-mono">SR-SEC-8F29A4D1</span>
                    </div>
                    <span className="w-7 h-7 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      Scan
                    </span>
                  </button>

                  {/* Test 2: Stop #2 Chhoun Vanna (Valid) */}
                  <button
                    onClick={() => handleSimulateScan('SR-SEC-3C71B8E5')}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left flex items-center justify-between transition-all cursor-pointer group active:scale-98"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold block">✓ VALID STOP #2</span>
                      <strong className="text-white text-xs block group-hover:text-blue-300">Chhoun Vanna (Grade 8B)</strong>
                      <span className="text-[10px] text-slate-400 font-mono">SR-SEC-3C71B8E5</span>
                    </div>
                    <span className="w-7 h-7 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      Scan
                    </span>
                  </button>

                  {/* Test 3: Rath Monika (Wrong Bus Test - Bus 02) */}
                  <button
                    onClick={() => handleSimulateScan('SR-SEC-1D88E3B4')}
                    className="p-3 rounded-2xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/40 text-left flex items-center justify-between transition-all cursor-pointer group active:scale-98"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-amber-400 font-bold block">⚠️ WRONG BUS TEST</span>
                      <strong className="text-white text-xs block group-hover:text-amber-300">Rath Monika (Bus 02)</strong>
                      <span className="text-[10px] text-amber-300/80 font-mono">Triggers Requirement 6 Warning</span>
                    </div>
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                      Warn
                    </span>
                  </button>

                  {/* Test 4: Fake / Unrecognized Token */}
                  <button
                    onClick={() => handleSimulateScan('SR-SEC-UNKNOWN-999')}
                    className="p-3 rounded-2xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-left flex items-center justify-between transition-all cursor-pointer group active:scale-98"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-rose-400 font-bold block">✕ INVALID QR TEST</span>
                      <strong className="text-white text-xs block group-hover:text-rose-300">Unrecognized Code</strong>
                      <span className="text-[10px] text-rose-300/80 font-mono">Unknown Token Error</span>
                    </div>
                    <span className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                      Fail
                    </span>
                  </button>

                  {/* Test 5: Bus Door Boarding Pass Sticker QR */}
                  <button
                    onClick={() => handleSimulateScan(`SR-BUS-${activeBus?.busNumber.replace(/\s+/g, '').toUpperCase() || 'BUS03'}-${activeBus?.id || 'bus-101'}`)}
                    className="sm:col-span-2 p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/50 text-left flex items-center justify-between transition-all cursor-pointer group active:scale-98"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-amber-300 font-black block flex items-center gap-1">
                        <BusIcon className="w-3 h-3 text-amber-400" />
                        🏷️ BUS DOOR STICKER SCAN TEST ({activeBus?.busNumber || 'Bus 03'})
                      </span>
                      <strong className="text-white text-xs block group-hover:text-amber-200">
                        {language === 'km' ? 'ស្កេនប័ណ្ណកូដ QR បិទលើរថយន្ត (Door Boarding Pass)' : 'Official Bus Door Boarding Pass QR Sticker'}
                      </strong>
                      <span className="text-[10px] text-amber-300/80 font-mono">Verifies vehicle & synchronizes parent & school admin alerts</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-md">
                      Scan Sticker
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 px-5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'km' ? 'សុវត្ថិភាពខ្ពស់៖ កូដ QR មិនផ្ទុកទិន្នន័យផ្ទាល់ខ្លួន' : 'Privacy Protected: Pure random student token with database matching.'}</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white font-bold cursor-pointer">
            {language === 'km' ? 'បិទផ្ទាំង' : 'Close'}
          </button>
        </div>

      </div>

      {/* Bus Door Sticker & In-App Notes Modal */}
      <BusBoardingStickerQRModal
        bus={activeBus}
        isOpen={showStickerModal}
        onClose={() => setShowStickerModal(false)}
      />
    </div>
  );
}
