export const chainableBlocks = ['mc_string', 'mc_int', 'mc_number', 'mc_param']
export const scoreboardVarSetBlocks = ['mc_int', 'MCCondition', 'mc_var_get', 'mc_param']

export const commands: any[] = [
  {
    "type": "mc_say",
    "message0": "say %1",
    "args0": [
      {
        "type": "input_value",
        "name": "MESSAGE",
        "check": chainableBlocks
      }
    ],
    "inputsInline": true,
    "tooltip": "Broadcasts a message to all players",
    "previousStatement": null,
    "nextStatement": null
  }
]
export const control: any[] = [
  {
    "type": "mc_comp_score_matches",
    "message0": "%1 matches %2 to %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "VAR_NAME",
        "options": [
          [
            "x",
            "X"
          ]
        ]
      },
      {
        "type": "field_number",
        "name": "MIN",
        "value": 0
      },
      {
        "type": "field_number",
        "name": "MAX",
        "value": 10
      }
    ],
    "output": 'MCCondition',
    "extensions": ["mc_scoreboard_variable_dropdown"]
  },
  {
    "type": "mc_comp_score_compare",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "VAR_NAME",
        "options": [
          [
            "x",
            "X"
          ]
        ]
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["<", "LT"],
          ["<=", "LTE"],
          ["=", "EQ"],
          [">=", "GTE"],
          [">", "GT"]
        ]
      },
      {
        "type": "input_value",
        "name": "VAR_B",
        "check": ['mc_int', 'mc_var_get']
      }
    ],
    "inputsInline": true,
    "output": 'MCCondition',
    "extensions": ["mc_scoreboard_variable_dropdown"]
  },
  {
    "type": "mc_if",
    "message0": "if %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CONDITION",
        "check": 'MCCondition'
      }
    ],
    "message1": "then %1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "mc_if_else",
    "message0": "if %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CONDITION",
        "check": 'MCCondition'
      }
    ],
    "message1": "then %1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "message2": "else %1",
    "args2": [
      {
        "type": "input_statement",
        "name": "ELSE"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "mc_while",
    "message0": "repeat while %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CONDITION",
        "check": 'MCCondition'
      }
    ],
    "message1": "do %1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  }
]
export const variable: any[] = [
  {
    "type": "mc_var_set",
    "message0": "set %1 to %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "VAR_NAME",
        "options": [
          [
            "x",
            "X"
          ]
        ]
      },
      {
        "type": "input_value",
        "name": "VALUE",
        "check": scoreboardVarSetBlocks
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "extensions": ["mc_scoreboard_variable_dropdown"]
  },
  {
    "type": "mc_var_change",
    "message0": "change %1 %2 by %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "VAR_NAME",
        "options": [
          [
            "x",
            "X"
          ]
        ]
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["+=", "ADD"],
          ["-=", "SUB"],
          ["*=", "MUL"],
          ["/=", "DIV"],
          ["%=", "MOD"]
        ]
      },
      {
        "type": "input_value",
        "name": "VALUE",
        "check": ['mc_int', 'mc_var_get']
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "extensions": ["mc_scoreboard_variable_dropdown"]
  },
  {
    "type": "mc_var_get",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "VAR_NAME",
        "options": [
          [
            "x",
            "X"
          ]
        ]
      }
    ],
    "output": "mc_var_get",
    "extensions": ["mc_scoreboard_variable_dropdown"]
  }
]
export const events: any[] = [
  {
    "type": "mc_on_load",
    "message0": "on load",
    "args0": [],
    "nextStatement": null
  },
  {
    "type": "mc_on_tick",
    "message0": "every tick",
    "args0": [],
    "nextStatement": null
  }
]
export const literals: any[] = [
  {
    "type": "mc_int",
    "tooltip": "",
    "helpUrl": "",
    "message0": "int %1 %2",
    "args0": [
      {
        "type": "field_number",
        "name": "VALUE",
        "value": 0
      },
      {
        "type": "input_value",
        "name": "CHAIN_NEXT",
        "check": chainableBlocks
      }
    ],
    "output": "mc_int"
  },
  {
    "type": "mc_string",
    "tooltip": "",
    "helpUrl": "",
    "message0": "\" %1 \" %2",
    "args0": [
      {
        "type": "field_input",
        "name": "VALUE",
        "text": "Hello world"
      },
      {
        "type": "input_value",
        "name": "CHAIN_NEXT",
        "check": chainableBlocks
      }
    ],
    "output": "mc_string"
  }
]
export const procedures: any[] = [
  {
    "type": "mc_param",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PARAM_NAME",
        "options": [
          [
            "myParam",
            "X"
          ]
        ]
      },
      {
        "type": "input_value",
        "name": "CHAIN_NEXT",
        "check": chainableBlocks
      }
    ],
    "output": "mc_param",
    "extensions": ["mc_procedure_parameter_dropdown"]
  }    
]