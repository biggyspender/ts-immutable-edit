"use strict";
import test from "ava";
import { deepFreeze } from "../index";
test("deepFreeze() - strict", (t) => {
  const bb = { b: 1 };
  const aaa = { a: 1 };
  const arr = [aaa, { a: 2 }];
  const data = { a: bb, b: arr };
  const frozen = deepFreeze(data);
  const f = frozen as typeof data;
  const temp = f.a;
  t.is(temp, bb);
  const v = { b: 2 };
  t.throws(() => {
    f.a = v;
  });

  t.not(f.a, v);
  t.is(f.a, temp);
  t.is(f.a, bb);

  const newB = { a: 666 };
  t.throws(() => {
    f.b[0] = newB;
  });
  t.not(f.b[0], newB);
  t.is(f.b[0], aaa);
  t.throws(() => {
    f.b[0].a = 9999;
  });

  t.is(f.b[0].a, 1);

  t.throws(() => {
    delete f.b;
  });
  t.is(f.b[0].a, 1);
});
