"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import InputBox from "../components/InputBox";
import SongList from "../components/SongList";
import DownloadButton from "../components/DownloadButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [polling, setPolling] = useState(false);

  const fetchSongs = async () => {
    setFileUrl("");
    setSongs([]);
    const res = await fetch(`${API_URL}/v1/spotify/find?url=${encodeURIComponent(query)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" ,
              "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setSongs(data.songs || []);
    setPolling(true);
  };

  useEffect(() => {
    if (!polling || songs.length === 0 || fileUrl) return;

    const interval = setInterval(async () => {
      // allowing only 1 song to fetched 
      const song = songs[0];
        try {
          const res = await fetch(`${API_URL}/v1/song/download/${encodeURIComponent(song)}` ,
        {
          method: "GET",
        headers: { 
              "ngrok-skip-browser-warning": "69420",
        },
        });
          if (res.ok) {
            const blob = await res.blob();
            const file = new File([blob], `${song}.mp3`, { type: 'audio/mpeg' });
            const songFile = URL.createObjectURL(file);
            console.log(song);
            setFileUrl(songFile);
            setPolling(false);
          }
        } catch (err) {
          console.error("Error checking file for:", song, err);
        }
      }
    , 5000);

    return () => clearInterval(interval);
  }, [polling, songs, fileUrl]);

  return (
    <div className="bg-gray-900 flex flex-col items-center justify-start h-full w-full">
      <Image src="/song-snatch.png" alt="Music Logo" width={300} height={300} />
      <InputBox query={query} setQuery={setQuery} onSubmit={fetchSongs} />
      <SongList songs={songs} />
      {fileUrl && <DownloadButton fileUrl={fileUrl} />}
    </div>
  );
}
