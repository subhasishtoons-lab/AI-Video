import React from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'gallery' | 'vault' | 'api' | 'github';
  onSelectTab: (tab: 'studio' | 'gallery' | 'vault' | 'api' | 'github') => void;
  onOpenCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (tab: 'studio' | 'gallery' | 'vault' | 'api' | 'github') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick('studio')}
          className="text-lg sm:text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 hover:text-indigo-400 transition-colors flex items-center gap-2"
        >
          <span>Tunsu Video AI</span>
        </button>

        {/* Zone 2: 4–5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick('studio')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'studio' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Video Studio
          </button>
          <button
            onClick={() => handleNavClick('gallery')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'gallery' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => handleNavClick('vault')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'vault' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Cloud Vault
          </button>
          <button
            onClick={() => handleNavClick('api')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'api' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            OpenAI & Runway
          </button>
          <button
            onClick={() => handleNavClick('github')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'github' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            GitHub.io Host
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onSelectTab('studio');
              onOpenCreate();
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-indigo-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Video</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0b101a] px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleNavClick('studio')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeTab === 'studio' ? 'bg-indigo-600/15 text-indigo-400 font-medium' : 'text-slate-300'
            }`}
          >
            Video Studio
          </button>
          <button
            onClick={() => handleNavClick('gallery')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeTab === 'gallery' ? 'bg-indigo-600/15 text-indigo-400 font-medium' : 'text-slate-300'
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => handleNavClick('vault')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeTab === 'vault' ? 'bg-indigo-600/15 text-indigo-400 font-medium' : 'text-slate-300'
            }`}
          >
            Cloud Vault
          </button>
          <button
            onClick={() => handleNavClick('api')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeTab === 'api' ? 'bg-indigo-600/15 text-indigo-400 font-medium' : 'text-slate-300'
            }`}
          >
            OpenAI & Runway APIs
          </button>
          <button
            onClick={() => handleNavClick('github')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeTab === 'github' ? 'bg-indigo-600/15 text-indigo-400 font-medium' : 'text-slate-300'
            }`}
          >
            GitHub.io Hosting Guide
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                handleNavClick('studio');
                onOpenCreate();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Free Generation</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
