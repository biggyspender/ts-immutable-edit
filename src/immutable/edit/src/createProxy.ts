import { createProxyHandler } from './createProxyHandler';
import { Proxied } from '../src/types/Proxied';

export function createProxy<T extends object>(originalTarget: T): Proxied<T> {
  const proxyHandler = createProxyHandler(createProxy);
  const draft = new Proxy(originalTarget, proxyHandler);
  return draft as Proxied<T>;
}
