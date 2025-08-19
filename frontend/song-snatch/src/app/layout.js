import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "SongSnatch",
  description: "Fetch and download your favorite songs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex mt-24 justify-center">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}