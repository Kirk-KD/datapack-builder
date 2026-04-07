import {registerLazyEditorModal} from "../registry.ts";

registerLazyEditorModal('item_selector', async () => {
  const module = await import('./ItemSelector.tsx')
  return module.default
})