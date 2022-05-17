import { edit } from './immutable/edit';
import util from 'util';
import { produce } from 'immer';
import { deepFreeze } from './immutable/deepFreeze';
import { Mutable } from './immutable/types/Mutable';
import { measureRunTime } from './measurement/measureRunTime';
import { clearConsoleScrollback } from './util/clearConsoleScrollback';

clearConsoleScrollback();
console.clear();

try {
  const srcData = deepFreeze({
    a: { a: 1 } as { a: number } | undefined,
    b: { animal: 'monkey' },
    arr: [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }, { n: 5 }],
  });

  const editFunc = (draft: Mutable<typeof srcData>) => {
    delete draft.a;
    draft.b.animal = 'giraffe';
    const arr = draft.arr;
    arr.sort((a, b) => b.n - a.n);
    arr.push({ n: 6 });
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
    arr.length = 5;
  };
  const numRuns = 50000;
  const editRunMeasurements = {
    name: 'edit',
    ...measureRunTime(numRuns, () => {
      edit(srcData, editFunc);
    }),
  };
  const produceRunMeasurements = {
    name: 'produce',
    ...measureRunTime(numRuns, () => {
      produce(srcData, editFunc);
    }),
  };

  console.log(editRunMeasurements, produceRunMeasurements);
  console.log(
    `${(produceRunMeasurements.runTime / editRunMeasurements.runTime).toFixed(
      2
    )} times faster`
  );

  const res1 = edit(srcData, editFunc);
  console.log(util.inspect(res1, undefined, 5, true));
  const res2 = produce(srcData, editFunc);
  console.log(util.inspect(res2, undefined, 5, true));
  console.log(res1.arr[4], res1.arr[4] === res2.arr[4]);
} catch (e: any) {
  console.log(e.message, e.stack);
}
