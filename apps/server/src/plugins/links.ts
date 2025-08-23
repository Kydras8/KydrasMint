import fp from "fastify-plugin";
import { nanoid } from "nanoid";
import QR from "qrcode";
import db from "../lib/db.js";

export default fp(async (app) => {
  app.post("/api/links", async (req, res) => {
    const { url } = (req.body as any) || {};
    if (!url) return res.status(400).send({ ok: false, error: "missing url" });
    const id = nanoid(8);
    db.prepare("INSERT INTO short_links(id,url) VALUES(?,?)").run(id, url);
    return { ok: true, id, short: `/l/${id}` };
  });

  app.get("/api/links", async () => {
    const rows = db.prepare("SELECT * FROM short_links ORDER BY created_at DESC LIMIT 200").all();
    return { ok: true, rows };
  });

  app.get("/api/qr/:id", async (req, res) => {
    const { id } = req.params as any;
    const row = db.prepare("SELECT url FROM short_links WHERE id=?").get(id) as { url: string }|undefined;
    if (!row) return res.status(404).send({ ok: false });
    const b = process.env.PUBLIC_BASE_URL || "";
    const dataUrl = await QR.toDataURL(`${b}/l/${id}`);
    return { ok: true, dataUrl };
  });

  // public resolver
  app.get("/l/:id", async (req, res) => {
    const { id } = req.params as any;
    const row = db.prepare("SELECT url FROM short_links WHERE id=?").get(id) as { url: string }|undefined;
    if (!row) return res.status(404).send("Not found");
    db.prepare("UPDATE short_links SET clicks=clicks+1 WHERE id=?").run(id);
    return res.redirect(row.url);
  });
});
