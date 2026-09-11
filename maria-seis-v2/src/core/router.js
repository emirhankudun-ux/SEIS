export function classifyIntent(command, projectId) {
  const c = command.toLowerCase();
  const intent = c.includes('build') ? 'build' : c.includes('ai') ? 'enemy-ai' : c.includes('mcp') ? 'mcp-health' : c.includes('tasarım') || c.includes('premium') ? 'creative-review' : 'general';
  const risk = /deploy|publish|sil|delete|ödeme|satın|production/.test(c) ? 'high' : /değiştir|fix|düzelt|kur|install/.test(c) ? 'modify' : 'safe';
  const agents = intent === 'build' ? ['Unreal Engineer','Build Engineer','QA Engineer'] : intent === 'enemy-ai' ? ['Enemy AI','QA Engineer'] : intent === 'creative-review' ? ['Creative Director','UI/UX Designer'] : intent === 'mcp-health' ? ['MCP Gateway','Verification Agent'] : ['SEIS Orchestrator'];
  return { intent, risk, agents, projectId, command };
}
