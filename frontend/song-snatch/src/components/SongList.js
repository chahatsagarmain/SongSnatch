import DownloadButton from "./DownloadButton";

export default function SongList({ songs }) {
  if (songs.length === 0) return null;

  return (
    <div className="mt-6 mb-12 text-center">
      <h2 className="font-semibold">Songs:</h2>
      <ul className="mt-2">
        {songs.map((song, idx) => (
          <li key={idx} className="flex items-center justify-between p-2 mt-2 bg-gray-800 border border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out">
            <span className="text-left flex-1 font-medium text-white">{song}</span>
            <div className="ml-4 mb-4">
              <DownloadButton songName={song} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
