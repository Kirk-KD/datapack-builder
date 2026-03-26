import * as Blockly from 'blockly'
import { shouldDisallowChainConnection } from './chainPolicy'

class GlobalChecker extends Blockly.ConnectionChecker {
  doTypeChecks(a: Blockly.Connection, b: Blockly.Connection): boolean {
    const superior = a.isSuperior() ? a : (b.isSuperior() ? b : null)
    const inferior = superior === a ? b : (superior === b ? a : null)

    if (!superior || !inferior) {
      return super.doTypeChecks(a, b)
    }

    const superiorBlock = superior.getSourceBlock()
    const inferiorBlock = inferior.getSourceBlock()
    if (shouldDisallowChainConnection(superiorBlock, inferiorBlock)) return false

    return super.doTypeChecks(a, b)
  }
}

Blockly.registry.register(Blockly.registry.Type.CONNECTION_CHECKER, Blockly.registry.DEFAULT, GlobalChecker, true)
