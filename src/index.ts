import { edit } from './immutable/edit';
import util from 'util';
import { pipeInto } from 'ts-functional-pipe';
import { join, toArray } from 'ts-iterable-functions';

process.stdout.write('\u001b[3J\u001b[1J');
console.clear();

try {
  const src1 = {
    a: { a: 1 } as { a: number } | undefined,
    b: { animal: 'monkey' },
    arr: [{ n: 1 }, { n: 2 }, { n: 3 }],
  };

  const res = edit(src1, (draft) => {
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
    //arr.copyWithin(0, 2, 4);
    //arr.reverse();
    //console.log(Object.entries(draft));
  });
  console.log(util.inspect(res, undefined, 5, true));
  console.log(util.inspect(src1, undefined, 5, true));
  console.log(src1.b.animal === res.b.animal);
  console.log(
    pipeInto(
      src1.arr,
      join(
        res.arr,
        (a) => a,
        (b) => b,
        (a) => a
      ),
      toArray()
    )
  );
  // console.log(res.b === src1.b);
  // console.log(res === src1);
} catch (e: any) {
  console.log(e.message);
}
