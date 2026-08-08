function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "haishin-ok",
        message: "Worker is running"
      });
    }

    if (url.pathname === "/api/games") {
      try {
        const { results } = await env.DB
          .prepare(`
            SELECT *
            FROM games
            ORDER BY popularity DESC, name ASC
            LIMIT 100
          `)
          .all();

        return json({
          ok: true,
          count: results.length,
          games: results
        });
      } catch (error) {
        return json({ ok: false, error: error.message }, 500);
      }
    }

    if (url.pathname === "/api/search") {
      try {
        const q = (url.searchParams.get("q") || "").trim();

        if (!q) {
          return json({
            ok: true,
            count: 0,
            games: []
          });
        }

        const like = `%${q}%`;

        const { results } = await env.DB
          .prepare(`
            SELECT *
            FROM games
            WHERE name LIKE ?
               OR name_kana LIKE ?
               OR source LIKE ?
            ORDER BY popularity DESC, name ASC
            LIMIT 10
          `)
          .bind(like, like, like)
          .all();

        return json({
          ok: true,
          query: q,
          count: results.length,
          games: results
        });
      } catch (error) {
        return json({ ok: false, error: error.message }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
