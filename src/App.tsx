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
            "key": "NoAI",
            "schema": {
              "kind": "scalar",
              "type": "boolean",
              "description": "Turns into NoAI entity tag for all bucketable entities."
            }
          },
          {
            "key": "Silent",
            "schema": {
              "kind": "scalar",
              "type": "boolean",
              "description": "Turns into Silent entity tag for all bucketable entities."
            }
          },
          {
            "key": "NoGravity",
            "schema": {
              "kind": "scalar",
              "type": "boolean",
              "description": "Turns into NoGravity entity tag for all bucketable entities."
            }
          },
          {
            "key": "Glowing",
            "schema": {
              "kind": "scalar",
              "type": "boolean",
              "description": "Turns into Glowing entity tag for all bucketable entities."
            }
          },
          {
            "key": "Invulnerable",
            "schema": {
              "kind": "scalar",
              "type": "boolean",
              "description": "Turns into Invulnerable entity tag for all bucketable entities."
            }
          },
          {
            "key": "AgeLocked",
            "schema": {
              "kind": "scalar",
              "type": "boolean",
              "description": "Turns into AgeLocked entity tag for axolotls and tadpoles."
            }
          },
          {
            "key": "Health",
            "schema": {
              "kind": "scalar",
              "type": "float",
              "description": "Turns into Health entity tag for all bucketable entities."
            }
          },
          {
            "key": "Age",
            "schema": {
              "kind": "scalar",
              "type": "int",
              "description": "Turns into Age entity tag for axolotls and tadpoles."
            }
          },
          {
            "key": "HuntingCooldown",
            "schema": {
              "kind": "scalar",
              "type": "long",
              "description": "Turns into the expiry time of the memory module has_hunting_cooldown for axolotls."
            }
          }
        ],
        "description": "NBT applied to an entity when placed from this bucket. Only tags below are applied."
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