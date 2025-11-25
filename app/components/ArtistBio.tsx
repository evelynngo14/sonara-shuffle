const fetchArtistBio = (artistName: string): Promise<string | null> =>
  new Promise(async (resolves, rejects) => {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(artistName)}&format=json&origin=*`;

    fetch(apiUrl, { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          console.error(`Wikipedia returned status: ${response.status}`);
          return resolves(null);
        }
        return response.json();
      })
      .then(async (data) => {
        const searchResults = data.query?.search;

        if (!searchResults || searchResults.length === 0) {
          console.log("No Wikipedia search results found for artist.");
          // Successfully checked, but no data found
          resolves(null);
        } else {
          // Extract the snippet (short bio) from the first result

          const topResult = searchResults[0];
          const pageTitle = topResult.title;
          // Use snippet for the initial filter checks
          let bioSnippet = topResult.snippet;

          const lowerBio = bioSnippet.toLowerCase(); // Convert for case-insensitive checking

          // Check for disambiguation page
          if (lowerBio.includes("may refer to")) {
            console.log("Skipping bio due to disambiguation page snippet.");
            resolves(null);
            return;
          }

          // New Logic: Check if the bio mentions music-related terms
          const musicKeywords = [
            "musician",
            "band",
            "singer",
            "singer-songwriter",
            "songwriter",
            "artist",
            "rapper",
            "group",
          ];
          const isMusicRelated = musicKeywords.some((keyword) =>
            lowerBio.includes(keyword),
          );

          if (!isMusicRelated) {
            console.log(
              `Skipping bio for "${artistName}" as it doesn't clearly state a music career.`,
            );
            resolves(null);
            return;
          }

          const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(pageTitle)}&exintro=true&explaintext=true&redirects=1&format=json&origin=*`;

          const extractResponse = await fetch(extractUrl, { method: "GET" });
          if (!extractResponse.ok) {
            console.error(
              `Wikipedia extract fetch returned non-OK status: ${extractResponse.status}`,
            );
            return resolves(null);
          }
          const extractData = await extractResponse.json();

          const pages = extractData.query?.pages;
          const pageId = Object.keys(pages)[0];
          let fullBio = pages[pageId]?.extract;

          if (!fullBio) {
            console.log("Could not find full extract for the page.");
            return resolves(null);
          }

          // 3. Clean up and truncate (now working on the full extract)
          fullBio = fullBio.replace(/<[^>]*>?/gm, "").trim();

          const maxLength = 500;
          if (fullBio.length > maxLength) {
            // Try to find the last complete sentence before the limit for cleaner truncation
            const lastSentenceEnd = fullBio.lastIndexOf(".", maxLength);
            if (lastSentenceEnd > maxLength - 100) {
              fullBio = fullBio.substring(0, lastSentenceEnd + 1);
            } else {
              fullBio = fullBio.substring(0, maxLength) + "...";
            }
          }

          resolves(fullBio);
        }
      })
      .catch((error) => {
        console.error(`Error fetching Wikipedia page:`, error);
        rejects(error);
      });
  });

export default fetchArtistBio;
