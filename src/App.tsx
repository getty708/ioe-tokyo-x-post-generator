import { XPostGenerator } from './components/XPostGenerator';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fc]">
      {/* Header (aligned to I/O Extended Tokyo 2026 branding) */}
      <header className="fixed left-0 top-0 z-50 w-full border-b-2 border-ink bg-white/95 backdrop-blur-md h-20 flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full flex items-center justify-between gap-4">

          {/* Logo link to the official landing page */}
          <a
            href="https://ioe-tokyo-2026.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-lg font-black leading-tight tracking-normal sm:text-xl md:text-2xl text-ink hover:opacity-85 transition duration-150 py-1"
            title="I/O Extended Tokyo 2026 イベントサイトへ"
          >
            I/O <span className="text-google-blue">Extended Tokyo</span> 2026<span className="hidden sm:inline"> - X Post Generator</span>
          </a>

          {/* Navigation Links and On-Device AI badge */}
          <nav className="flex items-center gap-3 md:gap-5">
            <a
              href="https://ioe-tokyo-2026.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs md:text-sm font-bold text-ink/75 hover:text-google-blue transition-colors hidden sm:flex items-center gap-1 hover:underline underline-offset-4 decoration-2"
            >
              イベントサイト 🔗
            </a>
            <span className="text-[10px] md:text-xs font-mono bg-pastel-green border border-ink/20 text-[#006b2b] px-2 py-0.5 md:px-2.5 md:py-1 rounded-full font-bold uppercase tracking-wider shrink-0 shadow-[1px_1px_0px_0px_rgba(0,107,43,0.2)]">
              On-Device AI
            </span>
          </nav>
        </div>
      </header>

      {/* Main Content with top margin to accommodate fixed header */}
      <main className="flex-grow pt-28 pb-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto mb-8 text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-display font-black text-ink tracking-tight">
            X Post Generator
          </h2>
          <p className="text-xs md:text-sm text-ink/70 leading-relaxed max-w-lg mx-auto font-body">
            Chrome 内蔵の Gemini Nano を使用して、セッション情報とあなたの感想メモから X (Twitter) の投稿原稿を自動作成します。データが外部サーバーに送信されない安全なクライアントサイドAI処理です。
          </p>
        </div>

        <XPostGenerator />
      </main>

      {/* Footer (aligned to SiteFooter.astro layout) */}
      <footer className="border-t-2 border-ink bg-ink py-12 px-6 text-white/90">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">

          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_260px] md:items-start">
            {/* White Branding Logo */}
            <div className="space-y-4">
              <img
                src="/gdg-tokyo/ioe-tokyo-2026-white.svg"
                alt="Google I/O Extended Tokyo 2026"
                className="w-full max-w-[260px] sm:max-w-[320px] md:max-w-[420px]"
              />
              <p className="text-xs text-white/50 font-mono pl-1">
                Powered by Chrome Built-in AI (Gemini Nano)
              </p>
            </div>

            {/* Quick Links */}
            <nav aria-label="Quick links">
              <h2 className="font-display text-sm font-extrabold text-google-yellow uppercase tracking-wider">Quick Links</h2>
              <div className="mt-4 flex flex-col gap-2.5 text-xs md:text-sm font-bold text-white/75">
                <a
                  href="https://gdg-tokyo.connpass.com/event/394136/"
                  className="hover:text-google-yellow transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Onsite Registration 🎫
                </a>
                <a
                  href="https://gdg-tokyo.connpass.com/event/394333/"
                  className="hover:text-google-yellow transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Online Registration 📡
                </a>
                <a
                  href="https://ioe-tokyo-2026.web.app/#timetable"
                  className="hover:text-google-yellow transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Timetable 🗓️
                </a>
                <a
                  href="https://ioe-tokyo-2026.web.app/#speakers"
                  className="hover:text-google-yellow transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Speakers 🎙️
                </a>
              </div>
            </nav>
          </div>

          {/* Copyright & Branded Color Blocks */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col gap-5 text-xs md:text-sm font-semibold text-white/60 md:flex-row md:items-center md:justify-between">
              <p>© 2026 Google I/O Extended Tokyo. Organized by GDG Tokyo.</p>

              <div className="flex items-center gap-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-5 w-5 rounded bg-[#4285F4]"></span>
                  <span className="h-5 w-5 rounded bg-[#EA4335]"></span>
                  <span className="h-5 w-5 rounded bg-[#FBBC05]"></span>
                  <span className="h-5 w-5 rounded bg-[#34A853]"></span>
                </div>
                <span className="font-sans text-xs font-bold text-white/80">Google Developer Groups</span>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

export default App;
