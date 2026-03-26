import * as Blockly from "blockly"
import { getParameters, getVariables } from "../compiler/workspaceRegistry"
import { shouldTrimChainTail } from "./chainPolicy"

Blockly.Extensions.register('mc_scoreboard_variable_dropdown', function() {
  // All blocks using this extension must have a dropdwn field named 'VAR_NAME'
  (this.getField('VAR_NAME')! as Blockly.FieldDropdown).setOptions(function() {
    return getVariables()
      .filter(variable => variable.getType() === 'mc_scoreboard_variable')
      .map(variable => [variable.getName(), variable.getName()])
  })
})

Blockly.Extensions.register('mc_procedure_parameter_dropdown', function() {
  // All blocks using this extension must have a dropdwn field named 'PARAM_NAME'
  (this.getField('PARAM_NAME')! as Blockly.FieldDropdown).setOptions(function() {
    return getParameters()
      .map(param => [param.getName(), param.getName()])
  })
})

Blockly.Extensions.register('mc_trim_chain_tail', function(this: Blockly.Block) {
  this.setOnChange(function(this: Blockly.Block, event: Blockly.Events.Abstract) {
    if (!event || this.isInFlyout) return

    if (
      event.type !== Blockly.Events.BLOCK_MOVE &&
      event.type !== Blockly.Events.BLOCK_CHANGE &&
      event.type !== Blockly.Events.BLOCK_CREATE
    ) return

    if (!shouldTrimChainTail(this)) return

    // Keep only the first chainable value when used in mc_var_set
    const chainNextConnection = this.getInput('CHAIN_NEXT')?.connection
    if (chainNextConnection?.isConnected()) {
      chainNextConnection.disconnect()
    }
  })
})