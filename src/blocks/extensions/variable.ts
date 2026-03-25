import * as Blockly from "blockly"
import { getScoreboardVariables } from "../../compiler/nameRegistry"

Blockly.Extensions.register('mc_scoreboard_variable_dropdown', function() {
  // All blocks using this extension must have a dropdwn field named 'VAR_NAME'
  (this.getField('VAR_NAME')! as Blockly.FieldDropdown).setOptions(function() {
    return getScoreboardVariables()
      .filter(variable => variable.getType() === 'mc_scoreboard_variable')
      .map(variable => [variable.getName(), variable.getName()])
  })
})
