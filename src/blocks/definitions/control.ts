const control: any[] = [
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
    "output": "MCCondition",
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
        "check": ["mc_int", "mc_var_get"]
      }
    ],
    "inputsInline": true,
    "output": "MCCondition",
    "extensions": ["mc_scoreboard_variable_dropdown", "mc_comp_score_compare_shadow"]
  },
  {
    "type": "mc_if",
    "message0": "if %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CONDITION",
        "check": "MCCondition"
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
        "check": "MCCondition"
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
        "check": "MCCondition"
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

export default control
