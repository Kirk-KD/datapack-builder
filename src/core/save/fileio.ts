import {deserialize, serialize} from "./serialization.ts";
import type {SerializationOptions} from "./types.ts";
import {useProjectConfigStore} from "../../stores";

export function saveProject(opt: SerializationOptions) {
  const serialized = serialize(opt)
  const link = document.createElement('a')
  link.href = `data:application/json;charset=utf-8;base64,${btoa(JSON.stringify(serialized))}`
  link.download = `${useProjectConfigStore.getState().projectConfig.namespace}.dpb.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function loadProject(opt: SerializationOptions & { onLoad?: () => void }) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    const text = await file.text()
    const save = JSON.parse(text)
    deserialize({ ...opt, save })
    opt.onLoad?.()
  }
  input.click()
}