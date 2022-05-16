import { edit } from './immutable/edit';
import util from 'util';
import { pipeInto } from 'ts-functional-pipe';
import { range, map, forEach } from 'ts-iterable-functions';
import { produce } from 'immer';
import { performance } from 'perf_hooks';
import { deepFreeze } from './immutable/deepFreeze';
import { Mutable } from './immutable/Immutable';

process.stdout.write('\u001b[3J\u001b[1J');
console.clear();

try {
  const srcData = deepFreeze({
    a: { a: 1 } as { a: number } | undefined,
    b: { animal: 'monkey' },
    arr: [{ n: 1 }, { n: 2 }, { n: 3 }],
  });

  const editFunc = (draft: Mutable<typeof srcData>) => {
    delete draft.a;
    draft.b.animal = 'giraffe';
    const arr = draft.arr;
    arr.sort((a, b) => b.n - a.n);
    arr.push({ n: 4 });
    arr.shift();
    const xx = { a: 2 };
    draft.a = xx;
    xx.a = 10;
    const nn = draft.arr.find((v) => v.n === 4);
    if (nn) {
      nn.n = 999;
    }
    arr.push(...[9, 8, 7].map((v) => ({ n: v })));
    arr.copyWithin(0, 1, 3);
    arr.reverse();
    //console.log(Object.entries(draft));
  };
  for (let i = 0; i < 10; ++i) {
    edit(srcData, editFunc);
    produce(srcData, editFunc);
  }

  const numRuns = 10000;
  const run1Start = performance.now();
  for (let i = 0; i < numRuns; ++i) {
    edit(srcData, editFunc);
  }
  // pipeInto(
  //   range(0, numRuns),
  //   map(() => edit(src1, editFunc)),
  //   forEach(() => {})
  // );
  const run1end = performance.now();
  for (let i = 0; i < numRuns; ++i) {
    produce(srcData, editFunc);
  }

  // pipeInto(
  //   range(0, numRuns),
  //   map(() => produce(src1, editFunc)),
  //   forEach(() => {})
  // );
  const run2end = performance.now();

  console.log(run1end - run1Start, run2end - run1end);

  const res1 = edit(srcData, editFunc);
  console.log(Object.isFrozen(res1));
  console.log(util.inspect(res1, undefined, 5, true));
  const res2 = produce(srcData, editFunc);
  console.log(util.inspect(res2, undefined, 5, true));
  // console.log(util.inspect(src1, undefined, 5, true));
  // console.log(src1.b.animal === res.b.animal);
  // console.log(
  //   pipeInto(
  //     src1.arr,
  //     join(
  //       res.arr,
  //       (a) => a,
  //       (b) => b,
  //       (a) => a
  //     ),
  //     toArray()
  //   )
  // );
  // console.log(res.b === src1.b);
  // console.log(res === src1);
} catch (e: any) {
  console.log(e.message, e.stack);
}
