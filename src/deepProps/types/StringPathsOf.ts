import { Join } from './Join';

export type PathTree<T> = {
  [P in keyof T]-?: T[P] extends object
    ? [P] | [P, ...ArrayPathsOf<T[P]>]
    : [P];
};

export type ArrayPathsOf<T> = PathTree<T>[keyof PathTree<T>];

export type StringPathsOf<T> = ArrayPathsOf<T> extends string[]
  ? Join<ArrayPathsOf<T>, '.'>
  : never;
