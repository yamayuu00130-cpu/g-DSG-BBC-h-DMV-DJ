export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Worker動作確認
    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "haishin-ok",
        message: "Worker is running"
      });
    }

    // D1データベース動作確認
    if (url.pathname === "/api/games") {
      try {
        const { results } = await env.DB
          .prepare("SELECT * FROM games LIMIT 50")
          .all();

        return Response.json({
          ok: true,
          count: results.length,
          games: results
        });
      } catch (error) {
        return Response.json(
          {
            ok: false,
            error: error.message
          },
          { status: 500 }
        );
      }
    }

    // 通常ページは今までのサイトを表示
    return env.ASSETS.fetch(request);
  }
};
