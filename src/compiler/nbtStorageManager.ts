import { getInternalNamespace } from './projectConfig'

class NBTStorageManager {
  getProcArgsStorageName(): string {
    const ins = getInternalNamespace()
    return `${ins}:_proc_args_data`
  }

  getProcArgPath(procName: string, paramName: string): string {
    return `proc_${procName}.${paramName}`
  }
}

export const nbtStorageManager = new NBTStorageManager()