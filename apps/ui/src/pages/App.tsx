import { useEffect, useState } from "react";
import Links from "./Links";
import Analytics from "./Analytics";
import Distribute from "./Distribute";
import Social from "./Social";
import Mint from "./Mint";
import Settings from "./Settings";

import { WagmiProvider } from "wagmi";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { config } from "../wallet/client";

createWeb3Modal({ wagmiConfig: config, projectId: import.meta.env.VITE_WALLETCONNECT_ID || "demo" });

const TABS = ["Mint","Distribute","Links","Social","Analytics","Settings"] as const;

export default function App(){
  const [tab, setTab] = useState<(typeof TABS)[number]>("Links");

  useEffect(()=>{ document.title = "Kydras Mint – " + tab; }, [tab]);

  return (
    <WagmiProvider config={config}>
      <div style={{minHeight:"100vh", background:"#0b0e13", color:"#e6edf7", fontFamily:"ui-sans-serif, system-ui, -apple-system"}}>
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px"}}>
          <h1 style={{margin:0,fontSize:20,fontWeight:800}}>Kydras Mint</h1>
          <nav style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {TABS.map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"6px 10px", borderRadius:999, border:"1px solid #2a3a54",
                background: tab===t ? "#fff" : "transparent", color: tab===t ? "#000":"#e6edf7"
              }}>{t}</button>
            ))}
          </nav>
          <div>
            {/* WalletConnect button is provided by the modal UI (command palette) */}
            <button onClick={()=> (window as any).open?.()} style={{padding:"6px 10px",borderRadius:12,border:"1px solid #2a3a54"}}>
              WalletConnect
            </button>
          </div>
        </header>

        <main style={{padding:20}}>
          {tab==="Mint" && <Mint/>}
          {tab==="Distribute" && <Distribute/>}
          {tab==="Links" && <Links/>}
          {tab==="Social" && <Social/>}
          {tab==="Analytics" && <Analytics/>}
          {tab==="Settings" && <Settings/>}
        </main>

        <footer style={{padding:"10px 20px",opacity:.7,fontSize:12,borderTop:"1px solid #1b2738"}}>
          Kydras Mint <VersionBadge/>
        </footer>
      </div>
    </WagmiProvider>
  );
}

function VersionBadge(){
  const [v,setV]=useState<string>("");
  useEffect(()=>{
    fetch("/package.json").then(r=>r.json()).then(j=>setV(j.version||""));
  },[]);
  return <span>v{v}</span>;
}
