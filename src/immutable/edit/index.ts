import { Immutable } from 'immer';
import { deepFreeze } from '../deepFreeze';
import { Mutable } from '../Immutable';
import { createProxy } from './src/createProxy';
import { materialize } from './src/materialize';

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
  const r = materialize(draft);
  revoke();
  if (opts.freeze) {
    return deepFreeze(r) as EditReturnType<O, T>;
  }
  return r as EditReturnType<O, T>;
}
