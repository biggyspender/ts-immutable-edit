import { CopyRef } from './types/CopyRef';

export function makeCopyRef<T extends object>(v: T): CopyRef<T> {
  return Array.isArray(v)
    ? {
        ref: Array.from(v) as T,
        type: 'array',
      }
    : {
        ref: { ...v },
        type: 'object',
      };
}
