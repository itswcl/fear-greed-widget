import { z } from 'zod';

// Widget output format for VIX data
export const VixWidgetDataSchema = z.object({
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  timestamp: z.string(),
});

export type VixWidgetData = z.infer<typeof VixWidgetDataSchema>;
