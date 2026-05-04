import {useContext} from "react";
import {SnackbarContext} from "./SnackbarContext.tsx";

export function useSnackbarContext() {
  const context = useContext(SnackbarContext)
  if (context === null) {
    throw new Error('useSnackbarContext must be used within a SnackbarProvider')
  }
  return context
}

