import { chainableBlocks } from './shared'

const procedures = [
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
    "extensions": ["mc_procedure_parameter_dropdown", "mc_trim_chain_tail"]
  }
]

export default procedures
