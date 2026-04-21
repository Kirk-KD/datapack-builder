import type {AnyEditorState, AnyEditorStateCallback, EditorSchema} from "./types.ts"
import {useEffect, useState} from "react";
import {controller} from "./modal/controller.ts";
import loadFromSchema from "./loadFromSchema.tsx";
import compileEditorState, {inferCompilerType} from "../compiler/compileEditorState.ts";

export function useTestString() {
  useTestEditor({
    kind: 'scalar',
    type: 'string',
  })
}

export function useTestNumber() {
  useTestEditor({
    kind: 'scalar',
    type: 'float'
  })
}

export function useTestBoolean() {
  useTestEditor({
    kind: 'scalar',
    type: 'boolean'
  })
}

export function useTestSelect() {
  useTestEditor({
    kind: 'scalar',
    type: 'select',
    options: ['A', 'B', 'C']
  })
}

export function useTestList() {
  useTestEditor({
    kind: 'list',
    item: {
      kind: 'scalar',
      type: 'string'
    }
  })
}

export function useTestObject() {
  useTestEditor({
    kind: 'object',
    fields: [
      {
        key: 'one',
        schema: {
          kind: 'scalar',
          type: 'string'
        }
      },
      {
        key: 'two',
        schema: {
          kind: 'scalar',
          type: 'int'
        }
      },
      {
        key: 'three',
        schema: {
          kind: 'scalar',
          type: 'select',
          options: ['A', 'B', 'C']
        }
      }
    ]
  })
}

export function useTestItemStack() {
  useTestEditor({
    kind: 'reference',
    ref: 'item_stack'
  })
}

export function useTestComplex() {
  useTestEditor({
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
  })
}

export function useTestEditor(schema: EditorSchema, initData?: unknown) {
  const [state, setState] = useState<AnyEditorState>({
    compiler: inferCompilerType(schema),
    error: false,
    data: initData
  }) as [AnyEditorState, AnyEditorStateCallback]

  useEffect(() => {
    controller.openEditorModal({
      title: 'Editor',
      editor: (
        loadFromSchema(schema, { state, setState, context: {} })
      )
    })
  }, [schema, state])

  useEffect(() => {
    try {
      console.log(compileEditorState(state, {}))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) { /* empty */ }
  }, [state])
}