from prometheus_client import Counter, Gauge, Histogram, CollectorRegistry

registry = CollectorRegistry()

songs_downloaded_counter = Counter(
    'worker_songs_downloaded_total',
    'Total number of songs downloaded',
    ['status'],
    registry=registry
)

download_duration_histogram = Histogram(
    'worker_download_duration_seconds',
    'Time taken to download a song',
    registry=registry
)

jobs_processed_counter = Counter(
    'worker_jobs_processed_total',
    'Total number of jobs processed',
    ['status'],
    registry=registry
)

rabbit_connection_status = Gauge(
    'worker_rabbit_connected',
    'RabbitMQ connection status (1=connected, 0=disconnected)',
    registry=registry
)

redis_connection_status = Gauge(
    'worker_redis_connected',
    'Redis connection status (1=connected, 0=disconnected)',
    registry=registry
)

active_downloads_gauge = Gauge(
    'worker_active_downloads',
    'Number of currently active downloads',
    registry=registry
)

job_queue_depth = Gauge(
    'worker_job_queue_depth',
    'Current depth of job queue',
    registry=registry
)
