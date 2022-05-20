import { Immutable } from "./types/Immutable";

export function deepFreeze<T extends object>(obj: T): Immutable<T> {
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (obj as any)[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj) as Immutable<T>;
}
