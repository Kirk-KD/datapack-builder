export const chainableBlocks = ['mc_string', 'mc_int', 'mc_number', 'mc_param', 'mc_target_selector']
export const scoreboardVarSetBlocks = ['mc_int', 'MCCondition', 'mc_var_get', 'mc_param']
export const literalBlocks = ['mc_string', 'mc_int', 'mc_number']
export const procArgBlocks = [...literalBlocks, 'mc_var_get', 'mc_param']

// Disconnect chains when trying to attach
export const trimChainTailBlocks = ['mc_var_set', 'mc_var_change']
