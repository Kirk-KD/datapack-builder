import type {EditorState, EditorStateCallback} from "../../../core/editor";
import {type ProjectConfig, useProjectConfigStore} from "../../../stores";
import {useEffect, useState} from "react";
import {ObjectEditor} from "./ObjectEditor";
import StringEditor from "./StringEditor.tsx";
import BooleanEditor from "./BooleanEditor.tsx";

function useConfigEntry<K extends keyof ProjectConfig>(key: K): [EditorState<ProjectConfig[K]>, EditorStateCallback<ProjectConfig[K]>] {
  const [state, setState] = useState<EditorState<ProjectConfig[K]>>({
    error: false,
    compiler: 'scalar',
    data: useProjectConfigStore.getState().projectConfig[key]
  })

  useEffect(() => {
    if (state.data !== undefined) {
      useProjectConfigStore.getState().updateConfig({ [key]: state.data } as Partial<ProjectConfig>)
    }
  }, [key, state.data])

  useEffect(() => {
    return useProjectConfigStore.subscribe(store => {
      setState(prev => ({ ...prev, data: store.projectConfig[key] }))
    })
  }, [key])

  return [state, setState]
}

export function ProjectConfigEditor() {
  const [namespaceState, setNamespaceState] = useConfigEntry('namespace')
  const [descriptionState, setDescriptionState] = useConfigEntry('description')
  const [noNameManglingState, setNoNameManglingState] = useConfigEntry('noNameMangling')

  return <ObjectEditor stateless entries={[
    {
      key: 'Project namespace',
      compiler: 'scalar',
      component: () => <StringEditor state={namespaceState} setState={setNamespaceState}/>
    },
    {
      key: 'Description',
      compiler: 'scalar',
      component: () => <StringEditor multiline state={descriptionState} setState={setDescriptionState}/>
    },
    {
      key: 'No name-mangling',
      compiler: 'scalar',
      component: () => <BooleanEditor state={noNameManglingState} setState={setNoNameManglingState}/>
    },
  ]}/>
}