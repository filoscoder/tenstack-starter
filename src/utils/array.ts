import { differenceWith, isEqual } from 'lodash-es';

export interface ArrayDifference {
  added: any[];
  removed: any[];
}

/**
 *
 * @param {any[]} arr1
 * @param {any[]} arr2
 * @returns {ArrayDifference}
 */
export const diff = (arr1: any[], arr2: any[]): ArrayDifference => {
  const added = differenceWith(arr2, arr1, isEqual);
  const removed = differenceWith(arr1, arr2, isEqual);

  return { added, removed };
};
