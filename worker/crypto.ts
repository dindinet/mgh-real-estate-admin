/**
 * Web Crypto API utilities for securely hashing and verifying passwords
 * in a Cloudflare Worker environment.
 */

const ITERATIONS = 100000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;

function buf2hex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    HASH_BYTES * 8
  );

  return `${buf2hex(salt)}:${buf2hex(hashBuffer)}`;
}

export async function verifyPassword(password: string, storedHashString: string): Promise<boolean> {
  const parts = storedHashString.split(':');
  if (parts.length !== 2) return false;
  
  const saltHex = parts[0];
  const hashHex = parts[1];

  const salt = hex2buf(saltHex);
  const storedHashBuffer = hex2buf(hashHex);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const newHashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    HASH_BYTES * 8
  );

  // Timing safe equal
  const newHashArray = new Uint8Array(newHashBuffer);
  const storedHashArray = new Uint8Array(storedHashBuffer);
  
  if (newHashArray.length !== storedHashArray.length) return false;
  
  let result = 0;
  for (let i = 0; i < newHashArray.length; i++) {
    result |= newHashArray[i] ^ storedHashArray[i];
  }
  
  return result === 0;
}
