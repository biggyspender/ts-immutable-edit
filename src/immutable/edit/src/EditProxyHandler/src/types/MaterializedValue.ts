export type MaterializedValue<T extends object> = {
  value_: T;
  changed_: boolean;
};
