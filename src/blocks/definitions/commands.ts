import { chainableBlocks } from './shared'

const commands: any[] = [
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

export default commands
