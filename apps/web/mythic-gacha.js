const DB_NAME = "seis-mythic-gacha";
const DB_VERSION = 1;
const STORE_NAME = "state";
const STATE_KEY = "mythic-progress";
const ART_ATLAS_PATH = "./public/media/mythic/shan-hai-creature-atlas.png";
const CODE_WORKSPACE_DB_NAME = "seis-code-workspace-v1";
const CODE_WORKSPACE_DB_VERSION = 1;
const CODE_WORKSPACE_ROOT = "/workspace";
const MYTHIC_ARCHIVE_DIR = `${CODE_WORKSPACE_ROOT}/MythicArchive`;
const CODE_WORKSPACE_CHANNEL = "seis-code-workspace";

const rarities = [
  { name: "Common", weight: 58, duplicateJade: 8 },
  { name: "Uncommon", weight: 25, duplicateJade: 16 },
  { name: "Rare", weight: 12, duplicateJade: 32 },
  { name: "Epic", weight: 4, duplicateJade: 80 },
  { name: "Legendary", weight: 1, duplicateJade: 220 }
];

const creatureSeeds = [
  ["SHJ-001", "Moss-Horn Yao", "Yao of moss horn", "Common", "Mountain", "West Ridge", "gentle sentinel", "rings hidden springs from stone"],
  ["SHJ-002", "Glass-Tail Lu", "Lu of glass tail", "Common", "River", "Mirror Ford", "watchful swimmer", "turns moonlight into ferry paths"],
  ["SHJ-003", "Cinder Finch Kui", "Kui of cinder wing", "Common", "Ember", "Ash Orchard", "restless singer", "keeps warm coals alive in rain"],
  ["SHJ-004", "Jade-Mane Shan", "Shan of jade mane", "Common", "Jade", "Green Gate", "patient guardian", "hears footsteps through roots"],
  ["SHJ-005", "Reed-Ear Pan", "Pan of reed ear", "Common", "River", "Nine Reed Marsh", "shy listener", "stores river gossip in shells"],
  ["SHJ-006", "Mist-Paw Hu", "Hu of mist paw", "Common", "Mist", "Cloud Basin", "quiet wanderer", "walks across dawn fog"],
  ["SHJ-007", "Copper-Beak Yi", "Yi of copper beak", "Common", "Thunder", "Old Bell Peak", "stern messenger", "strikes warning notes from cliffs"],
  ["SHJ-008", "Snow-Scale Mao", "Mao of snow scale", "Common", "Mountain", "White Pass", "calm watcher", "hides trails under fresh frost"],
  ["SHJ-009", "Lantern-Tooth Bo", "Bo of lantern tooth", "Common", "Ember", "Red Shrine", "curious prowler", "lights safe paths at dusk"],
  ["SHJ-010", "Pearl-Back Niao", "Niao of pearl back", "Common", "River", "Pearl Current", "bright diver", "finds lost names under water"],
  ["SHJ-011", "Ink-Shoulder Yan", "Yan of ink shoulder", "Common", "Mist", "Scripture Vale", "solemn keeper", "darkens false maps"],
  ["SHJ-012", "Stone-Brow Zhu", "Zhu of stone brow", "Common", "Mountain", "North Stair", "stubborn builder", "holds terraces against storms"],
  ["SHJ-013", "Silk-Wing Luo", "Luo of silk wing", "Uncommon", "Mist", "Mulberry Hollow", "elegant glider", "weaves wind into warning banners"],
  ["SHJ-014", "Jade-Eye Qilin", "Qilin of jade eye", "Uncommon", "Jade", "Hidden Court", "noble observer", "sees a lie before it is spoken"],
  ["SHJ-015", "Thunder-Rib Ao", "Ao of thunder rib", "Uncommon", "Thunder", "Storm Gate", "bold striker", "beats clouds into rain"],
  ["SHJ-016", "Ochre-Fang Rui", "Rui of ochre fang", "Uncommon", "Ember", "Clay Kiln Hill", "protective hunter", "tempers raw earth into shelter"],
  ["SHJ-017", "Moon-Gill Shen", "Shen of moon gill", "Uncommon", "River", "Tide Archive", "lucid dreamer", "breathes through reflected stars"],
  ["SHJ-018", "Pine-Spine Wu", "Wu of pine spine", "Uncommon", "Mountain", "Ancient Pine Road", "enduring climber", "anchors slopes with green needles"],
  ["SHJ-019", "Vermilion Qu", "Qu of vermilion crest", "Uncommon", "Ember", "Seal Terrace", "ceremonial caller", "opens ritual doors with a cry"],
  ["SHJ-020", "Fog-Antler Si", "Si of fog antler", "Uncommon", "Mist", "Antler Cloud", "soft-footed guide", "parts mist without tearing it"],
  ["SHJ-021", "Bronze-Shell Gui", "Gui of bronze shell", "Uncommon", "Thunder", "Drum Lake", "armored elder", "stores storm echoes in its shell"],
  ["SHJ-022", "Jade-Thread E", "E of jade thread", "Uncommon", "Jade", "Needle Ravine", "precise mender", "repairs cracked talismans"],
  ["SHJ-023", "Salt-Wing Hai", "Hai of salt wing", "Uncommon", "River", "Eastern Shoal", "wide-ranging scout", "reads tides before moonrise"],
  ["SHJ-024", "Ash-Root Qiu", "Qiu of ash root", "Uncommon", "Ember", "Burnt Cedar Field", "patient survivor", "grows medicine after wildfire"],
  ["SHJ-025", "Mirror-Horn Xun", "Xun of mirror horn", "Rare", "Jade", "Clear Mirror Gorge", "truthful oracle", "reflects the face of hidden intent"],
  ["SHJ-026", "Cloud-Bell Yong", "Yong of cloud bell", "Rare", "Thunder", "Bell Summit", "distant herald", "summons rain with low bronze notes"],
  ["SHJ-027", "Tide-Mask Lan", "Lan of tide mask", "Rare", "River", "Blue Estuary", "masked diplomat", "negotiates with flood spirits"],
  ["SHJ-028", "Ink-Bone Hei", "Hei of ink bone", "Rare", "Mist", "Black Scroll Ridge", "grave archivist", "records vanished roads in bone script"],
  ["SHJ-029", "Flame-Antler Yanlu", "Yanlu of flame antler", "Rare", "Ember", "South Furnace", "fierce defender", "burns curses from thresholds"],
  ["SHJ-030", "Granite-Wing Pengshi", "Pengshi of granite wing", "Rare", "Mountain", "Stone Sky", "immovable flyer", "carries boulders through wind"],
  ["SHJ-031", "Jade-Lung Nü", "Nü of jade lung", "Rare", "Jade", "Breathing Garden", "healing keeper", "exhales green light over wounds"],
  ["SHJ-032", "Rain-Drum Bao", "Bao of rain drum", "Rare", "Thunder", "Monsoon Step", "joyful caller", "keeps drought from old fields"],
  ["SHJ-033", "Mist-Scale Cang", "Cang of mist scale", "Rare", "Mist", "Blue Fog Shrine", "secretive swimmer", "vanishes between two breaths"],
  ["SHJ-034", "River-Glass Yu", "Yu of river glass", "Rare", "River", "Glass Delta", "clear-minded judge", "shows the honest shape of water"],
  ["SHJ-035", "Mountain-Script Ji", "Ji of mountain script", "Rare", "Mountain", "Carved Wall", "ancient reader", "deciphers strata as memory"],
  ["SHJ-036", "Coal-Crown Huo", "Huo of coal crown", "Rare", "Ember", "Night Kiln", "royal ember", "guards sleeping winter fire"],
  ["SHJ-037", "White-Jade Luan", "Luan of white jade", "Epic", "Jade", "Moonlit Gate", "serene sovereign", "stills conflict with one wingbeat"],
  ["SHJ-038", "Nine-Mist Xi", "Xi of nine mists", "Epic", "Mist", "Nine Veil Valley", "elusive patron", "layers illusions into safe refuge"],
  ["SHJ-039", "Thunder-Hoof Lei", "Lei of thunder hoof", "Epic", "Thunder", "Split Peak", "storm charger", "opens mountains with a step"],
  ["SHJ-040", "Sea-Lantern Ao", "Ao of sea lantern", "Epic", "River", "Outer Sea Gate", "ancient navigator", "guides ships by inner flame"],
  ["SHJ-041", "Ember-Plume Zhuque", "Zhuque of ember plume", "Epic", "Ember", "Southern Vermilion Field", "radiant witness", "renews vows in red fire"],
  ["SHJ-042", "Iron-Pine Ba", "Ba of iron pine", "Epic", "Mountain", "Ironwood Pass", "unyielding protector", "turns avalanches aside"],
  ["SHJ-043", "Jade-Mirror Kui", "Kui of jade mirror", "Epic", "Jade", "Silent Court", "merciful judge", "returns stolen luck to the weak"],
  ["SHJ-044", "Moon-Tide Ru", "Ru of moon tide", "Epic", "River", "Silver Harbor", "melancholy singer", "raises moonlit bridges from foam"],
  ["SHJ-045", "Celestial Qilin", "Tian Qilin", "Legendary", "Jade", "Heaven Terrace", "benevolent sovereign", "marks an age of just rule"],
  ["SHJ-046", "Black-Tide Dragon", "Xuan Long", "Legendary", "River", "Abyssal Gate", "ancient abyss", "moves seas by remembering the first rain"],
  ["SHJ-047", "Vermilion Phoenix", "Zhu Feng", "Legendary", "Ember", "Solar Altar", "rebirth flame", "turns endings into clean beginnings"],
  ["SHJ-048", "White-Tiger of Peaks", "Bai Hu Shan", "Legendary", "Mountain", "Western Heaven Pass", "severe guardian", "cuts corruption from the ridge"],
  ["SHJ-049", "Storm-Turtle Xuanwu", "Xuanwu Lei", "Legendary", "Thunder", "North Black Lake", "patient thunder", "carries winter lightning under shell"],
  ["SHJ-050", "Mist-Sovereign Luming", "Lu Ming", "Legendary", "Mist", "Unmapped Valley", "hidden monarch", "erases armies by making them forget war"],
  ["SHJ-051", "Jade-Comb Crane", "He of jade comb", "Common", "Jade", "Crane Fen", "graceful marker", "finds clean water with a feather"],
  ["SHJ-052", "Cave-Echo Niu", "Niu of cave echo", "Common", "Mountain", "Echo Cavern", "slow companion", "returns lost voices safely"],
  ["SHJ-053", "Blue-Reed She", "She of blue reed", "Uncommon", "River", "Blue Reed Crossing", "patient hunter", "silences troubled currents"],
  ["SHJ-054", "Ash-Mask Gui", "Gui of ash mask", "Uncommon", "Ember", "Ash Mask Shrine", "watchful mourner", "keeps ancestral coals named"],
  ["SHJ-055", "Cloud-Jade Bo", "Bo of cloud jade", "Rare", "Jade", "Cloud Jade Shelf", "bright negotiator", "trades sunlight for rain"],
  ["SHJ-056", "Thunder-Moth Yin", "Yin of thunder moth", "Rare", "Thunder", "Lantern Storm", "delicate omen", "warns villages before lightning"],
  ["SHJ-057", "Mist-Lotus Shen", "Shen of mist lotus", "Epic", "Mist", "Lotus Expanse", "dream healer", "opens sleep into prophecy"],
  ["SHJ-058", "Stone-Sea Kun", "Kun of stone sea", "Epic", "Mountain", "Fossil Shore", "vast sleeper", "keeps old oceans under cliffs"],
  ["SHJ-059", "Red-Jade Dragonet", "Chi Long", "Legendary", "Ember", "Red Jade Volcano", "young imperial fire", "writes renewal in lava veins"],
  ["SHJ-060", "Silver-Mist Fox", "Yin Hu", "Legendary", "Mist", "Silver Veil", "clever benefactor", "steals grief and leaves moonlight"]
];

const elements = {
  stage: document.querySelector("[data-ritual-stage]"),
  activeArt: document.querySelector("[data-active-art]"),
  activeRarity: document.querySelector("[data-active-rarity]"),
  activeName: document.querySelector("[data-active-name]"),
  activeMeta: document.querySelector("[data-active-meta]"),
  currency: document.querySelector("[data-currency]"),
  pity: document.querySelector("[data-pity]"),
  completion: document.querySelector("[data-completion]"),
  loreName: document.querySelector("[data-lore-name]"),
  loreLine: document.querySelector("[data-lore-line]"),
  loreRegion: document.querySelector("[data-lore-region]"),
  loreElement: document.querySelector("[data-lore-element]"),
  loreTemperament: document.querySelector("[data-lore-temperament]"),
  loreBody: document.querySelector("[data-lore-body]"),
  grid: document.querySelector("[data-bestiary-grid]"),
  history: document.querySelector("[data-draw-history]"),
  search: document.querySelector("[data-filter-search]"),
  rarity: document.querySelector("[data-filter-rarity]"),
  element: document.querySelector("[data-filter-element]"),
  state: document.querySelector("[data-filter-state]"),
  dialog: document.querySelector("[data-detail-dialog]"),
  detail: document.querySelector("[data-detail-content]"),
  exportStatus: document.querySelector("[data-export-status]"),
  favoriteActive: document.querySelector("[data-action=\"favorite-active\"]"),
  exportActive: document.querySelector("[data-action=\"export-active\"]"),
  openActive: document.querySelector("[data-action=\"open-active\"]"),
  drawTen: document.querySelector("[data-action=\"draw-ten\"]"),
  dailyDraw: document.querySelector("[data-action=\"daily-draw\"]")
};

const creatures = creatureSeeds.map((seed, index) => {
  const [id, name, pronunciation, rarity, element, region, temperament, power] = seed;
  return {
    id,
    name,
    pronunciation,
    rarity,
    element,
    region,
    temperament,
    powers: [power, `${element.toLowerCase()} resonance`, "protective omen"],
    symbol: ["seal", "mirror", "jade", "cloud", "reed", "bell"][index % 6],
    artIndex: index,
    description: `${name} is a ${rarity.toLowerCase()} ${element.toLowerCase()} creature recorded near ${region}.`,
    quote: `"The ${name} appears when ${region} holds its breath."`,
    lore: `${name} is described in the SEIS mythic field archive as a ${temperament}. Its power ${power}, but its deeper role is custodial: it keeps a boundary between human ambition and the older agreements of mountain, water, mist, jade, thunder, and ember.`
  };
});

const state = {
  currency: 1200,
  pity: 0,
  inventory: {},
  favorites: {},
  history: [],
  lastDraw: null,
  dailyKey: "",
  motionReduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

let db;

function artPosition(index) {
  const col = index % 10;
  const row = Math.floor(index / 10) % 6;
  return { x: `${col * 11.111}%`, y: `${row * 20}%` };
}

function setArt(element, index) {
  const pos = artPosition(index);
  element.style.setProperty("--art-x", pos.x);
  element.style.setProperty("--art-y", pos.y);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dbGet(key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dbPut(key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function basename(path) {
  return path.replace(/\/+$/, "").split("/").pop() || "/";
}

function dirname(path) {
  const clean = path.replace(/\/+$/, "");
  const index = clean.lastIndexOf("/");
  return index <= 0 ? "/" : clean.slice(0, index);
}

function workspaceLanguage(path) {
  return path.endsWith(".json") ? "json" : "plaintext";
}

function createWorkspaceEntry(path, content = "", type = "file") {
  const now = new Date().toISOString();
  return {
    path,
    name: basename(path),
    parent: dirname(path),
    type,
    content: type === "file" ? content : "",
    language: type === "file" ? workspaceLanguage(path) : "",
    createdAt: now,
    updatedAt: now,
    baseContent: type === "file" ? content : ""
  };
}

function openCodeWorkspaceDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CODE_WORKSPACE_DB_NAME, CODE_WORKSPACE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("files")) database.createObjectStore("files", { keyPath: "path" });
      if (!database.objectStoreNames.contains("settings")) database.createObjectStore("settings", { keyPath: "key" });
      if (!database.objectStoreNames.contains("history")) database.createObjectStore("history", { keyPath: "id", autoIncrement: true });
      if (!database.objectStoreNames.contains("extensions")) database.createObjectStore("extensions", { keyPath: "id" });
      if (!database.objectStoreNames.contains("commits")) database.createObjectStore("commits", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putWorkspaceEntry(database, entry) {
  return new Promise((resolve, reject) => {
    const tx = database.transaction("files", "readwrite");
    tx.objectStore("files").put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function saveToCodeWorkspace(filename, payload) {
  const database = await openCodeWorkspaceDatabase();
  try {
    await putWorkspaceEntry(database, createWorkspaceEntry(CODE_WORKSPACE_ROOT, "", "folder"));
    await putWorkspaceEntry(database, createWorkspaceEntry(MYTHIC_ARCHIVE_DIR, "", "folder"));
    const archivePath = `${MYTHIC_ARCHIVE_DIR}/${filename}`;
    await putWorkspaceEntry(database, createWorkspaceEntry(archivePath, payload, "file"));
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CODE_WORKSPACE_CHANNEL);
      channel.postMessage({ type: "workspace-file-created", path: archivePath, source: "mythic-gacha" });
      channel.close();
    }
    return archivePath;
  } finally {
    database.close();
  }
}

function downloadJson(filename, payload) {
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function setExportStatus(message) {
  if (elements.exportStatus) elements.exportStatus.textContent = message;
}

function saveState() {
  if (!db) return;
  dbPut(STATE_KEY, {
    currency: state.currency,
    pity: state.pity,
    inventory: state.inventory,
    favorites: state.favorites,
    history: state.history,
    lastDraw: state.lastDraw,
    dailyKey: state.dailyKey,
    motionReduced: state.motionReduced
  });
}

function mergeSaved(saved) {
  if (!saved || typeof saved !== "object") return;
  Object.assign(state, {
    currency: Number.isFinite(saved.currency) ? saved.currency : state.currency,
    pity: Number.isFinite(saved.pity) ? saved.pity : state.pity,
    inventory: saved.inventory || {},
    favorites: saved.favorites || {},
    history: Array.isArray(saved.history) ? saved.history : [],
    lastDraw: saved.lastDraw || null,
    dailyKey: saved.dailyKey || "",
    motionReduced: Boolean(saved.motionReduced)
  });
}

function weightedRarity(forceRare = false) {
  if (state.pity >= 79) return "Legendary";
  const pool = forceRare ? rarities.filter((rarity) => !["Common", "Uncommon"].includes(rarity.name)) : rarities;
  const total = pool.reduce((sum, rarity) => sum + rarity.weight, 0);
  let roll = Math.random() * total;
  for (const rarity of pool) {
    roll -= rarity.weight;
    if (roll <= 0) return rarity.name;
  }
  return pool[pool.length - 1].name;
}

function chooseCreature(rarityName) {
  const pool = creatures.filter((creature) => creature.rarity === rarityName);
  return pool[Math.floor(Math.random() * pool.length)];
}

function draw(count, options = {}) {
  const cost = options.free ? 0 : count === 10 ? 900 : 100;
  if (state.currency < cost) {
    if (count === 1 && !options.free) {
      state.currency += 120;
      setExportStatus("A 120 jade field stipend was added for a single draw.");
    }
    if (state.currency < cost) {
      setExportStatus(`Ten Draw needs ${cost} jade. Complete single draws or wait for the daily free draw.`);
      render();
      saveState();
      return;
    }
  }
  state.currency -= cost;

  const results = [];
  for (let index = 0; index < count; index += 1) {
    const rarityName = weightedRarity(count === 10 && index === count - 1 && !results.some((item) => ["Rare", "Epic", "Legendary"].includes(item.rarity)));
    const creature = chooseCreature(rarityName);
    const record = state.inventory[creature.id] || { count: 0, firstDiscoveredAt: new Date().toISOString() };
    const duplicate = record.count > 0;
    record.count += 1;
    if (duplicate) {
      state.currency += rarities.find((rarity) => rarity.name === creature.rarity).duplicateJade;
    }
    state.inventory[creature.id] = record;
    state.pity = creature.rarity === "Legendary" ? 0 : state.pity + 1;
    results.push(creature);
  }

  const latest = results[results.length - 1];
  state.lastDraw = latest.id;
  state.history = [...results.map((creature) => ({ id: creature.id, rarity: creature.rarity, time: new Date().toISOString() })), ...state.history].slice(0, 40);
  reveal(latest);
  render();
  saveState();
}

function reveal(creature) {
  elements.stage.classList.add("is-drawing");
  elements.stage.classList.remove("is-revealed");
  setTimeout(() => {
    setArt(elements.activeArt, creature.artIndex);
    elements.activeRarity.textContent = creature.rarity;
    elements.activeName.textContent = creature.name;
    elements.activeMeta.textContent = `${creature.element} / ${creature.region}`;
    elements.stage.classList.add("is-revealed");
    renderLore(creature);
  }, state.motionReduced ? 20 : 420);
  setTimeout(() => elements.stage.classList.remove("is-drawing"), state.motionReduced ? 30 : 900);
}

function renderLore(creature) {
  elements.loreName.textContent = creature.name;
  elements.loreLine.textContent = creature.quote;
  elements.loreRegion.textContent = `Region: ${creature.region}`;
  elements.loreElement.textContent = `Element: ${creature.element}`;
  elements.loreTemperament.textContent = `Temperament: ${creature.temperament}`;
  elements.loreBody.textContent = creature.lore;
}

function passesFilters(creature, unlocked) {
  const query = elements.search.value.trim().toLowerCase();
  const rarity = elements.rarity.value;
  const element = elements.element.value;
  const unlockState = elements.state.value;
  const haystack = `${creature.name} ${creature.description} ${creature.lore} ${creature.powers.join(" ")}`.toLowerCase();
  if (query && !haystack.includes(query)) return false;
  if (rarity !== "all" && creature.rarity !== rarity) return false;
  if (element !== "all" && creature.element !== element) return false;
  if (unlockState === "unlocked" && !unlocked) return false;
  if (unlockState === "locked" && unlocked) return false;
  if (unlockState === "favorite" && !state.favorites[creature.id]) return false;
  return true;
}

function render() {
  const unlockedCount = Object.keys(state.inventory).length;
  const hasLastDraw = Boolean(state.lastDraw);
  const dailyClaimed = state.dailyKey === todayKey();
  elements.currency.textContent = String(state.currency);
  elements.pity.textContent = String(state.pity);
  elements.completion.textContent = `${Math.round((unlockedCount / creatures.length) * 100)}%`;
  for (const control of [elements.favoriteActive, elements.exportActive, elements.openActive]) {
    if (!control) continue;
    control.disabled = !hasLastDraw;
    control.setAttribute("aria-disabled", String(!hasLastDraw));
    control.title = hasLastDraw ? "" : "Draw a creature first.";
  }
  if (elements.drawTen) {
    const disabled = state.currency < 900;
    elements.drawTen.disabled = disabled;
    elements.drawTen.setAttribute("aria-disabled", String(disabled));
    elements.drawTen.title = disabled ? "Ten Draw needs 900 jade." : "";
  }
  if (elements.dailyDraw) {
    elements.dailyDraw.disabled = dailyClaimed;
    elements.dailyDraw.setAttribute("aria-disabled", String(dailyClaimed));
    elements.dailyDraw.textContent = dailyClaimed ? "Daily Claimed" : "Daily Free";
    elements.dailyDraw.title = dailyClaimed ? "The free daily draw has already been used today." : "";
  }
  elements.history.innerHTML = state.history.length
    ? state.history.slice(0, 16).map((item) => {
        const creature = creatures.find((entry) => entry.id === item.id);
        return `<span class="history-chip">${creature?.name || item.id} / ${item.rarity}</span>`;
      }).join("")
    : "<span class=\"history-chip\">No draws yet</span>";

  elements.grid.innerHTML = creatures
    .filter((creature) => passesFilters(creature, Boolean(state.inventory[creature.id])))
    .map((creature) => {
      const unlocked = Boolean(state.inventory[creature.id]);
      const count = state.inventory[creature.id]?.count || 0;
      const pos = artPosition(creature.artIndex);
      return `<button class="creature-card rarity-${creature.rarity} ${unlocked ? "" : "is-locked"}" type="button" data-creature-id="${creature.id}" style="--art-x:${pos.x};--art-y:${pos.y}">
        <span>${unlocked ? creature.rarity : "Locked"}</span>
        <strong>${unlocked ? creature.name : "Undiscovered"}</strong>
        <span>${unlocked ? `${creature.element} / ${creature.region}` : "Draw to reveal lore"}</span>
        <span>${state.favorites[creature.id] ? "Favorite" : count ? `Copies ${count}` : ""}</span>
      </button>`;
    })
    .join("");
}

function openDetail(id, options = {}) {
  const creature = creatures.find((entry) => entry.id === id);
  if (!creature) return;
  const unlocked = Boolean(state.inventory[id]);
  const pos = artPosition(creature.artIndex);
  elements.detail.innerHTML = `
    <p class="eyebrow">${unlocked ? creature.rarity : "Locked record"}</p>
    <h2>${unlocked ? creature.name : "Undiscovered creature"}</h2>
    <div class="detail-art" style="--art-x:${pos.x};--art-y:${pos.y}"></div>
    <p>${unlocked ? creature.lore : "This record remains sealed until the creature is drawn."}</p>
    <p>${unlocked ? `Powers: ${creature.powers.join(", ")}.` : "Powers are hidden."}</p>
    <p>${unlocked ? `First discovered: ${state.inventory[id].firstDiscoveredAt}. Copies: ${state.inventory[id].count}.` : ""}</p>
    <button type="button" data-detail-favorite="${id}">${state.favorites[id] ? "Remove Favorite" : "Favorite"}</button>
  `;
  if (!options.refreshOnly && !elements.dialog.open) {
    elements.dialog.showModal();
  }
}

async function exportActive() {
  const creature = creatures.find((entry) => entry.id === state.lastDraw);
  if (!creature) return;
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), creature, localRecord: state.inventory[creature.id] }, null, 2);
  const filename = `${creature.id}-${creature.name.toLowerCase().replaceAll(" ", "-")}.json`;
  try {
    const archivePath = await saveToCodeWorkspace(filename, payload);
    setExportStatus(`Saved ${archivePath}. Open SEIS Code or Terminal to inspect it.`);
  } catch (_error) {
    downloadJson(filename, payload);
    setExportStatus("Browser workspace storage was unavailable, so the card was downloaded as JSON instead.");
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    const card = event.target.closest("[data-creature-id]");
    const detailFavorite = event.target.closest("[data-detail-favorite]");
    if (card) openDetail(card.dataset.creatureId);
    if (detailFavorite) {
      const id = detailFavorite.dataset.detailFavorite;
      state.favorites[id] = !state.favorites[id];
      saveState();
      render();
      openDetail(id, { refreshOnly: true });
    }
    if (!action) return;
    if (action === "draw-one") draw(1);
    if (action === "draw-ten") draw(10);
    if (action === "daily-draw" && state.dailyKey !== todayKey()) {
      state.dailyKey = todayKey();
      draw(1, { free: true });
    } else if (action === "daily-draw") {
      setExportStatus("The free daily draw has already been used today.");
    }
    if (action === "favorite-active" && state.lastDraw) {
      state.favorites[state.lastDraw] = !state.favorites[state.lastDraw];
      saveState();
      render();
    }
    if (action === "export-active") void exportActive();
    if (action === "open-active" && state.lastDraw) openDetail(state.lastDraw);
    if (action === "close-detail") elements.dialog.close();
    if (action === "toggle-motion") {
      state.motionReduced = !state.motionReduced;
      document.body.classList.toggle("low-motion", state.motionReduced);
      event.target.setAttribute("aria-pressed", String(state.motionReduced));
      saveState();
    }
    if (action === "reset-progress" && window.confirm("Reset local Mythic Gacha progress?")) {
      state.currency = 1200;
      state.pity = 0;
      state.inventory = {};
      state.favorites = {};
      state.history = [];
      state.lastDraw = null;
      saveState();
      render();
    }
  });

  for (const control of [elements.search, elements.rarity, elements.element, elements.state]) {
    control.addEventListener("input", render);
  }
}

async function init() {
  document.documentElement.style.setProperty("--mythic-atlas-url", `url("${ART_ATLAS_PATH}")`);
  try {
    db = await openDatabase();
    mergeSaved(await dbGet(STATE_KEY));
  } catch (_error) {
    // The game remains playable in memory if IndexedDB is unavailable.
  }
  document.body.classList.toggle("low-motion", state.motionReduced);
  bindEvents();
  if (state.lastDraw) {
    const creature = creatures.find((entry) => entry.id === state.lastDraw);
    if (creature) {
      setArt(elements.activeArt, creature.artIndex);
      renderLore(creature);
    }
  }
  render();
}

init();
