import { registerLazyEditorModal } from '../registry'

registerLazyEditorModal('item_stack', async () => {
  const module = await import('./itemStackEditor')
  return module.default
})
