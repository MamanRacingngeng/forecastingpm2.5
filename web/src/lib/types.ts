export type YearOption = {
  year: number;
  type: "historical" | "forecast";
  label: string;
};

export type Pm25Category = {
  label: string;
  emoji: string;
  color: "good" | "moderate" | "unhealthy" | "very-unhealthy";
  message: string;
};

export type GlobalRow = {
  City: string;
  Country: string;
  Date: string;
  "PM2.5": string;
};

export type Pm25SeriesRow = {
  datetime: string;
  "PM2.5": string;
};

export type Overview = {
  countries: number;
  cities: number;
  date_range: string;
};

export type PredictResult = {
  country: string;
  city: string;
  year: number;
  prediction: number;
  unit: string;
  status: string;
  emoji: string;
  color: Pm25Category["color"];
  message: string;
  year_type: "historical" | "forecast";
  year_label: string;
  historical_avg: number;
  data_points: number;
  min_pm25: number;
  max_pm25: number;
  prediction_note: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
