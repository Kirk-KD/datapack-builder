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

export type BlockInitFunction = (this: Blockly.Block) => void
export type BlockJsonDefinition = Record<string, unknown> & { type: string }
export type BlockShadowStatesFunction = (this: Blockly.Block) => void

export type ShadowInputBlockValidatorFunction = (value: string) => string | null

export type BlockSpec = {
  type: string
  category?: BlockSpecCategory
  json?: BlockJsonDefinition
  init?: BlockInitFunction
  generator: IrGeneratorFunction
  tags?: string[],
  setShadowBlocks?: BlockShadowStatesFunction
}
