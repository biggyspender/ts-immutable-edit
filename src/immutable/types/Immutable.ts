export type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};
