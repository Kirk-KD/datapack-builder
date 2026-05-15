export const valueTypes = {
  String: 'string',
  Int: 'int',
  Position: 'position',
  Rotation: 'rotation',
  Range: 'range',

  Condition: 'condition',

  ProcParam: 'proc_param',

  TargetSelector: 'target_selector',
  ItemStack: 'item_stack',

  VarGet: 'var_get',

  Number: 'number',
  OptNumber: 'opt_number',
  Tilde: 'tilde',
  Caret: 'caret',
  Swizzle: 'swizzle',
  Angle: 'angle',

  ConstantDef: 'constant_def',

  Array: 'array'
} as const

export type ValueType = (typeof valueTypes)[keyof typeof valueTypes]
