export interface Track {
  id: string;
  title: string;
  artists: string[];
  decade: [number, number];
  genre: string;
  external_url: {
    spotify: string;
  };
}

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify client credentials");
  }


  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Spotify token: ${errorText}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export default async function getRandomSong({
  genre,
  decade,
}: { genre: string; decade: [number, number] }): Promise<Track> {
  const token = await getAccessToken();
  const [minYear, maxYear] = decade;

  const res = await fetch(
    `${SPOTIFY_API_URL}/search?q=year:${minYear}-${maxYear}%20genre:${genre}&type=track&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // <-- Correct usage here
      },
    }
  );

  const data = await res.json();
  if (!data.tracks?.items || data.tracks.items.length === 0) {
    throw new Error("No tracks found");
  }

  const raw = data.tracks.items[Math.floor(Math.random() * data.tracks.items.length)];

  return {
    id: raw.id,
    title: raw.name,
    artists: raw.artists.map((a: { name: string }) => a.name),
    decade,
    genre,
    external_url: { spotify: raw.external_urls.spotify },
  };
}
