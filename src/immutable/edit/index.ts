import { deepFreeze } from "../deepFreeze";
import { Immutable } from "../types/Immutable";
import { Mutable } from "../types/Mutable";
import { createProxy } from "./src/createProxy";
import { materialize } from "./src/materialize";

type EditOptions = {
  freeze: boolean;
};
const defaultOptions = { freeze: false };

type EditReturnType<
  O extends Partial<EditOptions>,
  T extends object
> = O extends {
  freeze: true;
}
  ? Immutable<T>
  : T;

export function edit<
  T extends object,
  O extends Partial<EditOptions> = EditOptions
>(
  v: T,
  editor: (draft: Mutable<T>) => void,
  options?: O
): EditReturnType<O, T> {
  const opts = { ...defaultOptions, ...options };
  const { draft, revoke } = createProxy(v);
  editor(draft as Mutable<T>);
  const { value } = materialize(draft);
  revoke();
  if (opts.freeze) {
    return deepFreeze(value) as EditReturnType<O, T>;
  }
  return value as EditReturnType<O, T>;
}
