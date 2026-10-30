import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, Timer, FlipHorizontal, AlertCircle } from 'lucide-react';

interface WebcamCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    stopStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unable to access webcam. Please allow camera permissions.';
      setError(errorMsg);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedImage(null);
      setCountdown(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Handle shutter snap
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      if (isMirrored && facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
    }
  };

  const handleCaptureWithTimer = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white font-display">
              {capturedImage ? 'Review Snapshot' : 'Webcam Frame Capture'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          {error ? (
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
              <p className="text-sm font-medium text-white mb-2">Camera Access Blocked or Unavailable</p>
              <p className="text-xs text-slate-400 mb-4">{error}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Retry Access
                </button>
                <button
                  onClick={() => {
                    // Generate fallback studio portrait snapshot
                    const canvas = document.createElement('canvas');
                    canvas.width = 1280;
                    canvas.height = 720;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
                      grad.addColorStop(0, '#1e1b4b');
                      grad.addColorStop(1, '#0f172a');
                      ctx.fillStyle = grad;
                      ctx.fillRect(0, 0, 1280, 720);
                      ctx.fillStyle = '#6366f1';
                      ctx.beginPath();
                      ctx.arc(640, 360, 160, 0, Math.PI * 2);
                      ctx.fill();
                      setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
                      setError(null);
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Use Demo Frame
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured frame"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  isMirrored && facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-7xl font-bold font-display text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Camera Grid lines guide */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>
            </>
          )}

          {/* Flash animation */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-200" />
          )}
        </div>

        {/* Toolbar & Controls */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {capturedImage ? (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCapturedImage(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/25"
              >
                <Check className="w-4 h-4" />
                <span>Transform to Video</span>
              </button>
            </div>
          ) : (
            <>
              {/* Secondary toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCamera}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Switch Front/Back Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMirrored((m) => !m)}
                  className={`p-2.5 rounded-lg transition-colors ${
                    isMirrored
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Mirror Camera View"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCaptureWithTimer}
                  disabled={countdown !== null}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  title="3-Second Timer"
                >
                  <Timer className="w-4 h-4" />
                  <span>3s Timer</span>
                </button>
              </div>

              {/* Shutter Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={takeSnapshot}
                  disabled={countdown !== null}
                  className="relative group p-1 rounded-full border-2 border-white/60 hover:border-white transition-all transform active:scale-95"
                  title="Capture Frame"
                >
                  <div className="w-12 h-12 rounded-full bg-white group-hover:bg-indigo-400 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-900" />
                  </div>
                </button>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">1080P HD Ready</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
