const dataPaths = {
  registry: '../../content/development/seis-full-technology-registry.json',
  catalog: '../../content/development/seis-technology-tool-catalog.json',
  composer: '../../content/development/seis-workbench-composer.json',
  engines: '../../content/development/seis-engine-capability-registry.json',
  commandCenter: '../../content/development/seis-full-technology-command-center.json'
};

const storageKey = 'seis-full-technology-state-v2';

function loadStoredState() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

const storedState = loadStoredState();
const state = {
  section: storedState.section ?? 'atlas',
  query: '',
  domain: storedState.domain ?? 'all',
  selected: storedState.selected ?? null,
  activeWorkbenchId: storedState.activeWorkbenchId ?? null,
  activeCubeFace: storedState.activeCubeFace ?? 'intelligence',
  data: null
};

function saveStoredState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      section: state.section,
      domain: state.domain,
      selected: state.selected,
      activeWorkbenchId: state.activeWorkbenchId,
      activeCubeFace: state.activeCubeFace
    }));
  } catch {
    // Local persistence is optional. The browser-local experience remains usable in memory.
  }
}

const sectionMeta = {
  atlas: ['TECHNOLOGY ATLAS', 'Find the right capability without tool sprawl.', 'Registry-backed domains and first-wave tools. Proposed tools remain visibly proposed.'],
  cube: ['CUBE NAVIGATOR', 'Move through six technology faces without inventing system truth.', 'The Cube is an accessible projection of canonical domains, not proof of a live 3D runtime.'],
  workbenches: ['WORKBENCH COMPOSER', 'Open focused tool sets from intent.', 'Workbenches cap primary tools and never auto-execute external actions.'],
  engines: ['ENGINE FOUNDATION', 'Inspect the first four engine families.', 'Game, Reality, 3D and Digital Human remain contract-first prototypes until runtime evidence exists.'],
  evidence: ['EVIDENCE BOUNDARY', 'Keep claims visibly separated by maturity.', 'Contract validation is useful evidence, but it is not runtime, packaging or production evidence.']
};

const cubeFaces = [
  {
    id: 'intelligence',
    label: 'Intelligence',
    signal: 'AI, agents and digital-life intelligence.',
    accent: 'violet',
    domains: ['intelligence', 'digital-life']
  },
  {
    id: 'software',
    label: 'Software',
    signal: 'Code, platform and cross-device engineering.',
    accent: 'blue',
    domains: ['software', 'platform']
  },
  {
    id: 'creation',
    label: 'Creation',
    signal: 'Design, 3D, cinema and audio production.',
    accent: 'gold',
    domains: ['creation', 'cinema-audio']
  },
  {
    id: 'reality',
    label: 'Reality',
    signal: 'Game, world, rendering and simulation foundations.',
    accent: 'cyan',
    domains: ['reality', 'game']
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    signal: 'Data, cloud, security and operational systems.',
    accent: 'green',
    domains: ['data-knowledge', 'cloud-distributed', 'security-privacy']
  },
  {
    id: 'science',
    label: 'Science & Future',
    signal: 'Science, engineering, robotics, hardware and governance.',
    accent: 'amber',
    domains: ['science-math', 'engineering-manufacturing', 'robotics-autonomy', 'hardware-electronics', 'governance-research']
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function humanize(value) {
  return String(value ?? '').replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

async function loadData() {
  const [registry, catalog, composer, engines, commandCenter] = await Promise.all(
    Object.values(dataPaths).map(fetchJson)
  );
  state.data = { registry, catalog, composer, engines, commandCenter };
  validateClientProjection();
  normalizeStoredState();
  render();
}

function validateClientProjection() {
  const { registry, catalog, composer, engines, commandCenter } = state.data;
  const valid = registry.domains.length === commandCenter.summary.domainCount
    && catalog.tools.length === commandCenter.summary.toolCount
    && composer.presets.length === commandCenter.summary.workbenchCount
    && engines.engines.length === commandCenter.summary.engineFamilyCount
    && commandCenter.summary.verifiedRuntimeClaims === 0;
  if (!valid) throw new Error('Command Center projection is stale or inconsistent with canonical records.');
}

function normalizeStoredState() {
  if (!sectionMeta[state.section]) state.section = 'atlas';
  if (!state.data.registry.domains.some((domain) => domain.id === state.domain)) state.domain = 'all';
  if (!cubeFaces.some((face) => face.id === state.activeCubeFace)) state.activeCubeFace = cubeFaces[0].id;
  if (!state.data.composer.presets.some((preset) => preset.id === state.activeWorkbenchId)) state.activeWorkbenchId = null;
}

function matchesQuery(...values) {
  if (!state.query) return true;
  return values.join(' ').toLowerCase().includes(state.query);
}

function setSection(section) {
  state.section = sectionMeta[section] ? section : 'atlas';
  $$('.rail-button').forEach((button) => button.classList.toggle('is-active', button.dataset.section === state.section));
  $$('.surface').forEach((surface) => surface.classList.toggle('is-active', surface.dataset.surface === state.section));
  const [kicker, title, summary] = sectionMeta[state.section];
  $('#section-kicker').textContent = kicker;
  $('#section-title').textContent = title;
  $('#section-summary').textContent = summary;
  $('#domain-filters').hidden = state.section !== 'atlas';
  renderCurrentSurface();
  saveStoredState();
}

function renderStats() {
  const { commandCenter } = state.data;
  $('#stat-domains').textContent = commandCenter.summary.domainCount;
  $('#stat-capabilities').textContent = commandCenter.summary.capabilityCount;
  $('#stat-tools').textContent = commandCenter.summary.toolCount;
  $('#stat-workbenches').textContent = commandCenter.summary.workbenchCount;
  $('#stat-runtime').textContent = commandCenter.summary.verifiedRuntimeClaims;
}

function renderFilters() {
  const domains = state.data.registry.domains;
  $('#domain-filters').innerHTML = [
    ['all', 'All'],
    ...domains.map((domain) => [domain.id, domain.name])
  ].map(([id, label]) => `
    <button class="filter-chip ${state.domain === id ? 'is-active' : ''}" type="button" data-domain="${escapeHtml(id)}">${escapeHtml(label)}</button>
  `).join('');
}

function toolStatusClass(tool) {
  if (tool.validationState === 'contract-validated') return 'validated';
  if (tool.status === 'blocked' || tool.status === 'unavailable') return 'blocked';
  return 'proposed';
}

function renderAtlas() {
  const { registry, catalog } = state.data;
  const toolsByDomain = new Map();
  for (const tool of catalog.tools) {
    const list = toolsByDomain.get(tool.domain) ?? [];
    list.push(tool);
    toolsByDomain.set(tool.domain, list);
  }

  const visible = registry.domains.filter((domain) => {
    if (state.domain !== 'all' && state.domain !== domain.id) return false;
    const tools = toolsByDomain.get(domain.id) ?? [];
    return matchesQuery(domain.name, ...domain.capabilities, ...tools.flatMap((tool) => [tool.name, tool.capability, tool.status]));
  });

  $('#domain-list').innerHTML = visible.map((domain) => {
    const tools = (toolsByDomain.get(domain.id) ?? []).filter((tool) => matchesQuery(domain.name, tool.name, tool.capability, tool.status));
    return `
      <article class="domain-row">
        <button class="domain-heading record-button" type="button" data-record-type="domain" data-record-id="${escapeHtml(domain.id)}">
          <span><strong>${escapeHtml(domain.name)}</strong><small>${domain.capabilities.length} capabilities · ${tools.length} first-wave tools</small></span>
          <span aria-hidden="true">→</span>
        </button>
        <div class="tool-table" role="list">
          ${tools.map((tool) => `
            <button class="tool-row record-button" type="button" role="listitem" data-record-type="tool" data-record-id="${escapeHtml(tool.id)}">
              <span class="tool-name"><strong>${escapeHtml(tool.name)}</strong><small>${escapeHtml(humanize(tool.capability))}</small></span>
              <span>${escapeHtml(humanize(tool.implementationClass))}</span>
              <span class="state-dot ${toolStatusClass(tool)}">${escapeHtml(humanize(tool.validationState))}</span>
            </button>
          `).join('')}
        </div>
      </article>
    `;
  }).join('') || '<p class="empty-state">No matching technology records.</p>';
}

function renderCube() {
  const activeFace = cubeFaces.find((face) => face.id === state.activeCubeFace) ?? cubeFaces[0];
  const domainsById = new Map(state.data.registry.domains.map((domain) => [domain.id, domain]));

  $('#cube-navigator').innerHTML = cubeFaces.map((face, index) => `
    <button
      class="cube-face cube-face-${escapeHtml(face.accent)} ${face.id === activeFace.id ? 'is-active' : ''}"
      type="button"
      data-cube-face="${escapeHtml(face.id)}"
      aria-pressed="${face.id === activeFace.id}"
      tabindex="${face.id === activeFace.id ? '0' : '-1'}"
    >
      <span class="cube-face-index">0${index + 1}</span>
      <strong>${escapeHtml(face.label)}</strong>
      <small>${face.domains.length} domains</small>
    </button>
  `).join('');

  $('#cube-face-title').textContent = activeFace.label;
  $('#cube-face-summary').textContent = activeFace.signal;
  $('#cube-domain-list').innerHTML = activeFace.domains.map((domainId) => {
    const domain = domainsById.get(domainId);
    if (!domain) return '';
    return `
      <button class="cube-domain-button" type="button" data-cube-domain="${escapeHtml(domain.id)}">
        <span><strong>${escapeHtml(domain.name)}</strong><small>${domain.capabilities.length} canonical capabilities</small></span>
        <span aria-hidden="true">↗</span>
      </button>
    `;
  }).join('');
}

function selectCubeFace(faceId, focusFace = false) {
  if (!cubeFaces.some((face) => face.id === faceId)) return;
  state.activeCubeFace = faceId;
  saveStoredState();
  renderCube();
  renderInspector('cube', faceId);
  if (focusFace) $(`[data-cube-face="${faceId}"]`)?.focus();
}

function renderWorkbenches() {
  const presets = state.data.composer.presets.filter((preset) => matchesQuery(preset.intent, preset.id, ...preset.domains, ...preset.tools));
  $('#workbench-list').innerHTML = presets.map((preset) => `
    <article class="workbench-row ${preset.id === state.activeWorkbenchId ? 'is-active' : ''}">
      <button class="workbench-record record-button" type="button" data-record-type="workbench" data-record-id="${escapeHtml(preset.id)}">
        <span><strong>${escapeHtml(humanize(preset.id))}</strong><small>${escapeHtml(preset.intent)}</small></span>
        <span class="domain-tags">${preset.domains.map((domain) => `<i>${escapeHtml(humanize(domain))}</i>`).join('')}</span>
        <span>${preset.tools.length} tools</span>
      </button>
      <button class="launch-workbench" type="button" data-launch-workbench="${escapeHtml(preset.id)}">
        ${preset.id === state.activeWorkbenchId ? 'Loaded' : 'Load locally'}
      </button>
    </article>
  `).join('') || '<p class="empty-state">No matching workbenches.</p>';
}

function launchWorkbench(id) {
  const preset = state.data.composer.presets.find((item) => item.id === id);
  if (!preset) return;
  state.activeWorkbenchId = id;
  state.selected = { recordType: 'workbench', id };
  saveStoredState();
  renderActiveWorkbench();
  renderWorkbenches();
  renderInspector('workbench', id);
}

function closeWorkbench() {
  state.activeWorkbenchId = null;
  saveStoredState();
  renderActiveWorkbench();
  if (state.section === 'workbenches') renderWorkbenches();
}

function renderActiveWorkbench() {
  const panel = $('#active-workbench-panel');
  const preset = state.data?.composer.presets.find((item) => item.id === state.activeWorkbenchId);
  if (!preset) {
    panel.hidden = true;
    $('#active-workbench-tools').innerHTML = '';
    return;
  }

  panel.hidden = false;
  $('#active-workbench-title').textContent = humanize(preset.id);
  $('#workbench-status').textContent = `${preset.tools.length} tools loaded for local inspection. Zero tools executed; external actions still require approval.`;
  $('#active-workbench-tools').innerHTML = preset.tools.map((tool) => `
    <button class="workbench-tool" type="button" data-workbench-tool="${escapeHtml(tool)}">
      <span aria-hidden="true">◇</span>
      ${escapeHtml(humanize(tool))}
    </button>
  `).join('');
}

function exportReviewSnapshot() {
  const preset = state.data?.composer.presets.find((item) => item.id === state.activeWorkbenchId) ?? null;
  const snapshot = {
    version: 1,
    id: 'seis-full-technology-review-snapshot',
    generatedAt: new Date().toISOString(),
    mode: 'browser-local-review',
    sources: state.data.commandCenter.sourceOfTruth,
    summary: state.data.commandCenter.summary,
    activeCubeFace: state.activeCubeFace,
    activeWorkbench: preset ? {
      id: preset.id,
      intent: preset.intent,
      domains: preset.domains,
      tools: preset.tools
    } : null,
    selectedRecord: state.selected,
    executionTruth: {
      toolsExecuted: 0,
      externalWrites: 0,
      providerCalls: 0,
      credentialsRead: 0
    }
  };

  const blob = new Blob([`${JSON.stringify(snapshot, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `seis-full-technology-review-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function renderEngines() {
  const engines = state.data.engines.engines.filter((engine) => matchesQuery(engine.name, engine.id, engine.maturity, ...engine.capabilities));
  $('#engine-list').innerHTML = engines.map((engine) => `
    <button class="engine-row record-button" type="button" data-record-type="engine" data-record-id="${escapeHtml(engine.id)}">
      <span><strong>${escapeHtml(engine.name)}</strong><small>${escapeHtml(humanize(engine.implementationClass))}</small></span>
      <span>${engine.capabilities.length} capability contracts</span>
      <span class="state-dot proposed">${escapeHtml(humanize(engine.maturity))}</span>
    </button>
  `).join('') || '<p class="empty-state">No matching engine records.</p>';
}

function renderEvidence() {
  const validated = state.data.catalog.tools.filter((tool) => tool.validationState === 'contract-validated').length;
  const proposed = state.data.catalog.tools.length - validated;
  const rows = [
    ['Contract-validated tools', validated, 'Validator-backed metadata contracts only.'],
    ['Unverified/proposed tools', proposed, 'Visible in the catalog but not claimed as implemented runtime behavior.'],
    ['Browser-local interaction', 'Available', 'Cube navigation, Workbench composition and review export run locally without external execution.'],
    ['Verified engine runtime claims', state.data.commandCenter.summary.verifiedRuntimeClaims, 'Intentionally zero for this prototype slice.'],
    ['Goal binding', 'Unresolved', 'SEIS-GOAL-021 is conversation intent until the canonical Goal registry creates or maps it.'],
    ['External writes', 'Denied', 'First-wave tool records cannot enable external writes.'],
    ['Credentials', 'Not stored', 'Technology registry records never store credential values.']
  ];
  $('#evidence-list').innerHTML = rows.map(([name, value, detail]) => `
    <article class="evidence-row">
      <span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(detail)}</small></span>
      <b>${escapeHtml(value)}</b>
    </article>
  `).join('');
}

function renderInspector(recordType, id) {
  const { registry, catalog, composer, engines } = state.data;
  let record;
  let title;
  let summary;
  let entries = [];
  let actions = '';

  if (recordType === 'domain') {
    record = registry.domains.find((item) => item.id === id);
    title = record?.name;
    summary = 'Technology domain from the Full Technology Registry.';
    entries = [['Capabilities', record?.capabilities.map(humanize).join(', ')], ['Source', 'seis-full-technology-registry.json']];
  } else if (recordType === 'tool') {
    record = catalog.tools.find((item) => item.id === id);
    title = record?.name;
    summary = `${humanize(record?.implementationClass)} · ${humanize(record?.maturity)} · ${humanize(record?.status)}`;
    entries = [['Domain', humanize(record?.domain)], ['Capability', humanize(record?.capability)], ['Validation', humanize(record?.validationState)], ['Platforms', record?.platforms.join(', ')], ['Filesystem', record?.permissions.filesystem], ['Network', record?.permissions.network], ['External write', String(record?.permissions.externalWrite)], ['Fallback', record?.fallback], ['Owner', record?.owner]];
  } else if (recordType === 'workbench') {
    record = composer.presets.find((item) => item.id === id);
    title = humanize(record?.id);
    summary = record?.intent;
    entries = [['Domains', record?.domains.map(humanize).join(', ')], ['Tools', record?.tools.map(humanize).join(', ')], ['Auto execute', 'false'], ['External actions', 'approval required']];
    actions = `<button class="inspector-action" type="button" data-launch-workbench="${escapeHtml(id)}">Load this Workbench</button>`;
  } else if (recordType === 'engine') {
    record = engines.engines.find((item) => item.id === id);
    title = record?.name;
    summary = `${humanize(record?.implementationClass)} · ${humanize(record?.maturity)}`;
    entries = [['Capabilities', record?.capabilities.map(humanize).join(', ')], ['Runtime evidence', 'not claimed'], ['Status', record?.maturity], ['Source', 'seis-engine-capability-registry.json']];
  } else if (recordType === 'cube') {
    record = cubeFaces.find((item) => item.id === id);
    title = record?.label;
    summary = record?.signal;
    entries = [['Domains', record?.domains.map(humanize).join(', ')], ['Evidence', 'canonical domain projection'], ['Renderer', 'accessible HTML/CSS fallback'], ['Runtime truth', 'not inferred']];
  } else if (recordType === 'workbench-tool') {
    record = { id, name: humanize(id) };
    title = record.name;
    summary = 'Tool slot loaded inside the active Workbench for inspection only.';
    entries = [['Execution', 'not performed'], ['External write', 'denied'], ['Activation', 'requires a future capability adapter and permission resolution']];
  }

  if (!record) return false;
  state.selected = { recordType, id };
  saveStoredState();
  $('#inspector-title').textContent = title;
  $('#inspector-summary').textContent = summary;
  $('#inspector-data').innerHTML = entries.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  $('#inspector-actions').innerHTML = actions;
  return true;
}

function renderCurrentSurface() {
  if (!state.data) return;
  if (state.section === 'atlas') renderAtlas();
  if (state.section === 'cube') renderCube();
  if (state.section === 'workbenches') renderWorkbenches();
  if (state.section === 'engines') renderEngines();
  if (state.section === 'evidence') renderEvidence();
}

function render() {
  renderStats();
  renderFilters();
  setSection(state.section);
  renderActiveWorkbench();
  if (state.selected && !renderInspector(state.selected.recordType, state.selected.id)) {
    state.selected = null;
    saveStoredState();
  }
}

function isTextInput(target) {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const sectionButton = event.target.closest('[data-section]');
    if (sectionButton) setSection(sectionButton.dataset.section);

    const domainButton = event.target.closest('[data-domain]');
    if (domainButton) {
      state.domain = domainButton.dataset.domain;
      renderFilters();
      renderAtlas();
      saveStoredState();
    }

    const cubeFaceButton = event.target.closest('[data-cube-face]');
    if (cubeFaceButton) selectCubeFace(cubeFaceButton.dataset.cubeFace, true);

    const cubeDomainButton = event.target.closest('[data-cube-domain]');
    if (cubeDomainButton) {
      state.domain = cubeDomainButton.dataset.cubeDomain;
      setSection('atlas');
      renderFilters();
      renderAtlas();
      renderInspector('domain', state.domain);
    }

    const launchButton = event.target.closest('[data-launch-workbench]');
    if (launchButton) launchWorkbench(launchButton.dataset.launchWorkbench);

    const workbenchTool = event.target.closest('[data-workbench-tool]');
    if (workbenchTool) renderInspector('workbench-tool', workbenchTool.dataset.workbenchTool);

    const recordButton = event.target.closest('[data-record-type][data-record-id]');
    if (recordButton) renderInspector(recordButton.dataset.recordType, recordButton.dataset.recordId);
  });

  $('#technology-search').addEventListener('input', (event) => {
    state.query = event.target.value.toLowerCase().trim();
    renderCurrentSurface();
  });

  $('#close-workbench').addEventListener('click', closeWorkbench);
  $('#export-snapshot').addEventListener('click', exportReviewSnapshot);

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !isTextInput(event.target)) {
      event.preventDefault();
      $('#technology-search').focus();
      return;
    }

    if (state.section === 'cube' && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      const currentIndex = Math.max(0, cubeFaces.findIndex((face) => face.id === state.activeCubeFace));
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + cubeFaces.length) % cubeFaces.length;
      selectCubeFace(cubeFaces[nextIndex].id, true);
      return;
    }

    if (event.key === 'Escape') {
      if (state.query) {
        state.query = '';
        $('#technology-search').value = '';
        renderCurrentSurface();
      } else if (state.activeWorkbenchId) {
        closeWorkbench();
      }
    }
  });
}

bindEvents();
loadData().catch((error) => {
  console.error(error);
  $('#error-state').hidden = false;
  $('.content-layout').hidden = true;
  $('.status-strip').hidden = true;
  $('#active-workbench-panel').hidden = true;
});
