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

    // Worker動作確認
    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "haishin-ok",
        message: "Worker is running"
      });
    }

    // D1からゲーム一覧を取得
    if (url.pathname === "/api/games") {
      try {
        const { results } = await env.DB
          .prepare("SELECT * FROM games ORDER BY popularity DESC LIMIT 50")
          .all();

        return json({
          ok: true,
          count: results.length,
          games: results
        });
      } catch (error) {
        return json(
          {
            ok: false,
            error: error.message
          },
          500
        );
      }
    }

    // 通常ページ
    return env.ASSETS.fetch(request);
  }
};
