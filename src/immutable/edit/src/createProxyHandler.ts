import { Revokable } from "./createProxy";
import { EditProxyHandler } from "./EditProxyHandler";
import { Proxied } from "./types/Proxied";

export function createProxyHandler<T extends object>(
  originalTarget: T,
  createProxy: <T extends object>(v: T) => Revokable<Proxied<T>>
): EditProxyHandler<T> {
  return new EditProxyHandler(originalTarget, createProxy);
}
