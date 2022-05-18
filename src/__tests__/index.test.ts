import test from "ava";
import { edit } from "../index";

test("edit()", (t) => {
  const data = { a: { b: 1 }, b: [{ a: 1 }, { a: 2 }] };
  const edited = edit(data, (draft) => {
    draft.b[0].a = 33;
  });
  const targetOutput = { a: { b: 1 }, b: [{ a: 33 }, { a: 2 }] };
  t.deepEqual(edited, targetOutput);
});
