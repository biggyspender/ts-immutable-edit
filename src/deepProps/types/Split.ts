export type Split<
  SrcString extends string,
  Splitter extends string,
  Acc extends string[] = []
> = SrcString extends `${infer Head}${Splitter}${infer Rest}`
  ? Split<Rest, Splitter, [...Acc, Head]>
  : [...Acc, SrcString];
