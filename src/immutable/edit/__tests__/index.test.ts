import test from "ava";
import { Mutable } from "../../types/Mutable";
import { createProxy } from "../src/createProxy";
import { materialize } from "../src/materialize";

test("double materialize", (t) => {
  const v = { a: { b: 2 } };
  const { draft_ } = createProxy(v);
  const editableDraft = draft_ as Mutable<typeof v>;
  editableDraft.a.b = 5;
  const { value_: v1 } = materialize(draft_);
  const { value_: v2 } = materialize(draft_);
  t.is(v1, v2);
});
test("set after expiration", (t) => {
  const v = { a: { b: 2 } };
  const { draft_ } = createProxy(v);
  const editableDraft = draft_ as Mutable<typeof v>;
  materialize(draft_);
  t.throws(() => {
    editableDraft.a = { b: 4 };
  });
});
test("delete after expiration", (t) => {
  const v = { a: { b: 2 } };
  const { draft_ } = createProxy(v);
  const editableDraft = draft_ as Mutable<typeof v>;
  materialize(draft_);
  t.throws(() => {
    delete editableDraft.a;
  });
});
