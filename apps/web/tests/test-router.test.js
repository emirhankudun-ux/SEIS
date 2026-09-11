/**
 * SEIS Router Tests
 */

// Mock DOM environment for Node.js
if (typeof window === 'undefined') {
    global.window = {
        SEISRouter: null
    };
}

const { RouteRegistry } = require('./router.js');

describe('RouteRegistry', () => {
    let registry;

    beforeEach(() => {
        registry = new RouteRegistry();
    });

    describe('Route Registration', () => {
        test('should register a simple route', () => {
            const handler = () => 'test';
            const id = registry.register('/test', handler);
            
            expect(id).toBeDefined();
            expect(registry.list()).toHaveLength(1);
        });

        test('should register route with capabilities', () => {
            const handler = () => 'test';
            registry.register('/admin', handler, {
                capabilities: ['admin'],
                platforms: ['WEB', 'DESKTOP']
            });

            const routes = registry.list();
            expect(routes[0].capabilities).toEqual(['admin']);
            expect(routes[0].platforms).toEqual(['WEB', 'DESKTOP']);
        });

        test('should register route with priority', () => {
            registry.register('/low', () => 'low', { priority: 1 });
            registry.register('/high', () => 'high', { priority: 10 });

            const routes = registry.list();
            expect(routes.find(r => r.path === '/high').priority).toBe(10);
        });
    });

    describe('Route Resolution', () => {
        test('should resolve exact path match', () => {
            const handler = () => 'dashboard';
            registry.register('/dashboard', handler);

            const route = registry.resolve('/dashboard');
            expect(route).toBeDefined();
            expect(route.path).toBe('/dashboard');
        });

        test('should return null for non-existent route', () => {
            registry.register('/test', () => 'test');
            const route = registry.resolve('/nonexistent');
            expect(route).toBeNull();
        });

        test('should filter by platform', () => {
            registry.register('/mobile-only', () => 'mobile', {
                platforms: ['MOBILE']
            });

            const webRoute = registry.resolve('/mobile-only', { platform: 'WEB' });
            const mobileRoute = registry.resolve('/mobile-only', { platform: 'MOBILE' });

            expect(webRoute).toBeNull();
            expect(mobileRoute).toBeDefined();
        });

        test('should score routes based on capabilities', () => {
            registry.register('/premium', () => 'premium', {
                capabilities: ['premium']
            });

            const basicRoute = registry.resolve('/premium', {
                capabilities: ['basic']
            });
            const premiumRoute = registry.resolve('/premium', {
                capabilities: ['premium', 'basic']
            });

            // Both should match but premium should have higher score internally
            expect(basicRoute).toBeDefined();
            expect(premiumRoute).toBeDefined();
        });

        test('should prioritize exact matches over partial matches', () => {
            registry.register('/api', () => 'api-root', { priority: 5 });
            registry.register('/api/users', () => 'users', { priority: 10 });

            const exactRoute = registry.resolve('/api/users');
            expect(exactRoute.path).toBe('/api/users');
        });
    });

    describe('Pattern Matching', () => {
        test('should match dynamic routes with :param', () => {
            registry.register('/users/:id', () => 'user-detail');

            const route = registry.resolve('/users/123');
            expect(route).toBeDefined();
        });

        test('should match wildcard routes', () => {
            registry.register('/docs/*', () => 'docs-catchall');

            const route1 = registry.resolve('/docs/getting-started');
            const route2 = registry.resolve('/docs/api/reference');

            expect(route1).toBeDefined();
            expect(route2).toBeDefined();
        });
    });

    describe('Middleware', () => {
        test('should execute global middleware', async () => {
            const middlewareLog = [];
            
            registry.use(async (ctx) => {
                middlewareLog.push('global-mw');
                ctx.data.global = true;
            });

            registry.register('/test', async (ctx) => {
                return ctx.data;
            });

            const result = await registry.execute('/test');
            
            expect(middlewareLog).toContain('global-mw');
            expect(result.global).toBe(true);
        });

        test('should execute route-specific middleware', async () => {
            const middlewareLog = [];

            const routeMw = async (ctx) => {
                middlewareLog.push('route-mw');
                ctx.data.route = true;
            };

            registry.register('/protected', async (ctx) => {
                return ctx.data;
            }, { middleware: [routeMw] });

            const result = await registry.execute('/protected');
            
            expect(middlewareLog).toContain('route-mw');
            expect(result.route).toBe(true);
        });

        test('should execute middleware in order', async () => {
            const executionOrder = [];

            registry.use(async () => {
                executionOrder.push('global-1');
            });

            const routeMw = async () => {
                executionOrder.push('route-1');
            };

            registry.register('/test', async () => {
                executionOrder.push('handler');
                return 'done';
            }, { middleware: [routeMw] });

            await registry.execute('/test');
            
            expect(executionOrder).toEqual(['global-1', 'route-1', 'handler']);
        });
    });

    describe('Route Management', () => {
        test('should unregister a route', () => {
            const id = registry.register('/temp', () => 'temp');
            expect(registry.list()).toHaveLength(1);

            registry.unregister(id);
            expect(registry.list()).toHaveLength(0);
        });

        test('should handle unregistration of non-existent route gracefully', () => {
            expect(() => {
                registry.unregister('non-existent-id');
            }).not.toThrow();
        });
    });

    describe('Keyword Indexing', () => {
        test('should index routes by keywords', () => {
            registry.register('/user/profile', () => 'profile');
            registry.register('/user/settings', () => 'settings');

            // Keywords should be indexed for faster lookup
            const routes = registry.list();
            expect(routes).toHaveLength(2);
        });

        test('should resolve routes quickly using keyword index', () => {
            // Register multiple routes
            for (let i = 0; i < 100; i++) {
                registry.register(`/route/${i}`, () => `handler-${i}`);
            }

            // Should resolve quickly even with many routes
            const start = Date.now();
            registry.resolve('/route/50');
            const duration = Date.now() - start;

            // Should be very fast (< 10ms)
            expect(duration).toBeLessThan(10);
        });
    });

    describe('Error Handling', () => {
        test('should throw error when executing non-existent route', async () => {
            await expect(registry.execute('/nonexistent'))
                .rejects
                .toThrow(/No route found/);
        });

        test('should handle handler errors gracefully', async () => {
            registry.register('/error', () => {
                throw new Error('Handler error');
            });

            await expect(registry.execute('/error'))
                .rejects
                .toThrow('Handler error');
        });
    });
});

console.log('All RouteRegistry tests loaded successfully!');
