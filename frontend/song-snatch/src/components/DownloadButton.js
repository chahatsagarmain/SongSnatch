import { use, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DownloadButton({ songName }) {
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading , setIsLoading] = useState(false);

  async function getSong(songName) {
    setIsLoading(true);
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
      
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `${songName}`, { type: 'audio/mpeg' });
        const songFile = URL.createObjectURL(file);
        console.log(songName);
        console.log(songFile);
        console.log(file);
        setFileUrl(songFile);
      }
    } catch (err) {
      console.error("Error checking file for:", songName, err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {!fileUrl ? (
        <button
          onClick={() => getSong(songName)}
          className="mt-6 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg shadow-md inline-block text-white no-underline cursor-pointer"
        >
          {isLoading ? "Loading..." : "Get Song"}
        </button>
      ) : (
        <a
          href={fileUrl}
          download={`${songName}`}
          className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg shadow-md inline-block text-white no-underline cursor-pointer"
        >
          Download File
        </a>
      )}
    </>
  );
}
