import { AppError } from '../utils/error';

const GOOGLE_FINANCE_VIX_URL =
  'https://www.google.com/finance/quote/VIX:INDEXCBOE';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface VixRawData {
  price: number;
  change: number;
  changePercent: number;
}

export async function fetchGoogleVix(): Promise<VixRawData> {
  const response = await fetch(GOOGLE_FINANCE_VIX_URL, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    throw new AppError(
      `Google Finance responded with status: ${response.status}`,
      502,
    );
  }

  const html = await response.text();

  const priceMatch = html.match(/data-last-price="([^"]+)"/);
  if (!priceMatch) {
    throw new AppError(
      'Could not parse VIX price from Google Finance',
      502,
    );
  }

  const prevCloseMatch = html.match(/class="P6K39c"[^>]*>([0-9.]+)</);

  const price = parseFloat(priceMatch[1]);
  const previousClose = prevCloseMatch
    ? parseFloat(prevCloseMatch[1])
    : price;

  const change = +(price - previousClose).toFixed(2);
  const changePercent =
    previousClose > 0
      ? +((change / previousClose) * 100).toFixed(2)
      : 0;

  return { price: +price.toFixed(2), change, changePercent };
}
