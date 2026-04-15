import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx";
import {controller} from "./editor/modal/controller.ts";
import {KeyValueEditor} from "./editor/editors/KeyValueEditor";
import NumberEditor from "./editor/editors/NumberEditor.tsx";
import type {EditorResult} from "./editor/types.ts";

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
          component: (callback) => <NumberEditor context={{}} callback={callback} type={'int'}/>
        },
        {
          key: 'nested_editor',
          nested: true,
          component: (callback) => <KeyValueEditor entries={[
            {
              key: 'field_1',
              description: 'This is a description.',
              note: 'Note about this field.',
              optional: true,
              component: (callback) => <NumberEditor context={{}} callback={callback} type={'int'}/>
            },
            {
              key: 'field_2',
              description: 'This is a description.',
              component: (callback) => <NumberEditor context={{}} callback={callback} type={'int'}/>
            },
            {
              key: 'nested_editor_2',
              nested: true,
              component: (callback) => <KeyValueEditor entries={[
                {
                  key: 'field_1',
                  description: 'This is a description.',
                  note: 'Note about this field.',
                  optional: true,
                  component: (callback) => <NumberEditor context={{}} callback={callback} type={'int'}/>
                },
                {
                  key: 'field_2',
                  description: 'This is a description.',
                  component: (callback) => <NumberEditor context={{}} callback={callback} type={'int'}/>
                },
              ]} callback={callback} />
            }
          ]} callback={callback} />
        }
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