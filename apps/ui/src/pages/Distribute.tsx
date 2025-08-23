import { useState } from "react";
import { soundcloudUploadStub } from "../lib/api";

export default function Distribute(){
  const [title,setTitle] = useState("My Release");
  const [artist,setArtist] = useState("Artist");
  const [filePath,setFilePath] = useState("/absolute/path/to/track.mp3");
  return (
    <section style={{display:"grid",gap:12}}>
      <h2 style={{margin:0,fontSize:18}}>Distribute (SoundCloud stub)</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={{padding:8,borderRadius:8,border:"1px solid #2a3a54",color:"#000"}}/>
      <input value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Artist" style={{padding:8,borderRadius:8,border:"1px solid #2a3a54",color:"#000"}}/>
      <input value={filePath} onChange={e=>setFilePath(e.target.value)} placeholder="/path/to/track.mp3" style={{padding:8,borderRadius:8,border:"1px solid #2a3a54",color:"#000"}}/>
      <button onClick={async()=>{ const r=await soundcloudUploadStub({title,artist,filePath}); alert("Queued distro: " + r.id); }} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #2a3a54"}}>Queue Upload</button>
    </section>
  );
}
