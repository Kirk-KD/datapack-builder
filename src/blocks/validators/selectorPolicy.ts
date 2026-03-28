import * as Blockly from 'blockly'

const SELECTOR_TYPE = 'mc_target_selector'
const SELECTOR_FILTER_PREFIX = 'mc_target_filter_'
const SELECTOR_FILTER_STACK_INPUT = 'FILTER_STACK'

function isSelectorFilterBlock(block: Blockly.Block | null): block is Blockly.Block {
    return !!block && block.type.startsWith(SELECTOR_FILTER_PREFIX)
}

function getInputNameForConnection(block: Blockly.Block, connection: Blockly.Connection): string | null {
    for (const input of block.inputList) {
        if (input.connection === connection) return input.name
    }
    return null
}

function isSelectorFilterStackConnection(superior: Blockly.Connection): boolean {
    const superiorBlock = superior.getSourceBlock()
    if (superiorBlock.type !== SELECTOR_TYPE) return false

    return getInputNameForConnection(superiorBlock, superior) === SELECTOR_FILTER_STACK_INPUT
}

export function shouldDisallowSelectorConnection(
    superior: Blockly.Connection,
    superiorBlock: Blockly.Block,
    inferiorBlock: Blockly.Block,
): boolean {
    const superiorIsModifier = isSelectorFilterBlock(superiorBlock)
    const inferiorIsModifier = isSelectorFilterBlock(inferiorBlock)

    if (!superiorIsModifier && !inferiorIsModifier) {
        return isSelectorFilterStackConnection(superior)
    }

    if (superiorIsModifier) {
        return !inferiorIsModifier
    }

    return !isSelectorFilterStackConnection(superior)
}
