import * as React from "react";
import * as Blockly from "blockly";
import {useEffect, useRef} from "react";
import {deserialize, serialize} from "../../core/save/serialization.ts";
import {useProjectConfigStore} from "../../stores";

const AUTOSAVE_KEY = 'dpb_autosave'
const AUTOSAVE_INTERVAL_MS = 2000

export function useAutosave(workspaceRef: React.RefObject<Blockly.WorkspaceSvg | null>) {
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY)
    if (saved && workspaceRef.current) {
      deserialize({ workspace: workspaceRef.current, save: JSON.parse(saved) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isDirtyRef = useRef(false)

  useEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace) return

    const listener = workspace.addChangeListener(() => {
      isDirtyRef.current = true
    })

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    const interval = setInterval(() => {
      if (!isDirtyRef.current) return
      const serialized = serialize({ workspace })
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(serialized))
      isDirtyRef.current = false
    }, AUTOSAVE_INTERVAL_MS)

    return () => {
      workspace.removeChangeListener(listener)
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsubscribe = useProjectConfigStore.subscribe(() => {
      isDirtyRef.current = true
    })
    return () => unsubscribe()
  }, [])
}