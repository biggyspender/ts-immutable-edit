import { MATERIALIZE_PROXY } from "./symbol/MATERIALIZE_PROXY";
import { isMaterializable } from "./types/Materializable/guard/isMaterializable";
import { CopyRef } from "./types/CopyRef";

export function materializeObject<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T>,
  changed: boolean) {
  let descendentsOrSelfChanged = changed;
  const entries = Object.entries(copyRef.ref).map(([k, v]) => {
    if (isMaterializable(v)) {
      const r = v[MATERIALIZE_PROXY]();
      descendentsOrSelfChanged = descendentsOrSelfChanged || r.isCopy;
      return [k, r.value];
    } else {
      return [k, v];
    }
  });
  if (!descendentsOrSelfChanged) {
    return { value: originalTarget, isCopy: false };
  }
  const value = Object.fromEntries(entries) as T;
  return { value, isCopy: true };
}
