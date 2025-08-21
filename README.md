# 🎵 Spotify Downloader API + CLI + WORKER QUEUE

This project provides an integrated **FastAPI backend** and **Typer CLI tool** to download songs from Spotify links (track, album, or playlist) by searching for the corresponding YouTube audio and saving it locally as `.mp3`.

Apart from the above methods the whole application can be run as a scalable backend using Worker Queue (in our case RabbitMQ) . NodeJS server produces messages which is consumed by our python worker to download songs . 

A deployed instance should be available on https://song-snatch.vercel.app/ , The frontend is deployed on vercel and backend is deployed locally on my laptop exposed with tunneling to a static domain . 

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
---

## 🛠️ Setup: SongSnatch with Worker Queue

This project allows users to download songs from Spotify (track, album, or playlist) using a background worker architecture with:

* ✅ **Node.js** (API producer)
* ✅ **Python** (worker/consumer)
* ✅ **Redis** (job tracking)
* ✅ **RabbitMQ** (task queue)

---

### ✅ Prerequisites

Ensure the following are installed:

* [Node.js](https://nodejs.org/)
* [Python 3.8+](https://www.python.org/)
* [Docker](https://www.docker.com/)
* `pip3` (Python package installer)

---

### 🐇 1. Start RabbitMQ (with Management UI)

```bash
docker run -it --rm -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

* UI: [http://localhost:15672](http://localhost:15672)
* Username: `guest` | Password: `guest`

---

### 🧠 2. Start Redis

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest
```

---

### 🚀 3. Start the Node.js Producer (API Server)

```bash
cd producer
npm install
npm start
```

---

### ⚙️ 4. Start the Python Worker (Consumer)

```bash
cd worker
pip3 install -r requirements.txt
python3 consumer.py
```

---

## 🌐 API Endpoints

| Method | Route                        | Description                   |
| ------ | ---------------------------- | ----------------------------- |
| `GET`  | `/v1/find?url=<spotify_url>` | Queue a Spotify download job  |
| `GET`  | `/v1/status?jobId=<job_id>`  | Check job status in Redis     |
| `GET`  | `/v1/download/:song_name`    | Download a completed MP3 file |

---

### 📦 Example API Requests

#### 🎶 Queue a song/album/playlist for download

```bash
GET http://localhost:8000/v1/find?url=https://open.spotify.com/album/6AyUVv7MnxxTuijp4WmrhO
```

#### 📊 Check job status

```bash
GET http://localhost:8000/v1/status?jobId=0197fe57-6334-767e-aae2-0dd415799d46
```

Response from Redis (example):

```json
{
  "jobId": "0197fe57-6334-767e-aae2-0dd415799d46",
  "status": "completed",
  "songs": ["Muse - Unintended.mp3"]
}
```

#### 📥 Download a specific MP3 file

```bash
GET http://localhost:8000/v1/download/Muse%20-%20Unintended.mp3
```

---

