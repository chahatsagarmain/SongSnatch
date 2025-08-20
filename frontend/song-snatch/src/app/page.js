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

  const fetchSongs = async () => {
    setIsLoading(true);
    setSongs([]);
    if(query === "") return;
    try {
      const res = await fetch(`${API_URL}/v1/spotify/find?url=${encodeURIComponent(query)}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 flex flex-col items-center justify-start h-full w-full">
      <Image src="/song-snatch.png" alt="Music Logo" width={300} height={300} />
      <InputBox query={query} setQuery={setQuery} onSubmit={fetchSongs} />
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