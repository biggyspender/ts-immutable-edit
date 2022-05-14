import { DeepKey } from './types/DeepKey';
import { StringPathsOf } from './types/StringPathsOf';

export const getDeepProp = <T, K extends StringPathsOf<T>>(
  v: T,
  k: K
): DeepKey<T, K> => k.split('.').reduce((acc, curr) => acc[curr], v as any);
