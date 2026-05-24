import DownloadButton from "./DownloadButton";

export default function SongList({ songs }) {
  if (songs.length === 0) return null;

  return (
    <div className="w-full max-w-2xl px-4 mx-auto mt-6 mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Fetched Tracks
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
          {songs.length} {songs.length === 1 ? "track" : "tracks"}
        </span>
      </div>
      <ul className="space-y-3">
        {songs.map((song, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between p-4 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-md hover:border-slate-700/60 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-950/60 flex items-center justify-center text-xs font-semibold text-slate-500 group-hover:text-emerald-400 transition-colors">
                {idx + 1}
              </span>
              <span className="text-left font-medium text-sm text-slate-100 truncate group-hover:text-white transition-colors">
                {song}
              </span>
            </div>
            <div className="flex-shrink-0">
              <DownloadButton songName={song} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
