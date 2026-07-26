import os
import sys
import time
import json
import subprocess
import redis
import pika
from dotenv import load_dotenv

# Ensure we can load environment variables from the project root or parent
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(base_dir, ".env"))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(base_dir), ".env"))

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
rabbit_host = os.getenv("RABBIT_HOST", "localhost")
rabbit_port = int(os.getenv("RABBIT_PORT", 5672))
rabbit_url = os.getenv("RABBIT_URL")

def main():
    num_jobs = 100
    if len(sys.argv) > 1:
        try:
            num_jobs = int(sys.argv[1])
        except ValueError:
            print(f"Invalid number of jobs: {sys.argv[1]}. Defaulting to 100.")

    print("==================================================")
    print("Starting SongSnatch Worker Queue Benchmark")
    print(f"Number of jobs: {num_jobs}")
    print("==================================================")

    # 1. Connect to Redis and RabbitMQ
    print("[1/5] Connecting to Redis...")
    try:
        r = redis.from_url(redis_url, decode_responses=True)
        r.ping()
        print("Connected to Redis successfully.")
    except Exception as e:
        print(f"Error: Could not connect to Redis: {e}")
        sys.exit(1)

    print("[2/5] Connecting to RabbitMQ...")
    try:
        if rabbit_url:
            params = pika.URLParameters(rabbit_url)
        else:
            params = pika.ConnectionParameters(rabbit_host, rabbit_port, heartbeat=600)
        conn = pika.BlockingConnection(params)
        channel = conn.channel()
        
        # Declare/Purge the queue to start clean
        channel.queue_declare(queue='song_jobs', durable=True, arguments={
            'x-dead-letter-exchange': 'song_jobs_dlx',
            'x-dead-letter-routing-key': 'song_jobs'
        })
        channel.queue_purge(queue='song_jobs')
        print("Connected and purged RabbitMQ 'song_jobs' queue successfully.")
    except Exception as e:
        print(f"Error: Could not connect to RabbitMQ: {e}")
        sys.exit(1)

    # 2. Clear Redis cache keys for mock jobs
    print("[3/5] Cleaning up Redis mock job keys...")
    for i in range(num_jobs):
        r.delete(f"mock_job_{i}")

    # 3. Start the consumer subprocess in mock mode
    print("[4/5] Starting mocked_consumer.py...")
    consumer_path = os.path.join(base_dir, "benchmark", "mocked_consumer.py")
    
    env = os.environ.copy()
    env["MOCK_DOWNLOAD_DELAY_SEC"] = "0.05"
    
    # Run the consumer subprocess (it will spawn 5 workers using ProcessPoolExecutor)
    consumer_proc = subprocess.Popen(
        [sys.executable, consumer_path],
        env=env,
        cwd=base_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(2)  # Give it a moment to initialize and connect

    if consumer_proc.poll() is not None:
        print("Error: Consumer process failed to start.")
        sys.exit(1)

    try:
        # 4. Publish mock jobs to RabbitMQ
        print("[5/5] Enqueuing mock jobs...")
        for i in range(num_jobs):
            job_id = f"mock_job_{i}"
            job = {
                "jobId": job_id,
                "url": "https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGZ5"
            }
            channel.basic_publish(
                exchange='',
                routing_key='song_jobs',
                body=json.dumps(job),
                properties=pika.BasicProperties(delivery_mode=2)
            )

        print("\nBenchmark running... Monitoring queue completion.")
        start_time = time.time()
        timeout = 90  # seconds timeout
        
        while True:
            completed = 0
            errors = 0
            for i in range(num_jobs):
                job_id = f"mock_job_{i}"
                res = r.get(job_id)
                if res:
                    res_data = json.loads(res)
                    status = res_data.get("status")
                    if status == "completed":
                        completed += 1
                    elif status == "error":
                        errors += 1

            total_done = completed + errors
            elapsed = time.time() - start_time
            
            # Print simple inline progress
            print(f"\rProgress: {total_done}/{num_jobs} done (Errors: {errors}) | Elapsed: {elapsed:.2f}s", end="", flush=True)

            if total_done >= num_jobs:
                print("\nAll jobs processed!")
                break
                
            if elapsed > timeout:
                print(f"\nTimeout reached after {timeout}s! Some jobs did not finish.")
                break
                
            time.sleep(0.1)

        # 5. Output Stats
        end_time = time.time()
        duration = end_time - start_time
        throughput = total_done / duration if duration > 0 else 0
        
        print("\n================ BENCHMARK RESULTS ================")
        print(f"Total Jobs Processed: {total_done} / {num_jobs}")
        print(f"Total Time Taken:     {duration:.3f} seconds")
        print(f"Throughput:           {throughput:.2f} jobs/second")
        print(f"Active Workers:       5 (process pool executor)")
        print(f"Mock Download Delay:  0.05s per song")
        print("===================================================")

    finally:
        # Clean up the consumer processes
        print("Stopping consumer processes...")
        consumer_proc.terminate()
        try:
            consumer_proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            consumer_proc.kill()
        print("Consumer processes stopped cleanly.")
        try:
            conn.close()
        except Exception:
            pass

if __name__ == "__main__":
    main()
