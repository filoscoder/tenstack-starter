import AppInformation from '@/types/response/AppInformation';
import CONFIG from '@/config';

/**
 * Get application information.
 *
 * @returns {AppInformation}
 */
export const getAppInfo = (): AppInformation => {
  return CONFIG.APP;
};
