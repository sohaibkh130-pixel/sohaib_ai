import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Code2,
  Languages,
  Mic,
  ArrowRight,
  Globe,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  onStartChat: (initialPrompt?: string) => void;
  onOpenDeploymentGuide: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onOpenDeploymentGuide,
}) => {
  const [activeLangTab, setActiveLangTab] = useState<'darija' | 'arabic' | 'french' | 'english'>('darija');

  const samplePrompts = {
    darija: [
      {
        title: 'برمجة بالدارجة (Coding)',
        prompt: 'Salam Sohaib! Kifach ntelem Python w ndir biha machine learning f lmghrib? 3tini plan kamel.',
        desc: 'Ask about starting a machine learning roadmap explained in authentic Moroccan Darija.',
      },
      {
        title: 'استشارة وحل المشاكل (Problem Solving)',
        prompt: 'واش ممكن تشرح ليا كيفاش كيخدم الـ Event Loop ف JavaScript بأمثلة بسيطة من الواقع؟',
        desc: 'Complex programming concepts broken down with intuitive Moroccan analogies.',
      },
      {
        title: 'ترجمة وصياغة (Translation & Writing)',
        prompt: 'ترجم ليا هاد الإيميل المهني من الفرنسية للدارجة المغربية بطريقة محترمة: "Nous sommes ravis de vous inviter à notre conférence annuelle."',
        desc: 'Professional document nuance translation preserved into Moroccan Darija.',
      },
    ],
    arabic: [
      {
        title: 'تطوير البرمجيات (Software Architecture)',
        prompt: 'كيف يمكنني تصميم بنية Microservices قابلة للتوسع باستخدام Docker و Google Cloud Run؟',
        desc: 'In-depth architectural design and engineering best practices in Modern Standard Arabic.',
      },
      {
        title: 'الذكاء الاصطناعي (AI & Math)',
        prompt: 'اشرح لي مفهوم Attention Mechanism في نماذج المحولات (Transformers) بطريقة رياضية مبسطة.',
        desc: 'Deep dive into machine learning foundations and theoretical math.',
      },
      {
        title: 'الصياغة والكتابة (Professional Writing)',
        prompt: 'اكتب لي مقالاً تحليلياً حول مستقبل الاقتصاد الرقمي والشركات الناشئة في منطقة الشرق الأوسط وشمال أفريقيا.',
        desc: 'Eloquent and authoritative analytical writing in Standard Arabic.',
      },
    ],
    french: [
      {
        title: 'Ingénierie Full-Stack (Full-Stack Engineering)',
        prompt: 'Génère un composant React 19 avec TypeScript et Tailwind CSS qui gère la pagination côté serveur avec debounce.',
        desc: 'Production-ready modern frontend and backend code snippets with TypeScript types.',
      },
      {
        title: 'Explications Systèmes (Systems Deep Dive)',
        prompt: 'Quelle est la différence fondamentale entre la concurrence et le parallélisme dans les moteurs d’exécution modernes ?',
        desc: 'Precise computer science conceptual analysis in fluent French.',
      },
      {
        title: 'Communication Professionnelle (Executive Prose)',
        prompt: 'Rédige une proposition commerciale concise et persuasive pour un contrat de modernisation d’infrastructure Cloud.',
        desc: 'Persuasive executive communications and business proposals.',
      },
    ],
    english: [
      {
        title: 'Algorithms & Performance',
        prompt: 'Write an optimized TypeScript implementation of a LRU Cache with O(1) get and put operations, including unit tests.',
        desc: 'Clean algorithms with edge-case handling and complete unit test coverage.',
      },
      {
        title: 'Full-Stack Architecture',
        prompt: 'Explain how to architect a secure Server-Sent Events (SSE) streaming chat service with Express and Google Gemini API.',
        desc: 'End-to-end full-stack architectures and API security models.',
      },
      {
        title: 'Data Science & Logic',
        prompt: 'Explain how vector embeddings and cosine similarity search work in Retrieval-Augmented Generation (RAG).',
        desc: 'Clear technical explanations for modern AI workflows.',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed Metadata (Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-amber-400/90">
                <span>Gemini 3.8 Flash Engine</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Moroccan Darija · Arabic · French · English</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Server-Side Secure</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance leading-tight">
                Sohaib AI: Multilingual Intelligence Built for the Real World.
              </h1>

              <p className="max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
                A responsive web assistant engineered for authentic conversations. Seamlessly switch between
                <span className="text-amber-300 font-medium"> Moroccan Darija</span>,
                <span className="text-amber-300 font-medium"> Arabic</span>,
                <span className="text-amber-300 font-medium"> French</span>, and
                <span className="text-amber-300 font-medium"> English</span>.
                Get precise coding help, natural translations, deep topic explanations, and voice interaction.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onStartChat()}
                  className="flex items-center gap-2.5 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-300 active:scale-95 whitespace-nowrap"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start Chatting Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onOpenDeploymentGuide}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 whitespace-nowrap"
                >
                  <Globe className="h-4 w-4 text-amber-400" />
                  <span>Custom Domain &amp; Deploy Guide</span>
                </button>
              </div>

              {/* Trust & Architecture notes */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Zero API key exposure in browser</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-amber-400" />
                  <span>Voice input &amp; speech synthesis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  <span>Powered by Gemini 3.8 Flash</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl">
                  <img
                    src="/src/assets/images/sohaib_ai_hero_1792800156015.jpg"
                    alt="Sohaib AI Luminous Digital Intelligence Sculpture"
                    referrerPolicy="no-referrer"
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-6 space-y-3 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
                    <div className="flex items-center gap-3">
                      <img
                        src="/src/assets/images/sohaib_ai_emblem_1792800155031.jpg"
                        alt="Sohaib AI Emblem"
                        className="h-10 w-10 rounded-xl border border-amber-400/30 object-cover"
                      />
                      <div>
                        <h2 className="text-sm font-bold text-white">Sohaib AI Intelligence Hub</h2>
                        <p className="text-xs text-slate-400">Ready on Desktop &amp; Mobile Web</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal">
                      Native Moroccan Darija literacy combined with full-stack programming and cross-lingual translation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Multilingual Prompt Showcase */}
      <section className="px-6 py-16 border-b border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Experience Multilingual Fluency in Action
            </h2>
            <p className="text-sm text-slate-400">
              Select any language to inspect sample queries, or click a card to immediately jump into chat with Sohaib AI.
            </p>

            {/* Language Segmented Control */}
            <div className="inline-flex rounded-xl bg-slate-900 p-1.5 border border-slate-800 mt-2">
              <button
                type="button"
                onClick={() => setActiveLangTab('darija')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeLangTab === 'darija'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الدارجة المغربية (Darija)
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('arabic')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeLangTab === 'arabic'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                العربية الفصحى (Arabic)
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('french')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeLangTab === 'french'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Français (French)
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('english')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeLangTab === 'english'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {samplePrompts[activeLangTab].map((item, idx) => (
              <div
                key={idx}
                onClick={() => onStartChat(item.prompt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onStartChat(item.prompt);
                  }
                }}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-amber-400/50 hover:bg-slate-900 hover:shadow-xl cursor-pointer text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                    <span>Prompt 0{idx + 1}</span>
                    <Sparkles className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans italic border-l-2 border-slate-800 pl-3">
                    &ldquo;{item.prompt}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 pt-1">{item.desc}</p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Send this prompt to Sohaib AI</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section (Asymmetric Bento Grid) */}
      <section id="capabilities" className="px-6 py-16 md:py-24 border-b border-slate-800/80 bg-slate-950/60">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Complete Depth
            </h2>
            <p className="text-sm md:text-base text-slate-400">
              Sohaib AI is not a generic wrapper. It integrates state-of-the-art LLM reasoning with cultural nuance, programming mastery, and audio support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento Card 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">01. Moroccan Darija Native</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understands Moroccan Darija written in Arabic letters or Latin Arabizi (3, 7, 9). Converses warmly with regional expressions, cultural context, and Moroccan idioms.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">02. Software &amp; Code Help</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-stack mastery across TypeScript, React, Python, algorithms, Cloud architecture, and database queries. Produces complete, syntax-highlighted code ready to copy.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">03. Multilingual Translation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bridges Darija, Arabic, French, and English effortlessly. Translates technical documentation, legal correspondence, or casual communication without losing intent.
              </p>
            </div>

            {/* Bento Card 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">04. Voice &amp; Read Aloud</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dictate hands-free using browser speech recognition, and listen to AI answers read out aloud in Moroccan Arabic, French, or English via Web Speech Synthesis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Spotlight & Vision */}
      <section className="px-6 py-16 border-b border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/40 p-8 md:p-12 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg shrink-0">
              S
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Created by Sohaib</h3>
              <p className="text-xs text-amber-400/90 mt-0.5">Architect &amp; Lead Engineer behind Sohaib AI</p>
            </div>
          </div>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            &ldquo;Sohaib AI was born out of a desire to build a first-class artificial intelligence experience that respects the linguistic diversity of Morocco, North Africa, and the global developer community. By bridging Moroccan Darija, Standard Arabic, French, and English with Google&apos;s most capable Gemini models, we empower creators, programmers, and students to learn, communicate, and build without linguistic friction.&rdquo;
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onStartChat()}
              className="rounded-lg bg-amber-400 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-all flex items-center gap-2"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Launch Sohaib AI Chat</span>
            </button>
            <button
              type="button"
              onClick={onOpenDeploymentGuide}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>Setup Custom Domain Guide</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white">Sohaib AI</span>
            <span>&copy; 2026</span>
            <span aria-hidden="true">·</span>
            <span>Multilingual Web Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onStartChat()}
              className="hover:text-slate-300 transition-colors"
            >
              Chat Studio
            </button>
            <button
              type="button"
              onClick={onOpenDeploymentGuide}
              className="hover:text-slate-300 transition-colors"
            >
              Custom Domain Setup
            </button>
            <span className="text-slate-600">Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
