import type {
  AnyEditorState,
  CompilerOptions,
  CompilerType,
  EditorSchema,
  EditorState,
  EditorStateList,
  EditorStateMap,
} from '../editor/types.ts'
import { type SNBT, snbtToString } from './util.ts'
import type { ItemStackEditorResult } from '../editor/editors/ItemStackEditor'

export function inferCompilerType(schema: EditorSchema): CompilerType {
  return schema.kind === 'reference' ? schema.ref : schema.kind
}

export default function compileEditorState(state: AnyEditorState, opt: CompilerOptions): string {
  assertState(state)
  switch (state.compiler) {
    case 'scalar': return compileScalar(state as EditorState<string | number | boolean>, opt)
    case 'list': return compileList(state, opt)
    case 'object': return compileObject(state, opt)
    case 'item': return compileItem(state, opt)
    case 'item_stack': return compileItemStack(state, opt)
    default: throw Error(`Unknown Editor compiler type ${state.compiler}`)
  }
}

function compileScalar(state: EditorState<string | number | boolean>, opt: CompilerOptions): string {
  assertState(state)
  if (typeof state.data === 'string' && !opt.nbt) return state.data
  return snbtToString((state.data ?? {}) as SNBT)
}

function compileList(state: AnyEditorState, opt: CompilerOptions): string {
  assertState(state)
  const items = (state.data as EditorStateList)
    .map(item => compileEditorState(item, { ...opt, nbt: true }))
    .join(',')
  return `[${items}]`
}

function compileObject(state: AnyEditorState, opt: CompilerOptions): string {
  assertState(state)
  const fields = Object.entries(state.data as EditorStateMap)
    .map(([key, fieldState]) => `${key}:${compileEditorState(fieldState, { ...opt, nbt: true })}`)
    .join(',')
  return `{${fields}}`
}

function compileItem(state: AnyEditorState, opt: CompilerOptions): string {
  assertState(state)
  return opt.nbt ? snbtToString(state.data as string) : (state.data as string)
}

function compileItemStack(state: AnyEditorState, opt: CompilerOptions): string {
  assertState(state)

  const { amount: amountState, item: itemState, components } = state.data as ItemStackEditorResult
  const amount = compileEditorState(amountState, opt)
  const item = compileItem(itemState, opt)

  const itemComponents = components.map(({ key, state, negate }) => {
    if (opt.nbt) return negate ? `${snbtToString('!' + key)}:{}` : `${snbtToString(key)}:${compileEditorState(state, { ...opt, nbt: true })}`
    else return negate ? `!${key}` : `${key}=${compileEditorState(state, { ...opt, nbt: true })}`
  }).join(',')

  if (opt.nbt) return itemComponents
    ? `{id:${item},count:${amount},components:{${itemComponents}}}`
    : `{id:${item},count:${amount}}`
  else return itemComponents
    ? `${item}[${itemComponents}] ${amount}`
    : `${item} ${amount}`
}

function assertState(state: AnyEditorState): void {
  if (state.data === undefined || state.error) throw new Error('Error or no data while compiling editor state')
}