export interface JWTPayload { sub: string; exp: number; iat: number; }

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}
function b64dec(str: string): Uint8Array {
  return Uint8Array.from(atob(str.replace(/-/g,"+").replace(/_/g,"/")), c => c.charCodeAt(0));
}
function parseExpiry(s: string): number {
  const m = s.match(/^(\d+)([smhd])$/);
  return m ? parseInt(m[1]) * ({s:1,m:60,h:3600,d:86400}[m[2] as "s"]!) : 86400;
}

export async function signJWT(payload: { sub: string }, secret: string, expiresIn: string): Promise<string> {
  const now = Math.floor(Date.now()/1000);
  const full = { sub: payload.sub, iat: now, exp: now + parseExpiry(expiresIn) };
  const header  = btoa(JSON.stringify({ alg:"HS256", typ:"JWT" })).replace(/=/g,"");
  const body    = btoa(JSON.stringify(full)).replace(/=/g,"");
  const input   = `${header}.${body}`;
  const key     = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const sig     = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return `${input}.${b64url(sig)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const key   = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, b64dec(s) as any, new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return null;
    const payload: JWTPayload = JSON.parse(atob(p));
    if (payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload;
  } catch { return null; }
}
