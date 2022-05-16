import { MATERIALIZE_PROXY } from '../symbol/MATERIALIZE_PROXY';
import { materializeProxy } from './src/materializeProxy';
import { isMaterializable } from '../types/Materializable/guard/isMaterializable';
import { makeCopyRef } from './src/makeCopyRef';
import { CopyRef } from './src/types/CopyRef';
import { Revokable } from '../createProxy';
import { Proxied } from '../types/Proxied';

export class ImmutableProxyHandler<T extends object>
  implements ProxyHandler<T>
{
  copyRef?: CopyRef<T>;
  changed = false;
  materializedRef:
    | {
        value: T;
        changed: boolean;
      }
    | undefined;
  createProxy: <T extends object>(v: T) => Revokable<Proxied<T>>;
  revocations: (() => void)[] = [];
  originalTarget: T;

  constructor(
    originalTarget: T,
    createProxy: <T extends object>(v: T) => Revokable<Proxied<T>>
  ) {
    this.originalTarget = originalTarget;
    this.createProxy = createProxy;
  }
  revoke() {
    this.revocations.forEach((r) => r());
  }
  get(target: T, propKey: PropertyKey, receiver: any) {
    switch (propKey) {
      case MATERIALIZE_PROXY: {
        return () => {
          if (this.materializedRef) {
            return this.materializedRef;
          }
          const val = materializeProxy(
            this.originalTarget,
            this.copyRef,
            this.changed
          );
          this.materializedRef = val;
          //this.revoke?.();
          return val;
        };
      }
      default: {
        const returnValue = Reflect.get(
          this.copyRef ? this.copyRef.ref : this.originalTarget,
          propKey
        );

        if (typeof returnValue === 'function') {
          return (returnValue as Function).bind(receiver);
        }
        if (typeof returnValue !== 'object' || isMaterializable(returnValue)) {
          return returnValue;
        }
        const { draft, revoke } = this.createProxy(returnValue);
        this.revocations.push(revoke);
        if (!this.copyRef) {
          this.copyRef = makeCopyRef(this.originalTarget);
        }
        Reflect.set(this.copyRef.ref, propKey, draft);
        return draft;
      }
    }
  }
  set(target: T, propKey: PropertyKey, value: any, receiver: any) {
    if (this.materializedRef) {
      throw Error('object proxy expired');
    }
    this.changed = true;
    if (!this.copyRef) {
      this.copyRef = makeCopyRef(this.originalTarget);
    }
    const ret = Reflect.set(this.copyRef.ref, propKey, value, this.copyRef.ref);
    return ret;
  }
  deleteProperty(target: T, propKey: PropertyKey) {
    if (this.materializedRef) {
      throw Error('object proxy expired');
    }
    if (!this.copyRef) {
      this.copyRef = makeCopyRef(this.originalTarget);
    }
    return Reflect.deleteProperty(this.copyRef.ref, propKey);
  }
  has(target: T, propKey: PropertyKey) {
    switch (propKey) {
      case MATERIALIZE_PROXY: {
        return true;
      }
      default: {
        return Reflect.has(
          this.copyRef ? this.copyRef.ref : this.originalTarget,
          propKey
        );
      }
    }
  }
  ownKeys(target: T) {
    return Reflect.ownKeys(
      this.copyRef ? this.copyRef.ref : this.originalTarget
    );
  }
  getOwnPropertyDescriptor(target: T, propKey: PropertyKey) {
    const ownPropertyDescriptor = Reflect.getOwnPropertyDescriptor(
      this.copyRef ? this.copyRef.ref : this.originalTarget,
      propKey
    );
    console.log('foo');
    if (ownPropertyDescriptor) {
      ownPropertyDescriptor.configurable = true;
    }
    return ownPropertyDescriptor;
  }
}
