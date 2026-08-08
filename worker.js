export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Workerが正常に動いているか確認するAPI
    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "haishin-ok",
        message: "Worker is running"
      });
    }

    // それ以外は今までのサイトをそのまま表示
    return env.ASSETS.fetch(request);
  }
};
