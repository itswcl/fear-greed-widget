import { http, Request, Response } from '@google-cloud/functions-framework';
import { handleFearGreed } from './routes/feargreed';
import { handleVix } from './routes/vix';
import { AppError, handleError } from './utils/error';
import { isRateLimited } from './utils/rateLimit';
import { setSecurityHeaders } from './utils/headers';

http('getFearGreedIndex', async (req: Request, res: Response) => {
  setSecurityHeaders(res);

  try {
    if (req.method !== 'GET') {
      throw new AppError('Method Not Allowed', 405);
    }

    const clientIp =
      req.ip ||
      req.headers['x-forwarded-for']?.toString() ||
      'unknown';
    if (isRateLimited(clientIp)) {
      throw new AppError('Too Many Requests', 429);
    }

    // Route dispatch
    if (req.path === '/vix') {
      return await handleVix(req, res);
    }

    if (req.path === '/' || req.path === '') {
      return await handleFearGreed(req, res);
    }

    throw new AppError('Not Found', 404);
  } catch (err) {
    handleError(err, res);
  }
});
