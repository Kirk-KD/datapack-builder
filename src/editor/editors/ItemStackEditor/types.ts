import type {EditorState} from "../../types.ts";

export type ItemStackEditorResult = {
  item: EditorState<string>
  amount: EditorState<number>
  components: ItemComponent[]
}

export type ItemComponent = {
  key: string
  state: EditorState<unknown>
  negate: boolean
}