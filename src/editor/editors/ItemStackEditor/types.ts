export type ItemStackEditorResult = {
  item: string
  amount: number
  components: ItemStackComponent[]
}

export type ItemStackComponent = {
  name: string
  value: unknown
}