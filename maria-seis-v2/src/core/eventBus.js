export class EventBus {
  #listeners = new Map();
  on(type, handler) {
    const set = this.#listeners.get(type) ?? new Set();
    set.add(handler); this.#listeners.set(type, set);
    return () => set.delete(handler);
  }
  emit(type, payload = {}) {
    const event = { type, at: new Date().toISOString(), payload };
    for (const handler of this.#listeners.get(type) ?? []) handler(event);
    for (const handler of this.#listeners.get('*') ?? []) handler(event);
    return event;
  }
}
export const eventBus = new EventBus();
