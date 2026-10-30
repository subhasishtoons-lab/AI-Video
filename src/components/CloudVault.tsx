import React, { useState, useEffect } from 'react';
import {
  Shield,
  HardDrive,
  Download,
  Trash2,
  Play,
  Heart,
  Search,
  FileDown,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Lock,
} from 'lucide-react';
import { GeneratedVideo } from '../types';
import { vaultStorage } from '../services/storage';

interface CloudVaultProps {
  onPlayVideo: (video: GeneratedVideo) => void;
  onRemixVideo: (video: GeneratedVideo) => void;
  onNavigateToStudio: () => void;
}

export const CloudVault: React.FC<CloudVaultProps> = ({
  onPlayVideo,
  onRemixVideo,
  onNavigateToStudio,
}) => {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [storageStats, setStorageStats] = useState({ usedBytes: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadVaultData = async () => {
    setIsLoading(true);
    try {
      const all = await vaultStorage.getAllVideos();
      setVideos(all);
      const stats = await vaultStorage.calculateStorageUsage();
      setStorageStats(stats);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVaultData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await vaultStorage.deleteVideo(id);
    await loadVaultData();
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await vaultStorage.toggleFavorite(id);
    await loadVaultData();
  };

  const handleExportBackup = async () => {
    const archive = await vaultStorage.exportVaultArchive();
    const blob = new Blob([archive], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tunsu_cloud_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter logic
  const filteredVideos = videos.filter((v) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Favorites'
        ? !!v.isFavorite
        : v.category === selectedCategory;

    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.prompt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const usedMb = (storageStats.usedBytes / (1024 * 1024)).toFixed(1);
  const maxQuotaMb = 1024;
  const quotaPercent = Math.min(100, Math.round((parseFloat(usedMb) / maxQuotaMb) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Vault Header Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white font-display">
                Secure Client-Side Cloud Vault
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Encrypted, isolated local storage ensuring complete privacy. Your video files and keyframes never leak to external data brokers.
            </p>
          </div>

          {/* Storage Quota & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 min-w-[220px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Vault Storage</span>
                </span>
                <span className="font-mono tabular-nums text-slate-200 text-[11px]">
                  {usedMb} MB / {maxQuotaMb} MB
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(2, quotaPercent)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
                <span>{videos.length} videos stored</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Sandbox Encrypted</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBackup}
                disabled={videos.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
                title="Export JSON backup archive"
              >
                <FileDown className="w-4 h-4" />
                <span>Export Backup</span>
              </button>
              <button
                onClick={loadVaultData}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Refresh Vault"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {['All', 'Favorites', 'Cinematic', 'Social Reels', 'Portrait', 'Nature', 'Sci-Fi'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault creations..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-xl bg-slate-900/60 animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onPlayVideo(video)}
              className="group cursor-pointer bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-xl overflow-hidden transition-all duration-200 shadow-md hover:shadow-indigo-500/10 flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Ambient Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                </div>

                {/* Top badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-black/70 text-slate-300 backdrop-blur-md">
                    {video.aspectRatio} · {video.duration}s
                  </span>
                  <button
                    onClick={(e) => handleToggleFavorite(video.id, e)}
                    className="p-1 rounded-md bg-black/60 backdrop-blur-md text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        video.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Info Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white font-display truncate mb-1">
                    {video.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {video.prompt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono tabular-nums">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemixVideo(video);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-colors"
                      title="Remix Prompt"
                    >
                      Remix
                    </button>
                    {video.videoUrl && (
                      <a
                        href={video.videoUrl}
                        download={`${video.title}.webm`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDelete(video.id, e)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center max-w-lg mx-auto">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white font-display mb-1">
            Vault is Empty
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Generate your first AI video to populate your secure cloud vault storage
          </p>
          <button
            onClick={onNavigateToStudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Video Studio</span>
          </button>
        </div>
      )}
    </div>
  );
};
