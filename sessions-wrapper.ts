/**
 * Elastic Agent - Session Wrapper
 * 
 * 封装 sessions_spawn，提供类型安全的接口
 */

// 在实际运行环境中，这个函数会由 OpenClaw 提供
declare function sessions_spawn(params: {
  runtime: 'subagent' | 'acp';
  mode: 'run' | 'session';
  label?: string;
  task: string;
  thread?: boolean;
}): Promise<{
  childSessionKey: string;
  status: string;
}>;

export async function spawnAgent(
  label: string,
  systemPrompt: string
): Promise<string> {
  try {
    const result = await sessions_spawn({
      runtime: 'subagent',
      mode: 'run',
      label,
      task: systemPrompt,
    });
    return result.childSessionKey;
  } catch (error) {
    console.error('Spawn failed:', error);
    throw error;
  }
}
