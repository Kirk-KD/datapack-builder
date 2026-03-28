import { chainableBlocks } from './shared'

const commands = [
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
    "extensions": ["mc_say_shadow"],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "mc_teleport",
    "message0": "teleport %1 to %2 %3 %4", // TODO not always to coordinates
    "args0": [
      {
        "type": "input_value",
        "name": "SELECTOR",
        "check": ["mc_string", "mc_target_selector"]
      },
      {
        "type": "field_input",
        "name": "X",
        "text": "0"
      },
      {
        "type": "field_input",
        "name": "Y",
        "text": "0"
      },
      {
        "type": "field_input",
        "name": "Z",
        "text": "0"
      }
    ],
    "inputsInline": true,
    "tooltip": "Teleports to coordinates",
    "previousStatement": null,
    "nextStatement": null,
    "extensions": ["mc_teleport_shadow"],
  }
]

export default commands
