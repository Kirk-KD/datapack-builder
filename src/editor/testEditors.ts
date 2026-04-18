import type {EditorSchema} from "./types.ts"

export const testAllSchemas: EditorSchema = {
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

export const testItemStackEditor: EditorSchema = {
  kind: 'reference',
  ref: 'item_stack'
}