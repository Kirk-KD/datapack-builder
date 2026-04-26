import { Block } from 'blockly'

type ShadowBlock = {
  type: string
  fields?: Record<string, unknown>
}

export function setShadowState(block: Block, inputName: string, shadowBlock: ShadowBlock) {
  const connection = block.getInput(inputName)?.connection
  if (!connection || connection.targetBlock()) return
  connection.setShadowState(shadowBlock)
}
