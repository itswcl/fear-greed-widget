import { describe, it, expect } from 'vitest';
import { VixWidgetDataSchema } from '../schemas/vix';

describe('VixWidgetDataSchema', () => {
  it('validates a well-formed VIX widget payload', () => {
    const payload = {
      price: 21.01,
      change: 1.92,
      changePercent: 10.06,
      timestamp: '2026-02-23T21:00:00.000Z',
    };

    const result = VixWidgetDataSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('validates negative change values', () => {
    const payload = {
      price: 18.21,
      change: -0.35,
      changePercent: -1.89,
      timestamp: '2026-02-23T21:00:00.000Z',
    };

    const result = VixWidgetDataSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.change).toBe(-0.35);
    }
  });

  it('rejects payload with missing fields', () => {
    const result = VixWidgetDataSchema.safeParse({ price: 18.21 });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric price', () => {
    const result = VixWidgetDataSchema.safeParse({
      price: 'abc',
      change: 0,
      changePercent: 0,
      timestamp: '2026-02-23T21:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});
