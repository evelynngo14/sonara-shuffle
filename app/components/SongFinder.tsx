import React, { useState } from 'react';
import ListDecades, { Decades } from '../components/ListDecades';
import ListGenres, { Genres } from '../components/ListGenres';
import getAccessToken from '../lib/spotify';


export interface Track {
  id: string;
  name: string;
  artists: string[];
  albumArt: string;
  releaseDate: string;
  preview_url: string | null;
  external_url: {
    spotify: string;
  };
}

const SongFinder: React.FC = () => {
  const [genre, setGenre] = useState<string>('any');
  const [selectedRange, setSelectedRange] = useState<[number, number]>(Decades['any']);
  const [track, setTrack] = useState<Track | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(false);


  const accessToken = getAccessToken();

  const fetchSong = async () => {
    if (!accessToken) {
      setError("Missing Spotify access token");
      return;
    }

    setLoading(true);
    setError('');
    setTrack(null);

    try {
      // Construct the query: "genre:pop year:1980-1989"
      const [mixYear, maxYear] = selectedRange;
      const query = `genre:${genre} year:${mixYear}-${maxYear}`;

      // Randomize the offset to get different songs (Spotify limits offset to 1000)
      const randomOffset = Math.floor(Math.random() * 50);

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1&offset=${randomOffset}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      if (data.tracks && data.tracks.items.length > 0) {
        const foundTrack = data.tracks.items[0];
        setTrack({
          id: foundTrack.id,
          name: foundTrack.name,
          artists: foundTrack.artists,
          albumArt: foundTrack.images[0]?.url,
          releaseDate: foundTrack.release_date,
          preview_url: foundTrack.preview_url,
          external_url: foundTrack.external_urls.spotify,
        });
      } else {
        setError("No songs found");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch song");
    } finally {
      setLoading(false);
    }
  };

  // Handlers: receives the data from ListDecades component
  const handleDecadeSelect = (label: string, range: [number, number]) => {
    console.log(`Parent received: ${label}`, range);
    setSelectedRange(range);
  };

  const handleGenreSelect = (label: string) => {
    console.log(`Parent received: ${label}`);
    setGenre(label);
  }

  return (
    <>
      <div>
        <ListDecades decades={Decades} onClick={handleDecadeSelect} />
        <ListGenres genres={Genres} onClick={handleGenreSelect} />
        <button
          onClick={fetchSong}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Find Song'}
        </button>
      </div>
    </>
  );
}


export default SongFinder;
