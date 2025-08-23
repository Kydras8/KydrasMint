import fp from "fastify-plugin";
import db from "../lib/db.js";

export default fp(async (app) => {
  app.get("/api/analytics/overview", async () => {
    const totalEvents = (db.prepare("SELECT COUNT(1) c FROM events").get() as any).c ?? 0;
    const links = (db.prepare("SELECT COUNT(1) c FROM short_links").get() as any).c ?? 0;
    const linkClicks = (db.prepare("SELECT COALESCE(SUM(clicks),0) c FROM short_links").get() as any).c ?? 0;
    return { ok: true, totalEvents, links, linkClicks };
  });

  app.get("/api/analytics/links.csv", async (req, res) => {
    const rows = db.prepare("SELECT id,url,clicks,created_at FROM short_links ORDER BY created_at DESC").all() as any[];
    const header = "id,url,clicks,created_at";
    const body = rows.map(r => `${r.id},${r.url},${r.clicks},${r.created_at}`).join("\n");
    const csv = `${header}\n${body}\n`;
    res.header("content-type", "text/csv");
    res.send(csv);
  });
});
