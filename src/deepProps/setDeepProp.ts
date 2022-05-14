import { DeepKey } from './types/DeepKey';
import { StringPathsOf } from './types/StringPathsOf';

export const setDeepProp = <Obj, KeyPath extends StringPathsOf<Obj>>(
  src: Obj,
  keyPath: KeyPath,
  val: DeepKey<Obj, KeyPath>
): Obj => {
  const [, currentKey, rest] = /^(.*?)(?:\.(.*))?$/.exec(keyPath) ?? [];
  return rest
    ? {
        ...src,
        [currentKey]: (setDeepProp as any)((src as any)[currentKey], rest, val),
      }
    : { ...src, [currentKey]: val };
};
