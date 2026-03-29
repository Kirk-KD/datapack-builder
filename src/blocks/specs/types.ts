import * as Blockly from 'blockly'

export type BlockSpecCategory =
  | 'commands'
  | 'control'
  | 'variable'
  | 'events'
  | 'literals'
  | 'procedures'
  | 'execute'
  | 'targetSelectors'

export type BlockInitFunction = (this: Blockly.Block) => void
export type BlockGeneratorResult = ReturnType<Blockly.CodeGenerator['blockToCode']>
export type BlockGeneratorFunction = (block: Blockly.Block) => BlockGeneratorResult
export type BlockJsonDefinition = Record<string, unknown> & { type: string }
export type BlockShadowStatesFunction = (this: Blockly.Block) => void

export type ShadowInputBlockValidatorFunction = (value: string) => string | null

export type BlockSpec = {
  type: string
  category?: BlockSpecCategory
  json?: BlockJsonDefinition
  init?: BlockInitFunction
  generator?: BlockGeneratorFunction
  tags?: string[],
  setShadowBlocks?: BlockShadowStatesFunction
}
