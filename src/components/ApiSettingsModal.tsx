import React, { useState, useEffect } from 'react';
import { X, Key, Check, ShieldCheck, Zap, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { ApiKeys } from '../types';
import { vaultStorage } from '../services/storage';
import { AiApiService } from '../services/aiApi';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<ApiKeys>({
    runwayKey: '',
    openaiKey: '',
    useCustomKeys: false,
  });

  const [testingRunway, setTestingRunway] = useState(false);
  const [testingOpenAi, setTestingOpenAi] = useState(false);
  const [runwayFeedback, setRunwayFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [openaiFeedback, setOpenaiFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = vaultStorage.loadApiKeys();
      setKeys(stored);
      setRunwayFeedback(null);
      setOpenaiFeedback(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    vaultStorage.saveApiKeys(keys);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const testRunway = async () => {
    setTestingRunway(true);
    setRunwayFeedback(null);
    const res = await AiApiService.testRunwayKey(keys.runwayKey);
    setRunwayFeedback(res);
    setTestingRunway(false);
  };

  const testOpenAi = async () => {
    setTestingOpenAi(true);
    setOpenaiFeedback(null);
    const res = await AiApiService.testOpenAiKey(keys.openaiKey);
    setOpenaiFeedback(res);
    setTestingOpenAi(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-display">
                OpenAI & Runway API Integrations
              </h3>
              <p className="text-[11px] text-slate-400">
                Optional custom API keys or 100% free built-in engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Zero-Cost Free Engine Notice */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-indigo-300 block">
                Totally Free for All Users
              </span>
              <p className="text-slate-300 leading-relaxed">
                Tunsu Video AI includes an unlimited built-in client video synthesis engine. You do NOT need to provide credit cards or API keys to generate and export professional-grade videos.
              </p>
            </div>
          </div>

          {/* Runway API Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>Runway Gen-3 API Key</span>
                <span className="text-[10px] text-slate-500 font-mono">(Optional)</span>
              </label>
              <a
                href="https://runwayml.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Get Runway Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={keys.runwayKey}
                onChange={(e) => setKeys({ ...keys, runwayKey: e.target.value })}
                placeholder="key_runway_gen3_..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={testRunway}
                disabled={testingRunway || !keys.runwayKey}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                {testingRunway ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Verify Key</span>
              </button>
            </div>

            {runwayFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  runwayFeedback.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {runwayFeedback.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{runwayFeedback.message}</span>
              </div>
            )}
          </div>

          {/* OpenAI Sora API Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>OpenAI API Key (Sora & Vision)</span>
                <span className="text-[10px] text-slate-500 font-mono">(Optional)</span>
              </label>
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Get OpenAI Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={keys.openaiKey}
                onChange={(e) => setKeys({ ...keys, openaiKey: e.target.value })}
                placeholder="sk-proj-..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={testOpenAi}
                disabled={testingOpenAi || !keys.openaiKey}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                {testingOpenAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Verify Key</span>
              </button>
            </div>

            {openaiFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  openaiFeedback.success
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {openaiFeedback.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{openaiFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Privacy & Encryption Guarantee */}
          <div className="pt-2 border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Keys are strictly persisted inside your browser's private localStorage sandbox. We never store, transmit, or proxy your credentials to third-party databases.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={() => {
              setKeys({ runwayKey: '', openaiKey: '', useCustomKeys: false });
              vaultStorage.saveApiKeys({ runwayKey: '', openaiKey: '', useCustomKeys: false });
              setRunwayFeedback(null);
              setOpenaiFeedback(null);
            }}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            Clear Keys
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved Preferences' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
