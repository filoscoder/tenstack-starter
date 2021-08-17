import AppInformation from '@/types/response/AppInformation';
import config from '@/config';

/**
 * Get application information.
 *
 * @returns {AppInformation}
 */
export function getAppInfo(): AppInformation {
  return config.app;
}
