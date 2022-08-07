export interface ApiSuccessResponse<T> {
  status: number;
  message: string;
  data?: T;
}
