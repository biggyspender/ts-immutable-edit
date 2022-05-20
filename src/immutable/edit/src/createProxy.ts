import { Proxied } from "../src/types/Proxied";
import { createProxyHandler } from "./createProxyHandler";

export type Revokable<T extends object> = {
  draft_: T;
  revoke_: () => void;
};

export function createProxy<T extends object>(
  originalTarget: T
): Revokable<Proxied<T>> {
  const proxyHandler = createProxyHandler(originalTarget, createProxy);
  const { proxy, revoke } = Proxy.revocable({}, proxyHandler);
  //proxyHandler.revoke = revoke;
  return {
    draft_: proxy as Proxied<T>,
    revoke_: () => {
      proxyHandler.revoke_();
      revoke();
    },
  };
}
