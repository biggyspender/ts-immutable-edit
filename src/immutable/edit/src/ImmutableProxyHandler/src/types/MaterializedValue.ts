export type MaterializedValue<T extends object> = {
  value: T;
  changed: boolean;
};
