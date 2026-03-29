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

export type BlockGeneratorResult = ReturnType<Blockly.CodeGenerator['blockToCode']>
export type BlockGeneratorFunction = (block: Blockly.Block) => BlockGeneratorResult
export type BlockJsonDefinition = Record<string, unknown> & { type: string }

export type BlockSpec = {
  type: string
  category: BlockSpecCategory
  json?: BlockJsonDefinition
  init?: (this: Blockly.Block) => void
  generator?: BlockGeneratorFunction
  tags?: string[]
}
