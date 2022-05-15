import { MATERIALIZE_PROXY } from '../../symbol/MATERIALIZE_PROXY';
import { MaterializedValue } from '../MaterializedValue';

export interface Materializable<T extends object> {
  [MATERIALIZE_PROXY]: () => MaterializedValue<T>;
}
