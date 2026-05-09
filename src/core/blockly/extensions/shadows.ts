import { Block } from 'blockly'

type ShadowBlock = {
  type: string
  fields?: Record<string, unknown>
}

export function setShadowState(block: Block, inputName: string, shadowBlock: ShadowBlock) {
  if (!block.isInFlyout) return
  const connection = block.getInput(inputName)?.connection
  if (!connection || connection.targetBlock()) return
  connection.setShadowState(shadowBlock)
}

export function revokeShadowState(block: Block, inputName: string) {
  const connection = block.getInput(inputName)?.connection
  if (!connection || connection.targetBlock()?.isShadow()) return
  connection.setShadowState(null)
}
