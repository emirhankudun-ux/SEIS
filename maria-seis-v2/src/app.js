const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  context: 'Deadly Evil',
  mode: 'READY',
  listening: false,
  vision: false,
};

const contextCopy = {
  'Deadly Evil': {
    headline: 'Buradayım, Emirhan.',
    subline: 'Ne yapmak istediğini söyle. Gerisini SEIS doğru sisteme yönlendirsin.',
    suggestions: ['Son Deadly Evil build durumunu kontrol et', 'Enemy AI regression testlerini çalıştır', 'MCP sağlık durumunu kontrol et'],
  },
  'SEIS': {
    headline: 'SEIS çekirdeği hazır.',
    subline: 'Model, agent ve araç katmanlarını tek bir akışta koordine edebilirim.',
    suggestions: ['Model router durumunu kontrol et', 'MCP sağlık durumunu kontrol et', 'Agent havuzunu özetle'],
  },
  'Portfolio': {
    headline: 'Creative Director modu hazır.',
    subline: 'Tasarım kararlarını hiyerarşi, grid, tipografi ve tutarlılık üzerinden değerlendirebilirim.',
    suggestions: ['Ana sayfayı daha premium yap', 'Tipografiyi değerlendir', 'Responsive davranışı kontrol et'],
  },
};

function setMode(mode) {
  state.mode = mode;
  $('#stateLabel').textContent = mode;
  document.body.dataset.mode = mode.toLowerCase();
}

function setContext(context) {
  state.context = context;
  $('#contextLabel').textContent = context === 'SEIS' ? 'SEIS Core' : context;
  $('#activeContext').textContent = context.toUpperCase();
  const copy = contextCopy[context];
  $('#headline').textContent = copy.headline;
  $('#subline').textContent = copy.subline;
  $$('.project-row').forEach((row) => row.classList.toggle('active', row.dataset.project === context));
  $$('#contextPopover button').forEach((btn) => {
    const span = btn.querySelector('span');
    if (span) span.remove();
    if (btn.dataset.context === context) {
      const active = document.createElement('span');
      active.textContent = 'Active';
      btn.appendChild(active);
    }
  });
  $$('.suggestions button').forEach((btn, index) => {
    btn.dataset.prompt = copy.suggestions[index] || copy.suggestions[0];
    btn.textContent = ['Son build', 'AI testleri', 'MCP health'][index] || 'Komut';
  });
  $('#contextPopover').classList.add('hidden');
}

function setActivity({ agent, title, text, result, progress = 100 }) {
  $('#activityAgent').textContent = agent;
  $('#activityTitle').textContent = title;
  $('#activityText').textContent = text;
  $('#activityResult').textContent = result;
  $('#progressBar').style.width = `${progress}%`;
  $('#activityTime').textContent = 'now';
}

const workflow = {
  build() {
    setActivity({
      agent: 'Build Engineer',
      title: 'Build health check',
      text: 'Prototype: production adapters bağlı değil. Harici build çalıştırılmış gibi davranmıyorum.',
      result: 'Execution adapter required',
      progress: 72,
    });
  },
  ai() {
    setActivity({
      agent: 'Verification Agent',
      title: 'Enemy AI regression',
      text: 'Local prototype senaryosu doğrulanıyor. Gerçek Unreal testleri için Unreal adapter gerekir.',
      result: '12 / 12 simulated checks passed',
      progress: 100,
    });
  },
  mcp() {
    setActivity({
      agent: 'MCP Gateway',
      title: 'Capability health',
      text: 'UI health registry aktif. Bir connector degraded olarak işaretli.',
      result: '7 / 8 available',
      progress: 87,
    });
  },
  generic(command) {
    setActivity({
      agent: 'SEIS Orchestrator',
      title: 'Intent routed',
      text: `“${command}” komutu yerel prototip akışında işlendi.`,
      result: 'Awaiting production adapter',
      progress: 64,
    });
  },
};

function routeCommand(command) {
  const normalized = command.trim().toLowerCase();
  if (!normalized) return;

  setMode('UNDERSTANDING');
  $('#headline').textContent = 'Anladım.';
  $('#subline').textContent = command;

  window.setTimeout(() => {
    setMode('ROUTING');
    if (normalized.includes('build')) workflow.build();
    else if (normalized.includes('ai') || normalized.includes('regression')) workflow.ai();
    else if (normalized.includes('mcp')) workflow.mcp();
    else workflow.generic(command);

    window.setTimeout(() => {
      setMode('VERIFYING');
      window.setTimeout(() => {
        setMode('READY');
        $('#headline').textContent = contextCopy[state.context].headline;
        $('#subline').textContent = contextCopy[state.context].subline;
      }, 800);
    }, 700);
  }, 550);
}

function submitCommand() {
  const input = $('#commandInput');
  routeCommand(input.value);
  input.value = '';
}

$('#sendBtn').addEventListener('click', submitCommand);
$('#commandInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') submitCommand();
});

$$('.suggestions button').forEach((button) => {
  button.addEventListener('click', () => routeCommand(button.dataset.prompt));
});

$$('.project-row').forEach((button) => {
  button.addEventListener('click', () => setContext(button.dataset.project));
});

$('#contextPill').addEventListener('click', () => $('#contextPopover').classList.toggle('hidden'));
$$('#contextPopover button').forEach((button) => button.addEventListener('click', () => setContext(button.dataset.context)));

function toggleListening() {
  state.listening = !state.listening;
  $('#orbButton').classList.toggle('listening', state.listening);
  $('#micBtn').classList.toggle('active', state.listening);
  setMode(state.listening ? 'LISTENING' : 'READY');
  $('#headline').textContent = state.listening ? 'Dinliyorum.' : contextCopy[state.context].headline;
  $('#subline').textContent = state.listening
    ? 'Bu prototip mikrofon kaydı başlatmaz; yalnızca voice durumunu simüle eder.'
    : contextCopy[state.context].subline;
}

$('#orbButton').addEventListener('click', toggleListening);
$('#micBtn').addEventListener('click', toggleListening);

$('#visionBtn').addEventListener('click', () => {
  state.vision = !state.vision;
  $('#visionBtn').classList.toggle('active', state.vision);
  setActivity({
    agent: 'Vision Engine',
    title: state.vision ? 'Vision context enabled' : 'Vision context disabled',
    text: state.vision
      ? 'Prototype UI state enabled. No screen capture is performed without a production adapter and permission.'
      : 'Visual context input is disabled.',
    result: state.vision ? 'Permission boundary preserved' : 'Idle',
    progress: state.vision ? 100 : 0,
  });
});

$('#settingsBtn').addEventListener('click', () => $('#settingsSheet').classList.remove('hidden'));
$('#closeSettings').addEventListener('click', () => $('#settingsSheet').classList.add('hidden'));
$('#settingsSheet').addEventListener('click', (event) => {
  if (event.target === $('#settingsSheet')) $('#settingsSheet').classList.add('hidden');
});

$$('.toggle').forEach((toggle) => toggle.addEventListener('click', () => toggle.classList.toggle('on')));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    $('#contextPopover').classList.add('hidden');
    $('#settingsSheet').classList.add('hidden');
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('#commandInput').focus();
  }
});
