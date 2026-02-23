import { describe, it, expect } from 'vitest';
import { WidgetDataSchema, CnnResponseSchema } from '../schemas/cnn';

describe('CNN Schemas', () => {
  it('validates a valid WidgetData payload', () => {
    const data = {
      score: 75,
      rating: 'Greed',
      timestamp: '2023-10-27T00:00:00Z',
    };
    const result = WidgetDataSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects invalid WidgetData payload', () => {
    const data = {
      score: '75', // Should be number
      rating: 'Greed',
      timestamp: '2023-10-27T00:00:00Z',
    };
    const result = WidgetDataSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('validates a subset CNN Response Payload', () => {
    const data = {
      fear_and_greed: {
        score: 74.5,
        rating: 'greed',
        timestamp: '2024-02-23T12:00:00Z',
        previous_close: 70,
        previous_1_week: 65,
        previous_1_month: 50,
        previous_1_year: 40,
      },
      fear_and_greed_historical: {
        timestamp: 1708689600000,
        score: 74.5,
        rating: 'greed',
        data: [
          { x: 1708603200000, y: 70, rating: 'greed' },
        ],
      },
    };
    const result = CnnResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
