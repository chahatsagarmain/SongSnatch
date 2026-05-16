import re
import os
import spotipy
import pprint
from dotenv import load_dotenv
from typing import Optional
from spotipy.oauth2 import SpotifyClientCredentials
from models.track import Track , List

load_dotenv(dotenv_path="../.env")

spotify_client_id = os.getenv("SPOTIFY_CLIENT_ID")
spotify_client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=spotify_client_id,
    client_secret=spotify_client_secret
))

def get_track_metadata(url : str) -> Track:
    track_info = sp.track(url)
    # pprint.pprint(track_info)
    if track_info is None:
        raise ValueError()
    track_model = Track(
        id=track_info['id'],
        name=track_info['name'],
        artists=[artist['name'] for artist in track_info['artists']],
        duration_ms=track_info['duration_ms']
    )
    return track_model

def get_track_list_metadata(list_url : str , content_type : str) -> List[Track]:
    track_list_info = None
    track_list = []
    if content_type == "playlist":
        print(f"[SPOTIFY] Fetching playlist items for: {list_url}")
        results = sp.playlist_items(list_url)
        if results is None:
            raise ValueError("Could not fetch playlist items")
        
        items = results['items']
        while results['next']:
            results = sp.next(results)
            items.extend(results['items'])
            
        print(f"[SPOTIFY] Found {len(items)} tracks in playlist")
        for item in items:
            track_data = item['track']
            if not track_data:
                continue
            track_model = Track(
                id=track_data['id'],
                name=track_data['name'],
                artists=[artist['name'] for artist in track_data['artists']],
                duration_ms=track_data['duration_ms']
            )
            track_list.append(track_model)
    elif content_type == "album":   
        print(f"[SPOTIFY] Fetching album tracks for: {list_url}")
        results = sp.album_tracks(list_url)
        if results is None:
            raise ValueError("Could not fetch album tracks")
        
        items = results['items']
        while results['next']:
            results = sp.next(results)
            items.extend(results['items'])
            
        print(f"[SPOTIFY] Found {len(items)} tracks in album")
        for track in items:
            track_model = Track(
                id=track['id'],
                name=track['name'],
                artists=[artist['name'] for artist in track['artists']],
                duration_ms=track['duration_ms']
            )
            track_list.append(track_model)
    
    else:
        raise ValueError("Invalid content type")
    
    return track_list
def get_spotify_url_type(url: str) -> Optional[str]:

    patterns = {
        "track": r"open\.spotify\.com/track/[\w\d]+",
        "album": r"open\.spotify\.com/album/[\w\d]+",
        "playlist": r"open\.spotify\.com/playlist/[\w\d]+"
    }

    for content_type , regex in patterns.items():
        if re.search(regex , url):
            return content_type

    return None
