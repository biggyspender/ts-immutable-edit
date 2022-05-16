import { Revokable } from './createProxy';
import { ImmutableProxyHandler } from './ImmutableProxyHandler';
import { Proxied } from './types/Proxied';

export function createProxyHandler<T extends object>(
  originalTarget: T,
  createProxy: <T extends object>(v: T) => Revokable<Proxied<T>>
): ImmutableProxyHandler<T> {
  return new ImmutableProxyHandler(originalTarget, createProxy);
}
