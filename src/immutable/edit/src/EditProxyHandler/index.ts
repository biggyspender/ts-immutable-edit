import { Revokable } from "../createProxy";
import { MATERIALIZE_PROXY } from "../symbol/MATERIALIZE_PROXY";
import { isMaterializable } from "../types/Materializable/guard/isMaterializable";
import { Proxied } from "../types/Proxied";
import { makeCopyRef } from "./src/makeCopyRef";
import { materializeProxy } from "./src/materializeProxy";
import { MaterializedValue } from "./src/types/MaterializedValue";
import { Ref } from "./src/types/Ref";

export class EditProxyHandler<T extends object> implements ProxyHandler<T> {
  private copyRef_?: Ref<T>;
  private changed_ = false;
  private materializedRef_: MaterializedValue<T> | undefined;
  private revocations_: (() => void)[] = [];
  private originalTarget_: T;
  private createProxy_: <T extends object>(v: T) => Revokable<Proxied<T>>;
  constructor(
    originalTarget: T,
    createProxy: <T extends object>(v: T) => Revokable<Proxied<T>>
  ) {
    this.originalTarget_ = originalTarget;
    this.createProxy_ = createProxy;
  }

  private materialize_() {
    if (this.materializedRef_) {
      return this.materializedRef_;
    }
    const val = materializeProxy(
      this.originalTarget_,
      this.copyRef_,
      this.changed_
    );
    this.materializedRef_ = val;
    return val;
  }

  private throwOnMaterialized_() {
    if (this.materializedRef_) {
      throw Error("expired");
    }
  }

  public revoke_() {
    for (const r of this.revocations_) {
      r();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(target: T, propKey: PropertyKey, receiver: any) {
    switch (propKey) {
      case MATERIALIZE_PROXY: {
        return this.materialize_.bind(this);
      }
      default: {
        const returnValue = Reflect.get(
          this.copyRef_ ? this.copyRef_.ref_ : this.originalTarget_,
          propKey
        );

        if (typeof returnValue === "function") {
          return (returnValue as (...args: unknown[]) => unknown).bind(
            receiver
          );
        }
        if (typeof returnValue !== "object" || isMaterializable(returnValue)) {
          return returnValue;
        }
        const { draft_, revoke_ } = this.createProxy_(returnValue);
        this.revocations_.push(revoke_);
        if (!this.copyRef_) {
          this.copyRef_ = makeCopyRef(this.originalTarget_);
        }
        Reflect.set(this.copyRef_.ref_, propKey, draft_);
        return draft_;
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set(target: T, propKey: PropertyKey, value: any) {
    this.throwOnMaterialized_();
    this.changed_ = true;
    if (!this.copyRef_) {
      this.copyRef_ = makeCopyRef(this.originalTarget_);
    }
    const ret = Reflect.set(
      this.copyRef_.ref_,
      propKey,
      value,
      this.copyRef_.ref_
    );
    return ret;
  }

  public deleteProperty(target: T, propKey: PropertyKey) {
    this.throwOnMaterialized_();
    this.changed_ = true;
    if (!this.copyRef_) {
      this.copyRef_ = makeCopyRef(this.originalTarget_);
    }
    return Reflect.deleteProperty(this.copyRef_.ref_, propKey);
  }
  public has(target: T, propKey: PropertyKey) {
    switch (propKey) {
      case MATERIALIZE_PROXY: {
        return true;
      }
      default: {
        return Reflect.has(
          this.copyRef_ ? this.copyRef_.ref_ : this.originalTarget_,
          propKey
        );
      }
    }
  }
  ownKeys() {
    return Reflect.ownKeys(
      this.copyRef_ ? this.copyRef_.ref_ : this.originalTarget_
    );
  }
  getOwnPropertyDescriptor(_: T, propKey: PropertyKey) {
    const ownPropertyDescriptor = Reflect.getOwnPropertyDescriptor(
      this.copyRef_ ? this.copyRef_.ref_ : this.originalTarget_,
      propKey
    );
    return ownPropertyDescriptor;
  }
}
