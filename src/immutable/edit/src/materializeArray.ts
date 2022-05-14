import { MATERIALIZE_PROXY } from "./symbol/MATERIALIZE_PROXY";
import { isMaterializable } from "./types/Materializable/guard/isMaterializable";
import { CopyRef } from "./types/CopyRef";

export function materializeArray<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T>,
  changed: boolean) {
  let descendentsOrSelfChanged = changed;
  const value = (copyRef.ref as any[]).map((v) => {
    if (isMaterializable(v)) {
      const r = v[MATERIALIZE_PROXY]();
      descendentsOrSelfChanged = descendentsOrSelfChanged || r.isCopy;
      return r.value;
    } else {
      return v;
    }
  }) as T;
  return {
    value: descendentsOrSelfChanged ? value : originalTarget,
    isCopy: descendentsOrSelfChanged
  };
}
