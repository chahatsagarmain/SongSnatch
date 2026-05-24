export default function InputBox({ query, setQuery, onSubmit }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl px-4 mx-auto my-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <label className="block text-sm font-semibold text-slate-300 mb-2 text-left">
          Spotify Link
        </label>
        <div className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </span>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-300 text-sm"
              placeholder="Paste Spotify track, album, or playlist URL..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            onClick={onSubmit}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200 cursor-pointer text-sm whitespace-nowrap"
          >
            Fetch Songs
          </button>
        </div>
        
        {/* Accepted Input Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supports:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Tracks
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Albums
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/60 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            Playlists
          </div>
        </div>
      </div>
    </div>
  );
}
