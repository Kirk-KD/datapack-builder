import { mcfunctionGenerator } from './blockly/generator.ts'
import { registerBlockSpecGenerators } from '../blockly/specs/blockRegistry.ts'

const COMPILER_BOOTSTRAP_FLAG = '__mcDatapackBuilderCompilerInitialized__'

export function bootstrapCompiler() {
  const globalState = globalThis as Record<string, unknown>
  if (globalState[COMPILER_BOOTSTRAP_FLAG] === true) return

  globalState[COMPILER_BOOTSTRAP_FLAG] = true

  registerBlockSpecGenerators((type, generator) => {
    mcfunctionGenerator.forBlock[type] = generator
  })
}

