import { materialize } from "../../materialize";
import { MaterializedValue } from "./types/MaterializedValue";
import { Ref } from "./types/Ref";

export function materializeProxy<T extends object>(
  originalTarget: T,
  copyRef: Ref<T> | undefined,
  changed: boolean
): MaterializedValue<T> {
  if (!copyRef) {
    return { value: originalTarget, changed: false };
  }
  let descendantsOrSelfChanged = changed;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objRef: any = copyRef.ref;
  const propNames = Object.getOwnPropertyNames(objRef);
  for (const k of propNames) {
    const { value, changed } = materialize(objRef[k]);
    descendantsOrSelfChanged = descendantsOrSelfChanged || changed;
    objRef[k] = value;
  }
  return {
    value: descendantsOrSelfChanged ? copyRef.ref : originalTarget,
    changed: descendantsOrSelfChanged,
  };
}
