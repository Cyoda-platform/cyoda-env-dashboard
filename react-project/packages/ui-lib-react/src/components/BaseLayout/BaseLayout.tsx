import React, { useEffect, useRef, useCallback } from 'react'
import { throttle } from 'lodash'
import './BaseLayout.scss'

export interface BaseLayoutProps {
  header?: React.ReactNode
  main?: React.ReactNode
  footer?: React.ReactNode
  portals?: React.ReactNode
  className?: string
}

/**
 * BaseLayout Component
 * Main application layout with sticky header and responsive padding
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/templates/BaseLayout/BaseLayout.vue
 */
export const BaseLayout: React.FC<BaseLayoutProps> = ({
  header,
  main,
  footer,
  portals,
  className = ''
}) => {
  const headerRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  const resizeWindow = useCallback(() => {
    if (!headerRef.current || !mainRef.current) return
    
    const headerHeight = headerRef.current.offsetHeight
    mainRef.current.style.paddingTop = `${headerHeight + 10}px`
  }, [])

  useEffect(() => {
    // Create throttled resize handler
    const resizeWindowThrottle = throttle(resizeWindow, 100)

    // Initial resize
    resizeWindowThrottle()

    // Add event listener
    window.addEventListener('resize', resizeWindowThrottle)

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeWindowThrottle)
      resizeWindowThrottle.cancel()
    }
  }, [resizeWindow])

  return (
    <div className={`app-wrapper ${className}`}>
      <div className="app-content">
        <div>
          <header className="sticky" ref={headerRef}>
            {header}
          </header>
          <main className="main" ref={mainRef}>
            {main}
          </main>
          <footer>
            {footer}
          </footer>
        </div>
      </div>
      <div className="app-overlaping-components">
        {/* Portal target for modals - will be implemented with React Portal */}
        <div id="modal-portal-target" />
        {portals}
      </div>
    </div>
  )
}

