export default function SongList({ songs }) {
  if (songs.length === 0) return null;

  return (
    <div className="mt-6 text-center">
      <h2 className="font-semibold">Songs:</h2>
      <ul className="mt-2">
        {songs.map((song, idx) => (
          <li key={idx}>{song}</li>
        ))}
      </ul>
    </div>
  );
}
