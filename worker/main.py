import os
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from router.spotify import spotify_router
from router.songs import song_router

load_dotenv(dotenv_path="../.env")

app = FastAPI()

app.include_router(spotify_router , prefix="/v1")
app.include_router(song_router , prefix="/v1")

@app.get("/")
async def root():
    return JSONResponse(status_code=200,
                        content={"message" : "/ route"})

if __name__ == "__main__":
    port = int(os.getenv("WORKER_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)