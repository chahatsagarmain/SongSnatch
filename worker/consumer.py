import os
import redis
import json
import pika
import datetime
import time
from internal.spotify import spotify
from internal.downloader import downloader
from helper.helper import track_model_to_query
from metrics import (
    jobs_processed_counter,
    songs_downloaded_counter,
    download_duration_histogram,
    rabbit_connection_status,
    redis_connection_status,
    active_downloads_gauge,
)

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
r = redis.from_url(redis_url, decode_responses=True)

rabbit_host = os.getenv("RABBIT_HOST", "localhost")
rabbit_port = int(os.getenv("RABBIT_PORT", 5672))
rabbit_url = os.getenv("RABBIT_URL")

def callback(ch, method, properties, body):
    job = json.loads(body)
    print(job)
    job_id = job["jobId"]
    url = job["url"]
    song_names = []
    start_time = time.time()
    active_downloads_gauge.inc()

    try:
        content_type = spotify.get_spotify_url_type(url)

        if content_type == "track":
            track_model = spotify.get_track_metadata(url)
            query = track_model_to_query(track_model)
            path = downloader.download_audio(query, redis_client=r)
            print(f"path here : {path}")
            if path:
                song_names.append(path.split("/")[-1])
        else:
            print(content_type)
            track_list_model = spotify.get_track_list_metadata(url, content_type)
            for track_model in track_list_model:
                query = track_model_to_query(track_model)
                print(query)
                path = downloader.download_audio(query, redis_client=r)
                if path:
                    song_names.append(path.split("/")[-1])

        if len(song_names) == 0:
            raise ValueError("No Songs could be fetched")

        result = {
            "jobId": job_id,
            "status": "completed",
            "songs": song_names,
            "completedAt": datetime.datetime.now().isoformat()
        }

        r.set(job_id, json.dumps(result))
        print(f"job {job_id} done")
        
        # Record metrics
        duration = time.time() - start_time
        download_duration_histogram.observe(duration)
        songs_downloaded_counter.labels(status='success').inc(len(song_names))
        jobs_processed_counter.labels(status='completed').inc()
        
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        r.set(job_id, json.dumps({
            "jobId": job_id,
            "status": "error",
            "error": str(e)
        }))
        print(f"Job {job_id} failed: {e}")
        songs_downloaded_counter.labels(status='error').inc()
        jobs_processed_counter.labels(status='failed').inc()
        
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    
    finally:
        active_downloads_gauge.dec()

def connect_rabbit(max_retries=12, base_delay_s=2):
    attempt = 0
    while True:
        try:
            if rabbit_url:
                params = pika.URLParameters(rabbit_url)
            else:
                params = pika.ConnectionParameters(rabbit_host, rabbit_port, heartbeat=600)
            conn = pika.BlockingConnection(params)
            channel = conn.channel()
            
            dlx = 'song_jobs_dlx'
            dlq = 'song_jobs_dlq'
            
            channel.exchange_declare(exchange=dlx, exchange_type='direct', durable=True)
            channel.queue_declare(queue=dlq, durable=True)
            channel.queue_bind(exchange=dlx, queue=dlq, routing_key='song_jobs')
            
            channel.queue_declare(queue='song_jobs', durable=True, arguments={
                'x-dead-letter-exchange': dlx,
                'x-dead-letter-routing-key': 'song_jobs'
            })
            channel.basic_qos(prefetch_count=1)
            rabbit_connection_status.set(1)
            print("Connected to RabbitMQ")
            return conn, channel
        except Exception as e:
            attempt += 1
            rabbit_connection_status.set(0)
            if attempt > max_retries:
                print(f"Failed to connect to RabbitMQ after {max_retries} attempts: {e}")
                raise
            delay = base_delay_s * attempt
            print(f"RabbitMQ connection failed (attempt {attempt}), retrying in {delay}s: {e}")
            time.sleep(delay)


# Set Redis connection status
try:
    r.ping()
    redis_connection_status.set(1)
except Exception as e:
    print(f"Redis connection error: {e}")
    redis_connection_status.set(0)

conn, channel = connect_rabbit()
channel.basic_consume(queue='song_jobs', on_message_callback=callback)

print("worker waiting for jobs...")
channel.start_consuming()
