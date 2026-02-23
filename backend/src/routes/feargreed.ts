import { Request, Response } from '@google-cloud/functions-framework';
import { WidgetDataSchema } from '../schemas/cnn';
import { fetchCnnData } from '../services/cnn';

export async function handleFearGreed(
  _req: Request,
  res: Response,
): Promise<void> {
  const cnnData = await fetchCnnData();

  const widgetData = {
    score: Math.round(cnnData.fear_and_greed.score),
    rating: cnnData.fear_and_greed.rating,
    timestamp: cnnData.fear_and_greed.timestamp,
  };

  const responsePayload = WidgetDataSchema.parse(widgetData);
  res.status(200).json(responsePayload);
}
