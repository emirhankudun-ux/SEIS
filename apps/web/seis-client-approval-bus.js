(function (global) {
  "use strict";

  const VERSION = 1;
  const APPROVAL_NAMESPACE = ["seis", "client", "approvals", "v1"].join(".");
  const DECISIONS = {
    approve: "approved-local",
    changes: "changes-requested",
    decline: "declined"
  };

  function timestamp() {
    return new Date().toISOString();
  }

  function createId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeEvent(event) {
    return {
      id: String(event.id || createId("event")),
      type: String(event.type || "note").slice(0, 40),
      actor: event.actor === "client" ? "client" : "agency",
      note: String(event.note || "").slice(0, 2000),
      createdAt: event.createdAt || timestamp()
    };
  }

  function normalizeRequest(request) {
    const state = ["awaiting-client", "approved-local", "changes-requested", "declined"].includes(request.state) ? request.state : "awaiting-client";
    const events = Array.isArray(request.events) ? request.events.map(normalizeEvent) : [];
    return {
      id: String(request.id || createId("approval")),
      sourceId: String(request.sourceId || "command-center").slice(0, 80),
      threadId: String(request.threadId || "").slice(0, 160),
      title: String(request.title || "Client approval request").slice(0, 180),
      summary: String(request.summary || "").slice(0, 4000),
      risk: String(request.risk || "local-scope").slice(0, 80),
      state,
      requestedBy: "agency",
      createdAt: request.createdAt || timestamp(),
      updatedAt: request.updatedAt || timestamp(),
      events
    };
  }

  function defaultState() {
    return { version: VERSION, requests: [] };
  }

  function normalizeState(input) {
    const state = defaultState();
    if (input && Array.isArray(input.requests)) state.requests = input.requests.map(normalizeRequest);
    return state;
  }

  function read() {
    try {
      const raw = global.localStorage.getItem(APPROVAL_NAMESPACE);
      return raw ? normalizeState(JSON.parse(raw)) : defaultState();
    } catch (error) {
      return defaultState();
    }
  }

  function save(state) {
    const normalized = normalizeState(state);
    try { global.localStorage.setItem(APPROVAL_NAMESPACE, JSON.stringify(normalized)); } catch (error) {}
    return normalized;
  }

  function create(input) {
    const state = read();
    const request = normalizeRequest(Object.assign({}, input, {
      id: createId("approval"),
      state: "awaiting-client",
      createdAt: timestamp(),
      updatedAt: timestamp(),
      events: [{ id: createId("event"), type: "requested", actor: "agency", note: "Agency requested a client decision.", createdAt: timestamp() }]
    }));
    state.requests.unshift(request);
    save(state);
    global.dispatchEvent(new CustomEvent("seis:client-approval", { detail: request }));
    return request;
  }

  function decide(requestId, decision, note) {
    const state = read();
    const request = state.requests.find(function (candidate) { return candidate.id === requestId; });
    if (!request || !DECISIONS[decision]) return null;
    request.state = DECISIONS[decision];
    request.updatedAt = timestamp();
    request.events.push(normalizeEvent({
      id: createId("event"),
      type: request.state,
      actor: "client",
      note: String(note || (decision === "approve" ? "Client approved local scope only; no external action executed." : "Client decision recorded.")),
      createdAt: timestamp()
    }));
    save(state);
    global.dispatchEvent(new CustomEvent("seis:client-approval", { detail: request }));
    return request;
  }

  function merge(current, incoming) {
    const merged = normalizeState(current);
    const imported = normalizeState(incoming);
    const requests = new Map(merged.requests.map(function (request) { return [request.id, request]; }));
    imported.requests.forEach(function (incomingRequest) {
      const existing = requests.get(incomingRequest.id);
      if (!existing) {
        merged.requests.push(incomingRequest);
        requests.set(incomingRequest.id, incomingRequest);
        return;
      }
      const events = new Map(existing.events.map(function (event) { return [event.id, event]; }));
      incomingRequest.events.forEach(function (event) { if (!events.has(event.id)) existing.events.push(event); });
      if (incomingRequest.updatedAt > existing.updatedAt) {
        existing.state = incomingRequest.state;
        existing.updatedAt = incomingRequest.updatedAt;
      }
    });
    return save(merged);
  }

  global.SEISClientApprovalBus = {
    VERSION,
    read,
    save,
    create,
    decide,
    merge,
    exportPayload: function () {
      return { format: "seis-client-approvals", version: VERSION, exportedAt: timestamp(), state: read() };
    }
  };
})(window);
