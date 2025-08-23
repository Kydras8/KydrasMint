import { useEffect, useState } from "react";
import { analyticsOverview, analyticsCsvUrl } from "../lib/api";

export default function Analytics(){
  const [d,setD]=useState<any>({});
  useEffect(()=>{ analyticsOverview().then(setD); },[]);
  return (
    <section style={{display:"grid",gap:12}}>
      <h2 style={{margin:0,fontSize:18}}>Analytics</h2>
      <div style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
        <Stat label="Events" value={d.totalEvents}/>
        <Stat label="Links" value={d.links}/>
        <Stat label="Link clicks" value={d.linkClicks}/>
      </div>
      <div>
        <a href={analyticsCsvUrl()} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #2a3a54",textDecoration:"none",color:"#e6edf7"}}>Download Links CSV</a>
      </div>
    </section>
  );
}
function Stat({label,value}:{label:string;value?:number}){
  return <div style={{padding:14,borderRadius:12,border:"1px solid #2a3a54"}}>
    <div style={{opacity:.75,fontSize:12}}>{label}</div>
    <div style={{fontSize:28,fontWeight:800}}>{value ?? 0}</div>
  </div>;
}
