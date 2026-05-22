import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from router.spotify import spotify_router
from router.songs import song_router
from metrics import registry
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST


load_dotenv(dotenv_path="../.env")

app = FastAPI()

app.include_router(spotify_router , prefix="/v1")
app.include_router(song_router , prefix="/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],) 

@app.get("/")
async def root():
    return JSONResponse(status_code=200,
                        content={"message" : "/ route"})

@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(registry), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)