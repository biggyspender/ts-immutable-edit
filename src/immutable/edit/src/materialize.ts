import { MaterializedValue } from './EditProxyHandler/src/types/MaterializedValue';
import { MATERIALIZE_PROXY } from './symbol/MATERIALIZE_PROXY';
import { isMaterializable } from './types/Materializable/guard/isMaterializable';

export function materialize<T extends object>(v: T): MaterializedValue<T> {
  return isMaterializable(v)
    ? v[MATERIALIZE_PROXY]()
    : { value: v, changed: false };
}
