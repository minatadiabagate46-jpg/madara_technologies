
exports.handler = async (event) => {
  const query = (event.queryStringParameters?.q || "").trim();

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Écris quelque chose à rechercher."
      })
    };
  }

  try {
    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      srlimit: "10",
      srprop: "snippet",
      format: "json"
    });

    const response = await fetch(
      "https://fr.wikipedia.org/w/api.php?" + params
    );

    if (!response.ok) throw new Error("Erreur source");

    const data = await response.json();

    const results = (data.query?.search || []).map(item => ({
      title: item.title,
      description: item.snippet
        .replace(/<[^>]*>/g, ""),
      url: "https://fr.wikipedia.org/wiki/" +
        encodeURIComponent(item.title.replace(/ /g, "_"))
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: true,
        query,
        total: results.length,
        source: "Wikipédia",
        results
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "La recherche est momentanément indisponible."
      })
    };
  }
};
