(function () {
  "use strict";

  const pages = {
    overview: {
      title: "SEIS Website",
      eyebrow: "Product website hub",
      subtitle: "A premium local website map for SEIS AI, OS, Code, Design, Data, Search, Cloud, Store, and Agents.",
      pageStatus: "Local website pages. No provider key, SSH command, deployment, or external API call required.",
      cta: ["Open SEIS OS", "../seis-linux-replica.html?demo=live"],
      secondary: ["Open Search", "../desktop.html#search"],
      stats: [["10", "website pages"], ["0", "core API keys"], ["Local", "demo boundary"], ["190", "WOW references"]],
      capabilities: [
        ["Unified story", "Explains the full ecosystem without requiring the user to read governance docs first."],
        ["Product routes", "Each core product lane has its own static page and direct OS route."],
        ["Truthful states", "Mock, planned, disabled, and local demo boundaries are stated as product copy."],
        ["Runnable handoff", "All pages are included in the static package and can run from the local server."]
      ],
      proof: ["desktop.html", "seis-code.html", "wow-gallery.html", "mythic-gacha.html"],
      related: ["seis-ai", "seis-os", "seis-code", "seis-design", "seis-data", "seis-search", "seis-cloud", "seis-store", "seis-agents"]
    },
    "seis-ai": {
      title: "SEIS AI",
      eyebrow: "AI Core application layer",
      subtitle: "Provider-neutral AI command center with Local Demo mode, model-router concepts, agent status, plugin awareness, and no-key operation.",
      pageStatus: "Current page is local demo evidence. Live provider routing remains disabled until backend credentials and gateway validation exist.",
      cta: ["Open AI Center", "../desktop.html#ai-assistant"],
      secondary: ["Open AI Core 3D", "../ai-core-demo/index.html"],
      stats: [["Local Demo", "provider identity"], ["6", "profile lanes"], ["5", "version targets"], ["0", "browser keys"]],
      capabilities: [
        ["Model router concept", "Routes are described by capability, privacy, provider status, cost, and fallback."],
        ["Agent activity", "Architect, Code, Design, Security, Cloud, Documentation, and QA roles are visible as bounded lanes."],
        ["Plugin awareness", "Installed AI profile matrix keeps unavailable providers marked Missing Key or Disabled."],
        ["Truthful fallback", "The Claude-style command remains Local Demo unless Anthropic is configured server-side."]
      ],
      proof: ["SEIS_INSTALLED_AI_CORE_ROUTE_MATRIX", "Local Demo", "Missing Key", "Disabled"],
      related: ["seis-os", "seis-search", "seis-code", "seis-agents"]
    },
    "seis-os": {
      title: "SEIS OS",
      eyebrow: "Desktop operating surface",
      subtitle: "Linux-like flexibility, macOS-level polish, and Windows-like productivity expressed as an original SEIS browser OS.",
      pageStatus: "Browser-contained OS demo. It is not a host OS replacement and does not execute privileged system commands.",
      cta: ["Open Live SEIS OS", "../seis-linux-replica.html?demo=live"],
      secondary: ["Open Classic Desktop", "../desktop.html#seis-system-os"],
      stats: [["286", "apps"], ["219", "reference modules"], ["3", "smoked entry modes"], ["0", "provider keys"]],
      capabilities: [
        ["Window manager", "Draggable, resizable, snapped, minimized, restored, and persisted app windows."],
        ["System shell", "Top bar, dock, launcher, command palette, recents, notifications, quick settings, and wallpapers."],
        ["Virtual files", "Files, Terminal, SEIS Code, and exports share one browser-local VFS."],
        ["Responsive mode", "Desktop windows collapse to a usable mobile shell with no horizontal overflow."]
      ],
      proof: ["check:seis-linux-replica-browser-smoke", "summary.json", "seis-linux-replica.html?demo=live", "desktop.html"],
      related: ["seis-code", "seis-search", "seis-store", "seis-cloud"]
    },
    "seis-code": {
      title: "SEIS Code",
      eyebrow: "Browser IDE",
      subtitle: "A SEIS-branded VS Code-style workspace with editor, terminal, route awareness, extensions, source control mock mode, and VFS persistence.",
      pageStatus: "Current route is browser-safe. Native binary execution and real repository mutation are not claimed.",
      cta: ["Open SEIS Code", "../seis-code.html"],
      secondary: ["Open Code in OS", "../desktop.html#seis-code"],
      stats: [["25", "language modes"], ["8", "top menus"], ["5", "activity views"], ["IndexedDB", "persistence"]],
      capabilities: [
        ["Explorer", "Open, edit, save, and mirror files from the SEIS Desktop workspace."],
        ["Terminal", "Browser-safe commands operate on the virtual file system."],
        ["Extensions", "Local extension catalog supports install, enable, disable, and persistence."],
        ["AI assistant", "Local Demo code assistant keeps provider identity visible and no-key by default."]
      ],
      proof: ["check:seis-code", "seis-code.html", "seis-code.js", "Desktop bridge smoke"],
      related: ["seis-os", "seis-ai", "seis-design", "seis-search"]
    },
    "seis-design": {
      title: "SEIS Design",
      eyebrow: "Creative studio",
      subtitle: "A premium design lane for product pages, video heroes, Mythic Gacha, design tokens, visual references, and handoff artifacts.",
      pageStatus: "Runtime image generation is not required. Imported references remain labeled as reference material.",
      cta: ["Open Design Studio", "../desktop.html#seis-design"],
      secondary: ["Open WOW Gallery", "../wow-gallery.html"],
      stats: [["4", "video heroes"], ["60", "mythic cards"], ["190", "WOW pages"], ["Local", "assets"]],
      capabilities: [
        ["Design system", "Tokens, component cards, typography, colors, and prototype previews are surfaced as product controls."],
        ["Cinematic pages", "Nature, Still Life, Materials, and Metal Parts routes carry the video hero story."],
        ["Mythic game", "Gacha and bestiary provide an artful playable product surface with no live generation key."],
        ["Handoff", "Design state saves into the shared virtual file system for SEIS Code and Terminal."]
      ],
      proof: ["check:video-hero-showcase", "check:mythic-gacha", "wow-gallery.html", "SEIS_WOW imports"],
      related: ["seis-code", "seis-data", "seis-store", "seis-ai", "seis-os"]
    },
    "seis-data": {
      title: "SEIS Data",
      eyebrow: "Registry and provenance lane",
      subtitle: "A schema-backed data surface for evidence, records, freshness, SEIS-SSH public review artifacts, and deterministic local exports.",
      pageStatus: "Current page is read-only Local Demo evidence. Live databases, live SSH proof, and GitHub mutation remain disabled until separately validated.",
      cta: ["Open SEIS Data", "../desktop.html#seis-data"],
      secondary: ["Open Cloud Center", "../desktop.html#seis-cloud"],
      stats: [["Validated", "registry mode"], ["4", "curated records"], ["22", "port preserved"], ["0", "browser secrets"]],
      capabilities: [
        ["Schema registry", "Tracks repository-backed JSON records, validation commands, freshness rules, and safe boundaries."],
        ["SSH evidence", "Carries the same SEIS-SSH alias, host-kind, and port evidence shown in SEIS Cloud without claiming live SSH."],
        ["Goal and provenance ledgers", "Links deterministic evidence and goal records into one exportable data lane."],
        ["Plugin binding", "Connects the personal seis-data bridge, status tool, and plan tool without runtime mutation."]
      ],
      proof: ["content/development/seis-data-schema-registry.json", "docs/data/seis-data-foundation.md", "deploy/seis-ssh-public-access-contract.json", "content/development/seis-ssh-live-readiness-evidence.json"],
      related: ["seis-search", "seis-cloud", "seis-code", "seis-agents"]
    },
    "seis-search": {
      title: "SEIS Search",
      eyebrow: "Search engine and gateway",
      subtitle: "A local SEIS search engine that finds AI, Web, Code, Design, Cloud, Apps, Plugins, Files, routes, and references.",
      pageStatus: "Search results are local demo data unless a live search provider is explicitly configured and validated.",
      cta: ["Open SEIS Search", "../desktop.html#search"],
      secondary: ["Open Website Hub", "./index.html"],
      stats: [["Apps", "local catalog"], ["Files", "VFS"], ["Routes", "website map"], ["Mock", "web results"]],
      capabilities: [
        ["Tabs by lane", "AI, Web, Code, Design, Cloud, Apps, Plugins, and Files are represented in the gateway."],
        ["Route opening", "Search launches SEIS Code, Design, Cloud, Website pages, WOW Gallery, and AI Core routes."],
        ["Snapshot export", "Search state can be saved into Documents as a local artifact."],
        ["Truth boundary", "Mock results are explicitly local and do not imply external web crawling."]
      ],
      proof: ["DEMO_ROUTES", "Search gateway map", "command palette", "launcher route board"],
      related: ["seis-ai", "seis-code", "seis-design", "seis-data", "seis-cloud"]
    },
    "seis-cloud": {
      title: "SEIS Cloud",
      eyebrow: "Cloud and SSH safety center",
      subtitle: "A controlled cloud readiness page for sync, deployments, repositories, SSH status, logs, backups, agents, health, and usage metrics.",
      pageStatus: "SSH, deployment, provider keys, and cloud mutation are disabled unless explicitly approved and validated.",
      cta: ["Open Cloud Center", "../desktop.html#seis-cloud"],
      secondary: ["Open Terminal", "../desktop.html#terminal"],
      stats: [["Disabled", "SSH execution"], ["Missing Key", "providers"], ["Planned", "deployment"], ["Local", "preflight"]],
      capabilities: [
        ["SSH boundary", "Private keys never enter the browser, docs, prompts, localStorage, or IndexedDB."],
        ["Deployment status", "Release and deployment remain planned until PR, validation, rollback, and approval gates are met."],
        ["Health cards", "Local preflight distinguishes connected, mock, disabled, planned, and unknown states."],
        ["Audit posture", "Cloud handoff writes safe local artifacts without external mutation."]
      ],
      proof: ["seis-cloud local preflight", "SECURITY.md", "approval required", "no SSH execution"],
      related: ["seis-os", "seis-ai", "seis-data", "seis-agents", "seis-store"]
    },
    "seis-store": {
      title: "SEIS Store",
      eyebrow: "Apps, plugins, agents, themes",
      subtitle: "A local App Store-style catalog for SEIS apps, website routes, local extensions, AI agents, themes, and developer tools.",
      pageStatus: "Install, enable, disable, and update states are browser-local. No purchases or dependency installation occur.",
      cta: ["Open SEIS Store", "../desktop.html#seis-store"],
      secondary: ["Open Launchpad", "../desktop.html#launchpad"],
      stats: [["Installed", "core apps"], ["Available", "website routes"], ["Local", "extensions"], ["No", "payments"]],
      capabilities: [
        ["App catalog", "SEIS System OS, Code, Design, Cloud, Music, WOW Gallery, Mythic Gacha, and Video Heroes are surfaced."],
        ["Plugin lane", "Extensions remain local catalog state until signed package and permission policy exists."],
        ["Persistence", "Install state is saved in browser-local app data and can be exported as JSON."],
        ["Governance", "No unrestricted MCP tool or external installation is hidden behind a store button."]
      ],
      proof: ["SEIS_STORE_ITEMS", "Extensions Manager", "App Center", "Store catalog export"],
      related: ["seis-os", "seis-design", "seis-code", "seis-agents"]
    },
    "seis-agents": {
      title: "SEIS Agents",
      eyebrow: "Human-governed agent system",
      subtitle: "A status-first agent runtime concept for Architect, Code, Design, Search, Security, DevOps, Documentation, QA, Cloud, and Automation lanes.",
      pageStatus: "Agents are status/plan/local dry-run surfaces. They do not autonomously write, deploy, push, or approve privileged actions.",
      cta: ["Open Sub-Agent Control", "../desktop.html#sub-agent-control"],
      secondary: ["Open AI Center", "../desktop.html#ai-assistant"],
      stats: [["20", "quarters"], ["6", "lanes"], ["32", "MCP tools in evidence"], ["Dry-run", "only"]],
      capabilities: [
        ["Role contracts", "Each lane has purpose, allowed actions, denied actions, approvals, and validation expectations."],
        ["Five-year map", "The local demo compresses roadmap visibility without claiming elapsed execution."],
        ["Approval gates", "Destructive, SSH, deployment, credentials, and GitHub write actions require human approval."],
        ["Evidence export", "Process ledger and dry-run artifacts save into the VFS for review."]
      ],
      proof: ["Sub-Agent Control", "five-year evidence", "agent runtime fixtures", "approval boundaries"],
      related: ["seis-ai", "seis-cloud", "seis-search", "seis-os"]
    }
  };

  const navOrder = ["overview", "seis-ai", "seis-os", "seis-code", "seis-design", "seis-data", "seis-search", "seis-cloud", "seis-store", "seis-agents"];
  const root = document.querySelector("[data-product-page]");
  if (!root) return;

  const pageId = root.dataset.page || "overview";
  const page = pages[pageId] || pages.overview;
  document.title = `${page.title} - SEIS Website`;
  const description = document.querySelector("meta[name='description']");
  if (description) description.setAttribute("content", page.subtitle);

  root.innerHTML = renderPage(pageId, page);
  bindActions(pageId, page);

  function renderPage(id, pageData) {
    return `<div class="site-shell">
      <header class="site-header">
        <a class="brand" href="./index.html" aria-label="SEIS Website home">
          <span class="brand-mark" aria-hidden="true">S</span>
          <span>SEIS</span>
        </a>
        <nav class="site-nav" aria-label="SEIS website pages">
          ${navOrder.map((navId) => `<a href="./${navId === "overview" ? "index" : navId}.html"${navId === id ? ' aria-current="page"' : ""}>${escapeHtml(pages[navId].title.replace("SEIS ", ""))}</a>`).join("")}
        </nav>
        <div class="header-actions">
          <a href="../seis-linux-replica.html?demo=live">OS</a>
          <a class="primary-action" href="../desktop.html#search">Search</a>
        </div>
      </header>
      <main>
        <section class="hero">
          <div>
            <p class="eyebrow">${escapeHtml(pageData.eyebrow)}</p>
            <h1>${escapeHtml(pageData.title)}</h1>
            <p class="lede">${escapeHtml(pageData.subtitle)}</p>
            <div class="hero-actions">
              <a class="primary-action" href="${escapeAttr(pageData.cta[1])}">${escapeHtml(pageData.cta[0])}</a>
              <a href="${escapeAttr(pageData.secondary[1])}">${escapeHtml(pageData.secondary[0])}</a>
              <button type="button" data-copy-brief>Copy page brief</button>
            </div>
          </div>
          <aside class="system-card" aria-label="${escapeAttr(pageData.title)} status preview">
            <div class="system-card-body">
              <p class="eyebrow">Status</p>
              <p>${escapeHtml(pageData.pageStatus)}</p>
              <div class="status-list">
                ${pageData.stats.map(([value, label]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}
              </div>
            </div>
          </aside>
        </section>
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Capabilities</p>
            <h2>What this page makes visible.</h2>
            <p>Every page is part of the same local SEIS demo and links back into the operating shell.</p>
          </div>
          <div class="capability-grid">
            ${pageData.capabilities.map(([title, body], index) => `<article class="capability-card">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(body)}</p>
            </article>`).join("")}
          </div>
        </section>
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Five-year path</p>
            <h2>Roadmap stays visible without overclaiming.</h2>
          </div>
          <div class="roadmap-grid">
            ${[
              ["Year 1", "Working demo: Desktop OS, Local AI, Search, Code, Design, Cloud mock, Store, Music, Website, docs."],
              ["Year 2", "Alpha: plugin system, provider router, local model support, repository intelligence, auth, safe sync."],
              ["Year 3", "Beta: team collaboration, advanced IDE, advanced design studio, marketplace, deployment system."],
              ["Year 4", "Platform: enterprise security, observability, multi-user workspaces, automation, remote workspace management."],
              ["Year 5", "Full ecosystem: creative OS, agent platform, local/cloud AI, SEIS Universe research, public readiness."]
            ].map(([title, body]) => `<article class="roadmap-card"><span>${escapeHtml(title)}</span><p>${escapeHtml(body)}</p></article>`).join("")}
          </div>
        </section>
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Open related pages</p>
            <h2>Move through the ecosystem.</h2>
          </div>
          <div class="route-grid">
            ${pageData.related.map((relatedId) => `<article class="route-card">
              <div>
                <h3>${escapeHtml(pages[relatedId].title)}</h3>
                <p>${escapeHtml(pages[relatedId].subtitle)}</p>
              </div>
              <a href="./${escapeAttr(relatedId)}.html">Open</a>
            </article>`).join("")}
          </div>
        </section>
        <section class="section">
          <div class="section-heading">
            <p class="eyebrow">Evidence</p>
            <h2>Current proof is local and explicit.</h2>
          </div>
          <div class="proof-grid">
            ${pageData.proof.map((item) => `<article class="proof-card"><span>Evidence</span><p>${escapeHtml(item)}</p></article>`).join("")}
          </div>
          <div class="copy-card">
            <div>
              <h3>Shareable brief</h3>
              <p>${escapeHtml(pageData.subtitle)}</p>
              <p class="page-status" data-page-status></p>
            </div>
            <button type="button" data-copy-brief>Copy</button>
          </div>
        </section>
      </main>
      <footer class="site-footer">
        <span>SEIS Website local demo</span>
        <span>Mock and planned states remain labeled. Core product runs without cloud keys.</span>
      </footer>
    </div>`;
  }

  function bindActions(id, pageData) {
    const status = document.querySelector("[data-page-status]");
    document.querySelectorAll("[data-copy-brief]").forEach((button) => {
      button.addEventListener("click", async () => {
        const text = `${pageData.title}: ${pageData.subtitle}`;
        try {
          await navigator.clipboard?.writeText(text);
          setStatus(status, "Brief copied.");
        } catch {
          localStorage.setItem(`seis.website.${id}.brief`, text);
          setStatus(status, "Brief saved locally.");
        }
      });
    });
  }

  function setStatus(node, message) {
    if (!node) return;
    node.textContent = message;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
