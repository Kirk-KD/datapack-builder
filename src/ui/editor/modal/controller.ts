import {useEffect, useState} from "react";
import * as React from "react";

type Listener = () => void

type EditorModalPayload = {
  title: string
  editor: React.ReactNode
}

let state: {
  open: boolean
  maximized: boolean
  payload: EditorModalPayload | null
} = {
  open: false,
  maximized: false,
  payload: null
}

let listeners: Listener[] = []

function emit() {
  for (const l of listeners) l()
}

export const controller = {
  openEditorModal(payload: EditorModalPayload) {
    state = {
      ...state,
      open: true,
      payload
    }
    emit()
  },

  closeEditorModal() {
    state = {
      ...state,
      open: false,
      payload: null
    }
    emit()
  },

  toggleMaximized() {
    state = {
      ...state,
      maximized: !state.maximized
    }
    emit()
  },

  setMaximized(maximized: boolean) {
    state = {
      ...state,
      maximized
    }
    emit()
  },

  subscribe(listener: Listener) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  },

  getState() {
    return state
  }
}

// hook
export function useEditorModal() {
  const [state, setState] = useState(controller.getState())

  useEffect(() => {
    return controller.subscribe(() => {
      setState(controller.getState())
    })
  }, []);

  return state
}