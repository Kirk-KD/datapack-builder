export type ItemStackEditorResult = {
  item: string
  amount: number
  components: ItemComponent[]
}

export type ItemComponent = {
  key: string
  value: unknown
  negate: boolean
}