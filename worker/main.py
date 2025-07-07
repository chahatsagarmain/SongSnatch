from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os
import uvicorn

load_dotenv(dotenv_path="../.env")

app = FastAPI()

@app.get("/")
async def root():
    return 

if __name__ == "__main__":
    port = int(os.getenv("WORKER_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)