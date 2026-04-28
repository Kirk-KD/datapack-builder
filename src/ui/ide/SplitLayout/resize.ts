import type * as React from "react";
import type {PanelProps} from "./Panel.tsx";

export type PanelElement = React.ReactElement<PanelProps, typeof import("./Panel.tsx").Panel>

export const RESIZER_SIZE_PX = 8

export function parseCssLength(value: string | undefined, containerWidth: number) {
  if (!value) {
    return 0
  }

  const trimmed = value.trim()

  if (trimmed.endsWith('px')) {
    return Number.parseFloat(trimmed)
  }

  if (trimmed.endsWith('rem')) {
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    return Number.parseFloat(trimmed) * rootFontSize
  }

  if (trimmed.endsWith('%')) {
    return containerWidth * Number.parseFloat(trimmed) / 100
  }

  const numericValue = Number.parseFloat(trimmed)
  return Number.isNaN(numericValue) ? 0 : numericValue
}

export function getResizedPairSizes(
  panels: PanelElement[],
  startSizes: number[],
  containerWidth: number,
  index: number,
  deltaRatio: number,
) {
  const leftPanel = panels[index]
  const rightPanel = panels[index + 1]
  const leftMinRatio = parseCssLength(leftPanel.props.minWidth, containerWidth) / containerWidth
  const rightMinRatio = parseCssLength(rightPanel.props.minWidth, containerWidth) / containerWidth
  const pairTotal = startSizes[index] + startSizes[index + 1]
  const unclampedLeft = startSizes[index] + deltaRatio
  const nextLeft = Math.min(Math.max(unclampedLeft, leftMinRatio), pairTotal - rightMinRatio)

  return [nextLeft, pairTotal - nextLeft] as const
}
