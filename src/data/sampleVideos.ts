import { GeneratedVideo, VisualStyle, AspectRatio } from '../types';

function createSvgThumbnail(title: string, style: VisualStyle, primaryColor: string, secondaryColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="60%" stop-color="${secondaryColor}"/>
        <stop offset="100%" stop-color="#050811"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="flare" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0.7)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#bg)"/>
    <!-- Horizon lines -->
    <line x1="0" y1="220" x2="640" y2="220" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
    <line x1="0" y1="260" x2="640" y2="260" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <line x1="0" y1="300" x2="640" y2="300" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    <!-- Atmosphere Sun -->
    <circle cx="320" cy="180" r="54" fill="url(#glow)"/>
    <circle cx="320" cy="180" r="38" fill="#ffffff" fill-opacity="0.25"/>
    <!-- Anamorphic lens bar -->
    <rect x="0" y="178" width="640" height="4" fill="url(#flare)"/>
    <!-- Cinematic frame vignette -->
    <rect width="640" height="360" fill="none" stroke="#000000" stroke-width="16" opacity="0.35"/>
    <!-- Label -->
    <text x="32" y="324" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="20" fill="#ffffff" letter-spacing="-0.02em">${title}</text>
    <text x="32" y="342" font-family="'JetBrains Mono', monospace" font-size="11" fill="rgba(255,255,255,0.65)" text-transform="uppercase">${style} · 4K 24FPS</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_SHOWCASE_VIDEOS: GeneratedVideo[] = [
  {
    id: 'sample-1',
    title: 'Cyberpunk Neo-Tokyo Rain',
    prompt: 'Cinematic wide-angle tracking shot through a rain-drenched neon metropolis in 2089. Holographic advertisements illuminate wet asphalt reflections, steam rising from subterranean vents, high-speed levitating vehicles flashing past.',
    style: 'cyberpunk-neon',
    aspectRatio: '16:9',
    duration: 8,
    videoUrl: '', // Will play synthesizer canvas or mock stream
    thumbnailUrl: createSvgThumbnail('Cyberpunk Neo-Tokyo Rain', 'cyberpunk-neon', '#1e0836', '#091c38'),
    createdAt: Date.now() - 3600000 * 2,
    category: 'Sci-Fi',
    engine: 'runway-gen3',
    fileSizeMb: 14.2,
    isFavorite: true,
  },
  {
    id: 'sample-2',
    title: 'Nordic Fjord Cascades',
    prompt: 'Aerial drone sweeping down a colossal emerald fjord in Norway at sunrise. Glacial waterfall crashing into crystalline waters, morning mist catching golden god rays, pristine alpine silence.',
    style: 'cinematic-film',
    aspectRatio: '16:9',
    duration: 8,
    videoUrl: '',
    thumbnailUrl: createSvgThumbnail('Nordic Fjord Cascades', 'cinematic-film', '#0c2333', '#1b4d3e'),
    createdAt: Date.now() - 3600000 * 5,
    category: 'Nature',
    engine: 'free-tunsu',
    fileSizeMb: 12.8,
    isFavorite: true,
  },
  {
    id: 'sample-3',
    title: 'Deep Space Orbit Pioneer',
    prompt: 'High-budget 70mm IMAX cinematic sequence of an astronaut stepping onto iridescent crystalline sands of an exoplanet under dual binary purple moons. Floating particle dust in zero-G.',
    style: 'hyper-realism',
    aspectRatio: '16:9',
    duration: 12,
    videoUrl: '',
    thumbnailUrl: createSvgThumbnail('Deep Space Orbit Pioneer', 'hyper-realism', '#1c0a2e', '#0b162c'),
    createdAt: Date.now() - 3600000 * 12,
    category: 'Sci-Fi',
    engine: 'openai-sora',
    fileSizeMb: 18.5,
    isFavorite: false,
  },
  {
    id: 'sample-4',
    title: 'Tokyo Street Anime Sakuga',
    prompt: 'Hand-drawn anime opening sequence. A girl turning around in a blossom-filled Tokyo alleyway as spring cherry petals burst into slow-motion swirl, vibrant sunset golden sky, fluid sakuga animation.',
    style: 'anime-cel',
    aspectRatio: '9:16',
    duration: 8,
    videoUrl: '',
    thumbnailUrl: createSvgThumbnail('Tokyo Street Anime Sakuga', 'anime-cel', '#3b1236', '#4a154b'),
    createdAt: Date.now() - 3600000 * 24,
    category: 'Social Reels',
    engine: 'free-tunsu',
    fileSizeMb: 9.6,
    isFavorite: true,
  },
  {
    id: 'sample-5',
    title: 'Matte Hypercar Tunnel Rush',
    prompt: 'Low-slung aerodynamic hypercar surging through an architectural concrete mountain tunnel. Glowing red horizontal light signature, motion blur trails, dynamic lens distortion, cinema sound design.',
    style: 'cinematic-film',
    aspectRatio: '16:9',
    duration: 4,
    videoUrl: '',
    thumbnailUrl: createSvgThumbnail('Matte Hypercar Tunnel Rush', 'cinematic-film', '#111827', '#1f2937'),
    createdAt: Date.now() - 3600000 * 36,
    category: 'Cinematic',
    engine: 'runway-gen3',
    fileSizeMb: 8.2,
    isFavorite: false,
  },
  {
    id: 'sample-6',
    title: 'Ethereal Forest Spirit',
    prompt: 'Mystical ancient redwood grove bathed in bioluminescent fungal spores. Floating ember particles dancing in soft turquoise moonlight, slow camera push through ferns.',
    style: 'dreamy-fantasy',
    aspectRatio: '16:9',
    duration: 8,
    videoUrl: '',
    thumbnailUrl: createSvgThumbnail('Ethereal Forest Spirit', 'dreamy-fantasy', '#082f3b', '#164e63'),
    createdAt: Date.now() - 3600000 * 48,
    category: 'Nature',
    engine: 'free-tunsu',
    fileSizeMb: 11.4,
    isFavorite: false,
  },
];

export const PRESET_STARTER_IMAGES = [
  {
    id: 'preset-cyberpunk',
    title: 'Cyberpunk Alley',
    dataUrl: createSvgThumbnail('Cyberpunk Source', 'cyberpunk-neon', '#240046', '#10002b'),
  },
  {
    id: 'preset-nature',
    title: 'Emerald Peak',
    dataUrl: createSvgThumbnail('Emerald Peak Source', 'cinematic-film', '#003049', '#1d3557'),
  },
  {
    id: 'preset-portrait',
    title: 'Studio Portrait',
    dataUrl: createSvgThumbnail('Studio Portrait Source', 'hyper-realism', '#3a0ca3', '#4361ee'),
  },
  {
    id: 'preset-supercar',
    title: 'Hypercar Silhouette',
    dataUrl: createSvgThumbnail('Hypercar Silhouette', 'cinematic-film', '#0f172a', '#334155'),
  },
];
