import fp from "fastify-plugin";
import db from "../lib/db.js";
import { randomUUID } from "node:crypto";

export default fp(async (app) => {
  app.post("/api/distribute/soundcloud", async (req, res) => {
    const { title, artist, filePath } = (req.body as any) || {};
    if (!title || !artist || !filePath) {
      return res.status(400).send({ ok: false, error: "title, artist, filePath required" });
    }
    const id = randomUUID();
    db.prepare("INSERT INTO events(id,kind,payload) VALUES(?,?,?)")
      .run(id, "soundcloud_upload", JSON.stringify({ title, artist, filePath }));
    return { ok: true, id, note: "Queued upload (stub). Wire OAuth + upload API next." };
  });
});
