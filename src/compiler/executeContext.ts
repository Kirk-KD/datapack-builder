// Each entry will be in the form "<mod1> <mod1 args> <mod2> <mod2 args> ..."
let executeContexts: string[] = []
export const NO_EXEC_CTX_MARKER = '#no_exec_ctx# '

export function resetContext() {
  executeContexts = []
}

export function pushExecuteContext(context: string) {
  executeContexts.push(context)
}

export function popExecuteContext() {
  executeContexts.pop()
}

export function getExecuteContextPrefix() {
  if (executeContexts.length === 0) return ''
  return `execute ${executeContexts.join(' ')} run `
}

export function markNoExecCtx(code: string): string {
  return code.split('\n').map(line => line ? `${NO_EXEC_CTX_MARKER}${line}` : line).join('\n')
}

export function stripMarkers(code: string): string {
  const hasTrailingNewline = code.endsWith('\n')
  const lines = code.split('\n')

  const stripped = lines.map((line) => {
    if (line.startsWith(NO_EXEC_CTX_MARKER)) {
      return line.slice(NO_EXEC_CTX_MARKER.length)
    }
    return line
  }).join('\n')

  return hasTrailingNewline && !stripped.endsWith('\n') ? `${stripped}\n` : stripped
}

export function applyExecuteContextPrefixToCode(code: string): string {
  const prefix = getExecuteContextPrefix()
  const hasTrailingNewline = code.endsWith('\n')
  const lines = code.split('\n')

  const prefixed = lines.map((line) => {
    if (line.trim() === '') return line
    if (line.startsWith(NO_EXEC_CTX_MARKER)) {
      return line.slice(NO_EXEC_CTX_MARKER.length)
    }
    return prefix ? `${prefix}${line}` : line
  }).join('\n')

  return hasTrailingNewline && !prefixed.endsWith('\n') ? `${prefixed}\n` : prefixed
}