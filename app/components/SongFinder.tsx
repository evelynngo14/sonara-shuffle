import React, { useState, useEffect } from 'react';
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
  const [selectedDecadeLabel, setSelectedDecadeLabel] = useState<string>('any');
  const [track, setTrack] = useState<Track | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null); // State for token

  useEffect(() => {
    const loadToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token);
    };
    loadToken();
  }, []);

  const fetchSong = async () => {
    if (!accessToken) {
      setError("Missing Spotify access token");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [minYear, maxYear] = selectedRange;
      const queryParts: string[] = [];

      // Handle Genre: Only include if not 'any'
      if (genre !== 'any') {
        queryParts.push(`genre:${genre}`);
      }

      // Handle Decade: Only include if not 'any'
      if (selectedDecadeLabel !== 'any') {
        queryParts.push(`year:${minYear}-${maxYear}`);
      }

      // Use a default search term if both genre and decade are 'any', 
      let query = queryParts.join(' ');
      if (query === '') {
        // Fallback to a broad search if no filters are applied
        query = 'track:a'; // Searching for tracks with the letter 'a' is a common broad technique
      }

      const randomOffset = Math.floor(Math.random() * 50);


      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1&offset=${randomOffset}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
      );

      const data = await response.json();
      // check if data exists -> tracks -> items -> returns first item [0]
      const foundTrack = data?.tracks?.items?.[0];
      if (foundTrack) {
        setTrack({
          id: foundTrack.id,
          name: foundTrack.name,
          artists: foundTrack.artists?.map((artist: Track) => artist.name) || [],
          albumArt: foundTrack.album.images[0].url || '',
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
    setSelectedDecadeLabel(label);
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
      <div>
        {track && (
          <div>
            <h2>{track.name}</h2>
            <p>By {track.artists.join(', ')}</p>
            <p>{track.releaseDate}</p>
            <img
              src={track.albumArt}
              alt={`Album art for ${track.name}`}
              className="w-[200px]"
            />
          </div>
        )}      </div>
    </>
  );
}


export default SongFinder;
