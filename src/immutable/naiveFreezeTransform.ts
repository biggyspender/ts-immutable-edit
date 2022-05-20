import { deepFreeze } from "./deepFreeze";
import { Immutable } from "./types/Immutable";

export const naiveFreezeTransform = <T extends object>(v: T): Immutable<T> => {
  return deepFreeze(v);
};
