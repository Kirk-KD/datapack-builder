import * as Blockly from 'blockly'
import { shouldTrimChainTail } from '../validators/chainPolicy'

Blockly.Extensions.register('mc_trim_chain_tail', function(this: Blockly.Block) {
  const previousOnChange = this.onchange ?? (() => {})
  this.setOnChange(function(this: Blockly.Block, event: Blockly.Events.Abstract) {
    previousOnChange.call(this, event)

    if (!event || this.isInFlyout) return

    if (
      event.type !== Blockly.Events.BLOCK_MOVE
      && event.type !== Blockly.Events.BLOCK_CHANGE
      && event.type !== Blockly.Events.BLOCK_CREATE
    ) return

    if (!shouldTrimChainTail(this)) return

    // Keep only the first chainable value when used in mc_var_set.
    const chainNextConnection = this.getInput('CHAIN_NEXT')?.connection
    if (chainNextConnection?.isConnected()) {
      chainNextConnection.disconnect()
    }
  })
})
