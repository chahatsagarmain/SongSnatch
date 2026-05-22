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
    <div className="bg-gray-900 flex flex-col items-center justify-start h-full w-full">
      <Image src="/song-snatch.png" alt="Music Logo" width={300} height={300} />
      <InputBox query={query} setQuery={setQuery} onSubmit={fetchSongs} />
      
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

      {isLoading ? (
        <div className="flex items-center justify-center mt-8">
          <ClipLoader
            color="#3b82f6"
            loading={isLoading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <SongList songs={songs} />
      )}
    </div>
  );
}