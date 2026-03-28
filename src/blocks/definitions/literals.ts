import { chainableBlocks } from './shared'

const literals = [
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
    "output": "mc_int",
    "extensions": ["mc_trim_chain_tail", "mc_int_validator"]
  },
  {
    "type": "mc_string",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
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
    "output": "mc_string",
    "extensions": ["mc_trim_chain_tail"]
  }
]

export default literals
