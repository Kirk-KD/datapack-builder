import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type HelpTooltipProps = {
  text: string
}

function HelpTooltip({ text }: HelpTooltipProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isOpen) return

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return

      setPosition({
        top: rect.bottom + 6,
        left: Math.max(12, Math.min(rect.right - 320, window.innerWidth - 332)),
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  return (
    <span className="dataComponentHelp">
      <button
        type="button"
        ref={buttonRef}
        className="dataComponentHelpButton"
        aria-label="Show help"
        aria-expanded={isOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onClick={() => setIsOpen((current) => !current)}
      >
        ?
      </button>
      {isOpen && createPortal(
        <span
          className="dataComponentHelpTooltipPortal"
          role="tooltip"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  )
}

export default HelpTooltip
