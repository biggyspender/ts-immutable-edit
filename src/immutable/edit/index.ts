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
  const { draft_, revoke_ } = createProxy(v);
  editor(draft_ as Mutable<T>);
  const { value_ } = materialize(draft_);
  revoke_();
  if (opts.freeze) {
    return deepFreeze(value_) as EditReturnType<O, T>;
  }
  return value_ as EditReturnType<O, T>;
}
