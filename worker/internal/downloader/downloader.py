import yt_dlp
import os
from typing import Optional

song_path = "./songs/"

def download_first_youtube_audio(query: str) -> Optional[str]:
    if not os.path.exists(song_path):
        os.makedirs(song_path)

    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': False,
        'outtmpl': os.path.join(song_path, '%(title)s.%(ext)s'),
        'postprocessors': [
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }
        ]
    }

    search_query = f"ytsearch1:{query}"

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(search_query, download=True)
        filename = ydl.prepare_filename(info['entries'][0])
        if not info or not filename:
            return None
        return filename.replace(".webm", ".mp3").replace(".m4a", ".mp3")

    return None