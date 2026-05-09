import * as Blockly from 'blockly'
import {revokeShadowState} from './extensions/shadows.ts'

export function shadowBlockRevokeListener(e: Blockly.Events.Abstract) {
  if (e.type !== Blockly.Events.BLOCK_CREATE) return

  const id = (e as Blockly.Events.BlockCreate).blockId
  if (!id) return

  const block = e.getEventWorkspace_().getBlockById(id)
  if (!block) return

  revokeShadows(block)
}

function revokeShadows(block: Blockly.Block) {
  if (block.isShadow()) block.setShadow(false)

  block.inputList.forEach(inp => {
    revokeShadowState(block, inp.name)

    const connBlock = inp.connection?.targetBlock()
    if (connBlock) revokeShadows(connBlock)
  })
}
