import { CopyRef } from './types/CopyRef';
import { materializeArray } from './materializeArray';
import { materializeObject } from './materializeObject';
import { MaterializedValue } from './types/MaterializedValue';

export function materializeProxy<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T> | undefined,
  changed: boolean
): MaterializedValue<T> {
  if (!copyRef) {
    return { value: originalTarget, changed: false };
  }
  const { value: materialized, changed: descendentsChanged } =
    copyRef.type === 'object'
      ? materializeObject(originalTarget, copyRef, changed)
      : materializeArray(originalTarget, copyRef, changed);
  let descendentOrSelfChanged = changed || descendentsChanged;

  return {
    value: descendentOrSelfChanged ? materialized : originalTarget,
    changed: descendentOrSelfChanged,
  };
}
