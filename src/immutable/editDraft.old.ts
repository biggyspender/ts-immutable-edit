const materializationSymbol = Symbol();

function materializeObjectProxy<T extends Object>(
  v: T,
  modifications: Map<PropertyKey, any>
): T {
  console.log('materializing object', v, modifications);
  return {
    ...v,
    ...Object.fromEntries(
      Array.from(modifications).map(([k, v]) => [
        k,
        typeof v === 'object' && materializationSymbol in v
          ? v[materializationSymbol]()
          : v,
      ])
    ),
  } as T;
}
function materializeArrayProxy<T extends any[]>(
  arr: T,
  modifications: Map<PropertyKey, any>
): T {
  console.log('materializing array', arr, modifications);

  const output = [...arr];
  modifications.forEach((v, k) => {
    (output as any)[k] =
      typeof v === 'object' && materializationSymbol in v
        ? v[materializationSymbol]()
        : v;
  });
  return output as T;
}

function edit<T extends object>(v: T): [T, () => T] {
  const modifications = new Map<PropertyKey, any>();
  const materializationFunc = () =>
    Array.isArray(v)
      ? materializeArrayProxy(v, modifications)
      : materializeObjectProxy(v, modifications);

  const draft = new Proxy<T>(v, {
    get(targ, propKey) {
      switch (propKey) {
        case materializationSymbol: {
          return materializationFunc;
        }
        default: {
          console.log('getting', propKey);
          if (modifications.has(propKey)) {
            return modifications.get(propKey);
          }

          const valueToReturn = (targ as any)[propKey];
          if (typeof valueToReturn === 'object') {
            const [prox] = edit(valueToReturn);
            modifications.set(propKey, prox);
            return prox;
          }
          return valueToReturn;
        }
      }
    },
    set(obj, propKey, value) {
      console.log('setting', propKey);
      modifications.set(propKey, value);
      return true;
    },
    has(target, propKey) {
      switch (propKey) {
        case materializationSymbol: {
          return true;
        }
        default: {
          return propKey in target;
        }
      }
    },
  });
  return [draft, materializationFunc];
}

export function editDraft<T extends object>(
  v: T,
  editor: (draft: T) => void
): T {
  const [draft, materialize] = edit(v);
  editor(draft);
  return materialize();
}
