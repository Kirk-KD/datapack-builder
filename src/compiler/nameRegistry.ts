import * as Blockly from 'blockly'

let scoreboardVariables: Blockly.IVariableModel<Blockly.IVariableState>[] = []

export function updateScoreboardVariables(newVars: Blockly.IVariableModel<Blockly.IVariableState>[]) {
  scoreboardVariables = newVars
}

export function getScoreboardVariables() {
  return scoreboardVariables
}