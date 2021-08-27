import { differenceBy, intersectionBy } from 'lodash-es';

/**
 * Get the copy of object without attributes.
 *
 * @param  {Object} obj
 * @param  {Array} attrsToExclude
 * @return {Object}
 */
export const withoutAttrs = (obj: any, attrsToExclude: any[]) => {
  const result: any = {};

  Object.keys(obj).forEach((key: string) => {
    if (!attrsToExclude.includes(key)) {
      result[key] = obj[key];
    }
  });

  return result;
};

/**
 * Get the copy of object with only specified attributes.
 *
 * @param  {Object} obj
 * @param  {Array} attrs
 * @return {Object}
 */
export const withOnlyAttrs = (obj: any, attrs: any[]) => {
  const result: any = {};

  Object.keys(obj).forEach((key) => {
    if (attrs.includes(key)) {
      result[key] = obj[key];
    }
  });

  return result;
};

/**
 * Compare array of two objects and find data that needs to be create, update
 * and delete.
 *
 * @param {Array} list1
 * @param {Array} list2
 * @param {String} key
 * @returns {Object}
 */
export const difference = (list1: any[], list2: any[], key = 'id') => {
  return {
    create: list2
      .filter((obj) => obj.hasOwnProperty(key) && obj[key] === null)
      .map((obj) => withoutAttrs(obj, [key])),
    update: intersectionBy(list2, list1, key),
    destroy: differenceBy(list1, list2, key).map((obj: any) => obj[key]),
  };
};
