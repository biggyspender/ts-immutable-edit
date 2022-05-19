import test from "ava";
import { edit } from "../index";

const bValItem0 = { a: 1 };
const bVal = [bValItem0, { a: 2 }];
const data = { a: { b: 1 }, b: bVal };

test("edit() no changes with touch", (t) => {
  const edited = edit(data, (draft) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const b = draft.a;
  });

  t.is(edited, data);
});
test("edit() no changes no touch", (t) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const edited = edit(data, () => {});

  t.is(edited, data);
});
test("edit() general test", (t) => {
  const edited = edit(data, (draft) => {
    draft.b[1].a = 33;
  });
  const targetOutput = { a: { b: 1 }, b: [{ a: 1 }, { a: 33 }] };
  t.deepEqual(edited, targetOutput);
  t.is(edited.b[0], bValItem0);
});
test("edit() array", (t) => {
  const data = [...new Array(10)].map((_, i) => i);
  const copy = [...data];
  const pushed = edit(data, (draft) => draft.push(10, 11, 12));
  t.deepEqual(
    pushed,
    [...new Array(13)].map((_, i) => i)
  );
  t.deepEqual(data, copy);
});
test("edit() array reverse", (t) => {
  const data = [...new Array(10)].map((_, i) => ({ v: i }));
  const copy = [...data];
  const reversed = edit(data, (draft) => draft.reverse());
  t.deepEqual(reversed, [...new Array(10)].map((_, i) => ({ v: i })).reverse());
  t.deepEqual(data, copy);
  data.forEach((v, i) => t.is(v, copy[i]));
});
test("edit() array length increase", (t) => {
  const data = [...new Array(10)].map((_, i) => ({ v: i }));
  const copy = [...data];
  const newArr = edit(data, (draft) => (draft.length = 12));
  const regeneratedArray = [...data];
  regeneratedArray.length = 12;
  t.deepEqual(newArr, regeneratedArray);
  t.deepEqual(data, copy);
  data.forEach((v, i) => t.is(v, copy[i]));
});
test("edit() array length decrease", (t) => {
  const data = [...new Array(10)].map((_, i) => ({ v: i }));
  const copy = [...data];
  const newArr = edit(data, (draft) => (draft.length = 8));
  const regeneratedArray = [...data];
  regeneratedArray.length = 8;
  t.deepEqual(newArr, regeneratedArray);
  t.deepEqual(data, copy);
  data.forEach((v, i) => t.is(v, copy[i]));
});
