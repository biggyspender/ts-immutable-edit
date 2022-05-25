# ts-immutable-edit

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

## Example / Play

See the code above in action on [⚡StackBlitz](https://stackblitz.com/fork/ts-immutable-edit-demo?file=src/index.ts&view=editor).

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/ts-immutable-edit-demo?file=src/index.ts&view=editor)
