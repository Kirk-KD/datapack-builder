import * as Blockly from 'blockly'
import {registerContinuousToolbox} from '@blockly/continuous-toolbox'
import {setupToolbox} from './setupToolbox.ts'

const BLOCKLY_BOOTSTRAP_FLAG = '__mcDatapackBuilderBlocklyInitialized__'

export function bootstrapBlockly() {
  const globalState = globalThis as Record<string, unknown>
  if (globalState[BLOCKLY_BOOTSTRAP_FLAG] === true) return

  globalState[BLOCKLY_BOOTSTRAP_FLAG] = true

  // Global Blockly registrations should run only once.
  registerContinuousToolbox()
  setupToolbox()
  Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE'] = 'define'
}
