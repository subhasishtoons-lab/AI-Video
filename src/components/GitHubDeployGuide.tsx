import React, { useState } from 'react';
import {
  Github,
  Globe,
  Copy,
  Check,
  Code2,
  Terminal,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const GitHubDeployGuide: React.FC = () => {
  const [username, setUsername] = useState('username');
  const [repoName, setRepoName] = useState('tunsu-video-ai');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fullUrl = `https://${username}.github.io/${repoName}/`;

  const gitCommands = `# 1. Clone or initialize your repository
git init
git add .
git commit -m "feat: initial Tunsu Video AI studio release"

# 2. Add your GitHub remote repository
git remote add origin https://github.com/${username}/${repoName}.git
git branch -M main
git push -u origin main

# 3. Deploy to gh-pages branch
npm run build
npx gh-pages -d dist`;

  const githubActionsYaml = `name: Deploy Tunsu Video AI to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static production bundle
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
          <Github className="w-4 h-4" />
          <span>STATIC HOSTING PROTOCOL</span>
          <span aria-hidden="true">·</span>
          <span>GITHUB.IO READY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
          GitHub Pages (github.io) Deployment Guide
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Tunsu Video AI is engineered as a client-side single page web application. It runs 100% serverless, zero-cost, and can be published directly to your personal or organization GitHub Pages domain.
        </p>
      </div>

      {/* Interactive URL Generator Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Your GitHub.io Target URL</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">
              GitHub Username / Organization
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. subhasish"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">
              Repository Name
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
              placeholder="e.g. tunsu-video-ai"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs text-slate-400">Target URL:</span>
            <span className="text-xs font-mono text-emerald-400 truncate font-semibold">
              {fullUrl}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(fullUrl, 'url')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors shrink-0"
          >
            {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy URL</span>
          </button>
        </div>
      </div>

      {/* Step by Step Roadmap */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-white font-display">
          Three Simple Steps to Host on github.io
        </h3>

        {/* Step 1 */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono">
              1
            </div>
            <h4 className="text-sm font-semibold text-white font-display">
              Create a new GitHub Repository
            </h4>
          </div>
          <p className="text-xs text-slate-400 pl-10">
            Head to{' '}
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              github.com/new <ExternalLink className="w-3 h-3" />
            </a>{' '}
            and create a public repository named{' '}
            <span className="font-mono text-slate-200">{repoName}</span>.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono">
                2
              </div>
              <h4 className="text-sm font-semibold text-white font-display">
                Push Code & Build with Git CLI
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(gitCommands, 'cli')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              {copiedKey === 'cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy Commands</span>
            </button>
          </div>

          <div className="pl-10">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
              <code>{gitCommands}</code>
            </pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono">
                3
              </div>
              <h4 className="text-sm font-semibold text-white font-display">
                Automated GitHub Actions CI/CD (Optional / Recommended)
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(githubActionsYaml, 'yaml')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              {copiedKey === 'yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy .github/workflows/deploy.yml</span>
            </button>
          </div>

          <div className="pl-10 space-y-2">
            <p className="text-xs text-slate-400">
              Create a file at <code className="text-indigo-400 font-mono">.github/workflows/deploy.yml</code> in your repository. GitHub will automatically build and publish your site upon each push to <code className="text-slate-300 font-mono">main</code>.
            </p>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-56">
              <code>{githubActionsYaml}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Vite config base url notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
        <Code2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-200 block">
            Vite Subpath Configuration Notice
          </span>
          <p>
            If deploying to a subpath repository like <code className="text-indigo-400 font-mono">https://{username}.github.io/{repoName}/</code>, ensure your <code className="text-slate-300 font-mono">vite.config.ts</code> defines <code className="text-slate-300 font-mono">base: './'</code> so all JavaScript, fonts, and assets resolve with relative paths.
          </p>
        </div>
      </div>
    </div>
  );
};
