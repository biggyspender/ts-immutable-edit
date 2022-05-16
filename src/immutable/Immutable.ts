export type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
} & {};

export type Mutable<T> = { -readonly [P in keyof T]: Mutable<T[P]> } & {};
