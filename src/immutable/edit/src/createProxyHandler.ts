import { ImmutableProxyHandler } from './ImmutableProxyHandler';

export function createProxyHandler<T extends object>(
  createProxy: <T extends object>(v: T) => T
): ProxyHandler<T> {
  return new ImmutableProxyHandler(createProxy);
}
