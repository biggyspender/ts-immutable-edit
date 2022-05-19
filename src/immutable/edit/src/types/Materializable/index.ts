import { MaterializedValue } from "../../EditProxyHandler/src/types/MaterializedValue";
import { MATERIALIZE_PROXY } from "../../symbol/MATERIALIZE_PROXY";

export interface Materializable<T extends object> {
  [MATERIALIZE_PROXY]: () => MaterializedValue<T>;
}
