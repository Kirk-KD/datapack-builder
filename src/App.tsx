import WorkspacePanel from './components/WorkspacePanel'
import EditorModal from "./editor/modal/EditorModal.tsx";
import {controller} from "./editor/modal/controller.ts";
import type {EditorResult, EditorResultCallback, EditorSchema} from "./editor/types.ts";
import loadFromSchema from "./editor/loader/loadFromSchema.tsx";

const testSchema: EditorSchema = {
  kind: 'object',
  fields: [
    {
      key: 'name',
      schema: {
        kind: 'scalar',
        type: 'string',
        defaultValue: 'Steve',
        description: 'Player name'
      }
    },
    {
      key: 'health',
      schema: {
        kind: 'scalar',
        type: 'int',
        min: 0,
        max: 20,
        defaultValue: 10
      }
    },
    {
      key: 'speed',
      schema: {
        kind: 'scalar',
        type: 'float',
        min: 0,
        max: 1,
        defaultValue: 0.1
      }
    },
    {
      key: 'isAlive',
      schema: {
        kind: 'scalar',
        type: 'boolean',
        defaultValue: true
      }
    },
    {
      key: 'rank',
      schema: {
        kind: 'scalar',
        type: 'select',
        options: ['bronze', 'silver', 'gold'],
        defaultValue: 'bronze'
      }
    },
    {
      key: 'inventory',
      schema: {
        kind: 'list',
        item: {
          kind: 'reference',
          ref: 'item_stack'
        }
      }
    },
    {
      key: 'position',
      schema: {
        kind: 'object',
        fields: [
          {
            key: 'x',
            schema: {
              kind: 'scalar',
              type: 'double',
              defaultValue: 0
            }
          },
          {
            key: 'y',
            schema: {
              kind: 'scalar',
              type: 'double',
              defaultValue: 64
            }
          },
          {
            key: 'z',
            schema: {
              kind: 'scalar',
              type: 'double',
              defaultValue: 0
            }
          }
        ]
      }
    },
    {
      key: 'effects',
      schema: {
        kind: 'list',
        item: {
          kind: 'object',
          fields: [
            {
              key: 'id',
              schema: {
                kind: 'scalar',
                type: 'string'
              }
            },
            {
              key: 'duration',
              schema: {
                kind: 'scalar',
                type: 'long',
                min: 0
              }
            }
          ]
        }
      }
    },
    {
      key: 'optionalNote',
      schema: {
        kind: 'scalar',
        type: 'string',
        optional: true,
        note: 'This field is optional'
      }
    },
    {
      key: 'nested',
      schema: {
        kind: 'object',
        fields: [
          {
            key: 'name',
            schema: {
              kind: 'scalar',
              type: 'string',
              defaultValue: 'Steve',
              description: 'Player name'
            }
          },
          {
            key: 'nested',
            schema: {
              kind: 'object',
              fields: [
                {
                  key: 'name',
                  schema: {
                    kind: 'scalar',
                    type: 'string',
                    defaultValue: 'Steve',
                    description: 'Player name'
                  }
                },
                {
                  key: 'nested',
                  schema: {
                    kind: 'object',
                    fields: [
                      {
                        key: 'name',
                        schema: {
                          kind: 'scalar',
                          type: 'string',
                          defaultValue: 'Steve',
                          description: 'Player name'
                        }
                      },
                      {
                        key: 'nested',
                        schema: {
                          kind: 'object',
                          fields: [
                            {
                              key: 'name',
                              schema: {
                                kind: 'scalar',
                                type: 'string',
                                defaultValue: 'Steve',
                                description: 'Player name'
                              }
                            },
                            {
                              key: 'nested',
                              schema: {
                                kind: 'object',
                                fields: [
                                  {
                                    key: 'name',
                                    schema: {
                                      kind: 'scalar',
                                      type: 'string',
                                      defaultValue: 'Steve',
                                      description: 'Player name'
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

function App() {
  const outerCallback = (({error, data}: EditorResult<Record<string, unknown>>) => {
    console.log('Error:', error, 'Data:', data)
  }) as EditorResultCallback<unknown>
  controller.openEditorModal({
    title: 'Editor',
    editor: (
      loadFromSchema(testSchema, { callback: outerCallback, context: {} })
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