"use client";

import { useState } from "react";
import Image from "next/image";
import InputBox from "../components/InputBox";
import SongList from "../components/SongList";
import { ClipLoader } from "react-spinners";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSongs = async () => {
    if (query === "") return;
    setIsLoading(true);
    setSongs([]);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/v1/spotify/find?url=${encodeURIComponent(query)}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ query }),
      });
      
      if (!res.ok) {
        let errorMessage = "Failed to fetch songs. Please try again.";
        try {
          const data = await res.json();
          if (data && data.detail) {
            if (typeof data.detail === "object" && data.detail.message) {
              errorMessage = data.detail.message;
            } else if (typeof data.detail === "string") {
              errorMessage = data.detail;
            }
          } else if (data && data.message) {
            errorMessage = data.message;
          }
        } catch (e) {
          try {
            const text = await res.text();
            if (text) errorMessage = text;
          } catch (_) {
            errorMessage = res.statusText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error("Error fetching songs:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-10rem)] w-full flex flex-col items-center justify-start overflow-hidden px-4">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">
        {/* Logo and Brand Introduction */}
        <div className="flex flex-col items-center mt-4 mb-2 animate-fade-in">
          <div className="relative hover:scale-105 transition-transform duration-300">
            <Image
              src="/song-snatch.png"
              alt="Music Logo"
              width={160}
              height={160}
              className="drop-shadow-[0_8px_24px_rgba(16,185,129,0.15)]"
              priority
            />
          </div>
          <p className="mt-4 text-slate-400 text-sm max-w-md">
            Instantly download Spotify tracks, playlists, and albums to high-quality audio files.
          </p>
        </div>

        {/* Search Container */}
        <InputBox query={query} setQuery={setQuery} onSubmit={fetchSongs} />
        
        {/* Error Notification */}
        {error && (
          <div className="mx-auto my-4 max-w-md w-full px-4">
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 text-sm font-medium">
                <p className="font-semibold text-red-300 text-left">Error</p>
                <p className="mt-1 opacity-90 text-left">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loader or Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-12 py-8">
            <ClipLoader
              color="#10b981"
              loading={isLoading}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            <p className="text-slate-400 text-xs font-medium mt-3 animate-pulse">
              Snatching metadata and assets...
            </p>
          </div>
        ) : (
          <SongList songs={songs} />
        )}

        {/* Step Guide Section */}
        <div className="w-full max-w-4xl px-4 mx-auto mt-14 mb-16 border-t border-slate-900/60 pt-12">
          <h3 className="text-center text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-2">How it works</h3>
          <h2 className="text-center text-2xl font-extrabold text-white mb-10">Get your music in 3 easy steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/40 hover:bg-slate-900/40 transition-all duration-300 group hover:scale-[1.02] text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-2">1. Find on Spotify</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Open Spotify and search for the track, album, or playlist you want to download.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/40 hover:bg-slate-900/40 transition-all duration-300 group hover:scale-[1.02] text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-2">2. Copy URL Link</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click share or options (three dots) next to the item and copy its URL to your clipboard.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/40 hover:bg-slate-900/40 transition-all duration-300 group hover:scale-[1.02] text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-2">3. Snatch & Download</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Paste the copied URL in the field above, hit "Fetch", then click "Get Song" / "Download".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}