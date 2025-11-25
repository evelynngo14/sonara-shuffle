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


    const markets = ['US', 'GB'];
    let maxOffset = 950;
    let limit = 50;
    let foundTrack = null;
    let retries = 0;
    let MAX_RETRIES = 5;
    setTrack(null);

    try {
      // Retry loop: continues until a track is found or max retries are reached
      while (!foundTrack && retries < MAX_RETRIES) {
        retries++; // Increment retry count immediately

        // --- MARKET RESTRICTION LOGIC: Randomly select US or GB on each retry ---
        const randomMarket = markets[Math.floor(Math.random() * markets.length)];
        const marketParam = `&market=${randomMarket}`;

        // --- RANDOMIZATION LOGIC: Generate a new random offset on each retry ---
        const offset = Math.floor(Math.random() * maxOffset);

        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}${marketParam}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
        );

        // Check for API errors (e.g., rate limiting, invalid token) outside of 404/no results
        if (!response.ok) {
          // If we get an error response (like 401 Unauthorized or 429 Rate Limit)
          const errorData = await response.json();
          console.error("Spotify API Error:", errorData);
          // Throw an error to break the loop and go to the catch block
          throw new Error(errorData.error?.message || `Spotify API returned status ${response.status}`);
        }

        const data = await response.json();

        const trackItems = data?.tracks?.items;

        if (trackItems && trackItems.length > 0) {
          // Pick a random index from the fetched batch for a better shuffle
          const randomIndex = Math.floor(Math.random() * trackItems.length);
          foundTrack = trackItems[randomIndex];
        } else {
          console.log(`Retry ${retries}/${MAX_RETRIES}: No tracks found in this batch. Retrying...`);
          // Wait briefly before retrying to avoid excessive requests
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Process results after the loop
      if (foundTrack) {
        if (!foundTrack.album || !foundTrack.artists) {
          setError("Incomplete track data returned from Spotify.");
          return;
        }

        setTrack({
          id: foundTrack.id,
          name: foundTrack.name,
          // Safely map artists, ensuring artist names are extracted and defaults to []
          artists: foundTrack.artists?.map((artist: any) => artist.name) || [],
          // Safely access the album art URL
          albumArt: foundTrack.album.images?.[0]?.url || '',
          // Release date is usually on the album object
          releaseDate: foundTrack.album.release_date,
          preview_url: foundTrack.preview_url,
          external_url: foundTrack.external_urls,
        });
      } else {
        setError(`Could not find a song after ${MAX_RETRIES} attempts for ${genre === 'any' ? 'any genre' : genre} in the selected decade in the selected market.`);
        console.log(error)
      }
    } catch (error: any) {
      console.error("Fetch failed:", error);
      setError(`Failed to fetch song: ${error.message || "Network or parsing error."}`);
    } finally {
      setLoading(false);
    }
  };


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
      <div className="selection">
        <h2>Decade</h2>
        <ListDecades decades={Decades} onClick={handleDecadeSelect} />

        <h2>Genre</h2>
        <ListGenres genres={Genres} onClick={handleGenreSelect} />

        <button className="fetch-song"
          onClick={fetchSong}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Find Song'}
        </button>

      </div>

      <div>
        {track && (
          <div className="track-info">
            <h1 className="track-name">{track.name}</h1>

            <p>By {track.artists.join(', ')}</p>

            <p>{track.releaseDate}</p>

            <img
              src={track.albumArt}
              alt={`Album art for ${track.name}`}
              className="w-[200px]"
            />
          </div>)}
      </div>

      <div>
        <p> {error} </p>
      </div>
    </>
  )
}


export default SongFinder;
