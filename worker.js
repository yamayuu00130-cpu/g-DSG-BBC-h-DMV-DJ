function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

function absoluteUrl(value, baseUrl) {
  if (!value) return null;

  try {
    return new URL(value, baseUrl).href;
  } catch {
    return null;
  }
}

class ImageMetaCollector {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.ogImage = null;
    this.twitterImage = null;
  }

  element(element) {
    const property = (
      element.getAttribute("property") ||
      element.getAttribute("name") ||
      ""
    ).toLowerCase();

    const content = element.getAttribute("content");

    if (!content) return;

    if (
      !this.ogImage &&
      (property === "og:image" ||
       property === "og:image:url" ||
       property === "og:image:secure_url")
    ) {
      this.ogImage = absoluteUrl(content, this.baseUrl);
    }

    if (
      !this.twitterImage &&
      (property === "twitter:image" ||
       property === "twitter:image:src")
    ) {
      this.twitterImage = absoluteUrl(content, this.baseUrl);
    }
  }

  getImage() {
    return this.ogImage || this.twitterImage || null;
  }
}

async function findOfficialImage(pageUrl) {
  try {
    const response = await fetch(pageUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "haishin-ok-image-checker/1.0",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        error: "HTTP " + response.status
      };
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return {
        ok: false,
        error: "Not HTML"
      };
    }

    const finalUrl = response.url || pageUrl;

    const collector = new ImageMetaCollector(finalUrl);

    const rewritten = new HTMLRewriter()
      .on('meta[property="og:image"]', collector)
      .on('meta[property="og:image:url"]', collector)
      .on('meta[property="og:image:secure_url"]', collector)
      .on('meta[name="twitter:image"]', collector)
      .on('meta[name="twitter:image:src"]', collector)
      .transform(response);

    // HTMLRewriterを最後まで実行させる
    await rewritten.text();

    const imageUrl = collector.getImage();

    if (!imageUrl) {
      return {
        ok: false,
        error: "No image metadata found"
      };
    }

    return {
      ok: true,
      imageUrl,
      sourceUrl: finalUrl
    };

  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

async function collectImageCandidates(env) {
  const { results } = await env.DB
    .prepare(`
      SELECT
        id,
        name,
        official_url,
        image_status
      FROM games
      WHERE official_url IS NOT NULL
        AND official_url != ''
        AND (
          image_status IS NULL
          OR image_status = ''
          OR image_status = 'none'
        )
      ORDER BY popularity DESC
      LIMIT 10
    `)
    .all();

  let found = 0;
  let failed = 0;

  for (const game of results) {
    const result = await findOfficialImage(game.official_url);

    if (!result.ok) {
      failed++;
      console.log(
        "Image candidate not found:",
        game.name,
        result.error
      );
      continue;
    }

    await env.DB
      .prepare(`
        UPDATE games
        SET
          image_url = ?,
          image_source_url = ?,
          image_status = 'candidate',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        result.imageUrl,
        result.sourceUrl,
        game.id
      )
      .run();

    found++;

    console.log(
      "Image candidate found:",
      game.name,
      result.imageUrl
    );
  }

  return {
    checked: results
