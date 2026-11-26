
exports.handler = async (event) => {
  const query = (event.queryStringParameters?.q || "").trim();

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Recherche vide." })
    };
  }

  try {
    const url = "https://fr.wikipedia.org/w/api.php?" +
      new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: query,
        srlimit: "10",
        format: "json",
        origin: "*"
      });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("WIKIPEDIA_HTTP_" + response.status);
    }

    const data = await response.json();

    const results = (data.query?.search || []).map(item => ({
      title: item.title,
      description: item.snippet.replace(/<[^>]*>/g, ""),
      url: "https://fr.wikipedia.org/wiki/" +
        encodeURIComponent(item.title.replace(/ /g, "_"))
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        results,
        total: results.length
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erreur de recherche",
        details: error.message
      })
    };
  }
};
