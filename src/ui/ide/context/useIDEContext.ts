import * as React from "react";
import {IDEContext} from "./IDEContext.tsx";

export function useIDEContext() {
  const context = React.useContext(IDEContext)
  if (!context) {
    throw new Error('useIDEContext must be used inside IDEProvider')
  }

  return context
}

