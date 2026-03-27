const executeRootBlock = {
  "type": "execute_root",
  "tooltip": "",
  "helpUrl": "",
  "message0": "execute %1 run %2",
  "args0": [
    {
      "type": "input_statement",
      "name": "MODIFIER_STACK"
    },
    {
      "type": "input_statement",
      "name": "RUN_STACK"
    }
  ],
  "previousStatement": null,
  "nextStatement": null
}

export const executeModifierBlocks: any[] = [
  {
    "type": "execute_mod_align",
    "tooltip": "",
    "helpUrl": "",
    "message0": "align %1",
    "args0": [
      {
        "type": "field_input",
        "name": "AXES",
        "text": "xyz"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_anchored",
    "tooltip": "",
    "helpUrl": "",
    "message0": "anchored %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "ANCHOR",
        "options": [
          ["eyes", "eyes"],
          ["feet", "feet"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_as",
    "tooltip": "",
    "helpUrl": "",
    "message0": "as %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TARGET",
        "text": "@s"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_at",
    "tooltip": "",
    "helpUrl": "",
    "message0": "at %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TARGET",
        "text": "@s"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_facing",
    "tooltip": "",
    "helpUrl": "",
    "message0": "facing %1 %2 %3",
    "args0": [
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
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_facing_entity",
    "tooltip": "",
    "helpUrl": "",
    "message0": "facing entity %1 %2",
    "args0": [
      {
        "type": "field_input",
        "name": "TARGET",
        "text": "@s"
      },
      {
        "type": "field_dropdown",
        "name": "ANCHOR",
        "options": [
          ["eyes", "eyes"],
          ["feet", "feet"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_in",
    "tooltip": "",
    "helpUrl": "",
    "message0": "in %1",
    "args0": [
      {
        "type": "field_input",
        "name": "DIMENSION",
        "text": "minecraft:overworld"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_on",
    "tooltip": "",
    "helpUrl": "",
    "message0": "on %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "RELATION",
        "options": [
          ["attacker", "attacker"],
          ["controller", "controller"],
          ["leasher", "leasher"],
          ["origin", "origin"],
          ["owner", "owner"],
          ["passengers", "passengers"],
          ["target", "target"],
          ["vehicle", "vehicle"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_positioned",
    "tooltip": "",
    "helpUrl": "",
    "message0": "positioned %1 %2 %3",
    "args0": [
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
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_positioned_as",
    "tooltip": "",
    "helpUrl": "",
    "message0": "positioned as %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TARGET",
        "text": "@s"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_positioned_over",
    "tooltip": "",
    "helpUrl": "",
    "message0": "positioned over %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "HEIGHTMAP",
        "options": [
          ["world_surface", "world_surface"],
          ["motion_blocking", "motion_blocking"],
          ["motion_blocking_no_leaves", "motion_blocking_no_leaves"],
          ["ocean_floor", "ocean_floor"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_rotated",
    "tooltip": "",
    "helpUrl": "",
    "message0": "rotated %1 %2",
    "args0": [
      {
        "type": "field_input",
        "name": "YAW",
        "text": "0"
      },
      {
        "type": "field_input",
        "name": "PITCH",
        "text": "0"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_rotated_as",
    "tooltip": "",
    "helpUrl": "",
    "message0": "rotated as %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TARGET",
        "text": "@s"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "execute_mod_summon",
    "tooltip": "",
    "helpUrl": "",
    "message0": "summon %1",
    "args0": [
      {
        "type": "field_input",
        "name": "ENTITY",
        "text": "armor_stand"
      }
    ],
    "previousStatement": null,
    "nextStatement": null
  }
]

const execute: any[] = [executeRootBlock, ...executeModifierBlocks]
export default execute