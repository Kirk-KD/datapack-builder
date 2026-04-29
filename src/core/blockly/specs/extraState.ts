import * as Blockly from 'blockly'

export type StatefulBlock = Blockly.BlockSvg & {
  saveExtraState?: () => object | null
  loadExtraState?: (state: object | null) => void
  updateShape_?: () => void
}

type BindExtraStateConfig = {
  loadDefaults?: Record<string, unknown>
}

function serializeExtraState(block: StatefulBlock) {
  const state = block.saveExtraState?.()
  return state ? JSON.stringify(state) : ''
}

export function mutateExtraState(block: StatefulBlock, mutate: () => void) {
  const oldState = serializeExtraState(block)
  mutate()
  const newState = serializeExtraState(block)

  if (oldState === newState) return

  Blockly.Events.fire(new Blockly.Events.BlockChange(
    block,
    'mutation',
    null,
    oldState,
    newState,
  ))
}

export function bindExtraState<
  TBlock extends StatefulBlock,
  TState extends Record<string, unknown>,
>(
  block: TBlock,
  defaults: TState,
  config: BindExtraStateConfig = {},
) {
  const keys = Object.keys(defaults) as (keyof TState)[]
  const loadDefaults = config.loadDefaults ?? defaults

  for (const key of keys) {
    block[key as keyof TBlock] = defaults[key] as unknown as TBlock[keyof TBlock]
  }

  block.saveExtraState = function() {
    const state = {} as TState

    for (const key of keys) {
      state[key] = this[key as keyof TBlock] as unknown as TState[keyof TState]
    }

    return state
  }

  block.loadExtraState = function(savedState: Partial<TState> | null) {
    for (const key of keys) {
      this[key as keyof TBlock] = (savedState?.[key] ?? loadDefaults[key as string] ?? defaults[key]) as unknown as TBlock[keyof TBlock]
    }
    this.updateShape_?.()
  }
}
