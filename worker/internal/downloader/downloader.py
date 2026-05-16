import yt_dlp
import os
from typing import Optional
from .jiosaavn import download_jiosaavn_audio

# song_path = "./songs/"
song_path = "/tmp/songs/" # temp directory 

def download_audio(query: str, redis_client=None) -> Optional[str]:
    path = _download_youtube_audio(query, redis_client)
    if path:
        return path
    
    print("[FALLBACK] YouTube download failed, falling back to JioSaavn...")
    return download_jiosaavn_audio(query, redis_client)

def _download_youtube_audio(query: str, redis_client=None) -> Optional[str]:
    if not os.path.exists(song_path):
        os.makedirs(song_path)

    cache_key = f"cache:ytsearch:{query}"

    if redis_client:
        cached_path = redis_client.get(cache_key)
        if cached_path and os.path.exists(cached_path):
            print(f"[REDIS CACHE HIT] '{cached_path}' already exists, skipping YouTube API.")
            return cached_path
        elif cached_path:
            # The file was deleted from disk but is still in Redis, clean it up
            redis_client.delete(cache_key)

    ydl_opts = {
        'format': 'bestaudio/best/wa/worst',
        'noplaylist': True,
        'no_warnings': True,
        'quiet' : True,
        'outtmpl': os.path.join(song_path, '%(title)s.%(ext)s'),
        'restrictfilenames': True,  # Prevent special characters in filenames
        'concurrent_fragment_downloads': 5,  # Speed up download
        'socket_timeout': 15,  # Prevent hanging
        'retries': 3,
        'fragment_retries': 3,
        'source_address': '0.0.0.0',  # Force IPv4
        'extractor_args': {'youtube': ['player_client=ios']},  # Bypass "content not available on this app" error
        'postprocessors': [
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }
        ]
    }


    search_query = f"ytsearch1:{query}"

    print(f"searching for {search_query}")

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            # First, fetch metadata without downloading
            info = ydl.extract_info(search_query, download=False)
            if not info or 'entries' not in info or not info['entries']:
                return None
                
            entry = info['entries'][0]
            
            # Predict the final MP3 filename
            final_filepath = ydl.prepare_filename(entry).replace(".webm", ".mp3").replace(".m4a", ".mp3").replace(".mp4", ".mp3")
            

            if redis_client:
                redis_client.set(cache_key, final_filepath, ex=2592000) 

            # Download since we don't have it
            ydl.download([entry['webpage_url']])
            print("here we are")
            if redis_client:
                redis_client.set(cache_key, final_filepath, ex=2592000)
            return final_filepath
            
        except Exception as e:
            print(f"yt-dlp error : {e}")
            return None