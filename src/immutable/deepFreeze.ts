import { Immutable } from 'immer';

export function deepFreeze<T>(obj: T): Immutable<T> {
  var propNames = Object.getOwnPropertyNames(obj);
  for (let name of propNames) {
    let value = (obj as any)[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj) as Immutable<T>;
}
