
export default async function getAccessToken(): Promise<string> {
  const client_id = "a55cd94af1594c81b470f63bfe3dfed5";
  const client_secret = "839b0a15756b4dceb8b15bc5f02d3115";

  const authString = btoa(`${client_id}:${client_secret}`);

  if (!client_id || !client_secret) {
    throw new Error("Missing Spotify client credentials");
  }

  const res = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authString}`,
      },
      body: `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`,
    }
  )

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Spotify token: ${errorText}`);
  }

  const data = await res.json();
  return data.access_token as string;
}
