/** Synchronous notifications with bounded, redacted observer-failure diagnostics. */
export class EventBus {
  #listeners = new Map();
  #diagnostics = [];
  on(type, handler) {
    if (typeof type !== 'string' || !type || typeof handler !== 'function') throw new TypeError('Invalid event subscription');
    const set = this.#listeners.get(type) ?? new Set();
    set.add(handler); this.#listeners.set(type, set);
    return () => { set.delete(handler); if (!set.size) this.#listeners.delete(type); };
  }
  #record(type) {
    this.#diagnostics.push({type, code:'OBSERVER_FAILED'});
    if (this.#diagnostics.length > 50) this.#diagnostics.shift();
  }
  diagnostics() { return this.#diagnostics.map(item => ({...item})); }
  emit(type, payload = {}) {
    const event = { type, at:new Date().toISOString(), payload };
    const listeners = new Set([...(this.#listeners.get(type) ?? []), ...(this.#listeners.get('*') ?? [])]);
    for (const handler of listeners) {
      try {
        // Each observer gets a snapshot; modifying it cannot change execution or another observer.
        const result = handler(structuredClone(event));
        if (result && typeof result.then === 'function') Promise.resolve(result).catch(() => this.#record(type));
      } catch { this.#record(type); }
    }
    return event;
  }
}
export const eventBus = new EventBus();
