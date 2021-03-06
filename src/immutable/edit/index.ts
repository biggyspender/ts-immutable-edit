import { Mutable } from "../types/Mutable";
import { createProxy } from "./src/createProxy";
import { EventHandlers } from "./src/EditProxyHandler";
import { materialize } from "./src/materialize";

export type Freezable = {
  value: object;
  needsDeep: boolean;
};

export type EditOptions<T extends object, R> = {
  transform: (v: T, freezableItems: Freezable[]) => R;
};
export const configureEdit =
  <T extends object, R = never>(options: EditOptions<T, R>) =>
  (v: T, editor: (draft: Mutable<T>) => void) =>
    edit(v, editor, options);

export function edit<T extends object, R = T>(
  v: T,
  editor: (draft: Mutable<T>) => void,
  options?: EditOptions<T, R>
): R {
  const freezableItems: Freezable[] = [];
  const proxyEventHandlers: EventHandlers | undefined = options?.transform
    ? {
        onFreezableObject: (value, needsDeep) => {
          freezableItems.push({ value, needsDeep });
        },
      }
    : undefined;
  const { draft_, revoke_ } = createProxy(v, proxyEventHandlers);
  editor(draft_ as Mutable<T>);
  const { value_ } = materialize(draft_);
  revoke_();
  return options?.transform
    ? options.transform(value_, freezableItems)
    : (value_ as unknown as R);
}
