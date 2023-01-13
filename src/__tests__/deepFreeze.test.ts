import test from "ava";
import { deepFreeze } from "../index";
test("deepFreeze()", (t) => {
  const bb = { b: 1 };
  const aaa = { a: 1 };
  const arr = [aaa, { a: 2 }];
  const data = { a: bb, b: arr };
  const frozen = deepFreeze(data);
  const f = frozen as typeof data;
  const temp = f.a;
  t.is(temp, bb);
  const v = { b: 2 };
  f.a = v;
  t.not(f.a, v);
  t.is(f.a, temp);
  t.is(f.a, bb);

  const newB = { a: 666 };
  f.b[0] = newB;
  t.not(f.b[0], newB);
  t.is(f.b[0], aaa);

  f.b[0].a = 9999;
  t.is(f.b[0].a, 1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bbb = f as any;
  if ("b" in bbb) {
    delete bbb.b;
  }
  t.is(f.b[0].a, 1);

  // t.throws(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const f = frozen as any;
  //   f.c = { b: 2 };
  // });
  // t.throws(() => {
  //   const f = frozen as typeof data;
  //   f.b = [];
  // });
});
