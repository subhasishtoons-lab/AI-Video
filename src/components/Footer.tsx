import React from 'react';
import { Github, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'studio' | 'gallery' | 'vault' | 'api' | 'github') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#080c14] py-10 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-sm font-bold text-white font-display">
            Tunsu Video AI
          </span>
          <p className="text-xs text-slate-500">
            Professional generative video studio for text, images, and webcam captures. Free & open for everyone.
          </p>
        </div>

        {/* Quiet links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <button
            onClick={() => onSelectTab('studio')}
            className="hover:text-white transition-colors"
          >
            Video Studio
          </button>
          <button
            onClick={() => onSelectTab('gallery')}
            className="hover:text-white transition-colors"
          >
            Showcase
          </button>
          <button
            onClick={() => onSelectTab('vault')}
            className="hover:text-white transition-colors"
          >
            Cloud Vault
          </button>
          <button
            onClick={() => onSelectTab('api')}
            className="hover:text-white transition-colors"
          >
            OpenAI & Runway
          </button>
          <button
            onClick={() => onSelectTab('github')}
            className="hover:text-white transition-colors"
          >
            GitHub.io Hosting
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Client-Side Encrypted</span>
          <span aria-hidden="true">·</span>
          <span>Open Web Standard</span>
        </div>
      </div>
    </footer>
  );
};
