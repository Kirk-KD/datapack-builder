import type { BlockCodeKind, BlockSpec } from './types'

const blockSpecsByType = new Map<string, BlockSpec>()

export function registerRuntimeBlockSpec(spec: BlockSpec) {
  blockSpecsByType.set(spec.type, spec)
}

export function getRuntimeBlockCodeKind(type: string): BlockCodeKind {
  return blockSpecsByType.get(type)?.codeKind ?? 'command'
}
