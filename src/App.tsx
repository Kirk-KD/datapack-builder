import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx"

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkspacePanel />
      <EditorModal />
    </div>
  )
}

export default App