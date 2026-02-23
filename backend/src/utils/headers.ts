import { Response } from '@google-cloud/functions-framework';

export function setSecurityHeaders(res: Response): void {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '0');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Cache-Control', 'public, max-age=300'); // 5 min cache
  res.set('Access-Control-Allow-Origin', ''); // Block browser CORS
  res.set('Access-Control-Allow-Methods', 'GET');
}
