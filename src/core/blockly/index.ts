import './extensions'
import './validators'
import './renderer.ts'
import * as Blockly from 'blockly'

export {bootstrapBlockly} from './bootstrap.ts'
export {setupToolbox} from './setupToolbox.ts'
export {setupWorkspace, injectWorkspace} from './setupWorkspace.ts'
export type {CreateProcedureData, CreateVariableData, WorkspaceCallbacks, CreateParamData} from './workspaceCallbacks.ts'
export {states} from './states.ts'

export function getFocusManager() {
  return Blockly.getFocusManager()
}
