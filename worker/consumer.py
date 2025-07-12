import redis
import json
import pika
import datetime
from internal.spotify import spotify
from internal.downloader import downloader
from helper.helper import track_model_to_query

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

def callback(ch, method, properties, body):
    job = json.loads(body)
    print(job)
    job_id = job["jobId"]
    url = job["url"]
    song_names = []

    try:
        content_type = spotify.get_spotify_url_type(url)

        if content_type == "track":
            track_model = spotify.get_track_metadata(url)
            query = track_model_to_query(track_model)
            path = downloader.download_first_youtube_audio(query)
            if path:
                song_names.append(path.split("/")[-1])
        else:
            track_list_model = spotify.get_track_list_metadata(url, content_type)
            for track_model in track_list_model:
                query = track_model_to_query(track_model)
                path = downloader.download_first_youtube_audio(query)
                if path:
                    song_names.append(path.split("/")[-1])

        result = {
            "jobId": job_id,
            "status": "completed",
            "songs": song_names,
            "completedAt": datetime.datetime.now().isoformat()
        }

        r.set(job_id, json.dumps(result))
        print(f"job {job_id} done")

    except Exception as e:
        r.set(job_id, json.dumps({
            "jobId": job_id,
            "status": "error",
            "error": str(e)
        }))
        print(f"Job {job_id} failed: {e}")

    ch.basic_ack(delivery_tag=method.delivery_tag)

# RabbitMQ connection
conn = pika.BlockingConnection(pika.ConnectionParameters("localhost" , heartbeat= 600))
channel = conn.channel()
channel.queue_declare(queue='song_jobs', durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='song_jobs', on_message_callback=callback)

print("worker waiting for jobs...")
channel.start_consuming()
