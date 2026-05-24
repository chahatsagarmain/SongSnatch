export default function Footer() {
  return (
    <footer className="w-full py-6 mt-12 bg-slate-950/40 border-t border-slate-900/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <div>
          <p>SongSnatch.</p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/chahatsagarmain"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors duration-200"
          >
            GitHub
          </a>
          <span className="text-slate-600">|</span>
          <p>
            Crafted by{" "}
            <span className="font-semibold text-slate-300 hover:text-emerald-400 cursor-default transition-colors">
              @chahatsagarmain
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
