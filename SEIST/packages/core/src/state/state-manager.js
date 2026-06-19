/**
 * SEIS Core State Management System
 * Handles application state, persistence, and reactive updates
 * 
 * @module @seis/core/state
 * @version 1.0.0
 */

class StateManager {
  constructor(options = {}) {
    this.state = new Map();
    this.listeners = new Map();
    this.middlewares = [];
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
    this.persistKey = options.persistKey || 'seis_state';
    this.debug = options.debug || false;
    
    // Load persisted state
    if (options.persist !== false) {
      this.load();
    }
    
    this.log('StateManager initialized');
  }

  /**
   * Get value from state
   * @param {string} key - State key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} State value
   */
  get(key, defaultValue) {
    const path = key.split('.');
    let value = this.state;
    
    for (const segment of path) {
      if (!(value instanceof Map) && typeof value !== 'object') {
        return defaultValue;
      }
      value = value.get ? value.get(segment) : value[segment];
    }
    
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set value in state
   * @param {string} key - State key
   * @param {*} value - Value to set
   * @param {Object} options - Set options
   */
  set(key, value, options = {}) {
    const previousValue = this.get(key);
    const path = key.split('.');
    const lastKey = path.pop();
    
    let target = this.state;
    for (const segment of path) {
      if (!target.has(segment)) {
        target.set(segment, new Map());
      }
      target = target.get(segment);
    }
    
    target.set(lastKey, value);
    
    // Save to history
    if (!options.skipHistory) {
      this.saveToHistory({ key, previousValue, value, timestamp: Date.now() });
    }
    
    // Persist if enabled
    if (options.persist !== false) {
      this.save();
    }
    
    // Notify listeners
    this.notify(key, value, previousValue);
    
    this.log(`State updated: ${key}`);
    return this;
  }

  /**
   * Delete key from state
   * @param {string} key - State key
   */
  delete(key) {
    const previousValue = this.get(key);
    const path = key.split('.');
    const lastKey = path.pop();
    
    let target = this.state;
    for (const segment of path) {
      if (!target.has(segment)) return this;
      target = target.get(segment);
    }
    
    target.delete(lastKey);
    
    this.saveToHistory({ key, previousValue, value: undefined, timestamp: Date.now() });
    this.save();
    this.notify(key, undefined, previousValue);
    
    this.log(`State deleted: ${key}`);
    return this;
  }

  /**
   * Subscribe to state changes
   * @param {string|Function} keyOrListener - Key to watch or listener function
   * @param {Function} listener - Listener function (if key provided)
   * @returns {Function} Unsubscribe function
   */
  subscribe(keyOrListener, listener) {
    if (typeof keyOrListener === 'function') {
      const globalId = `global_${Date.now()}_${Math.random()}`;
      this.listeners.set(globalId, keyOrListener);
      return () => this.listeners.delete(globalId);
    }
    
    const id = `${keyOrListener}_${Date.now()}_${Math.random()}`;
    this.listeners.set(id, listener);
    
    return () => this.listeners.delete(id);
  }

  /**
   * Add middleware
   * @param {Function} middleware - Middleware function
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Batch update multiple keys
   * @param {Object} updates - Key-value pairs to update
   */
  batch(updates) {
    const skipHistory = { skipHistory: true };
    
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value, skipHistory);
    }
    
    this.saveToHistory({ 
      type: 'batch', 
      updates, 
      timestamp: Date.now() 
    });
    
    this.save();
    this.log('Batch update completed');
    return this;
  }

  /**
   * Undo last state change
   * @returns {boolean} Success status
   */
  undo() {
    if (this.history.length === 0) return false;
    
    const lastAction = this.history.pop();
    
    if (lastAction.type === 'batch') {
      // Undo batch by reversing updates
      for (const [key, { previousValue }] of Object.entries(lastAction.updates).reverse()) {
        this.set(key, previousValue, { skipHistory: true, persist: false });
      }
    } else {
      this.set(lastAction.key, lastAction.previousValue, { 
        skipHistory: true, 
        persist: false 
      });
    }
    
    this.save();
    this.log('Undo performed');
    return true;
  }

  /**
   * Redo state change
   * @returns {boolean} Success status
   */
  redo() {
    // Implementation would require separate redo stack
    this.log('Redo not implemented yet');
    return false;
  }

  /**
   * Get state snapshot
   * @returns {Object} Current state as plain object
   */
  snapshot() {
    return this.mapToObject(this.state);
  }

  /**
   * Reset state to initial or empty
   * @param {Object} initialState - Optional initial state
   */
  reset(initialState = {}) {
    this.state.clear();
    this.history = [];
    
    if (Object.keys(initialState).length > 0) {
      this.batch(initialState);
    }
    
    this.save();
    this.log('State reset');
    return this;
  }

  /**
   * Save state to localStorage
   */
  save() {
    try {
      const serialized = JSON.stringify(this.snapshot());
      localStorage.setItem(this.persistKey, serialized);
      this.log('State persisted');
    } catch (error) {
      this.warn('Failed to persist state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  load() {
    try {
      const serialized = localStorage.getItem(this.persistKey);
      if (serialized) {
        const data = JSON.parse(serialized);
        this.state = this.objectToMap(data);
        this.log('State loaded from persistence');
      }
    } catch (error) {
      this.warn('Failed to load persisted state:', error);
    }
  }

  /**
   * Save action to history
   * @private
   */
  saveToHistory(action) {
    this.history.push(action);
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Notify listeners of state change
   * @private
   */
  notify(key, newValue, oldValue) {
    for (const [listenerKey, listener] of this.listeners) {
      if (listenerKey === 'global_' || key.startsWith(listenerKey.split('_')[0])) {
        try {
          listener(newValue, oldValue, key);
        } catch (error) {
          this.warn('Listener error:', error);
        }
      }
    }
  }

  /**
   * Convert Map to plain object
   * @private
   */
  mapToObject(map) {
    if (!(map instanceof Map)) return map;
    
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = this.mapToObject(value);
    }
    return obj;
  }

  /**
   * Convert plain object to Map
   * @private
   */
  objectToMap(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const map = new Map();
    for (const [key, value] of Object.entries(obj)) {
      map.set(key, this.objectToMap(value));
    }
    return map;
  }

  /**
   * Debug logging
   * @private
   */
  log(...args) {
    if (this.debug) {
      console.log('[SEIS State]', ...args);
    }
  }

  warn(...args) {
    if (this.debug) {
      console.warn('[SEIS State]', ...args);
    }
  }
}

// Reactivity helpers
export function computed(getter) {
  let cached = null;
  let dirty = true;
  
  return {
    get value() {
      if (dirty) {
        cached = getter();
        dirty = false;
      }
      return cached;
    },
    invalidate: () => { dirty = true; }
  };
}

export function ref(value) {
  return { value };
}

export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const value = target[key];
      return typeof value === 'object' ? reactive(value) : value;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    }
  });
}

export default StateManager;
