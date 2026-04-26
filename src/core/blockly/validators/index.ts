import * as Blockly from 'blockly'
import { shouldDisallowExecuteConnection } from './executePolicy'
import {shouldDisallowSelectorConnection} from "./selectorPolicy.ts";

class GlobalChecker extends Blockly.ConnectionChecker {
  doTypeChecks(a: Blockly.Connection, b: Blockly.Connection): boolean {
    const superior = a.isSuperior() ? a : (b.isSuperior() ? b : null)
    const inferior = superior === a ? b : (superior === b ? a : null)

    if (!superior || !inferior) {
      return super.doTypeChecks(a, b)
    }

    const superiorBlock = superior.getSourceBlock()
    const inferiorBlock = inferior.getSourceBlock()
    if (shouldDisallowExecuteConnection(superior, superiorBlock, inferiorBlock)) return false
    if (shouldDisallowSelectorConnection(superior, superiorBlock, inferiorBlock)) return false

    return super.doTypeChecks(a, b)
  }
}

Blockly.registry.register(Blockly.registry.Type.CONNECTION_CHECKER, Blockly.registry.DEFAULT, GlobalChecker, true)

export function validateInt(newVal: number): string | null {
  const value = newVal.toString().trim()
  if (value === '') return null
  return /^-?\d+$/.test(value) ? value : null
}

export function validateNumber(newVal: string): string | null {
  const value = newVal.toString().trim()
  if (value === '') return null

  // Accept integers and decimal forms like 1, -1.2, .5, and 5.
  return /^-?(?:\d+\.\d+|\d+|\.\d+|\d+\.)$/.test(value) ? value : null
}
