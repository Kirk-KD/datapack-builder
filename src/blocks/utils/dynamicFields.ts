import * as Blockly from 'blockly'

type DynamicBlock = Blockly.BlockSvg & {
  updateShape_?: () => void
}

type DropdownOption<T extends string> = [string, T]

type DynamicFieldConfig = {
  rerender?: boolean
}

type DropdownConfig<TValue extends string> = DynamicFieldConfig & {
  fallbackValue?: TValue
}

export function createStateDropdown<
  TBlock extends DynamicBlock,
  TKey extends keyof TBlock & string,
  TValue extends Extract<TBlock[TKey], string>,
>(
  block: TBlock,
  key: TKey,
  options: DropdownOption<TValue>[],
  config: DropdownConfig<TValue> = {},
) {
  const dropdown = new Blockly.FieldDropdown(options as [string, string][], (newValue) => {
    if (!newValue || newValue === block[key]) return newValue
    block[key] = newValue as TBlock[TKey]
    if (config.rerender) {
      block.updateShape_?.()
    }
    return newValue
  })

  const currentValue = block[key]
  dropdown.setValue(String(currentValue ?? config.fallbackValue ?? options[0][1]))
  return dropdown
}

export function createStateCheckbox<
  TBlock extends DynamicBlock,
  TKey extends keyof TBlock & string,
>(
  block: TBlock,
  key: TKey,
  config: DynamicFieldConfig = {},
) {
  const checkbox = new Blockly.FieldCheckbox(block[key] ? 'TRUE' : 'FALSE', (newValue) => {
    const nextValue = newValue === 'TRUE'
    if (nextValue === block[key]) return newValue
    block[key] = nextValue as TBlock[TKey]
    if (config.rerender) {
      block.updateShape_?.()
    }
    return newValue
  })

  checkbox.setValue(block[key] ? 'TRUE' : 'FALSE')
  return checkbox
}
