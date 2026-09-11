/**
 * SEIS Utility Functions - Common helpers and utilities
 */

/**
 * Debounce function execution
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function execution
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone an object
 * @param {*} obj 
 * @returns {*}
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * Generate unique ID
 * @param {string} prefix 
 * @returns {string}
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse query string to object
 * @param {string} queryString 
 * @returns {Object}
 */
export function parseQuery(queryString) {
    const query = {};
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    return query;
}

/**
 * Stringify object to query string
 * @param {Object} obj 
 * @returns {string}
 */
export function stringifyQuery(obj) {
    return Object.entries(obj)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

/**
 * Format date relative to now
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html 
 * @returns {string}
 */
export function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Local storage wrapper with JSON serialization
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Storage get error: ${e}`);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Storage set error: ${e}`);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Storage remove error: ${e}`);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error(`Storage clear error: ${e}`);
            return false;
        }
    }
};

/**
 * Platform detection
 */
export const platform = {
    isWeb: () => typeof window !== 'undefined' && !window.electron,
    isDesktop: () => typeof window !== 'undefined' && !!window.electron,
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator?.userAgent || ''),
    isTouch: () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    
    getPlatform() {
        if (this.isDesktop()) return 'DESKTOP';
        if (this.isMobile()) return 'MOBILE';
        return 'WEB';
    }
};

/**
 * Async delay helper
 * @param {number} ms 
 * @returns {Promise}
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 * @param {Function} fn 
 * @param {Object} options 
 * @returns {Promise}
 */
export async function retry(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 10000,
        onRetry = () => {}
    } = options;

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                const delayTime = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
                onRetry({ attempt, error, delay: delayTime });
                await delay(delayTime);
            }
        }
    }
    throw lastError;
}

/**
 * Create event emitter
 * @returns {Object}
 */
export function createEventEmitter() {
    const events = new Map();

    return {
        on(event, callback) {
            if (!events.has(event)) {
                events.set(event, []);
            }
            events.get(event).push(callback);
            return () => this.off(event, callback);
        },

        off(event, callback) {
            if (events.has(event)) {
                const callbacks = events.get(event);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        },

        emit(event, ...args) {
            if (events.has(event)) {
                events.get(event).forEach(callback => callback(...args));
            }
        },

        once(event, callback) {
            const wrapper = (...args) => {
                this.off(event, wrapper);
                callback(...args);
            };
            return this.on(event, wrapper);
        }
    };
}

// Browser global access
if (typeof window !== 'undefined') {
    window.SEISUtils = {
        debounce,
        throttle,
        deepClone,
        generateId,
        parseQuery,
        stringifyQuery,
        formatRelativeTime,
        sanitizeHTML,
        storage,
        platform,
        delay,
        retry,
        createEventEmitter
    };
}
