import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx";
import {controller} from "./editor/modal/controller.ts";
import type {EditorResult, EditorResultCallback} from "./editor/types.ts";
import loadFromSchema from "./editor/loader/loadFromSchema.tsx";
import {testItemStackEditor} from "./editor/testEditors.ts";

function App() {
  const outerCallback = (({error, data}: EditorResult<Record<string, unknown>>) => {
    console.log('Error:', error, 'Data:', data)
  }) as EditorResultCallback<unknown>
  controller.openEditorModal({
    title: 'Editor',
    editor: (
      loadFromSchema(testItemStackEditor, { callback: outerCallback, context: {} })
    )
  })
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkspacePanel />
      <EditorModal />
    </div>
  )
}

export default App