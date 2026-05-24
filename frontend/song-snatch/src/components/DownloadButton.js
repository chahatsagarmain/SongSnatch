import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DownloadButton({ songName }) {
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function getSong(songName) {
    setIsLoading(true);
    setError(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl("");
    }
    try {
      const res = await fetch(`${API_URL}/v1/song/download/${encodeURIComponent(songName)}`, {
        method: "GET",
        headers: { 
          "ngrok-skip-browser-warning": "69420",
        },
      });
      
      if (!res.ok) {
        let errorMessage = "Failed to download song. Please try again.";
        try {
          const data = await res.json();
          if (data && data.message) {
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

      const blob = await res.blob();
      const file = new File([blob], `${songName}`, { type: 'audio/mpeg' });
      const songFile = URL.createObjectURL(file);
      setFileUrl(songFile);
    } catch (err) {
      console.error("Error checking file for:", songName, err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end justify-center w-full">
      {!fileUrl ? (
        <button
          onClick={() => getSong(songName)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-900 text-white font-medium text-xs rounded-lg shadow-md hover:shadow-emerald-500/10 transition-all duration-200 active:scale-95 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Preparing...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Get Song
            </>
          )}
        </button>
      ) : (
        <a
          href={fileUrl}
          download={`${songName}`}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-medium text-xs rounded-lg shadow-md hover:shadow-blue-500/10 transition-all duration-200 active:scale-95 cursor-pointer no-underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Download MP3
        </a>
      )}
      {error && (
        <p className="text-red-400 text-[10px] mt-1 font-medium max-w-[180px] text-right animate-in fade-in duration-300">
          {error}
        </p>
      )}
    </div>
  );
}
