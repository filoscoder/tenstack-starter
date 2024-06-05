export type AnalyticsFindManyProps = {
  id: string;
};

export type AnalyticsCreateRequest = {
  source: string;
  event: string;
  data: object;
};
