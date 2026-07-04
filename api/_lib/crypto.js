import crypto from 'node:crypto';

// AES-256-GCM at rest for BYOK provider keys. The master key lives in the
// server environment only (root .env under `vercel dev`; Session 5 must set
// it as a Vercel project env var) — never in the DB, never in frontend code.
// Ciphertext is stored with the GCM auth tag appended (last 16 bytes); the
// IV is random per encryption. Plaintext keys never touch the DB, logs, or
// responses.
if (!process.env.BYOK_MASTER_KEY) {
  throw new Error('BYOK_MASTER_KEY is not set. Generate one with: node -e "console.log(require(\'node:crypto\').randomBytes(32).toString(\'base64\'))" and add it to .env (local) or the Vercel project env vars.');
}

const masterKey = Buffer.from(process.env.BYOK_MASTER_KEY, 'base64');
if (masterKey.length !== 32) {
  throw new Error('BYOK_MASTER_KEY must decode to exactly 32 bytes of base64.');
}

const IV_BYTES = 12;
const TAG_BYTES = 16;

// -> { ciphertext, iv } (both base64) for the byok_keys columns.
export function encryptKey(plaintext) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64') };
}

// Throws on tampered/corrupt ciphertext (GCM auth failure) — callers surface
// that as a server error rather than falling back silently.
export function decryptKey(ciphertextB64, ivB64) {
  const data = Buffer.from(ciphertextB64, 'base64');
  const tag = data.subarray(data.length - TAG_BYTES);
  const ciphertext = data.subarray(0, data.length - TAG_BYTES);
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
