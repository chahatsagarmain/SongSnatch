from models.track import Track

def track_model_to_query(track : Track) -> str:
    track_data = track.model_dump()
    track_name = track_data['name']
    artist_name = ''
    for itr in track_data['artists']:
        artist_name += itr + ' , ' 
    return track_name + ' , ' + artist_name