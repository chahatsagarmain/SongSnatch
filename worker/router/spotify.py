from fastapi import HTTPException
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from internal.spotify import spotify
from internal.downloader import downloader
from helper.helper import track_model_to_query

spotify_router = APIRouter(prefix="/spotify",tags=["spofity" , "router"])

@spotify_router.post("/find")
async def download(url : str):
    content_type = spotify.get_spotify_url_type(url)
    song_names = []
    if not content_type:
        raise HTTPException(status_code=400,
                            detail={"message" : "invalid content type : please use correct url type"})
    try:
        if content_type == "track":
            track_model = spotify.get_track_metadata(url)
            query = track_model_to_query(track_model)
            path = downloader.download_first_youtube_audio(query)
            if path is None:
                raise ValueError()
            song_names.append((path.split("/")[-1]).split(".")[0] + ".mp3")
        else:
            track_list_model = spotify.get_track_list_metadata(url , content_type)
            for track_model in track_list_model:
                query = track_model_to_query(track_model)
                path = downloader.download_first_youtube_audio(query)
                if path is None:
                    continue
                song_names.append((path.split("/")[-1]).split(".")[0] + ".mp3")

    except Exception as e:
        raise HTTPException(status_code=500,
                            content={"message" : str(e)})

    return JSONResponse(status_code=200,
                        content={"message" : "Songs fetched",
                                 "songs" : song_names})