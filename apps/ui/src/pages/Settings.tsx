export default function Settings(){
  return (
    <section style={{display:"grid",gap:12}}>
      <h2 style={{margin:0,fontSize:18}}>Settings</h2>
      <ul style={{margin:0,paddingLeft:18}}>
        <li>.env (server): KYDRAS_LICENSE, SOUNDCLOUD_* tokens</li>
        <li>VITE_API_BASE (ui): point to your server if not localhost</li>
      </ul>
    </section>
  );
}
