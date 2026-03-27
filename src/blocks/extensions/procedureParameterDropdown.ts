import * as Blockly from 'blockly'
import { getParametersForProcedure } from '../../compiler/workspaceRegistry'

function getContainingProcedureName(block: Blockly.Block | null): string | null {
  let current = block

  while (current) {
    if (current.type === 'procedures_defnoreturn') {
      return current.getFieldValue('NAME') ?? null
    }
    current = current.getParent()
  }
  return null
}

function getProcedureParamOptions(block: Blockly.Block): [string, string][] | null {
  const containingProcedureName = getContainingProcedureName(block)
  if (!containingProcedureName) return null

  const params = getParametersForProcedure(containingProcedureName)
  return params.map(param => [param.getName(), param.getId()])
}

function areDropdownOptionsEqual(a: [string, string][], b: [string, string][]): boolean {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false
  }

  return true
}

function optionValues(options: [string, string][]): Set<string> {
  return new Set(options.map(([, value]) => value))
}

Blockly.Extensions.register('mc_procedure_parameter_dropdown', function() {
  // All blocks using this extension must have a dropdown field named 'PARAM_NAME'.
  const paramField = this.getField('PARAM_NAME')! as Blockly.FieldDropdown
  const initialOptions = getProcedureParamOptions(this)
  let appliedOptions: [string, string][] = initialOptions ?? [['...', '...']]
  paramField.setOptions(appliedOptions)

  const previousOnChange = this.onchange ?? (() => {})
  this.setOnChange(function(this: Blockly.Block, event: Blockly.Events.Abstract) {
    previousOnChange.call(this, event)

    if (!event || this.isInFlyout) return

    if (
      event.type !== Blockly.Events.BLOCK_MOVE
      && event.type !== Blockly.Events.BLOCK_CHANGE
      && event.type !== Blockly.Events.BLOCK_CREATE
      && event.type !== Blockly.Events.VAR_RENAME
      && event.type !== Blockly.Events.VAR_CREATE
      && event.type !== Blockly.Events.VAR_DELETE
    ) return

    const options = getProcedureParamOptions(this)
    if (options) {
      if (!areDropdownOptionsEqual(appliedOptions, options)) {
        const previousValue = paramField.getValue()
        const nextValues = optionValues(options)

        paramField.setOptions(options)
        appliedOptions = options

        if (previousValue != null && nextValues.has(previousValue)) {
          paramField.setValue(previousValue)
          paramField.forceRerender()
        }
      }

      this.setWarningText(null)
    } else this.setWarningText('Parameter can only be used inside a procedure')
  })
})
