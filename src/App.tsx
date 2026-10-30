import React, { useState } from 'react';
import { Header } from './components/Header';
import { CreationStudio } from './components/CreationStudio';
import { ShowcaseGallery } from './components/ShowcaseGallery';
import { CloudVault } from './components/CloudVault';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GitHubDeployGuide } from './components/GitHubDeployGuide';
import { Footer } from './components/Footer';
import { GeneratedVideo } from './types';
import { SAMPLE_SHOWCASE_VIDEOS } from './data/sampleVideos';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'gallery' | 'vault' | 'api' | 'github'>('studio');
  const [selectedVideoForRemix, setSelectedVideoForRemix] = useState<GeneratedVideo | null>(
    SAMPLE_SHOWCASE_VIDEOS[0]
  );
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const handleVideoGenerated = (video: GeneratedVideo) => {
    setSelectedVideoForRemix(video);
  };

  const handleRemixFromGallery = (video: GeneratedVideo) => {
    setSelectedVideoForRemix(video);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayFromVault = (video: GeneratedVideo) => {
    setSelectedVideoForRemix(video);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'api') {
            setIsApiModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenCreate={() => {
          setActiveTab('studio');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'studio' && (
          <CreationStudio
            key={selectedVideoForRemix?.id || 'studio-root'}
            initialVideo={selectedVideoForRemix}
            onVideoGenerated={handleVideoGenerated}
            onOpenApiSettings={() => setIsApiModalOpen(true)}
          />
        )}

        {activeTab === 'gallery' && (
          <ShowcaseGallery
            onSelectVideo={handleRemixFromGallery}
            onRemixVideo={handleRemixFromGallery}
          />
        )}

        {activeTab === 'vault' && (
          <CloudVault
            onPlayVideo={handlePlayFromVault}
            onRemixVideo={handleRemixFromGallery}
            onNavigateToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'github' && <GitHubDeployGuide />}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={(tab) => {
          if (tab === 'api') {
            setIsApiModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* API Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}
