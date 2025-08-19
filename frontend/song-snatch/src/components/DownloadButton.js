export default function DownloadButton({ fileUrl }) {
  return (
    <a
      href={fileUrl}
      download
      className="mt-6 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg shadow-md"
    >
      Download File
    </a>
  );
}
