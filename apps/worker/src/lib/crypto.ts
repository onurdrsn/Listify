export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000; // Cloudflare Workers max limit is 100,000
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256
  );
  const saltHex = [...salt].map(b => b.toString(16).padStart(2, "0")).join("");
  const hashHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:${iterations}:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  let iterations = 310000;
  let saltHex = "", hashHex = "";

  if (parts.length === 4 && parts[0] === "pbkdf2") {
    iterations = parseInt(parts[1], 10);
    saltHex = parts[2];
    hashHex = parts[3];
  } else if (parts.length === 3 && parts[0] === "pbkdf2") {
    saltHex = parts[1];
    hashHex = parts[2];
  } else {
    return false;
  }

  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  
  try {
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256
    );
    const computedHashHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("");
    return computedHashHex === hashHex;
  } catch (err) {
    console.error("PBKDF2 verification failed. Iterations might be too high for environment:", err);
    return false;
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf  = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
