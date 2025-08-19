import os
from fastapi.routing import APIRouter
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse , FileResponse

song_router = APIRouter(prefix="/song",tags=["songs"])

songs_dir = "./songs/"

@song_router.get("/list")
async def list_songs():
    if not os.path.exists(songs_dir):
        # return HTTPException(status_code=404)
        os.makedirs(songs_dir)
    song_names = []
    for file_name in os.listdir(songs_dir):
        if file_name.endswith(".mp3"):
            song_names.append(file_name)
    return JSONResponse(status_code=200,
                        content={"songs" : song_names})

@song_router.get("/download/{song_name}")
async def download_song(song_name : str):
    song_path = os.path.join(songs_dir , song_name)
    if os.path.exists(song_path) and song_path.endswith(".mp3"):
        return FileResponse(path=song_path,
                            status_code=200,
                            media_type="audio/mpeg")
    return HTTPException(status_code=404)
    