import { MATERIALIZE_PROXY } from './symbol/MATERIALIZE_PROXY';
import { materializeProxy } from './materializeProxy';
import { isMaterializable } from '../src/types/Materializable/guard/isMaterializable';
import { makeCopyRef } from './makeCopyRef';
import { CopyRef } from '../src/types/CopyRef';

export class ImmutableProxyHandler<T extends object>
  implements ProxyHandler<T>
{
  copyRef: CopyRef<T> | undefined;
  changed = false;
  materializedRef:
    | {
        value: T;
        changed: boolean;
      }
    | undefined;
  createProxy: <T extends object>(v: T) => T;

  constructor(createProxy: <T extends object>(v: T) => T) {
    this.createProxy = createProxy;
  }
  get(target: T, propKey: PropertyKey, receiver: any) {
    switch (propKey) {
      case MATERIALIZE_PROXY: {
        return () => {
          if (this.materializedRef) {
            return this.materializedRef;
          }
          const val = materializeProxy(target, this.copyRef, this.changed);
          this.materializedRef = val;
          return val;
        };
      }
      default: {
        const returnValue = Reflect.get(
          this.copyRef ? this.copyRef.ref : target,
          propKey
        );

        if (typeof returnValue === 'function') {
          return (returnValue as Function).bind(receiver);
        }
        if (typeof returnValue !== 'object' || isMaterializable(returnValue)) {
          return returnValue;
        }
        const proxyVal = this.createProxy(returnValue);
        if (!this.copyRef) {
          this.copyRef = makeCopyRef(target);
        }
        Reflect.set(this.copyRef.ref, propKey, proxyVal);
        return proxyVal;
      }
    }
  }
  set(target: T, propKey: PropertyKey, value: any, receiver: any) {
    if (this.materializedRef) {
      throw Error('object proxy expired');
    }
    this.changed = true;
    if (!this.copyRef) {
      this.copyRef = makeCopyRef(target);
    }
    const ret = Reflect.set(this.copyRef.ref, propKey, value, this.copyRef.ref);
    return ret;
  }
  deleteProperty(target: T, propKey: PropertyKey) {
    if (this.materializedRef) {
      throw Error('object proxy expired');
    }
    if (!this.copyRef) {
      this.copyRef = makeCopyRef(target);
    }
    return Reflect.deleteProperty(this.copyRef.ref, propKey);
  }
  has(target: T, propKey: PropertyKey) {
    switch (propKey) {
      case MATERIALIZE_PROXY: {
        return true;
      }
      default: {
        return Reflect.has(this.copyRef ? this.copyRef.ref : target, propKey);
      }
    }
  }
  ownKeys(target: T) {
    return Reflect.ownKeys(this.copyRef ? this.copyRef.ref : target);
  }
  getOwnPropertyDescriptor(target: T, propKey: PropertyKey) {
    return Reflect.getOwnPropertyDescriptor(
      this.copyRef ? this.copyRef.ref : target,
      propKey
    );
  }
}
