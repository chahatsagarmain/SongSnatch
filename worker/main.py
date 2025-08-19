import os
import uvicorn
from fastapi import Request
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from router.spotify import spotify_router
from router.songs import song_router
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

load_dotenv(dotenv_path="../.env")

app = FastAPI()

app.include_router(spotify_router , prefix="/v1")
app.include_router(song_router , prefix="/v1")

@app.exception_handler(Exception)
async def internal_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )

@app.get("/")
async def root():
    return JSONResponse(status_code=200,
                        content={"message" : "/ route"})

# Uncomment when running locally
# if __name__ == "__main__":
#     port = int(os.getenv("WORKER_PORT", 8000))
#     uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)