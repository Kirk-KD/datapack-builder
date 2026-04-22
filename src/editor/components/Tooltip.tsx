import * as React from "react"
import { createPortal } from "react-dom"
import './Tooltip.css'

type TooltipPosition = {
  top: number
  left: number
  placement: 'top' | 'bottom'
}

const TOOLTIP_GAP = 8
const VIEWPORT_PADDING = 8

export default function Tooltip({ text, children }: { text?: string, children: React.ReactElement}) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState<TooltipPosition | null>(null)
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null)
  const tooltipRef = React.useRef<HTMLSpanElement | null>(null)

  const updatePosition = React.useCallback(() => {
    const wrapper = wrapperRef.current
    const tooltip = tooltipRef.current

    if (!wrapper || !tooltip) return

    const wrapperRect = wrapper.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    let placement: TooltipPosition['placement'] = 'top'
    let top = wrapperRect.top - TOOLTIP_GAP

    if (top - tooltipRect.height < VIEWPORT_PADDING) {
      placement = 'bottom'
      top = wrapperRect.bottom + TOOLTIP_GAP
    }

    const centeredLeft = wrapperRect.left + (wrapperRect.width / 2)
    const minLeft = VIEWPORT_PADDING + (tooltipRect.width / 2)
    const maxLeft = window.innerWidth - VIEWPORT_PADDING - (tooltipRect.width / 2)

    setPosition({
      top,
      left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
      placement,
    })
  }, [])

  React.useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }

    updatePosition()

    const handleResizeOrScroll = () => updatePosition()

    window.addEventListener('resize', handleResizeOrScroll)
    window.addEventListener('scroll', handleResizeOrScroll, true)

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll)
      window.removeEventListener('scroll', handleResizeOrScroll, true)
    }
  }, [open, updatePosition])

  if (!text) return children

  return (
    <>
      <span
        ref={wrapperRef}
        className={'tooltipWrapper'}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>

      {open && typeof document !== 'undefined' && createPortal(
        <span
          ref={tooltipRef}
          className={'tooltip'}
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            visibility: position ? 'visible' : 'hidden',
            transform: position?.placement === 'bottom'
              ? 'translate(-50%, 0)'
              : 'translate(-50%, -100%)',
          }}
        >
          {text}
        </span>,
        document.body,
      )}
    </>
  )
}