
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Méthode non autorisée."
    });
  }

  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      error: "Veuillez saisir une recherche."
    });
  }

  if (query.length > 150) {
    return res.status(400).json({
      error: "Recherche trop longue."
    });
  }

  try {
    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      srlimit: "10",
      srprop: "snippet",
      format: "json",
      origin: "*"
    });

    const response = await fetch(
      "https://fr.wikipedia.org/w/api.php?" + params.toString(),
      {
        headers: {
          "User-Agent": "MadaraSearch/1.0 (search prototype)"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Source de recherche indisponible.");
    }

    const data = await response.json();

    const results = (data.query?.search || []).map(item => ({
      title: item.title,
      description: (item.snippet || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'"),
      url: "https://fr.wikipedia.org/wiki/" +
        encodeURIComponent(item.title.replace(/ /g, "_"))
    }));

    return res.status(200).json({
      success: true,
      query,
      total: results.length,
      source: "Wikipédia",
      results
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Impossible d'effectuer la recherche actuellement."
    });
  }
}
