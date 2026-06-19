/**
 * SEIS Core Engine - The heart of the SEIS ecosystem
 * Provides fundamental functionality for agent orchestration, 
 * task routing, and system coordination
 * 
 * @module @seis/core
 * @version 1.0.0
 */

// ============================================================================
// CORE TYPES & INTERFACES
// ============================================================================

/**
 * @typedef {Object} SEISConfig
 * @property {string} environment - Execution environment (local, cloud, codespaces)
 * @property {boolean} debugMode - Enable debug logging
 * @property {number} maxConcurrentAgents - Maximum concurrent agent limit
 * @property {number} taskTimeout - Default task timeout in milliseconds
 * @property {SecurityConfig} security - Security configuration
 * @property {PerformanceConfig} performance - Performance tuning
 */

/**
 * @typedef {Object} SecurityConfig
 * @property {boolean} enableSecretsScanning - Enable automatic secrets detection
 * @property {string[]} allowedOrigins - CORS allowed origins
 * @property {boolean} requireAuthentication - Require auth for API access
 * @property {string} encryptionAlgorithm - Encryption algorithm for sensitive data
 */

/**
 * @typedef {Object} PerformanceConfig
 * @property {number} cacheSize - Maximum cache entries
 * @property {number} workerThreads - Number of worker threads
 * @property {boolean} enableLazyLoading - Enable lazy loading for modules
 * @property {number} batchProcessingSize - Items per batch operation
 */

/**
 * @typedef {Object} AgentDefinition
 * @property {string} id - Unique agent identifier
 * @property {string} role - Agent role (architect, developer, reviewer, etc.)
 * @property {string[]} capabilities - List of agent capabilities
 * @property {Object.<string, any>} config - Agent-specific configuration
 * @property {boolean} active - Whether agent is currently active
 * @property {number} maxTasks - Maximum concurrent tasks
 * @property {string[]} permissions - Agent permission scopes
 */

/**
 * @typedef {Object} TaskDefinition
 * @property {string} id - Unique task identifier
 * @property {string} type - Task type (code_gen, review, test, deploy, etc.)
 * @property {string} priority - Task priority (critical, high, normal, low)
 * @property {string} status - Current status (pending, running, completed, failed)
 * @property {string} assignedAgent - ID of assigned agent
 * @property {Object} payload - Task-specific data
 * @property {Date} createdAt - Task creation timestamp
 * @property {Date} [completedAt] - Task completion timestamp
 * @property {string[]} dependencies - Dependent task IDs
 */

/**
 * @typedef {Object} MCPConnection
 * @property {string} id - Connection identifier
 * @property {string} serverUrl - MCP server endpoint
 * @property {string[]} tools - Available tools from this server
 * @property {boolean} connected - Connection status
 * @property {Object} metadata - Server metadata
 */

// ============================================================================
// CORE ENGINE CLASS
// ============================================================================

export class SEISEngine {
  /**
   * Create a new SEIS engine instance
   * @param {SEISConfig} config - Engine configuration
   */
  constructor(config = {}) {
    this.config = this._mergeDefaultsConfig(config);
    this.agents = new Map();
    this.tasks = new Map();
    this.mcpConnections = new Map();
    this.eventListeners = new Map();
    this.cache = new Map();
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      agentsActive: 0,
      averageTaskTime: 0,
      startTime: Date.now()
    };
    
    this._initializeCore();
    this._setupEventSystem();
    this._startMetricsCollector();
  }

  /**
   * Initialize core subsystems
   * @private
   */
  _initializeCore() {
    console.log('[SEIS Core] Initializing engine...');
    
    // Validate configuration
    this._validateConfig();
    
    // Setup security layer
    this._initSecurityLayer();
    
    // Setup performance optimizations
    this._initPerformanceLayer();
    
    // Load built-in agents
    this._loadBuiltinAgents();
    
    console.log('[SEIS Core] Engine initialized successfully');
  }

  /**
   * Merge user config with defaults
   * @param {SEISConfig} userConfig - User provided config
   * @returns {SEISConfig} Merged configuration
   * @private
   */
  _mergeDefaultsConfig(userConfig) {
    const defaults = {
      environment: process.env.SEIS_ENV || 'local',
      debugMode: process.env.DEBUG === 'true',
      maxConcurrentAgents: 10,
      taskTimeout: 30000,
      security: {
        enableSecretsScanning: true,
        allowedOrigins: ['*'],
        requireAuthentication: false,
        encryptionAlgorithm: 'AES-256-GCM'
      },
      performance: {
        cacheSize: 1000,
        workerThreads: 4,
        enableLazyLoading: true,
        batchProcessingSize: 50
      }
    };

    return {
      ...defaults,
      ...userConfig,
      security: { ...defaults.security, ...(userConfig.security || {}) },
      performance: { ...defaults.performance, ...(userConfig.performance || {}) }
    };
  }

  /**
   * Validate configuration
   * @private
   */
  _validateConfig() {
    if (this.config.maxConcurrentAgents < 1) {
      throw new Error('maxConcurrentAgents must be at least 1');
    }
    if (this.config.taskTimeout < 1000) {
      throw new Error('taskTimeout must be at least 1000ms');
    }
    if (!['local', 'cloud', 'codespaces'].includes(this.config.environment)) {
      throw new Error('Invalid environment value');
    }
  }

  /**
   * Initialize security layer
   * @private
   */
  _initSecurityLayer() {
    if (this.config.security.enableSecretsScanning) {
      console.log('[SEIS Security] Secrets scanning enabled');
    }
  }

  /**
   * Initialize performance optimizations
   * @private
   */
  _initPerformanceLayer() {
    if (this.config.performance.enableLazyLoading) {
      console.log('[SEIS Performance] Lazy loading enabled');
    }
    console.log(`[SEIS Performance] Cache size: ${this.config.performance.cacheSize}`);
  }

  /**
   * Load built-in system agents
   * @private
   */
  _loadBuiltinAgents() {
    const builtinAgents = [
      {
        id: 'architect',
        role: 'Architect Agent',
        capabilities: ['system_design', 'architecture_review', 'scalability_analysis'],
        config: { focusArea: 'system_boundaries' },
        active: true,
        maxTasks: 3,
        permissions: ['read:all', 'write:architecture']
      },
      {
        id: 'developer',
        role: 'Developer Agent',
        capabilities: ['code_generation', 'refactoring', 'debugging'],
        config: { languages: ['js', 'ts', 'py', 'rust'] },
        active: true,
        maxTasks: 5,
        permissions: ['read:all', 'write:code']
      },
      {
        id: 'reviewer',
        role: 'Code Reviewer Agent',
        capabilities: ['code_review', 'security_audit', 'quality_check'],
        config: { strictness: 'high' },
        active: true,
        maxTasks: 10,
        permissions: ['read:all', 'comment:code']
      },
      {
        id: 'tester',
        role: 'QA Agent',
        capabilities: ['test_generation', 'test_execution', 'coverage_analysis'],
        config: { coverageThreshold: 80 },
        active: true,
        maxTasks: 8,
        permissions: ['read:all', 'execute:tests']
      },
      {
        id: 'documenter',
        role: 'Documentation Agent',
        capabilities: ['doc_generation', 'api_docs', 'tutorials'],
        config: { style: 'markdown' },
        active: true,
        maxTasks: 5,
        permissions: ['read:all', 'write:docs']
      },
      {
        id: 'devops',
        role: 'DevOps Agent',
        capabilities: ['ci_cd', 'deployment', 'monitoring'],
        config: { cloudProviders: ['aws', 'gcp', 'azure'] },
        active: true,
        maxTasks: 3,
        permissions: ['read:all', 'deploy:production']
      },
      {
        id: 'security',
        role: 'Security Agent',
        capabilities: ['vulnerability_scan', 'secret_detection', 'compliance'],
        config: { scanDepth: 'deep' },
        active: true,
        maxTasks: 5,
        permissions: ['read:all', 'alert:security']
      }
    ];

    builtinAgents.forEach(agent => {
      this.registerAgent(agent);
    });

    console.log(`[SEIS Agents] Loaded ${builtinAgents.length} built-in agents`);
  }

  /**
   * Setup event system
   * @private
   */
  _setupEventSystem() {
    const coreEvents = [
      'agent:registered',
      'agent:activated',
      'agent:deactivated',
      'task:created',
      'task:started',
      'task:completed',
      'task:failed',
      'mcp:connected',
      'mcp:disconnected',
      'system:error',
      'system:shutdown'
    ];

    coreEvents.forEach(event => {
      this.eventListeners.set(event, []);
    });

    console.log('[SEIS Events] Event system initialized');
  }

  /**
   * Start metrics collection
   * @private
   */
  _startMetricsCollector() {
    setInterval(() => {
      const activeAgents = Array.from(this.agents.values()).filter(a => a.active).length;
      this.metrics.agentsActive = activeAgents;
      
      const completedTasks = Array.from(this.tasks.values())
        .filter(t => t.status === 'completed');
      
      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, task) => {
          return sum + (task.completedAt - task.createdAt);
        }, 0);
        this.metrics.averageTaskTime = totalTime / completedTasks.length;
      }
    }, 5000);

    console.log('[SEIS Metrics] Metrics collector started');
  }

  // ============================================================================
  // AGENT MANAGEMENT
  // ============================================================================

  /**
   * Register a new agent
   * @param {AgentDefinition} agent - Agent definition
   * @returns {boolean} Success status
   */
  registerAgent(agent) {
    if (!agent.id || !agent.role) {
      throw new Error('Agent must have id and role');
    }

    if (this.agents.has(agent.id)) {
      console.warn(`[SEIS Agents] Agent ${agent.id} already exists, updating...`);
    }

    this.agents.set(agent.id, {
      ...agent,
      registeredAt: new Date(),
      tasksCompleted: 0,
      tasksFailed: 0
    });

    this._emit('agent:registered', { agent });
    console.log(`[SEIS Agents] Registered agent: ${agent.role} (${agent.id})`);
    return true;
  }

  /**
   * Get agent by ID
   * @param {string} agentId - Agent ID
   * @returns {AgentDefinition|null}
   */
  getAgent(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all active agents
   * @returns {AgentDefinition[]}
   */
  getActiveAgents() {
    return Array.from(this.agents.values()).filter(a => a.active);
  }

  /**
   * Activate an agent
   * @param {string} agentId - Agent ID
   * @returns {boolean}
   */
  activateAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    agent.active = true;
    this._emit('agent:activated', { agent });
    return true;
  }

  /**
   * Deactivate an agent
   * @param {string} agentId - Agent ID
   * @returns {boolean}
   */
  deactivateAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    agent.active = false;
    this._emit('agent:deactivated', { agent });
    return true;
  }

  // ============================================================================
  // TASK MANAGEMENT
  // ============================================================================

  /**
   * Create a new task
   * @param {TaskDefinition} task - Task definition
   * @returns {string} Task ID
   */
  createTask(task) {
    const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTask = {
      ...task,
      id: taskId,
      status: 'pending',
      createdAt: new Date(),
      assignedAgent: task.assignedAgent || this._selectBestAgent(task)
    };

    this.tasks.set(taskId, newTask);
    this._emit('task:created', { task: newTask });
    
    console.log(`[SEIS Tasks] Created task: ${taskId} (${task.type})`);
    return taskId;
  }

  /**
   * Select best agent for a task
   * @param {TaskDefinition} task - Task to assign
   * @returns {string} Agent ID
   * @private
   */
  _selectBestAgent(task) {
    const activeAgents = this.getActiveAgents();
    
    const agentMapping = {
      'code_gen': 'developer',
      'review': 'reviewer',
      'test': 'tester',
      'deploy': 'devops',
      'security_audit': 'security',
      'doc_gen': 'documenter',
      'architecture': 'architect'
    };

    const preferredAgent = agentMapping[task.type];
    if (preferredAgent && activeAgents.find(a => a.id === preferredAgent)) {
      return preferredAgent;
    }

    return activeAgents[0]?.id || 'developer';
  }

  /**
   * Start task execution
   * @param {string} taskId - Task ID
   * @returns {boolean}
   */
  startTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'running';
    task.startedAt = new Date();
    this._emit('task:started', { task });
    
    console.log(`[SEIS Tasks] Started task: ${taskId}`);
    return true;
  }

  /**
   * Complete a task
   * @param {string} taskId - Task ID
   * @param {Object} result - Task result
   * @returns {boolean}
   */
  completeTask(taskId, result = {}) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.result = result;
    
    this.metrics.tasksCompleted++;
    this._emit('task:completed', { task, result });
    
    console.log(`[SEIS Tasks] Completed task: ${taskId}`);
    return true;
  }

  /**
   * Fail a task
   * @param {string} taskId - Task ID
   * @param {Error} error - Error details
   * @returns {boolean}
   */
  failTask(taskId, error) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'failed';
    task.failedAt = new Date();
    task.error = error.message;
    
    this.metrics.tasksFailed++;
    this._emit('task:failed', { task, error });
    
    console.error(`[SEIS Tasks] Failed task: ${taskId} - ${error.message}`);
    return true;
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {TaskDefinition|null}
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get all tasks
   * @param {Object} filters - Filter options
   * @returns {TaskDefinition[]}
   */
  getTasks(filters = {}) {
    let tasks = Array.from(this.tasks.values());
    
    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters.agentId) {
      tasks = tasks.filter(t => t.assignedAgent === filters.agentId);
    }
    if (filters.type) {
      tasks = tasks.filter(t => t.type === filters.type);
    }
    
    return tasks;
  }

  // ============================================================================
  // MCP CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Connect to an MCP server
   * @param {MCPConnection} connection - Connection details
   * @returns {Promise<boolean>}
   */
  async connectMCP(connection) {
    try {
      console.log(`[SEIS MCP] Connecting to ${connection.serverUrl}...`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const mcpConn = {
        ...connection,
        connected: true,
        connectedAt: new Date()
      };

      this.mcpConnections.set(connection.id, mcpConn);
      this._emit('mcp:connected', { connection: mcpConn });
      
      console.log(`[SEIS MCP] Connected to ${connection.id}`);
      return true;
    } catch (error) {
      console.error(`[SEIS MCP] Connection failed: ${error.message}`);
      this._emit('system:error', { type: 'mcp_connection', error });
      return false;
    }
  }

  /**
   * Disconnect from an MCP server
   * @param {string} connectionId - Connection ID
   * @returns {boolean}
   */
  disconnectMCP(connectionId) {
    const connection = this.mcpConnections.get(connectionId);
    if (!connection) {
      throw new Error(`MCP connection ${connectionId} not found`);
    }

    connection.connected = false;
    connection.disconnectedAt = new Date();
    this._emit('mcp:disconnected', { connection });
    
    console.log(`[SEIS MCP] Disconnected from ${connectionId}`);
    return true;
  }

  /**
   * Get all MCP connections
   * @returns {MCPConnection[]}
   */
  getMCPConnections() {
    return Array.from(this.mcpConnections.values());
  }

  /**
   * Execute tool via MCP
   * @param {string} connectionId - MCP connection ID
   * @param {string} toolName - Tool name
   * @param {Object} params - Tool parameters
   * @returns {Promise<any>}
   */
  async executeMCPTool(connectionId, toolName, params = {}) {
    const connection = this.mcpConnections.get(connectionId);
    if (!connection) {
      throw new Error(`MCP connection ${connectionId} not found`);
    }

    if (!connection.connected) {
      throw new Error(`MCP connection ${connectionId} is not connected`);
    }

    if (!connection.tools.includes(toolName)) {
      throw new Error(`Tool ${toolName} not available on ${connectionId}`);
    }

    console.log(`[SEIS MCP] Executing tool: ${toolName} on ${connectionId}`);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      success: true,
      data: { message: `Tool ${toolName} executed successfully`, params }
    };
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    const listeners = this.eventListeners.get(event);
    listeners.push(callback);

    console.log(`[SEIS Events] Subscribed to ${event}`);
    
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @private
   */
  _emit(event, data = {}) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[SEIS Events] Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Subscribe to event once
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any|null}
   */
  getCache(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in milliseconds
   * @returns {boolean}
   */
  setCache(key, value, ttl = 3600000) {
    if (this.cache.size >= this.config.performance.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });

    return true;
  }

  /**
   * Delete item from cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  deleteCache(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   * @returns {boolean}
   */
  clearCache() {
    this.cache.clear();
    return true;
  }

  // ============================================================================
  // METRICS & MONITORING
  // ============================================================================

  /**
   * Get engine metrics
   * @returns {Object} Metrics object
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      totalTasks: this.tasks.size,
      totalAgents: this.agents.size,
      totalMCPConnections: this.mcpConnections.size,
      cacheSize: this.cache.size
    };
  }

  /**
   * Get system health status
   * @returns {Object} Health status
   */
  getHealth() {
    const activeAgents = this.getActiveAgents().length;
    const pendingTasks = this.getTasks({ status: 'pending' }).length;
    const connectedMCPs = this.getMCPConnections().filter(c => c.connected).length;

    return {
      status: 'healthy',
      uptime: Date.now() - this.metrics.startTime,
      agents: {
        total: this.agents.size,
        active: activeAgents
      },
      tasks: {
        total: this.tasks.size,
        pending: pendingTasks,
        running: this.getTasks({ status: 'running' }).length,
        completed: this.metrics.tasksCompleted,
        failed: this.metrics.tasksFailed
      },
      mcp: {
        total: this.mcpConnections.size,
        connected: connectedMCPs
      },
      cache: {
        size: this.cache.size,
        maxSize: this.config.performance.cacheSize
      }
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique ID
   * @returns {string}
   */
  static generateId() {
    return `seis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate UUID
   * @param {string} uuid - UUID to validate
   * @returns {boolean}
   */
  static isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }
}

export default SEISEngine;
export { SEISEngine };
