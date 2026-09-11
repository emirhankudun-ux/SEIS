/**
 * SEIS UI Component System - Lightweight component framework
 * Provides reactive UI components with capability-aware rendering
 */

class Component {
    constructor(options = {}) {
        this.id = options.id || `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.tagName = options.tag || 'div';
        this.className = options.className || '';
        this.children = [];
        this.props = options.props || {};
        this.state = options.state || {};
        this.listeners = new Map();
        this.element = null;
        this.capabilities = options.capabilities || [];
        this.platforms = options.platforms || ['WEB'];
    }

    /**
     * Set component state and trigger re-render
     * @param {Object} newState 
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        if (this.element) {
            this.render();
        }
    }

    /**
     * Add event listener
     * @param {string} event 
     * @param {Function} handler 
     */
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
        return this;
    }

    /**
     * Remove event listener
     * @param {string} event 
     * @param {Function} handler 
     */
    off(event, handler) {
        if (this.listeners.has(event)) {
            const handlers = this.listeners.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
        return this;
    }

    /**
     * Add child component or element
     * @param {Component|HTMLElement|string} child 
     */
    append(child) {
        this.children.push(child);
        return this;
    }

    /**
     * Create DOM element
     * @returns {HTMLElement}
     */
    createElement() {
        const el = document.createElement(this.tagName);
        
        if (this.className) {
            el.className = this.className;
        }

        // Set attributes from props
        Object.entries(this.props).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.assign(el.dataset, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.slice(2).toLowerCase();
                el.addEventListener(eventName, value);
            } else if (typeof value !== 'function') {
                el.setAttribute(key, value);
            }
        });

        // Add event listeners
        this.listeners.forEach((handlers, event) => {
            handlers.forEach(handler => {
                el.addEventListener(event, handler);
            });
        });

        // Render children
        this.children.forEach(child => {
            if (child instanceof Component) {
                el.appendChild(child.createElement());
            } else if (child instanceof HTMLElement) {
                el.appendChild(child);
            } else {
                el.appendChild(document.createTextNode(String(child)));
            }
        });

        this.element = el;
        return el;
    }

    /**
     * Render component to DOM
     * @param {HTMLElement|null} container 
     * @returns {HTMLElement}
     */
    render(container = null) {
        const el = this.createElement();
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(el);
        }

        return el;
    }

    /**
     * Check if component should render on current platform
     * @returns {boolean}
     */
    canRender() {
        const platform = typeof window !== 'undefined' ? 'WEB' : 'SERVER';
        return this.platforms.includes(platform);
    }

    /**
     * Destroy component and cleanup
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.listeners.clear();
        this.children = [];
        this.element = null;
    }
}

/**
 * Pre-built UI Components
 */

class Button extends Component {
    constructor(options = {}) {
        super({
            tag: 'button',
            className: 'seis-button',
            ...options
        });
    }
}

class Card extends Component {
    constructor(options = {}) {
        super({
            tag: 'div',
            className: 'seis-card',
            ...options
        });
    }
}

class Modal extends Component {
    constructor(options = {}) {
        super({
            tag: 'div',
            className: 'seis-modal',
            ...options
        });
        this.visible = false;
    }

    show() {
        this.visible = true;
        this.setState({ display: 'block' });
    }

    hide() {
        this.visible = false;
        this.setState({ display: 'none' });
    }
}

class Toast extends Component {
    constructor(options = {}) {
        super({
            tag: 'div',
            className: 'seis-toast',
            ...options
        });
        this.duration = options.duration || 3000;
    }

    show(message, type = 'info') {
        this.setState({ message, type, visible: true });
        setTimeout(() => this.hide(), this.duration);
    }

    hide() {
        this.setState({ visible: false });
    }
}

/**
 * Component Registry for dynamic loading
 */
class ComponentRegistry {
    constructor() {
        this.components = new Map();
    }

    register(name, componentClass) {
        this.components.set(name, componentClass);
    }

    create(name, options = {}) {
        const ComponentClass = this.components.get(name);
        if (!ComponentClass) {
            throw new Error(`Component "${name}" not registered`);
        }
        return new ComponentClass(options);
    }

    list() {
        return Array.from(this.components.keys());
    }
}

// Global registry instance
const componentRegistry = new ComponentRegistry();

// Register built-in components
componentRegistry.register('button', Button);
componentRegistry.register('card', Card);
componentRegistry.register('modal', Modal);
componentRegistry.register('toast', Toast);

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Component,
        Button,
        Card,
        Modal,
        Toast,
        ComponentRegistry,
        componentRegistry
    };
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.SEISComponents = {
        Component,
        Button,
        Card,
        Modal,
        Toast,
        componentRegistry
    };
}
