import fp from "fastify-plugin";
import db from "../lib/db.js";
import { randomUUID } from "node:crypto";

export default fp(async (app) => {
  app.post("/api/social/post", async (req) => {
    const { message, url } = (req.body as any) || {};
    const id = randomUUID();
    db.prepare("INSERT INTO events(id,kind,payload) VALUES(?,?,?)")
      .run(id, "post", JSON.stringify({ message, url }));
    return { ok: true, id };
  });
});
