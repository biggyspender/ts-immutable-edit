import { Ref } from "./types/Ref";

export function makeCopyRef<T extends object>(v: T): Ref<T> {
  return Array.isArray(v)
    ? {
        ref_: Array.from(v) as T,
      }
    : {
        ref_: { ...v },
      };
}
