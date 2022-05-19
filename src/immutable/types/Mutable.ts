export type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>;
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};
