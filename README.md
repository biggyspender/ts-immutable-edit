# `ts-immutable-edit`

[![NPM](https://img.shields.io/npm/l/ts-immutable-edit)](https://www.npmjs.com/package/ts-immutable-edit)
[![NPM](https://img.shields.io/npm/v/ts-immutable-edit)](https://www.npmjs.com/package/ts-immutable-edit)
[![Bundlephobia Size](https://img.shields.io/bundlephobia/minzip/ts-immutable-edit.svg)](https://bundlephobia.com/package/ts-immutable-edit)
[![ts-immutable-edit](https://github.com/biggyspender/ts-immutable-edit/actions/workflows/ts-immutable-edit.yml/badge.svg?branch=master)](https://github.com/biggyspender/ts-immutable-edit/actions/workflows/ts-immutable-edit.yml)

A trifling<sup>\*</sup>, super-fast library for state management. <sub>(\*[approx 1KiB, gzipped](https://bundlephobia.com/package/ts-immutable-edit))</sub>

## Mutate your immutable

Just like [immer](https://github.com/immerjs/immer), this tiny library makes it easy to generate your next state by applying mutations to a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) around your existing state.

Unlike [immer](https://github.com/immerjs/immer), this library targets only ES6/ES2015 and above and doesn't consider anything other than plain objects and arrays (i.e. things that can be serialized to JSON and back).

Written from the ground-up in TypeScript, the package contains built-in type declarations.

## Get started

### Installation

#### NPM

```sh
npm install ts-immutable-edit
```

#### Yarn

```sh
yarn add ts-immutable-edit
```

### Usage

Import the `edit` function:

```typescript
import { edit } from "ts-immutable-edit";
```

Create a state:

```typescript
const sourceState = { a: { b: "foo" }, c: [{ d: 1 }, { d: 2 }] };
```

Edit your state by mutating the `draft` proxy that passed to the supplied callback:

```typescript
const newState = edit(sourceState, (draft) => {
  draft.c[0].d = 10;
  draft.c.reverse();
});
```

Now, `newState` is

```typescript
{ a: { b: 'foo' }, c: [ { d: 2 }, { d: 10 } ] }
```

but `sourceState` is completely untouched.

The `edit` function assumes that all data passed to it is considered immutable.

As much of the source state as possible will be reused.

In the example above, all of the following statements will log `true`:

```typescript
// the following parts of the new object graph are newly generated
console.log(sourceState !== newState);
console.log(sourceState.c !== newState.c);
console.log(sourceState.c[0] !== newState.c[1]);

// but unchanged parts of the object graph are copied from source
console.log(sourceState.a === newState.a);
console.log(sourceState.c[1] === newState.c[0]);
```

## Real immutability

In the examples above, although the data is treated as if it were immutable, the developer is free to mutate both the source state and the newly generated state. While this offers the fastest mode of operation, it might be desirable to work with an object graph that has been frozen via the [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) function.

### [`deepFreeze`]

Included in the library is the [`deepFreeze`](./src/immutable/deepFreeze.ts) function.

```typescript
const obj = { a: { b: "foo" }, c: [{ d: 2 }, { d: 10 }] };
deepFreeze(obj);
```

This function will recursively traverse the object graph, freezing every object or array that is encountered. In TypeScript, the object returned from `deepFreeze` will have all of its properties marked as `readonly` (this is applied recursively).

This makes it impossible to mutate any object/array in the object graph at runtime and (in the case of TypeScript) will also mean that any attempt to make modifications to a deep-frozen object will be flagged as an error in the IDE.

The `deepFreeze` function does _not_ make a copy of the object passed to it, instead freezing the object that is passed to it in-place. However, in TypeScript, the return value of `deepFreeze` is modified such that all props are `readonly`, as described above.

```typescript
const obj = { a: { b: "foo" }, c: [{ d: 2 }, { d: 10 }] };
const readOnlyObj = deepFreeze(obj);

console.log(obj === readOnlyObj); //true

// No runtime error unless "use strict" is enabled
// but value `obj.a.b` won't change.
obj.a.b = "woo";

// TS compiler error
readOnlyObj.a.b = "woo";
```

### Transforms

The behavior of the `edit` function can be changed by providing a `transform` function in the optional `options` third parameter.

This library provides the `freezeTransform` function, which can be supplied to the `transform` option.

```typescript
const source = { a: 1, b: { a: 1 }, c: [{ a: 1 }, { a: 2 }] };
const frozenSource = deepFreeze(source);
const modified = edit(
  frozenSource,
  (draft) => {
    draft.c[1].a = 3;
  },
  {
    transform: freezeTransform,
  }
);
```

When applied, the `freezeTransform` will "intelligently" ensure that any modifications to the object graph are also frozen while skipping any part of the object graph that was copied directly from source. Therefore, when using the `freezeTransform`, it is advisable to ensure the the original state is already recursively deep frozen (see [deepFreeze](#deepfreeze) section above). This will ensure that any edited object is also _completely_ deep frozen.

### Baking-in the `transform` option

Instead of supplying (a 3<sup>rd</sup>) `options` parameter to `edit`, there exists a higher-order function, [`configureEdit`](./src/immutable/edit/index.ts#L14) which allows the user to bake-in the options into the `edit` function.

So, to have an `edit` function which **_always_** applies the `freezeTransform`, just generate your own `edit` function using the `configureEdit` function:

```typescript
const edit = configureEdit({ transform: freezeTransform });
const source = { a: 1, b: { a: 1 }, c: [{ a: 1 }, { a: 2 }] };
const frozenSource = deepFreeze(source);
const modified = edit(frozenSource, (draft) => {
  draft.c[1].a = 3;
});
```

## Example / Play

See the code above in action on [⚡StackBlitz](https://stackblitz.com/fork/ts-immutable-edit-demo?file=src/index.ts&view=editor).

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/ts-immutable-edit-demo?file=src/index.ts&view=editor)
