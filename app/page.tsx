'use client'
import { useState } from "react";
import { ListGenres } from "./components/ListGenres";
import { ListDecades, Decades } from "./components/ListDecades";
import { Track } from "./lib/spotify";

const Genres = ['pop', 'rock', 'hip-hop', 'jazz', 'country', 'electronic'];

export default function Home() {
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);


  function handleGenreSelect(genre: string) {
    setSelectedGenre(genre);

  }

  async function handleDecadeSelect(decade: string, range: [number, number]) {
    const genre = "rock";

    const rest = await fetch("/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decade: `${range[0]}-${range[1]}`,
        genre,
      })
    });
    const data = await rest.json();
    setCurrentTrack(data);
  }

  async function handleShuffle() {
    const genre =
      selectedGenre ??
      Genres[Math.floor(Math.random() * Genres.length)];

    const decade =
      selectedDecade ??
      Object.values(Decades)[Math.floor(Math.random() * Object.values(Decades).length)];

    setIsShuffling(true);

    try {
      const res = await fetch("/api/route", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decade: `${decade[0]}-${decade[1]}`, // convert typle to string
          genre,
        })
      });
      const data = await res.json();
      setCurrentTrack(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsShuffling(false);
    }

  }

  return (
    <>

      <h1>Sonara Shuffle</h1>

      <h2 className="mt-2">Pick a genre</h2>

      <div>
        <ListGenres genres={Genres} onSelect={handleGenreSelect} />
      </div>

      <h2 className="mt-2">Pick a decade</h2>

      <div>
        <ListDecades decades={Decades} onSelect={handleDecadeSelect} />
      </div>

      <button onClick={handleShuffle}>
        Shuffle
      </button>

      {currentTrack && (
        <div className="mt-6 p-4 border rounded shadow">
          <h2 className="text-xl font-bold">{currentTrack.title}</h2>
          <p>{currentTrack.artists.join(", ")}</p>
          <a
            href={currentTrack.external_url.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Listen on Spotify
          </a>
        </div>
      )}
    </>)
}
