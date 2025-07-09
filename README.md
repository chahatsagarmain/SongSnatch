# 🎵 Spotify Downloader API + CLI

This project provides an integrated **FastAPI backend** and **Typer CLI tool** to download songs from Spotify links (track, album, or playlist) by searching for the corresponding YouTube audio and saving it locally as `.mp3`.

---

## 📦 Features

### ✅ FastAPI Backend (HTTP API)
- `/v1/spotify/find` – Accepts Spotify URL, fetches metadata, downloads from YouTube.
- `/v1/song/list` – Lists downloaded songs.
- `/v1/song/download/{song_name}` – Serves MP3 file for download or playback.

### ✅ Typer CLI Tool
- `spotify-find <url>` – Downloads from Spotify track/album/playlist link.
- `list-songs` – Lists locally saved MP3s.
- `download-song <name>` – Prints absolute path to downloaded MP3.
- `install-completion` – Enables shell autocomplete for CLI.

---

## 🚀 Getting Started

### 🛠 Prerequisites

- Python 3.9+
- `ffmpeg` installed and in PATH
- YouTube-dl / yt-dlp compatible backend for downloading
- Optional: `.env` file for environment variables like port

---

## 🧪 Running the API

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run the API

```bash
python main.py
```

Default: `http://localhost:8000`

### API Endpoints

| Method | Endpoint                        | Description                     |
| ------ | ------------------------------- | ------------------------------- |
| POST   | `/v1/spotify/find?url=...`      | Download audio from Spotify URL |
| GET    | `/v1/song/list`                 | List all downloaded songs       |
| GET    | `/v1/song/download/{song_name}` | Stream or download specific MP3 |
| GET    | `/`                             | Root health check               |

---

## 🔧 Using the CLI Tool

### Install `typer` if not already:

```bash
pip install typer[all]
```

### Run CLI commands

```bash
python cli.py spotify-find "<spotify-url>"
python cli.py list-songs
python cli.py download-song "song1.mp3"
```

## ⚙️ Configuration (Optional)

Set the port in `.env`:
Enter the spotify dev account credentials
```
WORKER_PORT=8000
SPOTIFY_CLIENT_ID=clientid_here
SPOTIFY_CLIENT_SECRET=secret_here
```

---

## 📚 Example

### Download from Spotify

```bash
python cli.py spotify-find "https://open.spotify.com/track/xyz"
```

Or via API:

```bash
curl -X POST "http://localhost:8000/v1/spotify/find?url=https://open.spotify.com/track/xyz"
```
