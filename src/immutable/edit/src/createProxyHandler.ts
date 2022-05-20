import { Revokable } from "./createProxy";
import { EventHandlers, EditProxyHandler } from "./EditProxyHandler";
import { Proxied } from "./types/Proxied";

export function createProxyHandler<T extends object>(
  originalTarget: T,
  createProxy: <T extends object>(
    v: T,
    eventHandlers: EventHandlers
  ) => Revokable<Proxied<T>>,
  eventHandlers: EventHandlers
): EditProxyHandler<T> {
  return new EditProxyHandler(originalTarget, createProxy, eventHandlers);
}
