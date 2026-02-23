export interface CnnDataPoint {
  /** Unix timestamp in milliseconds */
  x: number;
  /** Index value (0-100) */
  y: number;
  rating?: string;
}

export interface CnnResponse {
  fear_and_greed: {
    score: number;
    rating: string;
    timestamp: string;
    previous_close: number;
    previous_1_week: number;
    previous_1_month: number;
    previous_1_year: number;
  };
  fear_and_greed_historical: {
    timestamp: number;
    score: number;
    rating: string;
    data: CnnDataPoint[];
  };
}

export interface WidgetData {
  score: number;
  rating: string;
  timestamp: string;
}
