export interface ITokenRetreiver {
  /**
   * Grab tokens from cache, refresh if possible
   *
   * Returns null if no tokens found or unable to refresh
   */
  getAuth: () => Promise<string[] | null>;
  /**
   * Authenticate to fetch fresh set of tokens
   *
   * Returns null if unable to authenticate
   */
  authenticate: () => Promise<string[] | null>;
}
