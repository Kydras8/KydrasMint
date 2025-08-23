import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8788";

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
