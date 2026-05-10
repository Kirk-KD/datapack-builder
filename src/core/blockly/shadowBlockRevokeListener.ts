import * as Blockly from 'blockly'
import {revokeShadowState} from './extensions/shadows.ts'
import {shadowInputBlockSpecs} from './specs/shadowInputs.ts'

const shadowInputBlockTypes = new Set(shadowInputBlockSpecs.map(spec => spec.type))

export function shadowBlockRevokeListener(e: Blockly.Events.Abstract) {
  if (e.type !== Blockly.Events.BLOCK_CREATE) return

  const id = (e as Blockly.Events.BlockCreate).blockId
  if (!id) return

  const block = e.getEventWorkspace_().getBlockById(id)
  if (!block) return

  revokeShadows(block)
}

function revokeShadows(block: Blockly.Block) {
  if (block.isShadow() && !shadowInputBlockTypes.has(block.type)) block.setShadow(false)

  block.inputList.forEach(inp => {
    const connBlock = inp.connection?.targetBlock()
    if (connBlock) revokeShadows(connBlock)

    revokeShadowState(block, inp.name)
  })
}
