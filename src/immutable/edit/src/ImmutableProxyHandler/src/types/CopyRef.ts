import { Ref } from './Ref';

export type CopyRef<T extends object> = Ref<T> & {
  type: 'array' | 'object';
};
