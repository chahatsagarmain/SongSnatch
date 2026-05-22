# 🎵 SongSnatch: High-Performance Spotify to MP3 Downloader

SongSnatch is a robust, scalable, and resilient ecosystem designed to convert Spotify metadata into high-quality offline MP3s. It features a **FastAPI backend**, a **Typer-powered CLI**, and a **distributed microservices architecture** built for speed and reliability.

By leveraging a producer-consumer pattern, SongSnatch can handle high-concurrency download jobs across multiple workers, ensuring a seamless experience whether you're using it as a local tool or a deployed cloud service.

---

## 🔧 Service Architecture
<img width="2698" height="1603" alt="Untitled-2025-11-01-0300 (1)" src="https://github.com/user-attachments/assets/2aef5ea4-8647-4d80-b698-39a38ed3ac68" />

---

## 🛡️ Resilience & Performance

SongSnatch is built to handle the volatility of the web with multiple layers of redundancy:

### 🔄 Fallback Mechanism
If a YouTube download is blocked (due to anti-bot measures, 403 errors, or regional restrictions), the worker automatically switches to **JioSaavn**. It fetches high-quality audio directly from JioSaavn's CDN, ensuring your downloads never fail.

### ⚡Caching (Redis)
To ensure lightning-fast performance, we implement a multi-level caching strategy:
- **Search Caching**: YouTube and JioSaavn results are cached for 30 days.
- **Job Status store**: The entire job lifecycle is managed in Redis, allowing for seamless and fast operations .

### 🔀 Reliability with DLQ
Failed download jobs are never lost. We utilize **RabbitMQ Dead-Letter Queues (DLQ)** to catch and store problematic messages, allowing for easy debugging and inspection without disrupting the main processing pipeline. 



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

## ⚙️ Configuration

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
