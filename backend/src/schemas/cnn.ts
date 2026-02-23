import { z } from "zod";

export const CnnDataPointSchema = z.object({
  x: z.number().describe("Unix timestamp in milliseconds"),
  y: z.number().describe("Index value (0-100)"),
  rating: z.string().optional(),
});

export const CnnResponseSchema = z.object({
  fear_and_greed: z.object({
    score: z.number(),
    rating: z.string(),
    timestamp: z.string(),
    previous_close: z.number(),
    previous_1_week: z.number(),
    previous_1_month: z.number(),
    previous_1_year: z.number(),
  }),
  fear_and_greed_historical: z.object({
    timestamp: z.number(),
    score: z.number(),
    rating: z.string(),
    data: z.array(CnnDataPointSchema),
  }),
});

// The semantic output schema we send to our Client/Widget
export const WidgetDataSchema = z.object({
  score: z.number(),
  rating: z.string(),
  timestamp: z.string(),
  // Can add historical data if needed for the gauge, but gauge just needs current score.
});

export type CnnResponse = z.infer<typeof CnnResponseSchema>;
export type WidgetData = z.infer<typeof WidgetDataSchema>;
