import { Materializable } from './Materializable';

export type Proxied<T extends object> = T & Materializable<T>;
