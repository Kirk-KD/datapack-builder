import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx";
import {controller} from "./editor/modal/controller.ts";
import type {EditorResult} from "./editor/types.ts";
import {ItemStackEditor} from "./editor/editors/ItemStackEditor";

function App() {
  const outerCallback = ({error, data}: EditorResult<Record<string, unknown>>) => {
    console.log('Error:', error, 'Data:', data)
  }
  controller.openEditorModal({
    title: 'Item Stack',
    editor: (
      <ItemStackEditor context={{}} callback={outerCallback}/>
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