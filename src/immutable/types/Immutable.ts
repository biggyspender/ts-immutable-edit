export type Immutable<T extends object> = {
  readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
};
