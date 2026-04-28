import * as Blockly from "blockly";
import {compile} from "./compile.ts";
import JSZip from "jszip";
import {useProjectConfigStore} from "../../stores";

export function emit(workspace: Blockly.WorkspaceSvg) {
  const files = compile(workspace)
  const projName = useProjectConfigStore.getState().projectConfig.namespace

  const zip = new JSZip()
  for (const [path, content] of files.entries()) {
    zip.file(path, content)
  }

  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `${projName}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  })
}
