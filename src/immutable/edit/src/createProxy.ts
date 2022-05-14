import { MATERIALIZE_PROXY } from "./symbol/MATERIALIZE_PROXY";
import { Proxied } from "../src/types/Proxied";
import { materializeProxy } from "./materializeProxy";
import { isMaterializable } from "../src/types/Materializable/guard/isMaterializable";
import { makeCopyRef } from "./makeCopyRef";
import { CopyRef } from "../src/types/CopyRef";

export function createProxy<T extends object>(originalTarget: T): Proxied<T> {
  let copyRef: CopyRef<T> | undefined;
  let changed = false;
  let materializedRef: {
    value: T;
    isCopy: boolean;
  } |
    undefined;
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
          if (typeof returnValue !== 'object' ||
            isMaterializable(returnValue)) {
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
    }
  };
  const draft = new Proxy(originalTarget, proxyHandler);
  return draft as Proxied<T>;
}
