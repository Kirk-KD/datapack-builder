import * as React from "react";
import type {PanelElement} from "./resize.ts";
import {getResizedPairSizes} from "./resize.ts";

type UseSplitLayoutArgs = {
  panels: PanelElement[]
}

export function useSplitLayout({panels}: UseSplitLayoutArgs) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const panelRefs = React.useRef<Array<HTMLDivElement | null>>([])
  const [sizes, setSizes] = React.useState<number[] | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  React.useLayoutEffect(() => {
    const container = containerRef.current

    if (!container || panels.length === 0) {
      return
    }

    const measureSizes = () => {
      const containerWidth = container.getBoundingClientRect().width

      if (containerWidth <= 0) {
        return
      }

      const measuredWidths = panels.map((_, index) =>
        panelRefs.current[index]?.getBoundingClientRect().width ?? 0
      )
      const totalMeasuredWidth = measuredWidths.reduce((total, width) => total + width, 0)

      if (totalMeasuredWidth <= 0) {
        return
      }

      setSizes(measuredWidths.map(width => width / totalMeasuredWidth))
    }

    measureSizes()

    const resizeObserver = new ResizeObserver(() => {
      if (!isDragging) {
        measureSizes()
      }
    })

    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [isDragging, panels])

  React.useEffect(() => {
    panelRefs.current = panelRefs.current.slice(0, panels.length)
  }, [panels.length])

  const startResize = React.useCallback((index: number, event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current

    if (!container || !sizes) {
      return
    }

    const containerWidth = container.getBoundingClientRect().width

    if (containerWidth <= 0) {
      return
    }

    const startX = event.clientX
    const startSizes = [...sizes]
    setIsDragging(true)
    event.preventDefault()

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaRatio = (moveEvent.clientX - startX) / containerWidth
      const [nextLeft, nextRight] = getResizedPairSizes(
        panels,
        startSizes,
        containerWidth,
        index,
        deltaRatio
      )

      setSizes(currentSizes => {
        if (!currentSizes) {
          return currentSizes
        }

        const nextSizes = [...startSizes]
        nextSizes[index] = nextLeft
        nextSizes[index + 1] = nextRight
        return nextSizes
      })
    }

    const onPointerUp = () => {
      setIsDragging(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }, [panels, sizes])

  return {
    containerRef,
    panelRefs,
    sizes,
    startResize,
  }
}
