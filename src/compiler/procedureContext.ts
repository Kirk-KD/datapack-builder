interface ProcedureContext {
  name: string
  params: string[]
}

let activeContext: ProcedureContext | null = null

export function setProcedureContext(name: string, params: string[]): void {
  activeContext = { name, params }
}

export function clearProcedureContext(): void {
  activeContext = null
}

export function isParamInContext(varName: string): boolean {
  if (!activeContext) return false
  return activeContext.params.includes(varName)
}

export function getContextName(): string | null {
  return activeContext?.name ?? null
}