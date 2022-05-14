import { isMaterializable } from "./types/Materializable/guard/isMaterializable";
import { MATERIALIZE_PROXY } from "./symbol/MATERIALIZE_PROXY";

export function materialize<T extends object>(v: T): T {
  return isMaterializable(v) ? v[MATERIALIZE_PROXY]().value : v;
}
