import { createProxyHandler } from './createProxyHandler';
import { Proxied } from '../src/types/Proxied';

export type Revokable<T extends object> = {
  draft: T;
  revoke: () => void;
};

export function createProxy<T extends object>(
  originalTarget: T
): Revokable<Proxied<T>> {
  const proxyHandler = createProxyHandler(originalTarget, createProxy);
  const { proxy, revoke } = Proxy.revocable({}, proxyHandler);
  //proxyHandler.revoke = revoke;
  return {
    draft: proxy as Proxied<T>,
    revoke: () => {
      proxyHandler.revoke();
      revoke();
    },
  };
}
