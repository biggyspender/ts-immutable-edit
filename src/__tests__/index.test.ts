import test from "ava";
import { naiveFreezeTransform } from "../immutable/naiveFreezeTransform";
import { edit, freezeTransform } from "../index";

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
test("edit() array push", (t) => {
  const data = [...new Array(10)].map((_, i) => i);
  const copy = [...data];
  const pushed = edit(data, (draft) => draft.push(10, 11, 12));
  t.deepEqual(
    pushed,
    [...new Array(13)].map((_, i) => i)
  );
  t.deepEqual(data, copy);
});
test("edit() array unshift", (t) => {
  const data = [...new Array(10)].map((_, i) => i);
  const copy = [...data];
  const pushed = edit(data, (draft) => draft.unshift(10, 11, 12));
  t.deepEqual(pushed, [10, 11, 12, ...[...new Array(10)].map((_, i) => i)]);
  t.deepEqual(data, copy);
});
test("edit() array shift", (t) => {
  const data = [...new Array(10)].map((_, i) => i);
  const copy = [...data];
  const pushed = edit(data, (draft) => draft.shift());
  t.deepEqual(
    pushed,
    [...new Array(9)].map((_, i) => i + 1)
  );
  t.deepEqual(data, copy);
});
test("edit() array pop", (t) => {
  const data = [...new Array(10)].map((_, i) => i);
  const copy = [...data];
  const pushed = edit(data, (draft) => draft.pop());
  t.deepEqual(
    pushed,
    [...new Array(9)].map((_, i) => i)
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
test("edit() delete prop", (t) => {
  const d = { a: 1, b: "hello" };
  const edited = edit(d, (draft) => {
    delete draft.a;
  });
  t.deepEqual(edited, { b: "hello" });
  t.deepEqual(d, { a: 1, b: "hello" });
});
test("edit() array splice", (t) => {
  const d = [0, 1, 2, 3, 4, 5];
  const edited = edit(d, (draft) => {
    draft.splice(1, 1);
  });
  t.deepEqual(edited, [0, 2, 3, 4, 5]);
  t.deepEqual(d, [0, 1, 2, 3, 4, 5]);
});
test("edit() array copyWithin", (t) => {
  const d = [0, 1, 2, 3, 4, 5];
  const edited = edit(d, (draft) => {
    draft.copyWithin(2, 0, 2);
  });
  t.deepEqual(edited, [0, 1, 0, 1, 4, 5]);
  t.deepEqual(d, [0, 1, 2, 3, 4, 5]);
});
test("edit() array ownKeys", (t) => {
  const d = { a: 1, b: 2 };
  edit(d, (draft) => {
    t.deepEqual(Object.keys(draft), ["a", "b"]);
  });
  t.deepEqual(d, { a: 1, b: 2 });
});
test("edit() array ownKeys after edit", (t) => {
  const d = { a: 1, b: 2 };
  edit(d, (draft) => {
    draft.a = 0;
    t.deepEqual(Object.keys(draft), ["a", "b"]);
  });
  t.deepEqual(d, { a: 1, b: 2 });
});
test("edit() freeze", (t) => {
  const d = { a: 1, b: 2 };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const out = edit(
    d,
    (draft) => {
      draft.a = 55;
    },
    {
      transform: freezeTransform,
    }
  );
  const o = out as typeof d;
  o.a = 2;
  t.not(out.a, 2);
});
test("edit() draft JSON stringify", (t) => {
  const d = { a: 1, b: { c: 2 } };
  edit(d, (draft) => {
    t.is(JSON.stringify(draft), `{"a":1,"b":{"c":2}}`);
    draft.b.c = 3;
    t.is(JSON.stringify(draft), `{"a":1,"b":{"c":3}}`);
  });
});
test("edit() freezeTransform vs naiveFreezeTransfor", (t) => {
  const d = { a: 1, b: 2 };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const out = edit(d, () => {}, {
    transform: freezeTransform,
  });
  t.false(Object.isFrozen(out));
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const out2 = edit(d, () => {}, {
    transform: naiveFreezeTransform,
  });
  t.true(Object.isFrozen(out2));
});
