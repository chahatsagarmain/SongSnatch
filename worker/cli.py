import typer
import os
from internal.spotify import spotify
from internal.downloader import downloader
from helper.helper import track_model_to_query

app = typer.Typer()

songs_dir = "./songs"

@app.command()
def spotify_find(url: str):
    """
    Download songs from Spotify URL (track, album, or playlist).
    """
    content_type = spotify.get_spotify_url_type(url)
    song_names = []

    if not content_type:
        typer.echo("❌ Invalid content type. Use correct Spotify URL.")
        raise typer.Exit(code=1)

    try:
        if content_type == "track":
            track_model = spotify.get_track_metadata(url)
            query = track_model_to_query(track_model)
            path = downloader.download_first_youtube_audio(query)
            if path is None:
                typer.echo("❌ No audio found.")
                raise typer.Exit(code=1)
            song_names.append(path.split("/")[-1])
        else:
            track_list_model = spotify.get_track_list_metadata(url, content_type)
            for track_model in track_list_model:
                query = track_model_to_query(track_model)
                path = downloader.download_first_youtube_audio(query)
                if path:
                    song_names.append(path.split("/")[-1])

        typer.echo(f"✅ Downloaded: {', '.join(song_names)}")

    except Exception as e:
        typer.echo(f"❌ Error: {str(e)}")
        raise typer.Exit(code=1)


@app.command()
def list_songs():
    """
    List all downloaded MP3 songs.
    """
    if not os.path.exists(songs_dir):
        typer.echo("📁 Song directory not found.")
        return

    files = [f for f in os.listdir(songs_dir) if f.endswith(".mp3")]
    if not files:
        typer.echo("🎵 No songs found.")
        return

    for i, f in enumerate(files, 1):
        typer.echo(f"{i}. {f}")


if __name__ == "__main__":
    app()
