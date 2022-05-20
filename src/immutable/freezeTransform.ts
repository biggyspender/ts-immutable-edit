import { deepFreeze } from "./deepFreeze";
import { Freezable } from "./edit";
import { Immutable } from "./types/Immutable";

export const freezeTransform = <T extends object>(
  v: T,
  freezable: Freezable[]
): Immutable<T> => {
  freezable.forEach(({ value, needsDeep }) => {
    if (needsDeep) {
      deepFreeze(value);
    } else {
      Object.freeze(value);
    }
  });
  return v as Immutable<T>;
};
