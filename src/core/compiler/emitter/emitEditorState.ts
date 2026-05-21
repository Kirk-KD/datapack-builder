import type { CompilerType, EditorSchema } from '../../editor'

// Move this somewhere else in the future
export function inferCompilerType(schema: EditorSchema): CompilerType {
  return schema.kind === 'reference' ? schema.ref : schema.kind
}
