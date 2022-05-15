import { createProxyHandler } from './createProxyHandler';
import { Proxied } from '../src/types/Proxied';

export function createProxy<T extends object>(originalTarget: T): Proxied<T> {
  const proxyHandler = createProxyHandler(originalTarget, createProxy);
  const { proxy: draft } = Proxy.revocable(originalTarget, proxyHandler);
  return draft as Proxied<T>;
}
