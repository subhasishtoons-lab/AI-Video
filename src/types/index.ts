export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export type VideoDuration = 4 | 8 | 12 | 16;

export type MotionPreset =
  | 'dolly-zoom'
  | 'drone-aerial'
  | 'orbital-pan'
  | 'slow-particles'
  | 'hyperlapse-blur'
  | 'cinematic-parallax';

export type VisualStyle =
  | 'cinematic-film'
  | 'hyper-realism'
  | 'anime-cel'
  | 'cyberpunk-neon'
  | 'vintage-35mm'
  | 'dreamy-fantasy'
  | '3d-render';

export type EngineType = 'free-tunsu' | 'runway-gen3' | 'openai-sora';

export interface CameraControls {
  panX: number; // -10 to +10
  panY: number; // -10 to +10
  zoom: number; // -10 to +10
  roll: number; // -10 to +10
  speed: number; // 1 to 10
}

export interface GenerationSettings {
  mode: 'text-to-video' | 'image-to-video';
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  duration: VideoDuration;
  motionPreset: MotionPreset;
  style: VisualStyle;
  camera: CameraControls;
  fps: 24 | 30 | 60;
  seed: number;
  engine: EngineType;
  imageSource?: {
    type: 'upload' | 'webcam' | 'preset';
    dataUrl: string;
    fileName?: string;
  };
}

export interface GeneratedVideo {
  id: string;
  title: string;
  prompt: string;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: number;
  category: 'Cinematic' | 'Social Reels' | 'Portrait' | 'Nature' | 'Sci-Fi' | 'Custom';
  engine: EngineType;
  fileSizeMb: number;
  isFavorite?: boolean;
}

export interface ApiKeys {
  runwayKey: string;
  openaiKey: string;
  useCustomKeys: boolean;
}
