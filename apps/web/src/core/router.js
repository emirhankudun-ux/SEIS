/**
 * SEIS Core Router - Client-side routing engine
 * Handles dynamic route resolution and capability matching
 */

class RouteRegistry {
    constructor() {
        this.routes = new Map();
        this.keywordIndex = new Map(); // O(1) lookup
        this.middlewareStack = [];
    }

    /**
     * Register a new route with capabilities
     * @param {string} path - Route path pattern
     * @param {Function} handler - Route handler function
     * @param {Object} options - Route configuration
     */
    register(path, handler, options = {}) {
        const route = {
            id: this._generateId(),
            path,
            handler,
            capabilities: options.capabilities || [],
            platforms: options.platforms || ['WEB'],
            priority: options.priority || 0,
            middleware: options.middleware || []
        };

        this.routes.set(route.id, route);
        this._indexKeywords(path, route.id);
        
        console.log(`[RouteRegistry] Registered: ${path} (${route.id})`);
        return route.id;
    }

    /**
     * Resolve route based on path and context
     * @param {string} path - Request path
     * @param {Object} context - Request context (platform, capabilities, etc.)
     * @returns {Object|null} Matched route or null
     */
    resolve(path, context = {}) {
        const platform = context.platform || 'WEB';
        const userCapabilities = context.capabilities || [];

        // O(1) keyword-based initial filtering
        const keywords = this._extractKeywords(path);
        const candidateIds = new Set();

        keywords.forEach(keyword => {
            if (this.keywordIndex.has(keyword)) {
                this.keywordIndex.get(keyword).forEach(id => candidateIds.add(id));
            }
        });

        // If no keyword matches, scan all routes
        if (candidateIds.size === 0) {
            this.routes.forEach((_, id) => candidateIds.add(id));
        }

        // Score and rank candidates
        const scoredRoutes = [];
        candidateIds.forEach(id => {
            const route = this.routes.get(id);
            const score = this._scoreRoute(route, path, platform, userCapabilities);
            if (score > 0) {
                scoredRoutes.push({ route, score });
            }
        });

        // Return highest scoring route
        scoredRoutes.sort((a, b) => b.score - a.score);
        return scoredRoutes.length > 0 ? scoredRoutes[0].route : null;
    }

    /**
     * Execute route handler with middleware
     * @param {string} path - Request path
     * @param {Object} context - Request context
     * @returns {Promise<any>} Handler result
     */
    async execute(path, context = {}) {
        const route = this.resolve(path, context);
        
        if (!route) {
            throw new Error(`No route found for: ${path}`);
        }

        // Execute middleware stack
        let ctx = { path, context, data: {} };
        for (const mw of this.middlewareStack) {
            await mw(ctx);
        }

        // Execute route-specific middleware
        for (const mw of route.middleware) {
            await mw(ctx);
        }

        // Execute handler
        return await route.handler(ctx);
    }

    /**
     * Add global middleware
     * @param {Function} middleware 
     */
    use(middleware) {
        this.middlewareStack.push(middleware);
    }

    /**
     * Get all registered routes
     * @returns {Array} List of routes
     */
    list() {
        return Array.from(this.routes.values());
    }

    /**
     * Remove route by ID
     * @param {string} routeId 
     */
    unregister(routeId) {
        const route = this.routes.get(routeId);
        if (route) {
            this.routes.delete(routeId);
            this._deindexKeywords(route.path, routeId);
            console.log(`[RouteRegistry] Unregistered: ${route.path}`);
        }
    }

    // Private methods

    _generateId() {
        return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _extractKeywords(path) {
        return path.toLowerCase()
            .replace(/[\/\?&=]/g, ' ')
            .split(/\s+/)
            .filter(k => k.length > 2);
    }

    _indexKeywords(path, routeId) {
        const keywords = this._extractKeywords(path);
        keywords.forEach(keyword => {
            if (!this.keywordIndex.has(keyword)) {
                this.keywordIndex.set(keyword, new Set());
            }
            this.keywordIndex.get(keyword).add(routeId);
        });
    }

    _deindexKeywords(path, routeId) {
        const keywords = this._extractKeywords(path);
        keywords.forEach(keyword => {
            if (this.keywordIndex.has(keyword)) {
                this.keywordIndex.get(keyword).delete(routeId);
                if (this.keywordIndex.get(keyword).size === 0) {
                    this.keywordIndex.delete(keyword);
                }
            }
        });
    }

    _scoreRoute(route, path, platform, userCapabilities) {
        let score = 0;

        // Platform compatibility (required)
        if (!route.platforms.includes(platform)) {
            return 0;
        }

        // Path matching
        if (route.path === path) {
            score += 100;
        } else if (path.startsWith(route.path)) {
            score += 50;
        } else if (this._matchPattern(route.path, path)) {
            score += 75;
        } else {
            return 0;
        }

        // Capability matching
        route.capabilities.forEach(cap => {
            if (userCapabilities.includes(cap)) {
                score += 10;
            }
        });

        // Priority bonus
        score += route.priority;

        return score;
    }

    _matchPattern(pattern, path) {
        // Simple pattern matching (supports :param and *)
        const regex = new RegExp(
            '^' + pattern
                .replace(/:[^\s/]+/g, '([^/]+)')
                .replace(/\*/g, '.*') + '$'
        );
        return regex.test(path);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RouteRegistry };
}

// Global instance for browser
if (typeof window !== 'undefined') {
    window.SEISRouter = new RouteRegistry();
}
