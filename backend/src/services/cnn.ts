import { CnnResponseSchema, type CnnResponse } from '../schemas/cnn';
import { AppError } from '../utils/error';

const CNN_URL =
  'https://production.dataviz.cnn.io/index/fearandgreed/graphdata/';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchCnnData(): Promise<CnnResponse> {
  const response = await fetch(CNN_URL, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new AppError(
      `CNN API responded with status: ${response.status}`,
      502,
    );
  }

  const data = await response.json();
  return CnnResponseSchema.parse(data);
}
