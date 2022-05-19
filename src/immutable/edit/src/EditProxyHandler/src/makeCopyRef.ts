import { Ref } from "./types/Ref";

export function makeCopyRef<T extends object>(v: T): Ref<T> {
  return Array.isArray(v)
    ? {
        ref: Array.from(v) as T,
      }
    : {
        ref: { ...v },
      };
}
