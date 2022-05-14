import { StringPathsOf } from './StringPathsOf';

export type DeepKey<
  Obj,
  KeyPath extends StringPathsOf<Obj>
> = KeyPath extends `${infer KeySegment}.${infer RemainingKeyPath}`
  ? Obj extends { [_ in KeySegment]: infer PropValue }
    ? RemainingKeyPath extends StringPathsOf<PropValue>
      ? DeepKey<PropValue, RemainingKeyPath>
      : never
    : never
  : KeyPath extends `${infer KeySegment}`
  ? Obj extends { [_ in KeySegment]: infer PropValue }
    ? PropValue
    : Obj extends { [_ in KeySegment]?: infer PropValue }
    ? PropValue | undefined
    : never
  : never;
