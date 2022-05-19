import test from "ava";
import { Mutable } from "../../types/Mutable";
import { createProxy } from "../src/createProxy";
import { materialize } from "../src/materialize";

test("double materialize", (t) => {
  const v = { a: { b: 2 } };
  const { draft } = createProxy(v);
  const editableDraft = draft as Mutable<typeof v>;
  editableDraft.a.b = 5;
  const { value: v1 } = materialize(draft);
  const { value: v2 } = materialize(draft);
  t.is(v1, v2);
});
test("set after expiration", (t) => {
  const v = { a: { b: 2 } };
  const { draft } = createProxy(v);
  const editableDraft = draft as Mutable<typeof v>;
  materialize(draft);
  t.throws(() => {
    editableDraft.a = { b: 4 };
  });
});
test("delete after expiration", (t) => {
  const v = { a: { b: 2 } };
  const { draft } = createProxy(v);
  const editableDraft = draft as Mutable<typeof v>;
  materialize(draft);
  t.throws(() => {
    delete editableDraft.a;
  });
});
