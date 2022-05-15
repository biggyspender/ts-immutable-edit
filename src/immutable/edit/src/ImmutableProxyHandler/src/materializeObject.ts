import { MATERIALIZE_PROXY } from '../../symbol/MATERIALIZE_PROXY';
import { isMaterializable } from '../../types/Materializable/guard/isMaterializable';
import { CopyRef } from './types/CopyRef';
import { MaterializedValue } from './types/MaterializedValue';

export function materializeObject<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T>,
  changed: boolean
): MaterializedValue<T> {
  let descendentsOrSelfChanged = changed;

  Object.entries(copyRef.ref).forEach(([k, v]) => {
    if (isMaterializable(v)) {
      const r = v[MATERIALIZE_PROXY]();
      descendentsOrSelfChanged = descendentsOrSelfChanged || r.changed;
      (copyRef.ref as any)[k] = r.value;
    }
  });

  // const entries = Object.entries(copyRef.ref).map(([k, v]) => {
  //   if (isMaterializable(v)) {
  //     const r = v[MATERIALIZE_PROXY]();
  //     descendentsOrSelfChanged = descendentsOrSelfChanged || r.changed;
  //     return [k, r.value];
  //   } else {
  //     return [k, v];
  //   }
  // });
  // if (!descendentsOrSelfChanged) {
  //   return { value: originalTarget, changed: false };
  // }
  // const value = Object.fromEntries(entries) as T;
  // return { value, changed: true };
  return {
    value: descendentsOrSelfChanged ? copyRef.ref : originalTarget,
    changed: descendentsOrSelfChanged,
  };
}
