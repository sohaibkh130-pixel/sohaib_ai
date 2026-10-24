import React, { useState } from 'react';
import { X, Globe, Server, ShieldCheck, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cloudrun' | 'customdomain' | 'vps' | 'security'>('cloudrun');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippet(id);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deployment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div>
            <h2 id="deployment-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-400" />
              Deployment &amp; Custom Domain Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Everything required to take Sohaib AI live with production SSL and your personal brand domain
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 text-sm font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cloudrun')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cloudrun'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Google Cloud Run
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customdomain')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'customdomain'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Connect Custom Domain
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vps')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'vps'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. VPS / Docker / PM2
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. API Key &amp; Security
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {activeTab === 'cloudrun' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200/90">
                <p className="font-semibold text-amber-300">Recommended Production Target: Google Cloud Run</p>
                <p className="text-xs mt-1">
                  Cloud Run automatically provisions free managed SSL certificates, scales to zero when idle (0 cost), and integrates seamlessly with Google Gemini API quotas.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">Step 1: Build the applet</h3>
                <div className="relative rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <code>npm run build</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('npm run build', 'c1')}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                    aria-label="Copy command"
                  >
                    {copiedSnippet === 'c1' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">Step 2: Deploy container to Cloud Run</h3>
                <div className="relative rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <pre className="whitespace-pre-wrap">{`gcloud run deploy sohaib-ai \\
  --source . \\
  --region europe-west2 \\
  --allow-unauthenticated \\
  --set-env-vars GEMINI_API_KEY="YOUR_API_KEY"`}</pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(`gcloud run deploy sohaib-ai --source . --region europe-west2 --allow-unauthenticated --set-env-vars GEMINI_API_KEY="YOUR_API_KEY"`, 'c2')}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                    aria-label="Copy deploy command"
                  >
                    {copiedSnippet === 'c2' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">Step 3: Verification</h3>
                <p className="text-xs text-slate-400">
                  Cloud Run will output an HTTPS URL (e.g. <code>https://sohaib-ai-xyz.a.run.app</code>). You can test <code>/api/health</code> to ensure Gemini is responsive.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'customdomain' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Connecting your Custom Domain (e.g. sohaib.ai or chat.sohaib.ai)</h3>
              <p className="text-xs text-slate-400">
                You can buy your domain from Namecheap, Cloudflare, GoDaddy, or Google Domains, then point DNS records directly to your host.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-100">Step A: Add Domain Mapping in Cloud Run</h4>
                <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <code>gcloud beta run domain-mappings create --service sohaib-ai --domain chat.sohaib.ai</code>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-100">Step B: Configure DNS Records in Your Registrar</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Host / Name</th>
                        <th className="p-2.5">Value / Target</th>
                        <th className="p-2.5">TTL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                      <tr>
                        <td className="p-2.5 text-amber-400">CNAME</td>
                        <td className="p-2.5">chat (or www)</td>
                        <td className="p-2.5">ghs.googlehosted.com.</td>
                        <td className="p-2.5">Auto / 300</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-amber-400">A</td>
                        <td className="p-2.5">@ (apex domain)</td>
                        <td className="p-2.5">216.239.32.21</td>
                        <td className="p-2.5">Auto / 300</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-amber-400">A</td>
                        <td className="p-2.5">@ (apex domain)</td>
                        <td className="p-2.5">216.239.34.21</td>
                        <td className="p-2.5">Auto / 300</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-slate-100">Step C: SSL / HTTPS Certificate</h4>
                <p className="text-xs text-slate-400">
                  Google Cloud automatically handles TLS certificate creation and renewals through Let&apos;s Encrypt. Once DNS propagates (typically 5 to 60 minutes), your custom domain will load securely with a valid green padlock.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vps' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Deploying on Ubuntu / Debian VPS with Docker or PM2</h3>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-100">Dockerfile</h4>
                <div className="relative rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <pre className="whitespace-pre-wrap">{`FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]`}</pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(`FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nENV NODE_ENV=production\nENV PORT=3000\nEXPOSE 3000\nCMD ["npm", "start"]`, 'df')}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                    aria-label="Copy Dockerfile"
                  >
                    {copiedSnippet === 'df' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-100">Nginx Reverse Proxy with Certbot SSL</h4>
                <div className="relative rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800">
                  <pre className="whitespace-pre-wrap">{`server {
    server_name chat.sohaib.ai;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Run certbot to install free SSL
# sudo certbot --nginx -d chat.sohaib.ai`}</pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(`server {\n    server_name chat.sohaib.ai;\n    location / {\n        proxy_pass http://localhost:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection 'upgrade';\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n    }\n}`, 'ng')}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                    aria-label="Copy Nginx config"
                  >
                    {copiedSnippet === 'ng' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-300">Server-Side Secret Architecture</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Sohaib AI strictly isolates your <code>GEMINI_API_KEY</code> on the backend Express server (<code>server.ts</code>). The client browser never receives or embeds the API token, protecting against quota exhaustion or malicious token scraping.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-100">Environment Variables Checklist</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-amber-400">GEMINI_API_KEY</span>: Required. Configured in Cloud Run / hosting environment variables.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-amber-400">PORT</span>: Default <code>3000</code>. In Cloud Run, automatically injected by the platform.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-amber-400">NODE_ENV</span>: Set to <code>production</code> on live deployments for optimal caching and bundle serving.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>Sohaib AI &copy; 2026 — Ready for global production</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
