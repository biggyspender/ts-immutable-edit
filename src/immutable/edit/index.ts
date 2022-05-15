import { createProxy } from './src/createProxy';
import { materialize } from './src/materialize';

export function edit<T extends object>(v: T, editor: (draft: T) => void): T {
  const draft = createProxy(v);
  editor(draft);
  return materialize(draft);
}
