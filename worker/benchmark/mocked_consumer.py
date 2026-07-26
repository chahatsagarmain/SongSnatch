import os
import sys
import time

# Add the project root to sys.path so we can import internal and other modules
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

# 1. Import modules to be mocked
import internal.spotify.spotify as spotify
import internal.downloader.downloader as downloader
from models.track import Track

# 2. Apply monkeypatches on the imported modules
spotify.get_spotify_url_type = lambda url: "track"

def mock_get_track_metadata(url):
    return Track(
        id="mock_track_id",
        name="Mock Track Name",
        artists=["Mock Artist"],
        duration_ms=180000
    )

spotify.get_track_metadata = mock_get_track_metadata

def mock_get_track_list_metadata(list_url, content_type):
    return [
        Track(
            id=f"mock_track_{i}",
            name=f"Mock Track {i}",
            artists=[f"Mock Artist {i}"],
            duration_ms=180000
        )
        for i in range(5)
    ]

spotify.get_track_list_metadata = mock_get_track_list_metadata

def mock_download_audio(query, redis_client=None):
    mock_delay = float(os.getenv("MOCK_DOWNLOAD_DELAY_SEC", "0.05"))
    if mock_delay > 0:
        time.sleep(mock_delay)
    return "/tmp/songs/mock_song.mp3"

downloader.download_audio = mock_download_audio

# 3. Now import the original consumer and start it
import consumer

if __name__ == "__main__":
    consumer.main()
