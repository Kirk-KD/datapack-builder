import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx";
import {controller} from "./editor/modal/controller.ts";
import type {EditorResult, EditorResultCallback} from "./editor/types.ts";
import loadFromSchema from "./editor/loader/loadFromSchema.tsx";

function App() {
  const outerCallback = (({error, data}: EditorResult<Record<string, unknown>>) => {
    console.log('Error:', error, 'Data:', data)
  }) as EditorResultCallback<unknown>
  controller.openEditorModal({
    title: 'Editor',
    editor: (
      loadFromSchema({
        "kind": "object",
        "fields": [
          {
            "key": "item",
            "schema": {
              "kind": "reference",
              "ref": "item_stack",
              "description": "The item stack in this slot."
            }
          },
          {
            "key": "slot",
            "schema": {
              "kind": "scalar",
              "type": "int",
              "min": 0,
              "max": 255,
              "description": "A slot in this container. Can be from 0 to 255 (inclusive)."
            }
          }
        ],
        "description": "A single item."
      }, { callback: outerCallback, context: {} })
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