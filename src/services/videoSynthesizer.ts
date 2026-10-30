import { GenerationSettings, AspectRatio, VisualStyle, MotionPreset } from '../types';

interface Dimensions {
  width: number;
  height: number;
}

function getDimensions(aspectRatio: AspectRatio): Dimensions {
  switch (aspectRatio) {
    case '16:9':
      return { width: 960, height: 540 };
    case '9:16':
      return { width: 540, height: 960 };
    case '1:1':
      return { width: 640, height: 640 };
    case '4:3':
      return { width: 800, height: 600 };
    default:
      return { width: 960, height: 540 };
  }
}

export interface VideoSynthesisResult {
  videoBlob: Blob;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export async function synthesizeVideo(
  settings: GenerationSettings,
  onProgress?: (percent: number, status: string) => void
): Promise<VideoSynthesisResult> {
  const { width, height } = getDimensions(settings.aspectRatio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Load source image if provided, otherwise generate a procedural backdrop
  let sourceImg: HTMLImageElement | null = null;
  if (settings.imageSource?.dataUrl) {
    onProgress?.(10, 'Loading source frame...');
    sourceImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = settings.imageSource!.dataUrl;
    });
  }

  // Determine media stream format
  const stream = canvas.captureStream(30);

  // Optional: create synthesized cinematic audio drone
  let audioContext: AudioContext | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const dest = audioContext.createMediaStreamDestination();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, audioContext.currentTime); // Deep cinematic sub-bass
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + settings.duration);

      osc.connect(gain);
      gain.connect(dest);
      osc.start();

      // Add audio track to stream if supported
      dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }
  } catch {
    // Audio synthesis is optional; fallback to silent stream
  }

  // MediaRecorder setup
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    videoBitsPerSecond: 4_500_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
      const finalBlob = new Blob(chunks, { type: mimeType });
      resolve(finalBlob);
    };
  });

  recorder.start(100);

  const totalFrames = Math.floor(settings.duration * 30);
  let thumbnailDataUrl = '';

  // Generate frame by frame
  for (let frame = 0; frame < totalFrames; frame++) {
    const progressRatio = frame / totalFrames;
    const progressPercent = Math.round(15 + progressRatio * 75);

    if (frame % 10 === 0) {
      onProgress?.(progressPercent, `Synthesizing frame ${frame + 1} of ${totalFrames}...`);
    }

    renderVideoFrame(ctx, width, height, frame, totalFrames, settings, sourceImg);

    // Capture thumbnail at 25% progress
    if (frame === Math.floor(totalFrames * 0.25) || frame === 0) {
      thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    }

    // Small delay to allow canvas stream capture
    await new Promise((r) => setTimeout(r, 16));
  }

  onProgress?.(92, 'Finalizing video stream encoding...');
  recorder.stop();

  const videoBlob = await recordingPromise;
  const videoUrl = URL.createObjectURL(videoBlob);

  onProgress?.(100, 'Generation complete!');

  return {
    videoBlob,
    videoUrl,
    thumbnailUrl: thumbnailDataUrl || canvas.toDataURL('image/jpeg', 0.8),
    durationSeconds: settings.duration,
  };
}

function renderVideoFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  totalFrames: number,
  settings: GenerationSettings,
  sourceImg: HTMLImageElement | null
) {
  const t = frame / totalFrames; // 0 to 1
  const camera = settings.camera;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Background base
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, width, height);

  // Calculate motion transform based on preset and user camera controls
  const motionTransform = computeMotionTransform(
    settings.motionPreset,
    camera,
    t,
    width,
    height
  );

  ctx.save();
  // Apply camera transformation centered
  ctx.translate(width / 2 + motionTransform.x, height / 2 + motionTransform.y);
  ctx.rotate(motionTransform.rotation);
  ctx.scale(motionTransform.scale, motionTransform.scale);
  ctx.translate(-width / 2, -height / 2);

  if (sourceImg) {
    // Draw source image with cover scaling
    drawCoverImage(ctx, sourceImg, width, height);
  } else {
    // Procedural cinematic canvas if text-to-video without initial image
    drawProceduralScene(ctx, width, height, t, settings.style, settings.prompt);
  }

  ctx.restore();

  // Overlay cinematic style passes (lighting, vignette, atmospheric particles, anamorphic flares)
  applyStyleLighting(ctx, width, height, t, settings.style);

  // Dynamic atmospheric particles
  drawAtmosphericParticles(ctx, width, height, t, frame);

  // Lens Vignette
  drawCinematicVignette(ctx, width, height);

  ctx.restore();
}

function computeMotionTransform(
  preset: MotionPreset,
  camera: GenerationSettings['camera'],
  t: number,
  width: number,
  height: number
) {
  // Base scale starts around 1.05 to avoid border clipping during movement
  let scale = 1.06;
  let x = 0;
  let y = 0;
  let rotation = 0;

  const speedFactor = (camera.speed || 5) / 5;

  switch (preset) {
    case 'dolly-zoom':
      // Scale expands while subtle counter-drift occurs
      scale = 1.05 + Math.sin(t * Math.PI) * 0.15 * speedFactor;
      y = (t - 0.5) * -12 * speedFactor;
      break;

    case 'drone-aerial':
      // Sweeping forward push and elevation
      scale = 1.03 + t * 0.18 * speedFactor;
      y = (1 - t) * 18 * speedFactor;
      x = Math.sin(t * Math.PI * 1.5) * 15 * speedFactor;
      rotation = Math.sin(t * Math.PI) * 0.02 * speedFactor;
      break;

    case 'orbital-pan':
      // Circular rotation and lateral drift
      scale = 1.1 + Math.sin(t * Math.PI) * 0.05;
      x = Math.cos(t * Math.PI) * 28 * speedFactor;
      y = Math.sin(t * Math.PI) * 8 * speedFactor;
      rotation = (t - 0.5) * 0.04 * speedFactor;
      break;

    case 'hyperlapse-blur':
      // Fast forward surge
      scale = 1.02 + Math.pow(t, 1.4) * 0.28 * speedFactor;
      x = (Math.random() - 0.5) * 1.5; // subtle micro camera jitter
      y = (Math.random() - 0.5) * 1.5;
      break;

    case 'slow-particles':
      // Gentle floating drift
      scale = 1.05 + t * 0.06 * speedFactor;
      x = Math.sin(t * Math.PI * 2) * 10 * speedFactor;
      y = Math.cos(t * Math.PI) * 8 * speedFactor;
      break;

    case 'cinematic-parallax':
    default:
      // Cinematic horizontal pan
      scale = 1.08 + t * 0.08 * speedFactor;
      x = (t - 0.5) * 36 * speedFactor;
      y = (t - 0.5) * 10 * speedFactor;
      break;
  }

  // Add manual user camera overrides
  x += (camera.panX || 0) * 3 * t;
  y += (camera.panY || 0) * 3 * t;
  scale += ((camera.zoom || 0) / 10) * 0.15 * t;
  rotation += ((camera.roll || 0) / 10) * 0.06 * t;

  return { scale: Math.max(1, scale), x, y, rotation };
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let renderW = w;
  let renderH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    renderW = h * imgRatio;
    offsetX = (w - renderW) / 2;
  } else {
    renderH = w / imgRatio;
    offsetY = (h - renderH) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
}

function drawProceduralScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  style: VisualStyle,
  prompt: string
) {
  // Rich multi-layered procedural digital environment
  const grad = ctx.createLinearGradient(0, 0, w, h);

  if (style === 'cyberpunk-neon') {
    grad.addColorStop(0, '#0f051d');
    grad.addColorStop(0.5, '#1e0c3b');
    grad.addColorStop(1, '#051829');
  } else if (style === 'anime-cel') {
    grad.addColorStop(0, '#1a237e');
    grad.addColorStop(0.5, '#3949ab');
    grad.addColorStop(1, '#ff80ab');
  } else if (style === 'dreamy-fantasy') {
    grad.addColorStop(0, '#1f1338');
    grad.addColorStop(0.5, '#4a154b');
    grad.addColorStop(1, '#1b3b54');
  } else {
    // Cinematic film
    grad.addColorStop(0, '#0a101d');
    grad.addColorStop(0.5, '#111b2b');
    grad.addColorStop(1, '#1a1820');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Geometric horizon / depth mountain planes
  ctx.save();
  const horizonY = h * 0.62;

  // Horizon glow
  const horizonGlow = ctx.createRadialGradient(
    w / 2 + Math.sin(t * 2) * 50,
    horizonY,
    10,
    w / 2,
    horizonY,
    w * 0.7
  );
  if (style === 'cyberpunk-neon') {
    horizonGlow.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
    horizonGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
    horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    horizonGlow.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    horizonGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
    horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, horizonY - 180, w, 280);

  // Dynamic grid lines or terrain waves
  ctx.strokeStyle = style === 'cyberpunk-neon' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;

  const numLines = 14;
  for (let i = 0; i <= numLines; i++) {
    const p = i / numLines;
    const yPos = horizonY + Math.pow(p, 1.8) * (h - horizonY);
    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(w, yPos);
    ctx.stroke();
  }

  // Perspective rays converging at horizon
  const numRays = 18;
  const vanishX = w / 2 + Math.sin(t * Math.PI) * 40;
  for (let i = 0; i <= numRays; i++) {
    const bottomX = (w / numRays) * i * 1.4 - w * 0.2;
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(bottomX, h);
    ctx.stroke();
  }

  // Floating digital sun or cinematic celestial orb
  const sunY = horizonY - 90 + Math.sin(t * Math.PI) * 15;
  const sunX = w / 2 + Math.sin(t * 1.5) * 30;
  const sunRadius = Math.min(w, h) * 0.14;

  const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, sunRadius);
  if (style === 'cyberpunk-neon') {
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sunGrad.addColorStop(0.4, 'rgba(244, 63, 94, 0.85)');
    sunGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
  } else {
    sunGrad.addColorStop(0, 'rgba(254, 243, 199, 0.95)');
    sunGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.7)');
    sunGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  }
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function applyStyleLighting(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  style: VisualStyle
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Horizontal anamorphic cinematic lens flare sweep
  const flareY = h * 0.45 + Math.sin(t * Math.PI * 2) * 20;
  const flareGrad = ctx.createLinearGradient(0, flareY, w, flareY);

  if (style === 'cyberpunk-neon') {
    flareGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
    flareGrad.addColorStop(0.5, 'rgba(217, 70, 239, 0.35)');
    flareGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
  } else if (style === 'anime-cel') {
    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    flareGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.4)');
    flareGrad.addColorStop(1, 'rgba(96, 165, 250, 0)');
  } else {
    // Cinematic gold / teal
    flareGrad.addColorStop(0, 'rgba(20, 184, 166, 0)');
    flareGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.3)');
    flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  }

  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, flareY - 4, w, 8);

  ctx.restore();
}

function drawAtmosphericParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  frame: number
) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';

  const particleCount = 28;
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 9301 + 49297;
    const rndX = ((seed % 1000) / 1000) * w;
    const rndY = (((seed * 7) % 1000) / 1000) * h;
    const size = (((seed * 13) % 10) / 10) * 2.2 + 0.8;

    const currentX = (rndX + Math.sin(t * 3 + i) * 35) % w;
    const currentY = (rndY - t * 60 + i * 4) % h;
    const yPos = currentY < 0 ? currentY + h : currentY;

    const alpha = (Math.sin(t * 4 + i) * 0.3 + 0.5) * 0.6;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

    ctx.beginPath();
    ctx.arc(currentX, yPos, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCinematicVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const radius = Math.max(w, h) * 0.75;
  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    radius * 0.35,
    w / 2,
    h / 2,
    radius
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.8, 'rgba(0, 0, 0, 0.38)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.75)');

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
