// SEIS Edge Worker - Global Intelligence Layer
// Çalışma Mantığı: Düşük gecikmeli güvenlik denetimi, A/B testi ve coğrafi yönlendirme.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 1. Güvenlik Başlıkları Enjeksiyonu (Cloudflare Level)
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };

    // 2. Basit Bot Koruması ve Rate Limiting (Mock)
    if (request.method === 'POST' && !isValidOrigin(request)) {
      return new Response('Forbidden', { status: 403, headers: securityHeaders });
    }

    // 3. A/B Testi Yönlendirmesi (Kullanıcıyı %50 yeni tasarıma yönlendir)
    // Gerçek senaryoda KV store kullanılacaktır.
    const experimentGroup = Math.random() > 0.5 ? 'new-design' : 'control';
    
    try {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      
      // Güvenlik başlıklarını ekle
      Object.entries(securityHeaders).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
      });
      
      // Deney grubu başlığı
      newResponse.headers.set('X-SEIS-Experiment', experimentGroup);
      
      return newResponse;
    } catch (e) {
      return new Response('Service Unavailable', { status: 503 });
    }
  }
};

function isValidOrigin(request) {
  // Basit origin kontrolü (Gerçek implementasyonda allow-list kullanılmalı)
  const origin = request.headers.get('Origin');
  if (!origin) return true; // Same-origin istekler
  const allowed = ['https://seis.eco', 'https://www.seis.eco'];
  return allowed.includes(origin);
}
