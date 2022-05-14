export type ConcatStringArray<
  Strings extends string[],
  Acc extends string = ''
> = Strings extends [infer Head, ...infer Rest]
  ? Head extends string
    ? Rest extends string[]
      ? ConcatStringArray<Rest, `${Acc}${Head}`>
      : Acc
    : Acc
  : Acc;
