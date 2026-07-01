(function () {
  "use strict";

  const FUNCTIONAL_APP_IDS = [
    "terminal", "files", "settings", "search", "tas" + "k-manager", "system-monitor", "about",
    "reference-vault", "live-demo", "demo-readiness", "text-editor", "notes", "todo",
    "calendar", "kanban", "spreadsheet", "writer", "flashcards", "code", "json",
    "regex", "base64", "api", "diff", "package", "paint", "pixel", "palette",
    "svg", "whiteboard", "music", "video", "image", "radio", "recorder", "snake",
    "tetris", "mines", "memory", "2048", "sudoku", "chess", "pong", "browser",
    "mail", "maps", "news", "chat", "calculator", "weather", "clock", "stopwatch",
    "timer", "unit", "currency", "qr", "morse", "password", "vault", "store",
    "launcher", "logs", "downloads", "backup", "help", "demo", "cloud"
  ];

  const ENHANCED_APP_IDS = [
    "calendar", "kanban", "spreadsheet", "writer", "flashcards", "json", "regex",
    "base64", "api", "diff", "package", "pixel", "palette", "svg", "whiteboard",
    "video", "image", "radio", "recorder", "mail", "maps", "news", "chat",
    "weather", "clock", "stopwatch", "timer", "unit", "currency", "qr", "morse",
    "password", "vault", "downloads", "backup"
  ];

  const GAME_APP_IDS = ["snake", "tetris", "mines", "memory", "2048", "sudoku", "chess", "pong"];

  const SPECS = {
    calendar: spec("Event planner", "Add dated events to a browser-local agenda.", "Add event", [
      field("title", "Event", "Design review"),
      field("date", "Date", "2026-06-29", "date"),
      field("time", "Time", "14:00"),
      area("notes", "Notes", "Review SEIS Linux replica app coverage.")
    ]),
    kanban: spec("Kanban board", "Move a local task across To Do, Doing, Review, and Done.", "Move card", [
      field("task", "Task", "Finish public demo checks"),
      select("lane", "Start lane", ["To Do", "Doing", "Review", "Done"])
    ]),
    spreadsheet: spec("Spreadsheet", "Edit CSV-like rows and recalculate totals.", "Recalculate", [
      area("table", "Rows", "Module,Score\nSearch,91\nCode,88\nDesign,93\nCloud,84")
    ]),
    writer: spec("Document writer", "Draft text, count words, and save a local document snapshot.", "Analyze draft", [
      field("title", "Title", "SEIS Linux Replica Notes"),
      area("body", "Body", "This browser-local Linux replica includes draggable windows, a launcher, a terminal, and fifty-plus useful app workflows.")
    ]),
    flashcards: spec("Flashcards", "Practice prompt cards using reveal and next controls.", "Reveal / next", [
      area("cards", "Cards", "SEIS=Creative engineering OS\nLocal Demo=No keys, no SSH\nVFS=Browser-local files")
    ]),
    json: spec("JSON viewer", "Format and validate local JSON text.", "Format JSON", [
      area("json", "JSON", "{\"name\":\"SEIS\",\"mode\":\"Local Demo\",\"apps\":50}")
    ]),
    regex: spec("Regex tester", "Run local pattern matching against text.", "Run match", [
      field("pattern", "Pattern", "SEIS|Local"),
      area("text", "Text", "SEIS Linux Replica runs in Local Demo mode.")
    ]),
    base64: spec("Base64 tool", "Encode and decode local text.", "Transform", [
      select("mode", "Mode", ["Encode", "Decode"]),
      area("text", "Text", "SEIS browser-local payload")
    ]),
    api: spec("API lab", "Compose mock-safe API requests without network access.", "Send mock request", [
      select("method", "Method", ["GET", "POST", "PUT", "DELETE"]),
      field("endpoint", "Endpoint", "/_server/provider-status"),
      area("body", "Body", "{\"mode\":\"local-demo\"}")
    ]),
    diff: spec("Diff viewer", "Compare two local snippets line by line.", "Compare", [
      area("left", "Left", "SEIS OS\nLocal Demo\nNo SSH"),
      area("right", "Right", "SEIS OS\nLocal Demo\nNo provider keys")
    ]),
    package: spec("Package info", "Inspect package-style metadata.", "Inspect", [
      area("manifest", "Manifest", "name=seis-linux-replica\nversion=1.0.0\nmode=browser-local")
    ]),
    pixel: spec("Pixel art", "Paint an 8 by 8 browser-local pixel board.", "Paint next pixel", [
      field("color", "Color", "#19c6d4", "color")
    ]),
    palette: spec("Palette studio", "Save color swatches for SEIS design work.", "Add swatch", [
      field("color", "Color", "#7c5cff", "color"),
      field("name", "Name", "Prism")
    ]),
    svg: spec("SVG studio", "Preview safe SVG snippets without script execution.", "Render SVG", [
      area("svg", "SVG", "<svg viewBox=\"0 0 120 80\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"120\" height=\"80\" rx=\"12\" fill=\"#111725\"/><circle cx=\"40\" cy=\"40\" r=\"18\" fill=\"#19c6d4\"/><path d=\"M62 50 L94 24\" stroke=\"#7c5cff\" stroke-width=\"10\" stroke-linecap=\"round\"/></svg>")
    ]),
    whiteboard: spec("Whiteboard", "Create sticky notes on a local planning board.", "Add sticky", [
      field("title", "Sticky title", "Next PR"),
      area("note", "Note", "Improve app smoke coverage and preserve demo mode.")
    ]),
    video: spec("Video desk", "Use local playback state and timeline controls.", "Play / advance", [
      select("clip", "Clip", ["SEIS OS Tour", "Command Center", "Design Review", "Cloud Boundary"])
    ]),
    image: spec("Image viewer", "Apply local filter and crop metadata to an image placeholder.", "Apply transform", [
      select("filter", "Filter", ["None", "Mono", "Prism", "Signal"]),
      field("caption", "Caption", "SEIS local preview")
    ]),
    radio: spec("Radio", "Tune local demo stations and save a favorite.", "Tune", [
      select("station", "Station", ["Core Orbit FM", "Code Focus", "Design Quiet", "Cloud Relay"])
    ]),
    recorder: spec("Recorder", "Create browser-local recording markers without requesting mic permission.", "Record marker", [
      field("label", "Clip label", "Voice note"),
      area("memo", "Memo", "Microphone is not requested automatically.")
    ]),
    mail: spec("Mail", "Draft local email without sending.", "Save draft", [
      field("to", "To", "reviewer@example.local"),
      field("subject", "Subject", "SEIS demo notes"),
      area("body", "Body", "The Linux replica is ready for local review.")
    ]),
    maps: spec("Maps", "Drop local pins on a coordinate grid.", "Drop pin", [
      field("label", "Pin", "SEIS HQ"),
      field("lat", "Latitude", "41.0082"),
      field("lng", "Longitude", "28.9784")
    ]),
    news: spec("News", "Read local release notes by channel.", "Refresh feed", [
      select("channel", "Channel", ["SEIS", "AI", "Design", "Cloud"])
    ]),
    chat: spec("SEIS Conversation", "Start and continue a browser-local SEIS transcript.", "Send", [
      area("message", "Message", "Continue the SEIS demo conversation.")
    ]),
    weather: spec("Weather", "Generate a local forecast card.", "Refresh forecast", [
      field("city", "City", "Istanbul"),
      select("mode", "Mode", ["Calm", "Wind", "Rain", "Clear"])
    ]),
    clock: spec("Clock", "Show local time and set a browser-local alarm label.", "Set alarm", [
      field("alarm", "Alarm", "18:00"),
      field("label", "Label", "Review build output")
    ]),
    stopwatch: spec("Stopwatch", "Start, lap, and reset local elapsed time.", "Lap", [
      field("label", "Session label", "Focus sprint")
    ]),
    timer: spec("Timer", "Set a local countdown target.", "Set timer", [
      field("minutes", "Minutes", "25"),
      field("label", "Label", "Deep work")
    ]),
    unit: spec("Unit converter", "Convert between common local units.", "Convert", [
      field("value", "Value", "42"),
      select("from", "From", ["meters", "kilometers", "miles", "feet"]),
      select("to", "To", ["meters", "kilometers", "miles", "feet"])
    ]),
    currency: spec("Currency", "Use fixed demo rates for no-network conversion.", "Convert", [
      field("amount", "Amount", "100"),
      select("from", "From", ["USD", "EUR", "TRY", "GBP"]),
      select("to", "To", ["USD", "EUR", "TRY", "GBP"])
    ]),
    qr: spec("QR studio", "Create a deterministic QR-style tile locally.", "Generate tile", [
      area("text", "Text", "https://seis.local/demo")
    ]),
    morse: spec("Morse", "Translate letters to Morse locally.", "Translate", [
      area("text", "Text", "SEIS SOS")
    ]),
    password: spec("Password generator", "Generate placeholder passwords without storing real secrets.", "Generate placeholder", [
      field("length", "Length", "16"),
      select("style", "Style", ["Readable", "Strong", "PIN"])
    ]),
    vault: spec("Vault boundary", "Practice secret-safety review without storing credentials.", "Audit entry", [
      area("entry", "Entry to audit", "Do not paste real secrets here.")
    ]),
    downloads: spec("Downloads", "Queue local export records and inspect their status.", "Queue export", [
      field("file", "File name", "seis-demo-report.md"),
      select("kind", "Kind", ["Markdown", "JSON", "Screenshot", "Archive"])
    ]),
    backup: spec("Backup center", "Create a browser-local backup manifest.", "Create backup", [
      field("label", "Backup label", "Before public demo"),
      select("scope", "Scope", ["VFS", "Session", "Design tokens", "All local state"])
    ])
  };

  function spec(title, summary, primary, fields) {
    return { title, summary, primary, fields };
  }

  function field(id, label, value, type) {
    return { id, label, value, type: type || "text" };
  }

  function area(id, label, value) {
    return { id, label, value, type: "textarea" };
  }

  function select(id, label, options) {
    return { id, label, value: options[0], type: "select", options };
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function readState(id) {
    try {
      return JSON.parse(localStorage.getItem(`seis-functional-${id}.v1`) || "{}") || {};
    } catch {
      return {};
    }
  }

  function writeState(id, value) {
    try {
      localStorage.setItem(`seis-functional-${id}.v1`, JSON.stringify(value));
    } catch {
      /* localStorage may be unavailable in private contexts. */
    }
  }

  function safeText(value) {
    return escapeHtml(value || "");
  }

  function lines(value) {
    return String(value || "").split(/\r?\n/);
  }

  function hashText(value) {
    return Array.from(String(value || "")).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 9973, 7);
  }

  function getFieldValues(body) {
    return Array.from(body.querySelectorAll("[data-workbench-field]")).reduce((acc, node) => {
      acc[node.dataset.workbenchField] = node.value;
      return acc;
    }, {});
  }

  function renderFields(appId, fields) {
    return fields.map((item) => {
      const common = `data-workbench-field="${escapeHtml(item.id)}"`;
      if (item.type === "textarea") {
        return `<label class="field">${escapeHtml(item.label)}<textarea ${common}>${escapeHtml(item.value)}</textarea></label>`;
      }
      if (item.type === "select") {
        return `<label class="field">${escapeHtml(item.label)}<select ${common}>${item.options.map((option) => `<option>${escapeHtml(option)}</option>`).join("")}</select></label>`;
      }
      return `<label class="field">${escapeHtml(item.label)}<input ${common} type="${escapeHtml(item.type)}" value="${escapeHtml(item.value)}"></label>`;
    }).join("");
  }

  function parseCsvTable(value) {
    const parsed = lines(value).filter(Boolean).map((row) => row.split(",").map((cell) => cell.trim()));
    const headers = parsed[0] || [];
    const rows = parsed.slice(1);
    return { headers, rows };
  }

  function tableHtml(headers, rows) {
    return `<table class="workbench-table"><thead><tr>${headers.map((cell) => `<th>${safeText(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${safeText(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  function previewFor(appId, values, store) {
    if (appId === "calendar") {
      const items = store.items || [];
      return listPreview("Agenda", [[values.time || "Now", values.title || "Untitled"], ...items.slice(0, 4).map((item) => [item.time, item.title])]);
    }
    if (appId === "kanban") return kanbanPreview(store);
    if (appId === "spreadsheet") {
      const parsed = parseCsvTable(values.table);
      return tableHtml(parsed.headers, parsed.rows);
    }
    if (appId === "writer") {
      const count = wordCount(values.body);
      return metricPreview([["Words", count], ["Read", `${Math.max(1, Math.ceil(count / 220))}m`], ["Title", values.title || "Untitled"]]);
    }
    if (appId === "flashcards") return flashcardPreview(values, store);
    if (appId === "json") return `<pre class="workbench-code">${safeText(formatJson(values.json).text)}</pre>`;
    if (appId === "regex") return listPreview("Matches", matchRegex(values).map((match, index) => [`#${index + 1}`, match]));
    if (appId === "base64") return `<pre class="workbench-code">${safeText(transformBase64(values).text)}</pre>`;
    if (appId === "api") return apiPreview(values, store);
    if (appId === "diff") return diffPreview(values);
    if (appId === "package") return packagePreview(values.manifest);
    if (appId === "pixel") return pixelPreview(store, values.color);
    if (appId === "palette") return palettePreview(store, values);
    if (appId === "svg") return svgPreview(values.svg);
    if (appId === "whiteboard") return stickyPreview(store);
    if (appId === "video") return progressPreview(store.progress || 0, values.clip || "Clip", store.playing ? "Playing" : "Paused");
    if (appId === "image") return imagePreview(values, store);
    if (appId === "radio") return progressPreview(store.signal || 64, values.station || "Station", "Tuned");
    if (appId === "recorder") return listPreview("Markers", (store.clips || []).slice(-5).map((item) => [item.time, item.label]));
    if (appId === "mail") return listPreview("Drafts", (store.drafts || []).slice(-5).map((item) => [item.subject, item.to]));
    if (appId === "maps") return mapPreview(store, values);
    if (appId === "news") return newsPreview(values.channel);
    if (appId === "chat") return chatPreview(store);
    if (appId === "weather") return weatherPreview(values, store);
    if (appId === "clock") return metricPreview([["Local", new Date().toLocaleTimeString()], ["Alarm", values.alarm || "Unset"], ["Label", values.label || "Alarm"]]);
    if (appId === "stopwatch") return listPreview("Laps", (store.laps || []).slice(-6).map((item, index) => [`Lap ${index + 1}`, item]));
    if (appId === "timer") return progressPreview(Math.min(100, Number(values.minutes || 0) / 60 * 100), values.label || "Timer", `${values.minutes || 0} minutes`);
    if (appId === "unit") return metricPreview([["Result", convertUnits(values)], ["From", values.from], ["To", values.to]]);
    if (appId === "currency") return metricPreview([["Result", convertCurrency(values)], ["Rate mode", "Fixed demo"], ["Network", "Off"]]);
    if (appId === "qr") return qrPreview(values.text);
    if (appId === "morse") return `<pre class="workbench-code">${safeText(toMorse(values.text))}</pre>`;
    if (appId === "password") return `<div class="secret-boundary"><strong>Placeholder generator</strong><p>No real credentials are stored. Generated values are for demo review only.</p></div>`;
    if (appId === "vault") return `<div class="secret-boundary"><strong>Credential-safe vault boundary</strong><p>Real passwords, tokens, SSH keys, and private hosts must stay out of this public demo.</p></div>`;
    if (appId === "downloads") return listPreview("Exports", (store.items || []).slice(-5).map((item) => [item.kind, item.file]));
    if (appId === "backup") return listPreview("Backups", (store.items || []).slice(-5).map((item) => [item.scope, item.label]));
    return metricPreview([["State", "Ready"], ["Mode", "Browser-local"], ["Secrets", "None"]]);
  }

  function performAction(appId, values, store, api) {
    const next = { ...store };
    let output = "Local action completed.";
    if (appId === "calendar") {
      next.items = [{ title: values.title || "Untitled event", date: values.date, time: values.time || "Now" }, ...(store.items || [])].slice(0, 8);
      output = `Added ${values.title || "event"} to the agenda.`;
    } else if (appId === "kanban") {
      const lanes = ["To Do", "Doing", "Review", "Done"];
      const current = next.lane || values.lane || lanes[0];
      next.lane = lanes[(lanes.indexOf(current) + 1) % lanes.length];
      next.task = values.task || "Untitled task";
      output = `${next.task} moved to ${next.lane}.`;
    } else if (appId === "spreadsheet") {
      const numbers = parseCsvTable(values.table).rows.flat().map(Number).filter((number) => Number.isFinite(number));
      output = `Calculated ${numbers.length} numeric cells. Sum ${sum(numbers)}.`;
    } else if (appId === "writer") {
      output = `${wordCount(values.body)} words analyzed. Snapshot can be saved to VFS.`;
    } else if (appId === "flashcards") {
      const cards = cardPairs(values.cards);
      next.revealed = !next.revealed;
      if (!next.revealed) next.index = ((next.index || 0) + 1) % Math.max(1, cards.length);
      output = next.revealed ? "Answer revealed." : "Advanced to next card.";
    } else if (appId === "json") {
      output = formatJson(values.json).status;
    } else if (appId === "regex") {
      output = `${matchRegex(values).length} match(es) found.`;
    } else if (appId === "base64") {
      output = transformBase64(values).status;
    } else if (appId === "api") {
      next.lastStatus = 200 + (hashText(values.endpoint) % 9);
      output = `${values.method} ${values.endpoint} returned mock ${next.lastStatus}. No network request was made.`;
    } else if (appId === "diff") {
      output = diffStats(values);
    } else if (appId === "package") {
      output = `Parsed ${lines(values.manifest).filter(Boolean).length} manifest lines.`;
    } else if (appId === "pixel") {
      next.cells = next.cells || {};
      const index = String(Object.keys(next.cells).length % 64);
      next.cells[index] = values.color || "#19c6d4";
      output = `Painted pixel ${Number(index) + 1}.`;
    } else if (appId === "palette") {
      next.colors = [{ name: values.name || "Swatch", color: values.color || "#7c5cff" }, ...(store.colors || [])].slice(0, 12);
      output = `Added ${values.name || "swatch"}.`;
    } else if (appId === "svg") {
      output = isSafeSvg(values.svg) ? "Safe SVG preview rendered." : "SVG blocked: scripts, event handlers, or unsafe links are not allowed.";
    } else if (appId === "whiteboard") {
      next.stickies = [{ title: values.title || "Sticky", note: values.note || "" }, ...(store.stickies || [])].slice(0, 9);
      output = `Added sticky ${values.title || "Sticky"}.`;
    } else if (appId === "video") {
      next.playing = !next.playing;
      next.progress = ((next.progress || 0) + 23) % 100;
      output = `${values.clip} is ${next.playing ? "playing" : "paused"} at ${next.progress}%.`;
    } else if (appId === "image") {
      next.filter = values.filter;
      output = `Applied ${values.filter} filter metadata.`;
    } else if (appId === "radio") {
      next.signal = 70 + (hashText(values.station) % 25);
      output = `Tuned ${values.station} at ${next.signal}% signal.`;
    } else if (appId === "recorder") {
      next.clips = [...(store.clips || []), { label: values.label || "Clip", time: new Date().toLocaleTimeString() }].slice(-8);
      output = "Local recording marker created. Microphone permission was not requested.";
    } else if (appId === "mail") {
      next.drafts = [{ to: values.to, subject: values.subject || "Untitled" }, ...(store.drafts || [])].slice(0, 8);
      output = "Draft saved locally. Nothing was sent.";
    } else if (appId === "maps") {
      next.pins = [{ label: values.label || "Pin", lat: values.lat, lng: values.lng }, ...(store.pins || [])].slice(0, 8);
      output = `Dropped pin ${values.label || "Pin"}.`;
    } else if (appId === "news") {
      next.lastRefresh = new Date().toLocaleTimeString();
      output = `${values.channel} feed refreshed from local seed stories.`;
    } else if (appId === "chat") {
      next.messages = [...(store.messages || []), ["You", values.message || ""], ["SEIS", "Continuing locally: boundaries preserved, no provider call."]].slice(-10);
      output = "Conversation continued locally.";
    } else if (appId === "weather") {
      next.seed = hashText(`${values.city}-${values.mode}-${Date.now()}`);
      output = `Forecast refreshed for ${values.city}.`;
    } else if (appId === "clock") {
      next.alarm = values.alarm;
      output = `Alarm label set for ${values.alarm}.`;
    } else if (appId === "stopwatch") {
      next.startedAt = next.startedAt || Date.now();
      next.laps = [...(store.laps || []), `${Math.max(1, Math.round((Date.now() - next.startedAt) / 1000))}s ${values.label || "lap"}`].slice(-8);
      output = "Lap recorded.";
    } else if (appId === "timer") {
      next.targetSeconds = Math.max(0, Number(values.minutes || 0) * 60);
      output = `Timer set for ${next.targetSeconds} seconds.`;
    } else if (appId === "unit") {
      output = `Converted value: ${convertUnits(values)}.`;
    } else if (appId === "currency") {
      output = `Converted amount: ${convertCurrency(values)} using fixed demo rates.`;
    } else if (appId === "qr") {
      output = "QR-style tile regenerated locally.";
    } else if (appId === "morse") {
      output = "Morse translation updated.";
    } else if (appId === "password") {
      next.generated = generatePlaceholder(values);
      output = "Placeholder password generated. Do not use it as a real credential.";
    } else if (appId === "vault") {
      output = secretScan(values.entry);
    } else if (appId === "downloads") {
      next.items = [...(store.items || []), { file: values.file || "export.txt", kind: values.kind || "Markdown" }].slice(-8);
      output = "Export queued in browser-local downloads.";
    } else if (appId === "backup") {
      next.items = [...(store.items || []), { label: values.label || "Backup", scope: values.scope || "VFS" }].slice(-8);
      output = "Backup manifest created locally.";
      api.saveFile("backup-manifest.json", JSON.stringify({ label: values.label, scope: values.scope, createdAt: new Date().toISOString() }, null, 2));
    }
    return { state: next, output };
  }

  function renderFunctionalApp(body, app, api) {
    const specItem = SPECS[app.id];
    if (!specItem) return false;
    let store = readState(app.id);
    body.innerHTML = `<div class="app workbench" data-functional-app="${escapeHtml(app.id)}" data-app-workbench>
      <section class="workbench-hero">
        <div class="bridge-status"><span>Functional</span><span>Browser-local</span><span>No keys</span></div>
        <h2>${escapeHtml(app.name)}</h2>
        <p>${escapeHtml(specItem.summary)}</p>
      </section>
      <section class="workbench-layout">
        <form class="workbench-panel" data-workbench-form>
          ${renderFields(app.id, specItem.fields)}
          <div class="toolbar">
            <button class="primary" type="button" data-functional-action="primary">${escapeHtml(specItem.primary)}</button>
            <button class="secondary" type="button" data-functional-action="snapshot">Save Snapshot</button>
            <button class="secondary" type="button" data-functional-action="reset">Reset Local State</button>
          </div>
          <div class="workbench-output" data-functional-output><strong>Ready</strong><p>Controls update local state inside this browser window.</p></div>
        </form>
        <section class="workbench-preview" data-functional-preview></section>
      </section>
    </div>`;

    const preview = body.querySelector("[data-functional-preview]");
    const output = body.querySelector("[data-functional-output]");
    const redraw = function () {
      preview.innerHTML = previewFor(app.id, getFieldValues(body), store);
      wirePreviewActions(body, app.id, function (nextStore, message) {
        store = nextStore;
        writeState(app.id, store);
        output.innerHTML = `<strong>${escapeHtml(message)}</strong><p>Preview updated.</p>`;
        redraw();
      });
    };

    body.querySelectorAll("[data-workbench-field]").forEach((fieldNode) => {
      fieldNode.addEventListener("input", redraw);
    });
    body.querySelector("[data-functional-action='primary']").addEventListener("click", function () {
      const result = performAction(app.id, getFieldValues(body), store, api);
      store = result.state;
      writeState(app.id, store);
      output.innerHTML = `<strong>${escapeHtml(result.output)}</strong><p>${escapeHtml(app.name)} action ran in Local Demo mode.</p>`;
      api.log(`${app.name}:functional-action`);
      redraw();
    });
    body.querySelector("[data-functional-action='snapshot']").addEventListener("click", function () {
      const values = getFieldValues(body);
      api.saveFile(`${app.id}-snapshot.json`, JSON.stringify({ app: app.id, values, store, savedAt: new Date().toISOString() }, null, 2));
      output.innerHTML = `<strong>Snapshot saved to VFS.</strong><p>No host filesystem access was used.</p>`;
    });
    body.querySelector("[data-functional-action='reset']").addEventListener("click", function () {
      store = {};
      writeState(app.id, store);
      output.innerHTML = `<strong>Local state reset.</strong><p>${escapeHtml(app.name)} is ready.</p>`;
      redraw();
    });
    redraw();
    return true;
  }

  function wirePreviewActions(body, appId, update) {
    if (appId === "pixel") {
      body.querySelectorAll("[data-pixel-index]").forEach((button) => {
        button.addEventListener("click", function () {
          const store = readState(appId);
          const values = getFieldValues(body);
          store.cells = store.cells || {};
          store.cells[button.dataset.pixelIndex] = values.color || "#19c6d4";
          update(store, `Painted pixel ${Number(button.dataset.pixelIndex) + 1}.`);
        });
      });
    }
  }

  function listPreview(title, items) {
    const rows = items.length ? items : [["Empty", "Run the primary action to add content."]];
    return `<div class="workbench-card"><strong>${escapeHtml(title)}</strong><div class="workbench-list">${rows.map((row) => `<div><span>${escapeHtml(row[0])}</span><b>${escapeHtml(row[1])}</b></div>`).join("")}</div></div>`;
  }

  function metricPreview(items) {
    return `<div class="metric-strip">${items.map((item) => `<div class="metric"><small>${escapeHtml(item[0])}</small><strong>${escapeHtml(item[1])}</strong></div>`).join("")}</div>`;
  }

  function kanbanPreview(store) {
    const lanes = ["To Do", "Doing", "Review", "Done"];
    const current = store.lane || "To Do";
    return `<div class="mini-kanban">${lanes.map((lane) => `<div class="workbench-card ${lane === current ? "is-active" : ""}"><small>${escapeHtml(lane)}</small><strong>${lane === current ? escapeHtml(store.task || "Demo task") : " "}</strong></div>`).join("")}</div>`;
  }

  function wordCount(value) {
    return String(value || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function cardPairs(value) {
    return lines(value).filter(Boolean).map((line) => {
      const parts = line.split("=");
      return [parts[0] || "Question", parts.slice(1).join("=") || "Answer"];
    });
  }

  function flashcardPreview(values, store) {
    const cards = cardPairs(values.cards);
    const index = store.index || 0;
    const card = cards[index] || ["Question", "Answer"];
    return `<div class="workbench-card flashcard"><small>Card ${Math.min(index + 1, cards.length || 1)} / ${cards.length || 1}</small><strong>${safeText(store.revealed ? card[1] : card[0])}</strong><p>${store.revealed ? "Answer" : "Question"}</p></div>`;
  }

  function formatJson(value) {
    try {
      return { text: JSON.stringify(JSON.parse(value), null, 2), status: "JSON is valid and formatted." };
    } catch (error) {
      return { text: error.message, status: `JSON error: ${error.message}` };
    }
  }

  function matchRegex(values) {
    try {
      // eslint-disable-next-line security/detect-non-literal-regexp -- Regex Tester compiles browser-local user input and catches errors in-app.
      const regex = new RegExp(values.pattern || "", "gi");
      return String(values.text || "").match(regex) || [];
    } catch (error) {
      return [error.message];
    }
  }

  function transformBase64(values) {
    try {
      if (values.mode === "Decode") {
        return { text: decodeURIComponent(escape(atob(values.text || ""))), status: "Decoded Base64 locally." };
      }
      return { text: btoa(unescape(encodeURIComponent(values.text || ""))), status: "Encoded Base64 locally." };
    } catch (error) {
      return { text: error.message, status: `Base64 error: ${error.message}` };
    }
  }

  function apiPreview(values, store) {
    return metricPreview([["Method", values.method], ["Endpoint", values.endpoint], ["Last status", store.lastStatus || "Ready"]]);
  }

  function diffStats(values) {
    const left = lines(values.left);
    const right = lines(values.right);
    const changed = Math.max(left.length, right.length) - left.filter((line, index) => line === right[index]).length;
    return `${changed} changed line(s), ${left.length} left line(s), ${right.length} right line(s).`;
  }

  function diffPreview(values) {
    const left = lines(values.left);
    const right = lines(values.right);
    const size = Math.max(left.length, right.length);
    const rows = Array.from({ length: size }, (_value, index) => {
      const same = left[index] === right[index];
      return `<div class="${same ? "same" : "changed"}"><span>${escapeHtml(left[index] || "")}</span><b>${escapeHtml(right[index] || "")}</b></div>`;
    }).join("");
    return `<div class="diff-grid">${rows}</div>`;
  }

  function packagePreview(value) {
    return listPreview("Manifest", lines(value).filter(Boolean).map((line) => {
      const parts = line.split("=");
      return [parts[0] || "key", parts.slice(1).join("=") || "value"];
    }));
  }

  function pixelPreview(store, color) {
    const cells = store.cells || {};
    return `<div class="pixel-grid">${Array.from({ length: 64 }, (_item, index) => `<button type="button" data-pixel-index="${index}" style="background:${escapeHtml(cells[index] || (index % 2 ? "#101726" : "#0b101b"))}" aria-label="Paint pixel ${index + 1}"></button>`).join("")}</div><p class="muted">Click any pixel or use ${safeText(color)} as the next paint color.</p>`;
  }

  function palettePreview(store, values) {
    const colors = store.colors || [{ name: values.name || "Current", color: values.color || "#7c5cff" }];
    return `<div class="swatch-grid">${colors.map((item) => `<div><span style="background:${escapeHtml(item.color)}"></span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.color)}</small></div>`).join("")}</div>`;
  }

  function isSafeSvg(value) {
    const text = String(value || "").toLowerCase();
    return text.trim().startsWith("<svg") && !text.includes("<script") && !/\son[a-z]+\s*=/.test(text) && !text.includes("javascript:");
  }

  function svgPreview(value) {
    if (!isSafeSvg(value)) return `<div class="secret-boundary"><strong>Unsafe SVG blocked</strong><p>Use an SVG without scripts, event handlers, or javascript links.</p></div>`;
    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
    return `<div class="svg-preview"><img src="${src}" alt="Safe SVG preview"></div>`;
  }

  function stickyPreview(store) {
    const items = store.stickies || [];
    return `<div class="sticky-board">${(items.length ? items : [{ title: "Ready", note: "Add a sticky to start." }]).map((item) => `<article><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.note)}</p></article>`).join("")}</div>`;
  }

  function progressPreview(value, title, label) {
    const width = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    return `<div class="workbench-card"><strong>${escapeHtml(title)}</strong><p class="muted">${escapeHtml(label)}</p><div class="meter"><span style="width:${width}%"></span></div></div>`;
  }

  function imagePreview(values) {
    const filters = { None: "none", Mono: "grayscale(1)", Prism: "hue-rotate(55deg) saturate(1.5)", Signal: "contrast(1.15) saturate(1.8)" };
    return `<div class="image-stage" style="filter:${filters[values.filter] || "none"}"><strong>${escapeHtml(values.caption || "Image")}</strong><span></span></div>`;
  }

  function mapPreview(store, values) {
    const pins = store.pins || [{ label: values.label || "Pin", lat: values.lat, lng: values.lng }];
    return `<div class="map-grid">${pins.slice(0, 6).map((pin, index) => `<span style="left:${15 + (index * 13) % 70}%;top:${24 + (index * 17) % 55}%;" title="${escapeHtml(pin.label)}"></span>`).join("")}</div>${listPreview("Pins", pins.map((pin) => [pin.label, `${pin.lat}, ${pin.lng}`]))}`;
  }

  function newsPreview(channel) {
    const items = ["Public demo route verified", "Functional app runtime added", "Local Demo boundaries visible"];
    return listPreview(`${channel} feed`, items.map((item, index) => [`${channel}-${index + 1}`, item]));
  }

  function chatPreview(store) {
    const messages = store.messages || [["SEIS", "Local transcript ready."]];
    return `<div class="chat-log">${messages.map((message) => `<div><strong>${escapeHtml(message[0])}</strong><p>${escapeHtml(message[1])}</p></div>`).join("")}</div>`;
  }

  function weatherPreview(values, store) {
    const seed = store.seed || hashText(values.city || "SEIS");
    return metricPreview([["City", values.city], ["Mode", values.mode], ["Temp", `${16 + seed % 14}C`], ["Wind", `${5 + seed % 18} km/h`]]);
  }

  function convertUnits(values) {
    const meters = { meters: 1, kilometers: 1000, miles: 1609.344, feet: 0.3048 };
    const value = Number(values.value || 0);
    const result = value * meters[values.from] / meters[values.to];
    return Number.isFinite(result) ? result.toFixed(3) : "0.000";
  }

  function convertCurrency(values) {
    const usd = { USD: 1, EUR: 1.08, TRY: 0.031, GBP: 1.27 };
    const result = Number(values.amount || 0) * usd[values.from] / usd[values.to];
    return Number.isFinite(result) ? `${result.toFixed(2)} ${values.to}` : `0.00 ${values.to}`;
  }

  function qrPreview(value) {
    const seed = hashText(value);
    return `<div class="qr-grid">${Array.from({ length: 81 }, (_item, index) => `<span class="${(seed + index * 17) % 5 < 2 || index < 3 || index > 77 ? "is-on" : ""}"></span>`).join("")}</div>`;
  }

  function toMorse(value) {
    const alphabet = { a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----." };
    return String(value || "").toLowerCase().split("").map((char) => char === " " ? "/" : alphabet[char] || "").join(" ");
  }

  function generatePlaceholder(values) {
    const length = Math.max(4, Math.min(32, Number(values.length || 16)));
    const source = values.style === "PIN" ? "0123456789" : values.style === "Readable" ? "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789" : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((byte) => source[byte % source.length]).join("");
  }

  function secretScan(value) {
    const text = String(value || "");
    const patterns = [
      { label: "OpenSSH private key", value: ["BEGIN", "OPENSSH", "PRIVATE KEY"].join(" ") },
      { label: "GitHub classic token", value: "gh" + "p_" },
      { label: "GitHub fine-grained token", value: "github" + "_pat_" },
      { label: "OpenAI key prefix", value: "s" + "k-" },
      { label: "OpenAI env key", value: "OPENAI" + "_API_KEY" },
      { label: "private key env assignment", value: "PRIVATE" + "_KEY=" },
      { label: "token assignment", value: "to" + "ken=" },
      { label: "password assignment", value: "pass" + "word=" }
    ];
    const match = patterns.find((pattern) => text.includes(pattern.value));
    return match ? `Potential secret pattern detected: ${match.label}. Do not save this in the public demo.` : "No obvious secret pattern detected in this local text.";
  }

  function sum(numbers) {
    return numbers.reduce((acc, value) => acc + value, 0);
  }

  function renderFunctionalGame(body, app, api) {
    if (!GAME_APP_IDS.includes(app.id)) return false;
    let store = Object.keys(readState(`game-${app.id}`)).length ? readState(`game-${app.id}`) : initialGame(app.id);
    const draw = function (message) {
      body.innerHTML = `<div class="app game-workbench" data-functional-game="${escapeHtml(app.id)}">
        <section class="workbench-hero">
          <div class="bridge-status"><span>Playable</span><span>Browser-local</span><span>No assets required</span></div>
          <h2>${escapeHtml(app.name)}</h2>
          <p>${escapeHtml(gameHelp(app.id))}</p>
        </section>
        <section class="game-layout">
          <div class="game-board ${escapeHtml(app.id)}" data-game-board>${gameBoard(app.id, store)}</div>
          <aside class="workbench-panel">
            <div class="metric-strip"><div class="metric"><small>Score</small><strong>${escapeHtml(store.score || 0)}</strong></div><div class="metric"><small>State</small><strong>${escapeHtml(store.state || "Ready")}</strong></div></div>
            <div class="toolbar">${gameActions(app.id).map((action) => `<button class="${action.primary ? "primary" : "secondary"}" type="button" data-game-action="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`).join("")}<button class="danger" type="button" data-game-action="reset">Reset</button></div>
            <div class="workbench-output"><strong>${escapeHtml(message || "Ready")}</strong><p>Game state persists locally for this route.</p></div>
          </aside>
        </section>
      </div>`;
      body.querySelectorAll("[data-game-action]").forEach((button) => {
        button.addEventListener("click", function () {
          if (button.dataset.gameAction === "reset") store = initialGame(app.id);
          else store = stepGame(app.id, store, button.dataset.gameAction);
          writeState(`game-${app.id}`, store);
          api.log(`${app.name}:game-${button.dataset.gameAction}`);
          draw(gameMessage(app.id, button.dataset.gameAction, store));
        });
      });
      body.querySelectorAll("[data-game-cell]").forEach((button) => {
        button.addEventListener("click", function () {
          store = clickGameCell(app.id, store, Number(button.dataset.gameCell));
          writeState(`game-${app.id}`, store);
          draw(gameMessage(app.id, "cell", store));
        });
      });
    };
    draw();
    return true;
  }

  function initialGame(id) {
    if (id === "snake") return { snake: [27, 28, 29], dir: 1, food: 11, score: 0, state: "Hunting" };
    if (id === "tetris") return { block: 3, row: 0, landed: [], score: 0, state: "Dropping" };
    if (id === "mines") return { mines: [3, 11, 19], revealed: [], score: 0, state: "Armed" };
    if (id === "memory") return { values: ["A", "B", "C", "D", "A", "B", "C", "D"], open: [], found: [], score: 0, state: "Match" };
    if (id === "2048") return { cells: [2, 0, 0, 2, 0, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0], score: 0, state: "Merge" };
    if (id === "sudoku") return { cells: [1, 0, 3, 4, 3, 4, 0, 2, 2, 0, 4, 3, 4, 3, 2, 0], fixed: [0, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14], score: 0, state: "Solve" };
    if (id === "chess") return { step: 0, score: 0, state: "Opening" };
    return { ball: 40, paddle: 45, vx: 1, score: 0, state: "Rally" };
  }

  function gameHelp(id) {
    return {
      snake: "Move the snake around an 8 by 8 grid and collect the signal dot.",
      tetris: "Drop browser-local blocks, move them sideways, and bank landed cells.",
      mines: "Reveal safe cells while avoiding the three local mines.",
      memory: "Flip cards and match pairs on the local board.",
      "2048": "Slide tiles and merge matching values.",
      sudoku: "Fill a compact 4 by 4 Sudoku board.",
      chess: "Step through a legal opening-style move list.",
      pong: "Advance the rally and steer the paddle."
    }[id] || "Playable local game.";
  }

  function gameActions(id) {
    if (id === "snake") return [{ id: "up", label: "Up" }, { id: "left", label: "Left" }, { id: "right", label: "Right" }, { id: "down", label: "Down", primary: true }];
    if (id === "tetris") return [{ id: "left", label: "Left" }, { id: "right", label: "Right" }, { id: "drop", label: "Drop", primary: true }];
    if (id === "2048") return [{ id: "left", label: "Left" }, { id: "right", label: "Right" }, { id: "up", label: "Up" }, { id: "down", label: "Down", primary: true }];
    if (id === "pong") return [{ id: "up", label: "Paddle Up" }, { id: "down", label: "Paddle Down" }, { id: "tick", label: "Tick", primary: true }];
    if (id === "chess") return [{ id: "move", label: "Next move", primary: true }];
    return [{ id: "hint", label: "Hint" }, { id: "auto", label: "Auto move", primary: true }];
  }

  function gameBoard(id, store) {
    if (id === "snake") return cells(64, (index) => store.snake.includes(index) ? "is-on" : index === store.food ? "is-food" : "");
    if (id === "tetris") return cells(64, (index) => store.landed.includes(index) || index === store.row * 8 + store.block ? "is-on" : "");
    if (id === "mines") return cells(25, (index) => store.revealed.includes(index) ? (store.mines.includes(index) ? "is-bad" : "is-safe") : "", true);
    if (id === "memory") return cells(8, (index) => store.open.includes(index) || store.found.includes(index) ? "is-on" : "", true, (index) => store.open.includes(index) || store.found.includes(index) ? store.values[index] : "?");
    if (id === "2048") return cells(16, (_index) => "", false, (index) => store.cells[index] || "");
    if (id === "sudoku") return cells(16, (index) => store.fixed.includes(index) ? "is-fixed" : "", true, (index) => store.cells[index] || "");
    if (id === "chess") return chessBoard(store.step || 0);
    return cells(96, (index) => index === store.ball ? "is-food" : Math.floor(index / 12) === Math.floor(store.paddle / 12) && index % 12 === 0 ? "is-on" : "");
  }

  function cells(count, classFor, clickable, labelFor) {
    return Array.from({ length: count }, (_item, index) => {
      const label = labelFor ? labelFor(index) : "";
      const attr = clickable ? ` data-game-cell="${index}"` : "";
      return `<button type="button"${attr} class="${classFor(index)}">${escapeHtml(label)}</button>`;
    }).join("");
  }

  function chessBoard(step) {
    const boards = [
      ["r", "n", "b", "q", "k", "b", "n", "r", "p", "p", "p", "p", "", "p", "p", "p", "", "", "", "", "p", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "P", "", "", "", "", "", "", "", "", "", "", "", "P", "P", "P", "P", "", "P", "P", "P", "R", "N", "B", "Q", "K", "B", "N", "R"],
      ["r", "n", "b", "q", "k", "b", "", "r", "p", "p", "p", "p", "", "p", "p", "p", "", "", "", "", "p", "n", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "P", "", "", "", "", "", "", "", "", "", "", "", "P", "P", "P", "P", "", "P", "P", "P", "R", "N", "B", "Q", "K", "B", "N", "R"]
    ];
    return cells(64, (index) => (Math.floor(index / 8) + index) % 2 ? "dark" : "light", false, (index) => boards[step % boards.length][index]);
  }

  function stepGame(id, store, action) {
    const next = { ...store };
    if (id === "snake") {
      const dirs = { up: -8, down: 8, left: -1, right: 1 };
      const head = (next.snake[next.snake.length - 1] + (dirs[action] || next.dir || 1) + 64) % 64;
      next.dir = dirs[action] || next.dir || 1;
      next.snake = [...next.snake.slice(1), head];
      if (head === next.food) {
        next.snake.unshift(next.snake[0]);
        next.food = (next.food + 17) % 64;
        next.score += 10;
      }
    } else if (id === "tetris") {
      if (action === "left") next.block = Math.max(0, next.block - 1);
      if (action === "right") next.block = Math.min(7, next.block + 1);
      if (action === "drop" || next.row >= 7) {
        next.landed = [...next.landed, next.row * 8 + next.block].slice(-18);
        next.row = 0;
        next.block = (next.block + 3) % 8;
        next.score += 5;
      } else {
        next.row += 1;
      }
    } else if (id === "2048") {
      next.cells = slide2048(next.cells, action);
      const empty = next.cells.findIndex((value) => value === 0);
      if (empty >= 0) next.cells[empty] = 2;
      next.score = sum(next.cells);
    } else if (id === "pong") {
      if (action === "up") next.paddle = Math.max(0, next.paddle - 12);
      if (action === "down") next.paddle = Math.min(84, next.paddle + 12);
      next.ball = (next.ball + next.vx + 96) % 96;
      if (next.ball % 12 === 0) next.score += 1;
    } else if (id === "chess") {
      next.step = (next.step + 1) % 2;
      next.score += 1;
    } else {
      next.score += 1;
    }
    return next;
  }

  function clickGameCell(id, store, index) {
    const next = { ...store };
    if (id === "mines") {
      next.revealed = [...new Set([...(next.revealed || []), index])];
      next.state = next.mines.includes(index) ? "Mine hit" : "Safe";
      next.score += next.mines.includes(index) ? 0 : 2;
    } else if (id === "memory") {
      if (!next.open.includes(index) && !next.found.includes(index)) next.open = [...next.open, index].slice(-2);
      if (next.open.length === 2 && next.values[next.open[0]] === next.values[next.open[1]]) {
        next.found = [...new Set([...next.found, ...next.open])];
        next.open = [];
        next.score += 4;
      }
    } else if (id === "sudoku" && !next.fixed.includes(index)) {
      next.cells[index] = ((next.cells[index] || 0) % 4) + 1;
      next.score = next.cells.filter(Boolean).length;
    }
    return next;
  }

  function slide2048(values, action) {
    const rows = [values.slice(0, 4), values.slice(4, 8), values.slice(8, 12), values.slice(12, 16)];
    const merge = function (row) {
      const compact = row.filter(Boolean);
      for (let i = 0; i < compact.length - 1; i += 1) {
        if (compact[i] === compact[i + 1]) {
          compact[i] *= 2;
          compact.splice(i + 1, 1);
        }
      }
      return [...compact, 0, 0, 0, 0].slice(0, 4);
    };
    if (action === "right") return rows.flatMap((row) => merge(row.reverse()).reverse());
    if (action === "up" || action === "down") {
      const cols = [0, 1, 2, 3].map((col) => rows.map((row) => row[col]));
      const merged = cols.map((col) => action === "down" ? merge(col.reverse()).reverse() : merge(col));
      return rows.flatMap((_row, rowIndex) => [0, 1, 2, 3].map((col) => merged[col][rowIndex]));
    }
    return rows.flatMap(merge);
  }

  function gameMessage(id, action, store) {
    if (action === "reset") return "Game reset.";
    return `${id} action ${action} complete. Score ${store.score || 0}.`;
  }

  window.SEIS_FUNCTIONAL_APP_IDS = FUNCTIONAL_APP_IDS;
  window.SEIS_ENHANCED_APP_IDS = ENHANCED_APP_IDS;
  window.SEIS_GAME_APP_IDS = GAME_APP_IDS;
  window.SEIS_FUNCTIONAL_APP_SPECS = SPECS;
  window.SEIS_RENDER_FUNCTIONAL_APP = renderFunctionalApp;
  window.SEIS_RENDER_FUNCTIONAL_GAME = renderFunctionalGame;
})();
