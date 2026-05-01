function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString();
}


export function generateFakeJwtToken(): string {
  const fakeHeader = {
    alg: ['HS256', 'RS256', 'ES256', 'PS256'][Math.floor(Math.random() * 4)],
    typ: 'JWT',
    kid: Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    // Sometimes add extra header fields
    ...(Math.random() > 0.5 && {
      x5t: Array.from(crypto.getRandomValues(new Uint8Array(10)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      jku: `https://${['auth', 'svc', 'api'][Math.floor(Math.random() * 3)]}-${Math.random().toString(36).substring(2, 6)}.${['net', 'io', 'dev'][Math.floor(Math.random() * 3)]}/.well-known/jwks.json`
    })
  };

  const now = Math.floor(Date.now() / 1000);
  const randomExp = now + (Math.floor(Math.random() * 24) + 1) * 60 * 60; // 1-24 hours

  const scopes = ['read', 'write', 'delete', 'admin', 'user', 'system'];
  const permissions = ['create', 'update', 'view', 'manage', 'execute'];

  const fakePayload = {
    jti: Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    sub: Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    iat: now,
    exp: randomExp,
    iss: `https://${['auth', 'svc', 'api'][Math.floor(Math.random() * 3)]}-${Math.random().toString(36).substring(2, 6)}.${['net', 'io', 'dev'][Math.floor(Math.random() * 3)]}`,
    aud: `api://${['v1', 'v2', 'v3'][Math.floor(Math.random() * 3)]}/${['service', 'system', 'app'][Math.floor(Math.random() * 3)]}`,
    scope: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      scopes[Math.floor(Math.random() * scopes.length)]).join(' '),
    // Sometimes add extra claims
    ...(Math.random() > 0.5 && {
      perms: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        permissions[Math.floor(Math.random() * permissions.length)]),
      sid: Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      ver: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`
    })
  };

  // Generate a random signature-looking string
  const fakeSignature = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${base64UrlEncode(JSON.stringify(fakeHeader))}.${base64UrlEncode(JSON.stringify(fakePayload))}.${fakeSignature}`;
}

export function generateRandomAuthToken(): string {
  const tokenTypes = [
    // System token
    () => `sys_${Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}`,
    
    // Session ID
    () => `${['sid', 'ses', 'session'][Math.floor(Math.random() * 3)]}_${Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}`,
    
    // API Key
    () => `${['pk', 'sk', 'ak'][Math.floor(Math.random() * 3)]}_${['live', 'prod', 'sys'][Math.floor(Math.random() * 3)]}_${Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}`,
    
    // Access token
    () => `${['access', 'auth', 'token'][Math.floor(Math.random() * 3)]}_${Date.now()}_${Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}`,
    
    // UUID-style token
    () => Array.from({ length: 4 }, () => 
      Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    ).join('-'),
    
    // Hash-style token
    () => Array.from(crypto.getRandomValues(new Uint8Array(Math.floor(Math.random() * 32) + 16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
      
    // Base64-style token
    () => btoa(Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')).replace(/[+/]/g, char => char === '+' ? '-' : '_').replace(/=/g, '')
  ];

  return tokenTypes[Math.floor(Math.random() * tokenTypes.length)]();
}

