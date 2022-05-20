import { materialize } from "../../materialize";
import { MaterializedValue } from "./types/MaterializedValue";
import { Ref } from "./types/Ref";

export function materializeProxy<T extends object>(
  originalTarget: T,
  copyRef: Ref<T> | undefined,
  changed: boolean
): MaterializedValue<T> {
  if (!copyRef) {
    return { value_: originalTarget, changed_: false };
  }
  let descendantsOrSelfChanged = changed;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objRef: any = copyRef.ref_;
  const propNames = Object.getOwnPropertyNames(objRef);
  for (const k of propNames) {
    const { value_, changed_ } = materialize(objRef[k]);
    descendantsOrSelfChanged = descendantsOrSelfChanged || changed_;
    objRef[k] = value_;
  }
  return {
    value_: descendantsOrSelfChanged ? copyRef.ref_ : originalTarget,
    changed_: descendantsOrSelfChanged,
  };
}
