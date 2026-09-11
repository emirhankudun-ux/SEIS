/**
 * SEIS Security Gateway - Hardened Version
 * Features: Strict Origin Validation, Rate Limiting, CSP Headers, Input Sanitization
 */

const ALLOWED_ORIGINS = [
  'https://seis.io',
  'https://www.seis.io',
  'https://dev.seis.io'
];

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.seis.io;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Basit In-Memory Rate Limiter (Production için Redis önerilir)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 dakika
const MAX_REQUESTS = 100; // IP başına istek limiti

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, startTime: now };
  
  if (now - record.startTime > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.startTime = now;
  } else {
    record.count++;
  }
  
  rateLimitStore.set(ip, record);
  return record.count <= MAX_REQUESTS;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>\"'&]/g, (char) => {
    const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
    return map[char];
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

    // 1. Strict Origin Validation
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden: Invalid Origin', { 
        status: 403,
        headers: SECURITY_HEADERS
      });
    }

    // 2. Rate Limiting Check
    if (!checkRateLimit(clientIP)) {
      return new Response('Too Many Requests', { 
        status: 429,
        headers: { ...SECURITY_HEADERS, 'Retry-After': '60' }
      });
    }

    // 3. Method Restriction (Sadece güvenli metodlar)
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) {
      return new Response('Method Not Allowed', { status: 405, headers: SECURITY_HEADERS });
    }

    try {
      // 4. Request Processing
      let response;
      if (request.method === 'POST') {
        const contentType = request.headers.get('Content-Type') || '';
        if (!contentType.includes('application/json')) {
           return new Response('Unsupported Media Type', { status: 415, headers: SECURITY_HEADERS });
        }
        
        const rawBody = await request.text();
        // Basit JSON validation ve sanitization
        let body;
        try {
          body = JSON.parse(rawBody);
          // Recursive sanitization could be added here for deep objects
        } catch (e) {
          return new Response('Invalid JSON Payload', { status: 400, headers: SECURITY_HEADERS });
        }
        
        // İş mantığı buraya gelecek
        response = new Response(JSON.stringify({ success: true, data: sanitizeInput(JSON.stringify(body)) }), {
          headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/json' }
        });
      } else {
        response = new Response(JSON.stringify({ message: 'SEIS Gateway Active', timestamp: Date.now() }), {
          headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      return response;
    } catch (err) {
      console.error('Gateway Error:', err);
      return new Response('Internal Server Error', { 
        status: 500, 
        headers: SECURITY_HEADERS 
      });
    }
  }
};
