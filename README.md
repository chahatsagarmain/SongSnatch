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

We use [uv](https://github.com/astral-sh/uv) for fast package management.

```bash
cd worker
uv sync
```

### Run the API

```bash
uv run main.py
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

### Install dependencies:

```bash
cd worker
uv sync
```

### Run CLI commands

```bash
uv run cli.py spotify-find "<spotify-url>"
uv run cli.py list-songs
uv run cli.py download-song "song1.mp3"
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
uv run cli.py spotify-find "https://open.spotify.com/track/xyz"
```

Or via API:

```bash
curl -X POST "http://localhost:8000/v1/spotify/find?url=https://open.spotify.com/track/xyz"
```
---

## 🛠️ Setup: SongSnatch with Worker Queue & Docker

This project uses a **containerized microservices architecture** with separate producer and worker services:

* ✅ **Node.js Producer** (API server) – queues download jobs via RabbitMQ
* ✅ **Python Worker** (FastAPI + background consumer) – downloads songs from Spotify/YouTube
* ✅ **Redis** – persistent job state storage
* ✅ **RabbitMQ** – message queue for job distribution
* ✅ **Prometheus** – metrics collection from services
* ✅ **Grafana** – visualization dashboards
* ✅ **JioSaavn Fallback** – Automatically attempts to download from JioSaavn if YouTube is blocked or fails
* ✅ **Dead-Letter Queue (DLQ)** – Handles failed RabbitMQ messages for better resilience

---

### 🐳 Quick Start with Docker Compose

**Prerequisites:**
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

**1. Create `.env` file with Spotify credentials:**

```bash
cp .env.example .env
# Edit .env and add:
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

**2. Start all services:**

```bash
docker compose up --build
```

This starts:
- **Producer API**: http://localhost:8000 (Node.js Express)
- **Worker API**: http://localhost:8080 (Python FastAPI)
- **RabbitMQ UI**: http://localhost:15672 (guest/guest)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3100 (admin/admin)

---

### 🌐 API Endpoints

| Method  | Route                        | Service    | Description                   |
| ------- | ---------------------------- | ---------- | ----------------------------- |
| `POST`  | `/v1/find?url=<spotify_url>` | Producer   | Queue a Spotify download job  |
| `GET`   | `/v1/status?jobId=<job_id>`  | Producer   | Check job status in Redis     |
| `GET`   | `/v1/download/:song_name`    | Producer   | Download a completed MP3 file |
| `GET`   | `/v1/song/list`              | Worker     | List all downloaded songs     |
| `GET`   | `/metrics`                   | Both       | Prometheus metrics endpoint   |

---

### 📊 Monitoring & Metrics

Both services export Prometheus metrics:

**Producer Metrics** (`http://localhost:8000/metrics`):
- `producer_jobs_created_total` – Total jobs queued (with status label)
- `producer_job_status_checks_total` – Total status requests
- `producer_redis_connected` – Redis connection status (1/0)
- `producer_rabbit_connected` – RabbitMQ connection status (1/0)

**Worker Metrics** (`http://localhost:8080/metrics`):
- `worker_jobs_processed_total` – Total jobs completed/failed (with status label)
- `worker_songs_downloaded_total` – Total songs downloaded (with status label)
- `worker_download_duration_seconds` – Download time histogram
- `worker_active_downloads` – Currently active downloads
- `worker_redis_connected` – Redis connection status (1/0)
- `worker_rabbit_connected` – RabbitMQ connection status (1/0)

**View Metrics:**
1. **Prometheus UI**: http://localhost:9090 → Query metrics directly
2. **Grafana**: http://localhost:3100 → Create custom dashboards
   - Data source is auto-configured to Prometheus

---

### 📦 Example API Requests

#### 🎶 Queue a song/album/playlist for download

```bash
curl -X POST "http://localhost:8000/v1/find?url=https://open.spotify.com/album/6AyUVv7MnxxTuijp4WmrhO"
```

Response:
```json
{
  "message": "Job created",
  "jobId": "0197fe57-6334-767e-aae2-0dd415799d46"
}
```

#### 📊 Check job status

```bash
curl "http://localhost:8000/v1/status?jobId=0197fe57-6334-767e-aae2-0dd415799d46"
```

Response:
```json
{
  "data": {
    "jobId": "0197fe57-6334-767e-aae2-0dd415799d46",
    "status": "completed",
    "songs": ["Muse - Unintended.mp3"],
    "completedAt": "2026-02-05T12:34:56.789Z"
  }
}
```

#### 📥 Download a specific MP3 file

```bash
curl "http://localhost:8000/v1/download/Muse%20-%20Unintended.mp3" --output song.mp3
```

---

### 🔧 Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Docker Compose Network                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐         ┌──────────────┐                   │
│  │  Producer   │         │   Worker     │                   │
│  │  (Node.js)  │──RMQ──▶ │ (FastAPI)    │                   │
│  │  :8000      │  RMQ  │ :8080         │                   │
│  └─────────────┘  ◀────┘ │              │                   │
│         │                 │ worker-      │                   │
│         │                 │ consumer     │                   │
│         │                 └──────────────┘                   │
│         │                       │                             │
│         └──────────────┬────────┘                             │
│                        │                                      │
│              ┌─────────▼────────┐                             │
│              │  Shared Volume   │                             │
│              │  /tmp/songs      │                             │
│              └──────────────────┘                             │
│                                                               │
│  ┌──────────┐  ┌─────────┐  ┌──────────────┐                │
│  │  Redis   │  │RabbitMQ │  │ Prometheus   │                │
│  │ :6379    │  │ :5672   │  │ :9090        │                │
│  └──────────┘  └─────────┘  └──────────────┘                │
│                                      │                        │
│                              ┌───────▼────────┐              │
│                              │  Grafana       │              │
│                              │  :3100 (UI)    │              │
│                              └────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### ⚡ Caching Strategy

The system implements a robust caching layer using **Redis** to minimize redundant API calls and processing:
*   **Search Caching**: YouTube and JioSaavn search results are cached for 30 days. If the same song is requested again, the system skips the search/download and serves the existing file.
*   **Job Persistence**: All job metadata and statuses are stored in Redis, allowing the producer to track progress across restarts.
*   **Performance**: Cached hits reduce processing time from ~10-15 seconds to under 100ms.

---

### 🔄 Fallback Mechanism

SongSnatch is designed to be highly resilient. If a YouTube download fails (due to a 403 Forbidden error, regional restrictions, or bot detection), the worker will:
1. Catch the exception from `yt-dlp`.
2. Automatically trigger a search on **JioSaavn** using the track metadata.
3. Download the high-quality audio directly from JioSaavn's CDN.

This ensures that most songs are successfully downloaded even when YouTube's anti-bot measures are aggressive.

---

### 🔀 Dead-Letter Queue (DLQ) Integration

The messaging system includes a Dead-Letter Queue setup to handle failed jobs gracefully. If the Python Worker encounters an exception while downloading a song (e.g., network failure, invalid URL), it will negatively acknowledge (`nack`) the message without requeuing it. 

RabbitMQ is configured with a Dead-Letter Exchange (`song_jobs_dlx`) that automatically catches these failed messages and routes them to a dedicated queue (`song_jobs_dlq`) for later inspection, preventing data loss and infinite retry loops.

---

### 🛑 Stop Services

```bash
docker compose down
```

Remove volumes:
```bash
docker compose down -v
```

---

## 🧪 Running Standalone (without Docker)

### 🐇 1. Start RabbitMQ

```bash
docker run -it --rm -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

### 🧠 2. Start Redis

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest
```

### 🚀 3. Start Producer

```bash
cd producer
npm install
npm start
```

### ⚙️ 4. Start Worker

```bash
cd worker
uv sync
uv run consumer.py
```

### 🌐 5. Start Worker API (in another terminal)

```bash
cd worker
uv run main.py
```

---
