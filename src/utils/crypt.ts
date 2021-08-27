import CONFIG from '@/config';
import bcrypt from 'bcrypt';

/**
 * Create a bcrypt hash for a string.
 *
 * @param {string} value
 * @returns {Promise<any>}
 */
export const hash = async (value: string): Promise<any> => {
  const saltRounds = parseInt(CONFIG.AUTH.SALT_ROUNDS, 10);

  return bcrypt.hash(value, saltRounds);
};

/**
 * Compare a string with the hash.
 *
 * @param {string} value
 * @param {string} hashedValue
 * @returns {Promise<boolean>}
 */
export const compare = async (
  value: string,
  hashedValue: string,
): Promise<boolean> => {
  return bcrypt.compare(value, hashedValue);
};
