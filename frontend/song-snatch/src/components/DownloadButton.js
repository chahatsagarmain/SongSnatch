import { use, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DownloadButton({ songName }) {
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading , setIsLoading] = useState(false);
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
      console.log(songName);
      console.log(songFile);
      console.log(file);
      setFileUrl(songFile);
    } catch (err) {
      console.error("Error checking file for:", songName, err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {!fileUrl ? (
        <button
          onClick={() => getSong(songName)}
          disabled={isLoading}
          className="mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 disabled:opacity-50 px-6 py-2 rounded-lg shadow-md inline-block text-white no-underline cursor-pointer transition-colors duration-200"
        >
          {isLoading ? "Loading..." : "Get Song"}
        </button>
      ) : (
        <a
          href={fileUrl}
          download={`${songName}`}
          className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg shadow-md inline-block text-white no-underline cursor-pointer transition-colors duration-200"
        >
          Download File
        </a>
      )}
      {error && (
        <p className="text-red-400 text-xs mt-2 font-medium max-w-[200px] text-center animate-in fade-in duration-300">
          {error}
        </p>
      )}
    </div>
  );
}
