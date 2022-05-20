import { Mutable } from "../types/Mutable";
import { createProxy } from "./src/createProxy";
import { materialize } from "./src/materialize";

export function edit<T extends object, R = T>(
  v: T,
  editor: (draft: Mutable<T>) => void,
  options?: { postEdit: (v: T) => R }
): R {
  const { draft_, revoke_ } = createProxy(v);
  editor(draft_ as Mutable<T>);
  const { value_ } = materialize(draft_);
  revoke_();
  return options?.postEdit
    ? options.postEdit(value_)
    : (value_ as unknown as R);
}
