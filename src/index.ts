import { edit } from './immutable/edit';
import util from 'util';
import { enableAllPlugins, produce, setAutoFreeze, setUseProxies } from 'immer';
import { deepFreeze } from './immutable/deepFreeze';
import { Mutable } from './immutable/types/Mutable';
import { measureRunTime } from './measurement/measureRunTime';
import { clearConsoleScrollback } from './util/clearConsoleScrollback';
import { deepEqual } from 'ts-deep-equal';

clearConsoleScrollback();
console.clear();
const MAX = 50000;
const MODIFY_FACTOR = 0.1;

enableAllPlugins();
setUseProxies(true);
setAutoFreeze(false);

try {
  test2();
} catch (e: any) {
  console.log(e.message, e.stack);
}

function test2() {
  const baseState: {
    todo: string;
    done: boolean;
    someThingCompletelyIrrelevant: number[];
  }[] = [];
  //console.log('Hh', MAX);
  for (let i = 0; i < MAX; i++) {
    baseState.push({
      todo: 'todo_' + i,
      done: false,
      someThingCompletelyIrrelevant: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
    });
  }
  //console.log(baseState);
  const editFunc = (draft: Mutable<typeof baseState>) => {
    for (let i = 0; i < MAX * MODIFY_FACTOR; i++) {
      draft[i].done = true;
    }
  };
  runTest(baseState, editFunc, 50, (v1, v2) =>
    console.log(
      deepEqual(v1, v2),
      v1[0],
      v1[0].someThingCompletelyIrrelevant ===
        v2[0].someThingCompletelyIrrelevant
    )
  );
}

function test1() {
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
  runTest(srcData, editFunc, 20000, (res1, res2) => {
    console.log(util.inspect(res1, undefined, 5, true));
    console.log(util.inspect(res2, undefined, 5, true));
    console.log(res1.arr[4], res1.arr[4] === res2.arr[4]);
  });
}

function runTest<T extends object>(
  srcData: T,
  editFunc: (draft: Mutable<T>) => void,
  numRuns: number,
  inspectData?: (v1: T, v2: T) => void
) {
  console.log('measuring performance...', global.gc);
  global.gc && global.gc();
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
  const res2 = produce(srcData, editFunc);
  inspectData?.(res1, res2);
}
