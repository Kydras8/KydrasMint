import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { planFromLicense } from "./lib/license.js";

import links from "./plugins/links.js";
import analytics from "./plugins/analytics.js";
import social from "./plugins/social.js";
import distro from "./plugins/distro.js";
import microsites from "./plugins/microsites.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const microDir = process.env.MICROSITES_DIR || path.join(__dirname, "..", "microsites");
await app.register(fastifyStatic, { root: path.resolve(microDir), prefix: "/microsites/" });

await app.register(links);
await app.register(analytics);
await app.register(social);
await app.register(distro);
await app.register(microsites);

app.get("/api/plan", async () => {
  const plan = planFromLicense(process.env.KYDRAS_LICENSE, process.env.KYDRAS_LICENSE_SECRET);
  return { ok: true, plan };
});

const port = Number(process.env.PORT||8788);
app.listen({ port, host: "0.0.0.0" }).catch((e) => {
  app.log.error(e);
  process.exit(1);
});

// Mint (custodial signer): POST /api/mint/erc721 { to }
await app.register((await import("./plugins/mint.js")).default);
