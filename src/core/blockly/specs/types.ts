import * as Blockly from 'blockly'
import type {IrGeneratorFunction} from '../../compiler'

export type BlockSpecCategory =
  | 'commands'
  | 'control'
  | 'variable'
  | 'events'
  | 'literals'
  | 'constructs'
  | 'procedures'
  | 'execute'
  | 'utility'
  | 'constants'
  | 'math'

export type BlockInitFunction = (this: Blockly.Block) => void
export type BlockJsonDefinition = Record<string, unknown> & { type: string }
export type BlockShadowStatesFunction = (this: Blockly.Block) => void
export type BlockContextMenuOption = Blockly.ContextMenuRegistry.ContextMenuOption
export type BlockContextMenuFunction = (this: Blockly.BlockSvg, options: BlockContextMenuOption[]) => void

export type ShadowInputBlockValidatorFunction = (value: string) => string | null

export type BlockSpec = {
  type: string
  category?: BlockSpecCategory
  json?: BlockJsonDefinition
  init?: BlockInitFunction
  generator: IrGeneratorFunction
  tags?: string[],
  setShadowBlocks?: BlockShadowStatesFunction
  contextMenu?: BlockContextMenuFunction
}
