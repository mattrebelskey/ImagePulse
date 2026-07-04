import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies Supabase Auth JWTs (ES256, asymmetric) against the project's
// public JWKS — stateless, no per-request round trip to the Auth server
// (jose caches the key set in module scope across warm invocations).
// SUPABASE_URL comes from the function environment (root .env under
// `vercel dev`, project env vars once deployed).
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set. Add it to .env (local) or the Vercel project env vars.');
}

const jwks = createRemoteJWKSet(new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

// Returns { id, email } for a valid signed-in user, or sends the 401 and
// returns null. Callers: `const user = await requireUser(req, res); if (!user) return;`
// Tenancy note: api/ queries run as the table OWNER (RLS bypassed), so the
// explicit `WHERE user_id = $n` every handler adds after this check IS the
// tenancy enforcement — never query a user-owned table without it.
export async function requireUser(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Sign in to use ImagePulse.' });
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${process.env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });
    return { id: payload.sub, email: payload.email };
  } catch {
    res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
    return null;
  }
}
