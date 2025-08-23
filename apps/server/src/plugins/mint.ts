import fp from "fastify-plugin";
import { ethers } from "ethers";
import { ABI_721 } from "../lib/abi721.js";

export default fp(async (app) => {
  const rpc = process.env.EVM_RPC_URL;
  const pk  = process.env.PRIVATE_KEY;
  const c721= process.env.CONTRACT_721;

  if (!rpc || !pk || !c721) {
    app.log.warn("Mint plugin: set EVM_RPC_URL, PRIVATE_KEY, CONTRACT_721 in .env");
  }

  app.post("/api/mint/erc721", async (req, res) => {
    try {
      const { to } = (req.body as any) || {};
      if (!to) return res.status(400).send({ ok:false, error:"missing to" });
      if (!rpc || !pk || !c721) return res.status(500).send({ ok:false, error:"server not configured" });

      const provider = new ethers.JsonRpcProvider(rpc);
      const signer   = new ethers.Wallet(pk, provider);
      const contract = new ethers.Contract(c721, ABI_721, signer);
      const tx = await contract.mint(to);
      const receipt = await tx.wait();
      return { ok:true, hash: tx.hash, mined: receipt?.blockNumber ?? null };
    } catch (e:any) {
      app.log.error(e);
      return res.status(500).send({ ok:false, error: e?.message || "mint failed" });
    }
  });
});
