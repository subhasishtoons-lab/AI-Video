import React, { useState } from 'react';
import { Play, Sparkles, Film, ArrowUpRight } from 'lucide-react';
import { GeneratedVideo } from '../types';
import { SAMPLE_SHOWCASE_VIDEOS } from '../data/sampleVideos';

interface ShowcaseGalleryProps {
  onSelectVideo: (video: GeneratedVideo) => void;
  onRemixVideo: (video: GeneratedVideo) => void;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({
  onSelectVideo,
  onRemixVideo,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const filteredShowcase = SAMPLE_SHOWCASE_VIDEOS.filter((v) => {
    if (selectedTag === 'All') return true;
    return v.category === selectedTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
            <span>COMMUNITY SHOWCASE</span>
            <span aria-hidden="true">·</span>
            <span>4K CINEMA MASTER RENDERS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
            Curated AI Video Showcase
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Explore state-of-the-art cinematic sequences synthesized with Runway Gen-3 and OpenAI Sora models. Inspect prompt architecture and remix into your own project.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
          {['All', 'Cinematic', 'Sci-Fi', 'Nature', 'Social Reels'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedTag(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShowcase.map((video) => (
          <div
            key={video.id}
            onClick={() => onSelectVideo(video)}
            className="group cursor-pointer bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col shadow-lg hover:shadow-indigo-500/10"
          >
            {/* Image / Thumbnail Container */}
            <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-black/70 text-slate-300 backdrop-blur-md">
                  {video.engine === 'runway-gen3' ? 'Runway Gen-3' : video.engine === 'openai-sora' ? 'OpenAI Sora' : 'Tunsu Free'}
                </span>
              </div>

              <div className="absolute bottom-3 right-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-slate-300 backdrop-blur-md">
                  {video.aspectRatio} · {video.duration}s
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-white font-display group-hover:text-indigo-400 transition-colors">
                    {video.title}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {video.prompt}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 capitalize">
                  {video.style.replace('-', ' ')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemixVideo(video);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Remix Prompt</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
