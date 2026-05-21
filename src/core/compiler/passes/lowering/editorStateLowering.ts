import type {
  AnyEditorState,
  CompilerOptions,
  EditorState,
  EditorStateList,
  EditorStateMap,
  ItemStackEditorResult
} from '../../../editor'
import {type SNBT, snbtToString} from '../../snbt.ts'
import type {LoweredResult} from './types.ts'
import {FragmentCompositeNode, type FragmentNode} from '../../ir'
import type {LoweringPass} from './lowering.ts'

export class EditorStateLowering {
  private readonly lowering: LoweringPass
  private readonly sourceBlockId?: string | null

  constructor(lowering: LoweringPass, sourceBlockId?: string | null) {
    this.lowering = lowering
    this.sourceBlockId = sourceBlockId
    void this.lowering
  }

  compileEditorState(state: AnyEditorState, opt: CompilerOptions): LoweredResult {
    assertState(state)
    switch (state.compiler) {
      case 'scalar': return this.compileScalar(state as EditorState<string | number | boolean>, opt)
      case 'list': return this.compileList(state, opt)
      case 'object': return this.compileObject(state, opt)
      case 'item': return this.compileItem(state, opt)
      case 'item_stack': return this.compileItemStack(state, opt)
      default: throw Error(`Unknown Editor compiler type ${state.compiler}`)
    }
  }

  private compileScalar(state: EditorState<string | number | boolean>, opt: CompilerOptions): LoweredResult {
    assertState(state)

    if (typeof state.data === 'string' && !opt.nbt) return {
      pre: [],
      nodes: [new FragmentCompositeNode([state.data], this.sourceBlockId, true)]
    }

    return {
      pre: [],
      nodes: [new FragmentCompositeNode([snbtToString((state.data ?? {}) as SNBT)], this.sourceBlockId, true)]
    }
  }

  private compileList(state: AnyEditorState, opt: CompilerOptions): LoweredResult {
    assertState(state)

    const items = (state.data as EditorStateList)
      .map(item => this.compileEditorState(item, { ...opt, nbt: true }))

    const parts: (FragmentNode | string)[] = ['[']
    items.forEach((item, index) => {
      if (index) parts.push(',')
      parts.push(this.fragmentNode(item))
    })
    parts.push(']')

    return {
      pre: items.flatMap(item => item.pre),
      nodes: [new FragmentCompositeNode(parts, this.sourceBlockId, true)]
    }
  }

  private compileObject(state: AnyEditorState, opt: CompilerOptions): LoweredResult {
    assertState(state)

    const fields = Object.entries(state.data as EditorStateMap)
      .map(([key, fieldState]) => [key, this.compileEditorState(fieldState, { ...opt, nbt: true })] as const)

    const parts: (FragmentNode | string)[] = ['{']
    fields.forEach(([key, fieldResult], index) => {
      if (index) parts.push(',')
      parts.push(new FragmentCompositeNode([key, ':', this.fragmentNode(fieldResult)], this.sourceBlockId, true))
    })
    parts.push('}')

    return {
      pre: fields.flatMap(([, fieldResult]) => fieldResult.pre),
      nodes: [new FragmentCompositeNode(parts, this.sourceBlockId, true)]
    }
  }

  private compileItem(state: AnyEditorState, opt: CompilerOptions): LoweredResult {
    assertState(state)

    return {
      pre: [],
      nodes: [new FragmentCompositeNode([
        opt.nbt ? snbtToString(state.data as string) : (state.data as string)
      ], this.sourceBlockId, true)]
    }
  }

  private compileItemStack(state: AnyEditorState, opt: CompilerOptions): LoweredResult {
    assertState(state)

    const { amount: amountState, item: itemState, components } = state.data as ItemStackEditorResult
    const amount = this.compileEditorState(amountState, opt)
    const item = this.compileItem(itemState, opt)

    const loweredComponents = components.map(({ key, state, negate }) => ({
      key,
      negate,
      lowered: negate ? null : this.compileEditorState(state, { ...opt, nbt: true })
    }))

    const pre = [
      ...amount.pre,
      ...item.pre,
      ...loweredComponents.flatMap(component => component.lowered?.pre ?? [])
    ]

    if (opt.nbt) {
      const parts: (FragmentNode | string)[] = ['{', 'id:', this.fragmentNode(item), ',count:', this.fragmentNode(amount)]

      if (loweredComponents.length) {
        parts.push(',components:{')
        loweredComponents.forEach((component, index) => {
          if (index) parts.push(',')
          parts.push(new FragmentCompositeNode(
            component.negate
              ? [snbtToString('!' + component.key), ':{}']
              : [snbtToString(component.key), ':', this.fragmentNode(component.lowered as LoweredResult)],
            this.sourceBlockId,
            true
          ))
        })
        parts.push('}')
      }

      parts.push('}')

      return {
        pre,
        nodes: [new FragmentCompositeNode(parts, this.sourceBlockId, true)]
      }
    }

    const parts: (FragmentNode | string)[] = [this.fragmentNode(item)]

    if (loweredComponents.length) {
      parts.push('[')
      loweredComponents.forEach((component, index) => {
        if (index) parts.push(',')
        parts.push(new FragmentCompositeNode(
          component.negate
            ? [`!${component.key}`]
            : [`${component.key}=`, this.fragmentNode(component.lowered as LoweredResult)],
          this.sourceBlockId,
          true
        ))
      })
      parts.push(']')
    }

    parts.push(' ', this.fragmentNode(amount))

    return {
      pre,
      nodes: [new FragmentCompositeNode(parts, this.sourceBlockId, true)]
    }
  }

  private fragmentNode(result: LoweredResult): FragmentNode {
    if (result.nodes.length !== 1) {
      throw new Error('Expected editor state lowering to produce a single fragment node.')
    }

    return result.nodes[0] as FragmentNode
  }
}

function assertState(state: AnyEditorState): void {
  if (state.compiler === undefined || state.data === undefined || state.error)
    throw new Error('Error or no data while compiling editor state')
}
