import { Revokable } from "../createProxy";
import { MATERIALIZE_PROXY } from "../symbol/MATERIALIZE_PROXY";
import { isMaterializable } from "../types/Materializable/guard/isMaterializable";
import { Proxied } from "../types/Proxied";
import { makeCopyRef } from "./src/makeCopyRef";
import { materializeProxy } from "./src/materializeProxy";
import { MaterializedValue } from "./src/types/MaterializedValue";
import { Ref } from "./src/types/Ref";

//type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type EventHandlers = {
  onCanFreeze?: <T extends object>(v: T, deep: boolean) => void;
};

//type TTT = EventHandlers<string,EventTypes>
export class EditProxyHandler<T extends object> implements ProxyHandler<T> {
  private copyRef_?: Ref<T>;
  private changed_ = false;
  private materializedRef_: MaterializedValue<T> | undefined;
  private revocations_: (() => void)[] = [];
  private originalTarget_: T;
  private createProxy_: <T extends object>(
    v: T,
    eventHandlers: EventHandlers
  ) => Revokable<Proxied<T>>;
  private eventHandlers_: EventHandlers;
  constructor(
    originalTarget: T,
    createProxy: <T extends object>(
      v: T,
      eventHandlers: EventHandlers
    ) => Revokable<Proxied<T>>,
    eventHandlers: EventHandlers
  ) {
    this.eventHandlers_ = eventHandlers;
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

  private setChanged_() {
    // if (this.eventHandlers_.discarded && !this.changed_) {
    //   this.eventHandlers_.discarded(this.originalTarget_);
    // }
    this.changed_ = true;
    if (!this.copyRef_) {
      this.copyRef_ = makeCopyRef(this.originalTarget_);
      if (this.eventHandlers_.onCanFreeze) {
        this.eventHandlers_.onCanFreeze(this.copyRef_.ref_, false);
      }
    }
    return this.copyRef_;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(target: T, propKey: PropertyKey, receiver: any) {
    // console.log(`GET : ${String(propKey)}`);
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
        const { draft_, revoke_ } = this.createProxy_(
          returnValue,
          this.eventHandlers_
        );
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
    // console.log(`SET : ${String(propKey)}`);
    this.throwOnMaterialized_();
    const copyRef = this.setChanged_();
    if (
      this.eventHandlers_.onCanFreeze &&
      typeof value === "object" &&
      !isMaterializable(value)
    ) {
      this.eventHandlers_.onCanFreeze(value, true);
    }
    const ret = Reflect.set(copyRef.ref_, propKey, value, copyRef.ref_);
    return ret;
  }

  public deleteProperty(target: T, propKey: PropertyKey) {
    // console.log(`DELETE : ${String(propKey)}`);
    this.throwOnMaterialized_();
    const copyRef = this.setChanged_();
    //    const v = Reflect.get(copyRef.ref_, propKey);
    const deleted = Reflect.deleteProperty(copyRef.ref_, propKey);
    // if (this.eventHandlers_.discarded && typeof v === "object" && deleted) {
    //   this.eventHandlers_.discarded(v);
    // }
    return deleted;
  }
  public has(target: T, propKey: PropertyKey) {
    // console.log(`HAS : ${String(propKey)}`);
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
    // console.log(`OWNKEYS`);
    return Reflect.ownKeys(
      this.copyRef_ ? this.copyRef_.ref_ : this.originalTarget_
    );
  }
  getOwnPropertyDescriptor(_: T, propKey: PropertyKey) {
    // console.log(`GETOWNPROPERTYDESCRIPTOR : ${String(propKey)}`);

    const ownPropertyDescriptor = Reflect.getOwnPropertyDescriptor(
      this.copyRef_ ? this.copyRef_.ref_ : this.originalTarget_,
      propKey
    );
    return ownPropertyDescriptor;
  }
}
