export default function InputBox({ query, setQuery, onSubmit }) {
  return (
    <div className="flex flex-col items-center m-8">
      <input
        className="px-4 py-2 text-white border-2 border-solid border-white rounded-lg w-80 m-4"
        placeholder="Enter track url..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={onSubmit}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg shadow-md"
      >
        Fetch Songs
      </button>
    </div>
  );
}
