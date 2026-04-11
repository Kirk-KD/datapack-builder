import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx";
import {controller} from "./editor/modal/controller.ts";
import KeyValueEditor from "./editor/editors/KeyValueEditor.tsx";
import EditorRow from "./editor/components/EditorRow.tsx";
import NumberEditor from "./editor/editors/NumberEditor.tsx";

function App() {
  controller.openEditorModal({
    title: 'Hello',
    editor: (
      <KeyValueEditor>
        <EditorRow label={'field_1'}>
          <NumberEditor context={{}} callback={({data}) => {
            console.log('field_1', data)
          }} type={'float'} />
        </EditorRow>
        <EditorRow label={'field_number_two'}>
          <NumberEditor context={{}} callback={({data}) => {
            console.log('field_number_two', data)
          }} type={'int'} />
        </EditorRow>
        <EditorRow label={'noted_input'} note={'This one has a note.'}>
          <NumberEditor context={{}} callback={() => {}} type={'int'} />
        </EditorRow>
        <EditorRow label={'nested'} isNested={true}>
          <KeyValueEditor>
            <EditorRow label={'field_1'}>
              <NumberEditor context={{}} callback={({data}) => {
                console.log('field_1', data)
              }} type={'float'} />
            </EditorRow>
            <EditorRow label={'field_2'} isNested={true}>
              <KeyValueEditor>
                <EditorRow label={'field_2_1'}>
                  <NumberEditor context={{}} callback={({data}) => {
                    console.log('field_2_1', data)
                  }} type={'float'} />
                </EditorRow>
                <EditorRow label={'field_2_2'}>
                  <NumberEditor context={{}} callback={({data}) => {
                    console.log('field_2_2', data)
                  }} type={'float'} />
                </EditorRow>
                <EditorRow label={'field_2_3'}>
                  <NumberEditor context={{}} callback={({data}) => {
                    console.log('field_2_3', data)
                  }} type={'float'} />
                </EditorRow>
              </KeyValueEditor>
            </EditorRow>
          </KeyValueEditor>
        </EditorRow>
        <EditorRow label={'optional'} optional={true}>
          <NumberEditor context={{}} callback={({data}) => {
            console.log('optional', data)
          }} type={'int'} />
        </EditorRow>
      </KeyValueEditor>
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