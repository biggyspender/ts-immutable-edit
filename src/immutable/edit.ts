const MATERIALIZE_PROXY = Symbol('EDIT_PROXY');
interface Materializable<T extends object> {
  [MATERIALIZE_PROXY]: () => { value: T; isCopy: boolean };
}

type Proxied<T extends object> = T & Materializable<T>;
function materializeObject<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T>,
  changed: boolean
) {
  let descendentsOrSelfChanged = changed;
  const entries = Object.entries(copyRef.ref).map(([k, v]) => {
    if (isMaterializable(v)) {
      const r = v[MATERIALIZE_PROXY]();
      descendentsOrSelfChanged = descendentsOrSelfChanged || r.isCopy;
      return [k, r.value];
    } else {
      return [k, v];
    }
  });
  if (!descendentsOrSelfChanged) {
    return { value: originalTarget, isCopy: false };
  }
  const value = Object.fromEntries(entries) as T;
  return { value, isCopy: true };
}
function materializeArray<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T>,
  changed: boolean
) {
  let descendentsOrSelfChanged = changed;
  const value = (copyRef.ref as any[]).map((v) => {
    if (isMaterializable(v)) {
      const r = v[MATERIALIZE_PROXY]();
      descendentsOrSelfChanged = descendentsOrSelfChanged || r.isCopy;
      return r.value;
    } else {
      return v;
    }
  }) as T;
  return {
    value: descendentsOrSelfChanged ? value : originalTarget,
    isCopy: descendentsOrSelfChanged,
  };
}
function materializeProxy<T extends object>(
  originalTarget: T,
  copyRef: CopyRef<T> | undefined,
  changed: boolean
): { value: T; isCopy: boolean } {
  if (!copyRef) {
    return { value: originalTarget, isCopy: false };
  }
  const { value: materialized, isCopy: descendentsChanged } =
    copyRef.type === 'object'
      ? materializeObject(originalTarget, copyRef, changed)
      : materializeArray(originalTarget, copyRef, changed);
  let descendentOrSelfChanged = changed || descendentsChanged;

  return {
    value: descendentOrSelfChanged ? materialized : originalTarget,
    isCopy: descendentOrSelfChanged,
  };
}

function createProxy<T extends object>(originalTarget: T): Proxied<T> {
  let copyRef: CopyRef<T> | undefined;
  let changed = false;
  let materializedRef:
    | {
        value: T;
        isCopy: boolean;
      }
    | undefined;
  const proxyHandler: ProxyHandler<T> = {
    get: (target, propKey, receiver) => {
      switch (propKey) {
        case MATERIALIZE_PROXY: {
          return () => {
            if (materializedRef) {
              return materializedRef;
            }
            const val = materializeProxy(originalTarget, copyRef, changed);
            materializedRef = val;
            return val;
          };
        }
        default: {
          const returnValue = Reflect.get(
            copyRef ? copyRef.ref : originalTarget,
            propKey
          );

          if (typeof returnValue === 'function') {
            return (returnValue as Function).bind(draft);
          }
          if (
            typeof returnValue !== 'object' ||
            isMaterializable(returnValue)
          ) {
            return returnValue;
          }
          const proxyVal = createProxy(returnValue);
          if (!copyRef) {
            copyRef = makeCopyRef(originalTarget);
          }
          Reflect.set(copyRef.ref, propKey, proxyVal);
          return proxyVal;
        }
      }
    },
    set: (target, propKey, value, receiver) => {
      if (materializedRef) {
        throw Error('object proxy expired');
      }
      changed = true;
      if (!copyRef) {
        copyRef = makeCopyRef(originalTarget);
      }
      const ret = Reflect.set(copyRef.ref, propKey, value, copyRef.ref);
      return ret;
    },
    deleteProperty: (target, propKey) => {
      if (materializedRef) {
        throw Error('object proxy expired');
      }
      if (!copyRef) {
        copyRef = makeCopyRef(originalTarget);
      }
      return Reflect.deleteProperty(copyRef.ref, propKey);
    },
    has: (target, propKey) => {
      switch (propKey) {
        case MATERIALIZE_PROXY: {
          return true;
        }
        default: {
          return Reflect.has(copyRef ? copyRef.ref : target, propKey);
        }
      }
    },
    ownKeys: (target) => {
      return Reflect.ownKeys(copyRef ? copyRef.ref : target);
    },
    getOwnPropertyDescriptor: (target, propKey) => {
      return Reflect.getOwnPropertyDescriptor(
        copyRef ? copyRef.ref : target,
        propKey
      );
    },
  };
  const draft = new Proxy(originalTarget, proxyHandler);
  return draft as Proxied<T>;
}
type Ref<T extends object> = {
  ref: T;
};
type CopyRef<T extends object> = Ref<T> & {
  type: 'array' | 'object';
};

function makeCopyRef<T extends object>(v: T): CopyRef<T> {
  return Array.isArray(v)
    ? {
        ref: Array.from(v) as T,
        type: 'array',
      }
    : {
        ref: { ...v },
        type: 'object',
      };
}

function isMaterializable(v: any): v is Materializable<any> {
  return typeof v === 'object' && MATERIALIZE_PROXY in v;
}

function materialize<T extends object>(v: T): T {
  return isMaterializable(v) ? v[MATERIALIZE_PROXY]().value : v;
}

export function edit<T extends object>(v: T, editor: (draft: T) => void): T {
  const draft = createProxy(v);
  editor(draft);
  return materialize(draft);
}
