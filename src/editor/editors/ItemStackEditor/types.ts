import type {EditorResult} from "../../types.ts";

export type ItemStackEditorResult = {
  item: string
  amount: number
  components: Record<string, {
    component: unknown | null
    negate: boolean
  }>
}

export type ItemComponent = {
  key: string
  result: EditorResult<unknown> | null
  negate: boolean
}