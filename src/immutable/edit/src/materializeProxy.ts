import { CopyRef } from "./types/CopyRef";
import { materializeArray } from "./materializeArray";
import { materializeObject } from "./materializeObject";


export function materializeProxy<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T> | undefined,
  changed: boolean
): { value: T; isCopy: boolean; } {
  if (!copyRef) {
    return { value: originalTarget, isCopy: false };
  }
  const { value: materialized, isCopy: descendentsChanged } = copyRef.type === 'object'
    ? materializeObject(originalTarget, copyRef, changed)
    : materializeArray(originalTarget, copyRef, changed);
  let descendentOrSelfChanged = changed || descendentsChanged;

  return {
    value: descendentOrSelfChanged ? materialized : originalTarget,
    isCopy: descendentOrSelfChanged
  };
}
