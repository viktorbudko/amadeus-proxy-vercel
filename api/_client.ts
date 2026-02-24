let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getAmadeusToken() {
  if (cachedToken && Date.now() < cachedToken.expires_at) return cachedToken.access_token;

  const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });

  const data = await res.json();
  cachedToken = { access_token: data.access_token, expires_at: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.access_token;
}

export async function amadeusFetch(path: string, params?: Record<string, any>) {
  const token = await getAmadeusToken();
  const base = 'https://test.api.amadeus.com';
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return res;
}
