import { createProxyHandler } from './createProxyHandler';
import { Proxied } from '../src/types/Proxied';

export function createProxy<T extends object>(originalTarget: T): Proxied<T> {
  const proxyHandler = createProxyHandler(createProxy);
  const { proxy: draft, revoke } = Proxy.revocable(
    originalTarget,
    proxyHandler
  );
  //proxyHandler.revoke = revoke;
  return draft as Proxied<T>;
}
