import {useProjectConfigStore} from "../../stores";

export function getInternalNamespace(): string {
  const {projectConfig} = useProjectConfigStore.getState()
  return projectConfig.noNameMangling ? 'dpb_internal' : `__dpb_${projectConfig.namespace}_internal`
}

export function getProcArgsStorageName(): string {
  const ins = getInternalNamespace()
  return `${ins}:_proc_args_data`
}

export function getProcName(procName: string): string {
  return `proc_${procName}`
}

export function getProcArgPath(procName: string, paramName: string): string {
  return `${getProcName(procName)}.${paramName}`
}

export function getObjectiveName(): string {
  const { projectConfig } = useProjectConfigStore.getState()
  const { namespace, noNameMangling } = projectConfig
  return noNameMangling ? 'VARIABLES' : `__dpb_${namespace}_VARIABLES`
}

export function getVarName(name: string): string {
  const { projectConfig } = useProjectConfigStore.getState()
  const { namespace, noNameMangling } = projectConfig
  return noNameMangling ? name : `$__dpb_${namespace}_${name}`
}

export function getTempVarName(): string {
  const { projectConfig } = useProjectConfigStore.getState()
  const { namespace, noNameMangling } = projectConfig
  return noNameMangling ? 'TEMP' : `$__dpb_${namespace}_$TEMP`
}

export function getInitializedVarName(): string {
  const { projectConfig } = useProjectConfigStore.getState()
  const { namespace, noNameMangling } = projectConfig
  return noNameMangling ? 'INIT' : `$__dpb_${namespace}_$INIT`
}

export function getObjectiveNamePublic(): string {
  return getObjectiveName()
}