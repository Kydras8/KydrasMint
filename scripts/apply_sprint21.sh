#!/usr/bin/env bash
set -Eeuo pipefail

# Preconditions
command -v pnpm >/dev/null || { echo "[!] pnpm not found"; exit 1; }
[ -d apps/server ] || { echo "[!] apps/server missing (run Sprint-2 script first)"; exit 1; }
[ -d apps/ui ] || { echo "[!] apps/ui missing (run Sprint-2 script first)"; exit 1; }

### 1) Server: add ethers + mint plugin
pushd apps/server >/dev/null
pnpm add ethers@6
popd >/dev/null

mkdir -p apps/server/src/plugins apps/server/src/lib

# Minimal ABI for 721 mint(to)
cat > apps/server/src/lib/abi721.ts <<'TS'
export const ABI_721 = [
  { "inputs": [{"internalType":"address","name":"to","type":"address"}],
    "name":"mint","outputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],
    "stateMutability":"nonpayable","type":"function" }
] as const;
TS

# Mint plugin
cat > apps/server/src/plugins/mint.ts <<'TS'
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
TS

# Wire plugin in server index (append if not present)
if ! grep -q "plugins/mint" apps/server/src/index.ts; then
  cat >> apps/server/src/index.ts <<'TS'

// Mint (custodial signer): POST /api/mint/erc721 { to }
await app.register((await import("./plugins/mint.js")).default);
TS
fi

# Ensure .env.example contains mint vars
if ! grep -q '^EVM_RPC_URL=' apps/server/.env.example; then
  cat >> apps/server/.env.example <<'ENV'

# Minting (custodial signer)
EVM_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/ALCHEMY_KEY
PRIVATE_KEY=0xyour_testnet_key
CONTRACT_721=0xYourDeployed721
ENV
fi

### 2) UI: add Web3Modal/Wagmi and Mint page with server call
pushd apps/ui >/dev/null
pnpm add @web3modal/wagmi@^5 wagmi@^2 viem@^2
popd >/dev/null

mkdir -p apps/ui/src/wallet
cat > apps/ui/src/wallet/client.ts <<'TS'
import { http } from "viem";
import { sepolia, polygonAmoy } from "wagmi/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi/react";

const projectId = import.meta.env.VITE_WALLETCONNECT_ID || "demo";
export const chains = [polygonAmoy, sepolia] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: "Kydras Mint",
    description: "Mint & distribute music",
    url: "https://kydras.local",
    icons: ["https://avatars.githubusercontent.com/u/1?v=4"]
  },
  transports: {
    [polygonAmoy.id]: http(),
    [sepolia.id]: http()
  }
});
TS

# Ensure App shell loads modal and Wagmi
if ! grep -q "@web3modal/wagmi" apps/ui/src/pages/App.tsx 2>/dev/null; then
  # Prepend imports
  sed -i '1i import { WagmiProvider } from "wagmi";\nimport { createWeb3Modal } from "@web3modal/wagmi/react";\nimport { config } from "../wallet/client";' apps/ui/src/pages/App.tsx
  # Initialize modal
  awk 'NR==1{print; next} /export default function App\(\)/{print; print "createWeb3Modal({ wagmiConfig: config, projectId: import.meta.env.VITE_WALLETCONNECT_ID || \"demo\" });"; next} {print}' apps/ui/src/pages/App.tsx > /tmp/app.$$ && mv /tmp/app.$$ apps/ui/src/pages/App.tsx
  # Wrap with WagmiProvider
  awk '/return \(/ {print "  return ("; print "    <WagmiProvider config={config}>"; next} /<\/footer>\n?\s*<\/div>/ {print; print "    </WagmiProvider>"; next} {print}' apps/ui/src/pages/App.tsx > /tmp/app.$$ && mv /tmp/app.$$ apps/ui/src/pages/App.tsx || true
fi

# Replace Mint page
cat > apps/ui/src/pages/Mint.tsx <<'TSX'
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8788"\;

export default function Mint(){
  const { address, isConnected } = useAccount();
  const [to,setTo] = useState<string>("");

  useEffect(()=>{ if(isConnected && address) setTo(address); },[isConnected,address]);

  async function requestMint(){
    const r = await fetch(API + "/api/mint/erc721", {
      method:"POST", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ to })
    });
    const j = await r.json();
    if(!j.ok) return alert("Mint failed: " + j.error);
    alert("Mint tx: " + j.hash);
  }

  return (
    <section style={{display:"grid",gap:12}}>
      <h2 style={{margin:0,fontSize:18}}>Mint</h2>
      <p>Connect your wallet (top-right WalletConnect button), then mint to that address.</p>
      <label>Mint to:</label>
      <input value={to} onChange={e=>setTo(e.target.value)} placeholder="0x..." style={{padding:8,borderRadius:8,border:"1px solid #2a3a54",color:"#000"}}/>
      <button onClick={requestMint} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #2a3a54"}}>Request Server Mint</button>
      <small style={{opacity:.7}}>Server uses custodial signer (env PRIVATE_KEY) calling your ERC-721 owner-only <code>mint(to)</code>.</small>
    </section>
  );
}
TSX

# Install & build
pnpm -w install
pnpm -w -r build || true

echo
echo "[✓] Sprint-2.1 applied."
echo
echo "Configure server (apps/server/.env):"
echo "  EVM_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/ALCHEMY_KEY"
echo "  PRIVATE_KEY=0xYOUR_TESTNET_DEPLOYER_KEY (owner of CONTRACT_721)"
echo "  CONTRACT_721=0xYourDeployed721"
echo
echo "Run:"
echo "  cp apps/server/.env.example apps/server/.env   # then edit values"
echo "  pnpm --filter @kydras/server dev"
echo "  pnpm --filter @kydras/ui dev"
echo
echo "UI:"
echo "  • Click WalletConnect (top-right) to connect"
echo "  • Go to Mint tab → Request Server Mint"
