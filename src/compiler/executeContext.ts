// Each entry will be in the form "<mod1> <mod1 args> <mod2> <mod2 args> ..."
let executeContexts: string[] = []

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

export function applyExecuteContextPrefixToCode(code: string): string {
  const prefix = getExecuteContextPrefix()
  const hasTrailingNewline = code.endsWith('\n')
  const lines = code.split('\n')

  const prefixed = lines.map((line) => {
    if (line.trim() === '') return line
    return prefix ? `${prefix}${line}` : line
  }).join('\n')

  return hasTrailingNewline && !prefixed.endsWith('\n') ? `${prefixed}\n` : prefixed
}