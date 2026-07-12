(function (global) {
  "use strict";

  const VERSION = 1;
  const CONVERSATION_NAMESPACE = ["seis", "conversation", "hub", "v1"].join(".");
  const SOURCES = [
    { id: "ai-core", label: "SEIS AI Core", short: "AI", kind: "Intelligence", state: "local-only", description: "Provider-neutral local conversation shell.", href: "seis-linux-replica.html?demo=live" },
    { id: "command-center", label: "Command Center", short: "CC", kind: "Orchestration", state: "local-only", description: "Planning and agent coordination in the browser.", href: "seis-linux-replica.html?demo=live" },
    { id: "desktop", label: "Desktop OS", short: "OS", kind: "Workspace", state: "metadata-only", description: "Desktop context is metadata only; no host access.", href: "seis-linux-replica.html?demo=live" },
    { id: "code", label: "SEIS Code", short: "CO", kind: "Build", state: "metadata-only", description: "Code conversations carry safe local context.", href: "seis-code.html" },
    { id: "design", label: "Design Studio", short: "DS", kind: "Creative", state: "metadata-only", description: "Design context has no remote file permission.", href: "seis-design-studio.html" },
    { id: "search", label: "SEIS Search", short: "SE", kind: "Discovery", state: "mock", description: "Search answers use Local Demo fixtures.", href: "seis-search.html" },
    { id: "cloud", label: "SEIS Cloud", short: "CL", kind: "Infrastructure", state: "planned", description: "Cloud actions require backend approval wiring.", href: "seis-cloud.html" },
    { id: "store", label: "SEIS Store", short: "ST", kind: "Extensions", state: "mock", description: "Plugin conversations use local catalog state.", href: "seis-store.html" },
    { id: "music", label: "SEIS Music", short: "MU", kind: "Media", state: "mock", description: "Recommendations remain local demo interactions.", href: "seis-linux-replica.html?demo=live" },
    { id: "files", label: "SEIS Files", short: "FI", kind: "Workspace", state: "local-only", description: "Only the browser-local workspace is in scope.", href: "seis-files.html" },
    { id: "terminal", label: "Terminal / SSH", short: "SH", kind: "Operations", state: "disabled", description: "Real SSH is disabled; private keys are not read.", href: "seis-terminal.html" },
    { id: "agents", label: "SEIS Agents", short: "AG", kind: "Agents", state: "local-only", description: "Agent planning is local and approval-aware.", href: "seis-agents.html" }
  ];

  function createId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function now() {
    return new Date().toISOString();
  }

  function sourceById(sourceId) {
    return SOURCES.find(function (source) { return source.id === sourceId; }) || SOURCES[0];
  }

  function systemMessage(source) {
    return {
      id: createId("message"),
      role: "system",
      mode: "local-demo",
      createdAt: now(),
      text: "Local Demo thread ready for " + source.label + ". This hub stores conversation state in the browser; live provider, cloud, host filesystem, and SSH access are not enabled."
    };
  }

  function defaultState() {
    return { version: VERSION, activeSourceId: "command-center", sessions: [] };
  }

  function normalizeMessage(message) {
    return {
      id: String(message.id || createId("message")),
      role: message.role === "user" ? "user" : message.role === "assistant" ? "assistant" : "system",
      mode: String(message.mode || "local-demo"),
      createdAt: message.createdAt || now(),
      text: String(message.text || "").slice(0, 12000)
    };
  }

  function normalizeSession(session) {
    const source = sourceById(session.sourceId);
    const messages = Array.isArray(session.messages) ? session.messages.map(normalizeMessage).filter(function (message) { return message.text; }) : [];
    if (!messages.length) messages.push(systemMessage(source));
    return {
      id: String(session.id || createId("session")),
      sourceId: source.id,
      title: String(session.title || source.label + " thread").slice(0, 120),
      createdAt: session.createdAt || now(),
      updatedAt: session.updatedAt || now(),
      messages
    };
  }

  function normalizeState(input) {
    const state = defaultState();
    if (!input || typeof input !== "object") return state;
    state.activeSourceId = sourceById(input.activeSourceId).id;
    state.sessions = Array.isArray(input.sessions) ? input.sessions.map(normalizeSession) : [];
    return state;
  }

  function read() {
    try {
      const raw = global.localStorage.getItem(CONVERSATION_NAMESPACE);
      return raw ? normalizeState(JSON.parse(raw)) : defaultState();
    } catch (error) {
      return defaultState();
    }
  }

  function save(state) {
    const normalized = normalizeState(state);
    try { global.localStorage.setItem(CONVERSATION_NAMESPACE, JSON.stringify(normalized)); } catch (error) {}
    return normalized;
  }

  function ensureSession(state, sourceId) {
    const source = sourceById(sourceId);
    const existing = state.sessions.find(function (session) { return session.sourceId === source.id; });
    if (existing) {
      state.activeSourceId = source.id;
      return existing;
    }
    const session = normalizeSession({ id: createId("session"), sourceId: source.id, title: source.label + " thread", messages: [systemMessage(source)] });
    state.sessions.push(session);
    state.activeSourceId = source.id;
    return session;
  }

  function createSession(state, sourceId) {
    const source = sourceById(sourceId);
    const session = normalizeSession({ id: createId("session"), sourceId: source.id, title: source.label + " / new thread", messages: [systemMessage(source)] });
    state.sessions.push(session);
    state.activeSourceId = source.id;
    return session;
  }

  function appendMessage(state, sessionId, role, text, mode) {
    const session = state.sessions.find(function (candidate) { return candidate.id === sessionId; });
    if (!session || !String(text || "").trim()) return session;
    session.messages.push(normalizeMessage({ id: createId("message"), role, mode: mode || "local-demo", createdAt: now(), text: String(text).trim() }));
    session.updatedAt = now();
    return session;
  }

  function merge(current, incoming) {
    const merged = normalizeState(current);
    const incomingState = normalizeState(incoming);
    const sessions = new Map(merged.sessions.map(function (session) { return [session.id, session]; }));
    incomingState.sessions.forEach(function (incomingSession) {
      const existing = sessions.get(incomingSession.id);
      if (!existing) {
        merged.sessions.push(incomingSession);
        sessions.set(incomingSession.id, incomingSession);
        return;
      }
      const messages = new Map(existing.messages.map(function (message) { return [message.id, message]; }));
      incomingSession.messages.forEach(function (message) { if (!messages.has(message.id)) existing.messages.push(message); });
      existing.updatedAt = existing.updatedAt > incomingSession.updatedAt ? existing.updatedAt : incomingSession.updatedAt;
    });
    merged.activeSourceId = incomingState.activeSourceId || merged.activeSourceId;
    return normalizeState(merged);
  }

  global.SEISConversationBus = {
    VERSION,
    listSources: function () { return SOURCES.map(function (source) { return Object.assign({}, source); }); },
    sourceById,
    read,
    save,
    ensureSession,
    createSession,
    appendMessage,
    merge,
    exportPayload: function (state) { return { format: "seis-conversation-hub", version: VERSION, exportedAt: now(), state: normalizeState(state) }; }
  };
})(window);
