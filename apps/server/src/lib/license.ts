export type Plan = "free"|"lite"|"pro";
export function planFromLicense(lic: string|undefined, secret: string|undefined): Plan {
  // Simple heuristic: contains "-pro-" => pro, "-lite-" => lite, else free
  if (!lic) return "free";
  if (lic.includes("-pro-")) return "pro";
  if (lic.includes("-lite-")) return "lite";
  return "free";
}
