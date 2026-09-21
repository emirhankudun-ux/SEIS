/** Advisory intent classification; never a security boundary for a live tool. */
export function classifyIntent(command, projectId) {
  if (typeof command !== 'string' || !command.trim() || command.length > 4000) {
    throw new TypeError('command must contain 1–4000 characters');
  }
  if (typeof projectId !== 'string' || !projectId.trim() || projectId.length > 100) {
    throw new TypeError('projectId must contain 1–100 characters');
  }
  const normalized = command.normalize('NFKC').toLocaleLowerCase('tr-TR')
    .normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i');
  const words = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  const has = (...values) => values.some(value => words.includes(value));
  const intent = has('mcp') ? 'mcp-health' : has('build','derleme') ? 'build'
    : has('ai') ? 'enemy-ai'
    : words.some(word => word.startsWith('tasarim')) || has('premium','design') ? 'creative-review' : 'general';
  const high = has('deploy','publish','sil','silin','delete','remove','odeme','satin','production','yayinla');
  const modify = has('degistir','fix','duzelt','kur','install');
  const risk = high ? 'high' : modify ? 'modify' : 'safe';
  const groups = {
    build:['Unreal Engineer','Build Engineer','QA Engineer'],
    'enemy-ai':['Enemy AI','QA Engineer'],
    'creative-review':['Creative Director','UI/UX Designer'],
    'mcp-health':['MCP Gateway','Verification Agent'], general:['SEIS Orchestrator']
  };
  return Object.freeze({ intent, risk, agents:Object.freeze(groups[intent]), projectId, command:command.trim() });
}
