const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8788";
export async function createShortLink(url: string) {
  const r = await fetch(API + "/api/links", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ url }) });
  return r.json();
}
export async function listShortLinks() {
  const r = await fetch(API + "/api/links");
  return r.json();
}
export async function getQR(id: string) {
  const r = await fetch(API + "/api/qr/" + id);
  return r.json();
}
export async function analyticsOverview() {
  const r = await fetch(API + "/api/analytics/overview");
  return r.json();
}
export function analyticsCsvUrl(){ return API + "/api/analytics/links.csv"; }
export async function createMicrosite(payload: any){
  const r = await fetch(API + "/api/microsites", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(payload) });
  return r.json();
}
export async function soundcloudUploadStub(payload: any){
  const r = await fetch(API + "/api/distribute/soundcloud", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(payload) });
  return r.json();
}
