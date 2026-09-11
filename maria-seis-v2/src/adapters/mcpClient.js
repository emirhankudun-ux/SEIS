/** Bounded text/structured MCP client; lifecycle negotiation and trusted-host policy stay separate. */
const idPattern = /^[a-z][a-z0-9-]{0,63}$/;
const MODERN = '2026-07-28';
const LEGACY = Object.freeze(['2025-11-25', '2025-06-18']);
const toolPattern = /^[A-Za-z0-9_.:-]{1,128}$/;
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function boundedCopy(value, limit = 65536) {
  const text = JSON.stringify(value);
  if (typeof text !== 'string' || text.length > limit) throw new Error('invalid-payload');
  return freeze(JSON.parse(text));
}
function syncVerdict(fn, context) {
  try {
    const value = fn(context);
    // Policies are synchronous to keep the authorization decision tied to the captured request.
    if (value && typeof value.then === 'function') Promise.resolve(value).catch(() => {});
    return value === true;
  } catch { return false; }
}
function validResult(result) {
  return object(result) && (result.isError === undefined || typeof result.isError === 'boolean')
    && Array.isArray(result.content) && result.content.length <= 64
    && (result.content.length > 0 || object(result.structuredContent))
    && result.content.every(c => object(c) && c.type === 'text' && typeof c.text === 'string')
    && (result.structuredContent === undefined || object(result.structuredContent));
}

export function createMcpAdapter({providerId = 'mcp', transport, authToken = null,
  protocolVersion = null, authorizeTool = () => false, verifyResult = () => false,
  maxPages = 16, maxTools = 256} = {}) {
  if (typeof providerId !== 'string' || !idPattern.test(providerId)) throw new TypeError('invalid provider id');
  if (typeof transport !== 'function') throw new TypeError('transport required');
  if (protocolVersion !== null && protocolVersion !== MODERN && !LEGACY.includes(protocolVersion)) throw new TypeError('unsupported protocol version');
  if (authToken !== null && (typeof authToken !== 'string' || !authToken || authToken.length > 8192)) throw new TypeError('invalid auth token');
  if (typeof authorizeTool !== 'function' || typeof verifyResult !== 'function') throw new TypeError('host policy required');
  if (!Number.isSafeInteger(maxPages) || maxPages < 1 || maxPages > 64 || !Number.isSafeInteger(maxTools) || maxTools < 1 || maxTools > 2048) throw new TypeError('invalid discovery bounds');
  let initialized = false, connecting = false, epoch = 0, sequence = 0;
  let negotiatedProtocol = null, lifecycle = null;
  let discovered = new Map(), discoveryRevision = 0;
  const check = (signal, generation) => {
    if (signal?.aborted) throw new Error('aborted');
    if (generation !== epoch) throw new Error('session-changed');
  };
  const send = async (method, params, signal, generation, notification = false, modernVersion = null) => {
    check(signal, generation);
    const useModern = modernVersion ?? (lifecycle === 'modern' ? negotiatedProtocol : null);
    const requestParams = useModern && !notification ? {...params, _meta:{
      'io.modelcontextprotocol/protocolVersion':useModern,
      'io.modelcontextprotocol/clientInfo':{name:'MARIA-SEIS',version:'4.0.0-alpha.10'},
      'io.modelcontextprotocol/clientCapabilities':{}
    }} : params;
    const message = {jsonrpc:'2.0', ...(notification ? {} : {id:`mcp-${++sequence}`}), method, params:requestParams,
      headers:authToken ? {authorization:`Bearer ${authToken}`} : {}, signal};
    const result = await transport(message);
    check(signal, generation);
    return result;
  };
  return Object.freeze({
    id:providerId, apiVersion:'2', capabilities:Object.freeze(['tool-call']),
    tools() { return [...discovered.keys()]; },
    protocolVersion() { return negotiatedProtocol; },
    mode() { return lifecycle; },
    async connect({signal} = {}) {
      if (connecting || initialized) throw new Error('session-already-active');
      const generation = ++epoch;
      connecting = true; discovered.clear(); negotiatedProtocol = null; lifecycle = null;
      let failure = 'mcp-initialize-failed';
      try {
        let legacy = protocolVersion;
        let strict = protocolVersion !== null;
        if (protocolVersion === null || protocolVersion === MODERN) {
          let discovery;
          try { discovery = await send('server/discover', {}, signal, generation, false, MODERN); }
          catch (error) {
            // Preserve typed protocol errors, never infer a downgrade from untrusted error text.
            check(signal, generation);
            if (protocolVersion !== null || error?.code !== -32601) throw error;
            legacy = LEGACY[0]; strict = false;
          }
          if (!legacy || protocolVersion === MODERN) {
            if (!object(discovery) || !Array.isArray(discovery.supportedVersions)
              || discovery.supportedVersions.length > 32 || discovery.supportedVersions.some(v => typeof v !== 'string')
              || !object(discovery.capabilities?.tools)) throw new Error('invalid-discovery');
            if (discovery.supportedVersions.includes(MODERN)) {
              negotiatedProtocol = MODERN; lifecycle = 'modern'; initialized = true;
              return {sessionId:null,protocolVersion:negotiatedProtocol,mode:lifecycle};
            }
            legacy = protocolVersion === null ? LEGACY.find(v => discovery.supportedVersions.includes(v)) : null;
            strict = true;
            if (!legacy) { failure = 'unsupported-protocol-version'; throw new Error(failure); }
          }
        }
        const result = await send('initialize', {protocolVersion:legacy, capabilities:{}, clientInfo:{name:'MARIA-SEIS',version:'4.0.0-alpha.10'}}, signal, generation);
        if (!object(result) || !LEGACY.includes(result.protocolVersion) || strict && result.protocolVersion !== legacy) {
          failure = 'unsupported-protocol-version'; throw new Error(failure);
        }
        if (!object(result.capabilities?.tools) || !object(result.serverInfo)
          || typeof result.serverInfo.name !== 'string' || !result.serverInfo.name
          || typeof result.serverInfo.version !== 'string' || !result.serverInfo.version) throw new Error('mcp-initialize-failed');
        await send('notifications/initialized', {}, signal, generation, true);
        negotiatedProtocol = result.protocolVersion; lifecycle = 'legacy'; initialized = true;
        return {sessionId:`mcp-session-${generation}`,protocolVersion:negotiatedProtocol,mode:lifecycle};
      } catch {
        if (generation === epoch) { initialized = false; discovered.clear(); negotiatedProtocol = null; lifecycle = null; }
        throw new Error(failure);
      } finally { if (generation === epoch) connecting = false; }
    },
    async health({signal} = {}) {
      if (!initialized) return {ok:false, reason:'not-initialized', capabilities:[]};
      const generation = epoch, revision = ++discoveryRevision, tools = new Map(), cursors = new Set();
      // Failed or partial refresh must never retain stale invocation privileges.
      discovered.clear();
      let cursor;
      try {
        for (let page = 0; page < maxPages; page++) {
          const listed = await send('tools/list', cursor === undefined ? {} : {cursor}, signal, generation);
          if (!object(listed) || !Array.isArray(listed.tools)) throw new Error('invalid-tool-list');
          for (const tool of listed.tools) {
            if (!object(tool) || !toolPattern.test(tool.name) || typeof tool.name !== 'string' || tools.has(tool.name)
              || !object(tool.inputSchema) || tool.inputSchema.type !== 'object' || tools.size >= maxTools) throw new Error('invalid-tool-list');
            tools.set(tool.name, boundedCopy(tool));
          }
          if (listed.nextCursor === undefined) {
            check(signal, generation);
            if (revision !== discoveryRevision) throw new Error('discovery-superseded');
            discovered = tools;
            return {ok:true, capabilities:['tool-call'], toolCount:tools.size, protocolVersion:negotiatedProtocol};
          }
          cursor = listed.nextCursor;
          if (typeof cursor !== 'string' || !cursor || cursor.length > 1024 || cursors.has(cursor)) throw new Error('invalid-discovery-cursor');
          cursors.add(cursor);
        }
        throw new Error('discovery-limit');
      } catch { if (generation === epoch && revision === discoveryRevision) discovered.clear(); throw new Error('mcp-discovery-failed'); }
    },
    async execute(payload = {}, context = {}) {
      if (context.capability !== 'tool-call') throw new Error('capability-not-supported');
      if (!initialized) throw new Error('not-initialized');
      const generation = epoch;
      const request = boundedCopy(payload);
      const tool = request.tool;
      if (typeof tool !== 'string' || !discovered.has(tool)) throw new Error('tool-not-discovered');
      if (!object(request.arguments ?? {})) throw new Error('invalid-arguments');
      if (!syncVerdict(authorizeTool, freeze({providerId, request, tool:discovered.get(tool)}))) throw new Error('tool-not-authorized');
      const raw = await send('tools/call', {name:tool, arguments:request.arguments ?? {}}, context.signal, generation);
      if (!validResult(raw)) throw new Error('invalid-tool-result');
      const result = boundedCopy(raw, 1048576);
      const ok = result.isError !== true;
      const outcomeVerified = ok && syncVerdict(verifyResult, freeze({providerId, request, result}));
      check(context.signal, generation);
      // Known host credential values are removed even if an untrusted tool echoes one.
      const redact = value => typeof value === 'string' ? value.replaceAll(authToken, '[REDACTED]')
        : Array.isArray(value) ? value.map(redact)
        : object(value) ? Object.fromEntries(Object.entries(value).map(([key, val]) => [key.replaceAll(authToken, '[REDACTED]'), redact(val)])) : value;
      const safe = authToken ? redact(result) : result;
      return {ok, providerId, protocolVersion:negotiatedProtocol, tool, runId:request.runId ?? null, projectId:request.projectId ?? null,
        intent:request.intent ?? null, result:safe, transportVerified:true, outcomeVerified,
        verificationScope:outcomeVerified?'external-outcome':'tool-response-transport',
        evidence:[`mcp-tool:${tool}`, `mcp-result:${ok ? 'ok' : 'error'}`, `outcome:${outcomeVerified ? 'host-checked' : 'unverified'}`]};
    },
    async disconnect() {
      epoch++; initialized = false; connecting = false; discovered.clear(); negotiatedProtocol = null; lifecycle = null;
      return {ok:true};
    }
  });
}
