# Dockerfile for worker (FastAPI)
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# Source - https://stackoverflow.com/a/73088647
# Posted by Pritam Sinha
# Retrieved 2026-02-05, License - CC BY-SA 4.0

RUN apt-get -y update && apt-get -y upgrade && apt-get install -y --no-install-recommends ffmpeg

# Copy application
COPY . .

ENV WORKER_PORT=8000
EXPOSE 8000

# Start uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
