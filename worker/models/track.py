from typing import List
from pydantic import BaseModel


class Track(BaseModel):
    id: str
    name: str
    artists: List[str]
    duration_ms: int


class TrackList(BaseModel):
    tracks: List[Track]
