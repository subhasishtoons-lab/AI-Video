import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Copy,
  Check,
  Sparkles,
  Repeat,
  Gauge,
} from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoPlayerProps {
  video: GeneratedVideo;
  onRemix?: (video: GeneratedVideo) => void;
  onClose?: () => void;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onRemix,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 8);
  const [isMuted, setIsMuted] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleTimeUpdate = () => {
      setCurrentTime(vid.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (vid.duration && !isNaN(vid.duration)) {
        setDuration(vid.duration);
      }
    };

    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    vid.addEventListener('timeupdate', handleTimeUpdate);
    vid.addEventListener('loadedmetadata', handleLoadedMetadata);
    vid.addEventListener('ended', handleEnded);

    return () => {
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
      vid.removeEventListener('ended', handleEnded);
    };
  }, [isLooping]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleDownload = () => {
    if (!video.videoUrl) return;
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `${video.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_tunsu.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(video.prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Compute container aspect ratio class
  const getAspectClass = () => {
    switch (video.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[680px] mx-auto';
      case '1:1':
        return 'aspect-square max-h-[580px] mx-auto';
      case '4:3':
        return 'aspect-[4/3] max-h-[580px] mx-auto';
      case '16:9':
      default:
        return 'aspect-video w-full';
    }
  };

  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Video Canvas Container */}
      <div className={`relative bg-black flex items-center justify-center overflow-hidden ${getAspectClass()}`}>
        {video.videoUrl ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            autoPlay={autoPlay}
            loop={isLooping}
            muted={isMuted}
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            {/* Visual play cue */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => onRemix?.(video)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold backdrop-blur-md shadow-lg transition-transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Render Live Stream</span>
              </button>
            </div>
          </div>
        )}

        {/* Ambient Top Overlay with Engine tag */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-md border border-slate-800/80">
            <span className="font-medium text-white">{video.title}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="font-mono text-slate-400 uppercase text-[11px]">{video.aspectRatio}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800/80">
            <span>{video.engine === 'free-tunsu' ? 'Tunsu High-Speed' : video.engine === 'runway-gen3' ? 'Runway Gen-3' : 'OpenAI Sora'}</span>
          </div>
        </div>

        {/* Center Play/Pause button on hover if playing */}
        {video.videoUrl && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
        )}
      </div>

      {/* Scrub bar & playback controls */}
      {video.videoUrl && (
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800">
          {/* Progress Timeline */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {currentTime.toFixed(1)}s
            </span>
            <input
              type="range"
              min="0"
              max={duration || 8}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {duration.toFixed(1)}s
            </span>
          </div>

          {/* Action strip */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                }}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-1.5 rounded transition-colors ${
                  isLooping ? 'text-indigo-400 bg-indigo-500/10' : 'hover:bg-slate-800'
                }`}
                title="Loop Video"
              >
                <Repeat className="w-4 h-4" />
              </button>
              <button
                onClick={toggleMute}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={cycleSpeed}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono tabular-nums text-slate-300 transition-colors"
                title="Playback Speed"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>{playbackRate}x</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-all"
                title="Download MP4 / WebM"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Director Prompt & Remix Section */}
      <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span>Director Prompt</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{video.style.replace('-', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{video.duration}s</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-normal line-clamp-3">
              {video.prompt}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyPrompt}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
              title="Copy prompt"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            {onRemix && (
              <button
                onClick={() => onRemix(video)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Remix in Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
