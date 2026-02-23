import { Request, Response } from '@google-cloud/functions-framework';
import { VixWidgetDataSchema } from '../schemas/vix';
import { fetchGoogleVix } from '../services/vix';

export async function handleVix(
  _req: Request,
  res: Response,
): Promise<void> {
  const { price, change, changePercent } = await fetchGoogleVix();

  const vixData = {
    price,
    change,
    changePercent,
    timestamp: new Date().toISOString(),
  };

  const responsePayload = VixWidgetDataSchema.parse(vixData);
  res.status(200).json(responsePayload);
}
