import os
import requests
import re
from typing import Optional
from jiosaavnpy import JioSaavn

song_path = "/tmp/songs/"

def sanitize_filename(title: str) -> str:
    return re.sub(r'[^\w\-_\. ]', '_', title)

def download_jiosaavn_audio(query: str, redis_client=None) -> Optional[str]:
    print(f"[JIOSAAVN] Searching for query: {query}")
    try:
        if not os.path.exists(song_path):
            os.makedirs(song_path)

        cache_key = f"cache:jiosaavn:{query}"
        if redis_client:
            cached_path = redis_client.get(cache_key)
            if cached_path and os.path.exists(cached_path):
                print(f"[REDIS CACHE HIT] '{cached_path}' already exists, skipping JioSaavn API.")
                return cached_path
            elif cached_path:
                redis_client.delete(cache_key)

        # 1. Search for the song
        js = JioSaavn()
        results = js.search_songs(query, limit=1)

        if not results:
            print(f"[JIOSAAVN] No results found for query: {query}")
            return None

        track = results[0]
        title = track.get('title', 'Unknown Title')
        
        # 2. Get stream URL (prefer high quality)
        stream_urls = track.get('stream_urls', {})
        download_url = stream_urls.get('high_quality') or stream_urls.get('medium_quality') or stream_urls.get('low_quality')

        if not download_url:
            print("[JIOSAAVN] No downloadable stream URL found.")
            return None
        
        # 3. Download the file
        clean_title = sanitize_filename(title)
        final_filepath = os.path.join(song_path, f"{clean_title}.mp3")

        print(f"[JIOSAAVN] Downloading {title} from {download_url}...")
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
        
        with requests.get(download_url, stream=True, headers=headers) as r:
            r.raise_for_status()
            with open(final_filepath, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

        print(f"[JIOSAAVN] Downloaded to {final_filepath}")
        
        if redis_client:
            redis_client.set(cache_key, final_filepath, ex=2592000)

        return final_filepath

    except Exception as e:
        print(f"[JIOSAAVN] Error fetching query '{query}': {e}")
        return None
