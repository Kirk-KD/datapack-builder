import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx";
import {controller} from "./editor/modal/controller.ts";
import {KeyValueEditor} from "./editor/editors/KeyValueEditor";
import type {EditorResult} from "./editor/types.ts";
import ItemSelectorEditor from "./editor/editors/ItemSelectorEditor/ItemSelectorEditor.tsx";

function App() {
  const outerCallback = ({error, data}: EditorResult<Record<string, unknown>>) => {
    console.log('Error:', error, 'Data:', data)
  }
  controller.openEditorModal({
    title: 'Hello',
    editor: (
      <KeyValueEditor entries={[
        {
          key: 'field_1',
          description: 'This is a description.',
          note: 'Note about this field.',
          nested: true,
          component: (callback) => <ItemSelectorEditor context={{}} callback={callback}/>
        },
      ]} callback={outerCallback} />
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