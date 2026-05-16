# Dockerfile for worker (FastAPI)
FROM python:3.11-slim

COPY --from=ghcr.io/astral-sh/uv:0.9.2 /uv /bin/

WORKDIR /app

RUN apt-get -y update && apt-get -y upgrade && apt-get install -y --no-install-recommends ffmpeg

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

# Copy application
COPY . .

# Ensure the virtual environment is in the PATH
ENV PATH="/app/.venv/bin:$PATH"

ENV WORKER_PORT=8000
EXPOSE 8000

# Start uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
