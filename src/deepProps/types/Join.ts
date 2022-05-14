import { ConcatStringArray } from './ConcatStringArray';

export type Join<
  Strings extends string[],
  Joiner extends string = '.',
  Acc extends string = ''
> = Strings extends [infer Head, ...infer Rest]
  ? Rest extends string[]
    ? Join<
        Rest,
        Joiner,
        Head extends string
          ? Acc extends ''
            ? Head
            : ConcatStringArray<[Acc, Joiner, Head]>
          : never
      >
    : never
  : Acc;
