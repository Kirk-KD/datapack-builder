import { scoreboardVarSetBlocks } from './shared'

const variable = [
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
    "extensions": ["mc_scoreboard_variable_dropdown", "mc_var_set_shadow"]
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
        "check": ["mc_int", "mc_var_get"]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "extensions": ["mc_scoreboard_variable_dropdown", "mc_var_change_shadow"]
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

export default variable
