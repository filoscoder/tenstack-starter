export interface ApiSuccessResponse<T> {
  status: number;
  code: string;
  data?: T;
}
