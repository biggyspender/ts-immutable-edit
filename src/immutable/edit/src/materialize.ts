import { isMaterializable } from './types/Materializable/guard/isMaterializable';
import { MATERIALIZE_PROXY } from './symbol/MATERIALIZE_PROXY';
import { Proxied } from './types/Proxied';

export function materialize<T extends object>(v: Proxied<T>): T {
  return isMaterializable(v) ? v[MATERIALIZE_PROXY]().value : v;
}
