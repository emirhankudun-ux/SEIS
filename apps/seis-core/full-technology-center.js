const dataPaths = {
  registry: '../../content/development/seis-full-technology-registry.json',
  catalog: '../../content/development/seis-technology-tool-catalog.json',
  composer: '../../content/development/seis-workbench-composer.json',
  engines: '../../content/development/seis-engine-capability-registry.json',
  commandCenter: '../../content/development/seis-full-technology-command-center.json'
};

const state = {
  section: 'atlas',
  query: '',
  domain: 'all',
  selected: null,
  data: null
};

const sectionMeta = {
  atlas: ['TECHNOLOGY ATLAS', 'Find the right capability without tool sprawl.', 'Registry-backed domains and first-wave tools. Proposed tools remain visibly proposed.'],
  workbenches: ['WORKBENCH COMPOSER', 'Open focused tool sets from intent.', 'Workbenches cap primary tools and never auto-execute external actions.'],
  engines: ['ENGINE FOUNDATION', 'Inspect the first four engine families.', 'Game, Reality, 3D and Digital Human remain contract-first prototypes until runtime evidence exists.'],
  evidence: ['EVIDENCE BOUNDARY', 'Keep claims visibly separated by maturity.', 'Contract validation is useful evidence, but it is not runtime, packaging or production evidence.']
};

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

function matchesQuery(...values) {
  if (!state.query) return true;
  return values.join(' ').toLowerCase().includes(state.query);
}

function setSection(section) {
  state.section = section;
  $$('.rail-button').forEach((button) => button.classList.toggle('is-active', button.dataset.section === section));
  $$('.surface').forEach((surface) => surface.classList.toggle('is-active', surface.dataset.surface === section));
  const [kicker, title, summary] = sectionMeta[section];
  $('#section-kicker').textContent = kicker;
  $('#section-title').textContent = title;
  $('#section-summary').textContent = summary;
  $('#domain-filters').hidden = section !== 'atlas';
  renderCurrentSurface();
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

function renderWorkbenches() {
  const presets = state.data.composer.presets.filter((preset) => matchesQuery(preset.intent, preset.id, ...preset.domains, ...preset.tools));
  $('#workbench-list').innerHTML = presets.map((preset) => `
    <button class="workbench-row record-button" type="button" data-record-type="workbench" data-record-id="${escapeHtml(preset.id)}">
      <span><strong>${escapeHtml(humanize(preset.id))}</strong><small>${escapeHtml(preset.intent)}</small></span>
      <span class="domain-tags">${preset.domains.map((domain) => `<i>${escapeHtml(humanize(domain))}</i>`).join('')}</span>
      <span>${preset.tools.length} tools</span>
    </button>
  `).join('') || '<p class="empty-state">No matching workbenches.</p>';
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
    ['Verified runtime claims', state.data.commandCenter.summary.verifiedRuntimeClaims, 'Intentionally zero for this prototype slice.'],
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
  } else if (recordType === 'engine') {
    record = engines.engines.find((item) => item.id === id);
    title = record?.name;
    summary = `${humanize(record?.implementationClass)} · ${humanize(record?.maturity)}`;
    entries = [['Capabilities', record?.capabilities.map(humanize).join(', ')], ['Runtime evidence', 'not claimed'], ['Status', record?.maturity], ['Source', 'seis-engine-capability-registry.json']];
  }

  if (!record) return;
  state.selected = { recordType, id };
  $('#inspector-title').textContent = title;
  $('#inspector-summary').textContent = summary;
  $('#inspector-data').innerHTML = entries.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
}

function renderCurrentSurface() {
  if (!state.data) return;
  if (state.section === 'atlas') renderAtlas();
  if (state.section === 'workbenches') renderWorkbenches();
  if (state.section === 'engines') renderEngines();
  if (state.section === 'evidence') renderEvidence();
}

function render() {
  renderStats();
  renderFilters();
  setSection(state.section);
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
    }

    const recordButton = event.target.closest('[data-record-type][data-record-id]');
    if (recordButton) renderInspector(recordButton.dataset.recordType, recordButton.dataset.recordId);
  });

  $('#technology-search').addEventListener('input', (event) => {
    state.query = event.target.value.toLowerCase().trim();
    renderCurrentSurface();
  });
}

bindEvents();
loadData().catch((error) => {
  console.error(error);
  $('#error-state').hidden = false;
  $('.content-layout').hidden = true;
  $('.status-strip').hidden = true;
});
