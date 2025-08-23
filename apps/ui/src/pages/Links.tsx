import { useEffect, useState } from "react";
import { createShortLink, listShortLinks, getQR, createMicrosite } from "../lib/api";

export default function Links(){
  const [url,setUrl]=useState("https://example.com/listen");
  const [rows,setRows]=useState<any[]>([]);
  const [qr,setQr]=useState<string>("");

  async function refresh(){ const d=await listShortLinks(); setRows(d.rows||[]); }

  useEffect(()=>{ refresh(); },[]);

  return (
    <section style={{display:"grid",gap:12}}>
      <h2 style={{margin:0,fontSize:18}}>Smart Links</h2>
      <div style={{display:"flex",gap:8}}>
        <input value={url} onChange={e=>setUrl(e.target.value)} style={{flex:1,padding:8,borderRadius:8,border:"1px solid #2a3a54",color:"#000"}}/>
        <button onClick={async()=>{ await createShortLink(url); await refresh(); }} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #2a3a54"}}>Create</button>
      </div>

      <h3 style={{marginTop:16}}>Microsite</h3>
      <button onClick={async()=>{
        const m = await createMicrosite({ title:"New Single", artist:"You", coverUrl:"", listenUrl:url, buyUrl:"" });
        alert("Microsite: " + m.url + "  Short: " + m.short);
        await refresh();
      }} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #2a3a54"}}>Generate Microsite</button>

      <table style={{width:"100%",fontSize:14,borderCollapse:"collapse"}}>
        <thead><tr><th style={{textAlign:"left",padding:6}}>ID</th><th style={{textAlign:"left",padding:6}}>URL</th><th style={{textAlign:"left",padding:6}}>Clicks</th><th style={{textAlign:"left",padding:6}}>QR</th></tr></thead>
        <tbody>
          {rows.map((r:any)=>(
            <tr key={r.id} style={{borderTop:"1px solid #1b2738"}}>
              <td style={{padding:6}}>{r.id}</td>
              <td style={{padding:6,wordBreak:"break-all"}}>{r.url}</td>
              <td style={{padding:6}}>{r.clicks}</td>
              <td style={{padding:6}}>
                <button onClick={async()=>{ const q=await getQR(r.id); setQr(q.dataUrl); }} style={{padding:"6px 8px",borderRadius:8,border:"1px solid #2a3a54"}}>Show QR</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {qr && <img src={qr} alt="qr" style={{width:160,height:160,background:"#fff",padding:6,borderRadius:8}}/>}
    </section>
  );
}
