import fp from "fastify-plugin";
import fs from "node:fs";
import path from "node:path";
import db from "../lib/db.js";
import { nanoid } from "nanoid";

export default fp(async (app) => {
  const root = process.env.MICROSITES_DIR || "./microsites";
  fs.mkdirSync(root, { recursive: true });

  app.post("/api/microsites", async (req) => {
    const { title, artist, coverUrl, listenUrl, buyUrl } = (req.body as any)||{};
    const id = nanoid(8);
    const outDir = path.join(root, id);
    fs.mkdirSync(outDir, { recursive: true });
    const html = `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} — ${artist}</title>
<link rel="stylesheet" href="https://unpkg.com/sanitize.css"/>
<style>
body{font-family:Inter,system-ui,Arial;background:#0b0e13;color:#e6edf7;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}
.card{max-width:720px;width:100%;background:#121826;border:1px solid #273246;border-radius:16px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
h1{margin:0 0 6px;font-size:28px} .muted{color:#8ca0be}
img{max-width:100%;border-radius:14px;border:1px solid #1f2a3a}
.btn{display:inline-block;margin-top:14px;margin-right:10px;padding:10px 16px;border-radius:12px;background:#6ee7ff;color:#07121a;text-decoration:none;font-weight:700}
</style></head>
<body><main class="card">
<h1>${title}</h1>
<div class="muted">by ${artist}</div>
${coverUrl ? `<img src="${coverUrl}" alt="cover"/>`: ""}
<div>
${listenUrl ? `<a class="btn" href="${listenUrl}">Listen</a>`:""}
${buyUrl ? `<a class="btn" href="${buyUrl}">Buy</a>`:""}
</div>
</main></body></html>`;
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
    const micrositePath = `/microsites/${id}/index.html`;

    // store link target
    const publicBase = process.env.PUBLIC_BASE_URL || "http://127.0.0.1:8788";
    const full = `${publicBase}${micrositePath}`;
    const linkId = nanoid(8);
    db.prepare("INSERT INTO short_links(id,url) VALUES(?,?)").run(linkId, full);

    return { ok: true, id, url: full, short: `/l/${linkId}` };
  });
});
