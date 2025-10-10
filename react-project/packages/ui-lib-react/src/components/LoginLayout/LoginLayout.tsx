import React from 'react'
import { Link } from 'react-router-dom'
import './LoginLayout.scss'

export interface LoginLayoutProps {
  nameApp?: string
  footer?: React.ReactNode
  children?: React.ReactNode
  logoComponent?: React.ReactNode
  logoLink?: string
}

/**
 * LoginLayout Component
 * Layout for login and authentication pages with logo header
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/templates/LoginLayout/LoginLayout.vue
 */
export const LoginLayout: React.FC<LoginLayoutProps> = ({
  nameApp = '',
  footer,
  children,
  logoComponent,
  logoLink = '/'
}) => {
  return (
    <div className="app-wrapper">
      <div className="app-content">
        <div>
          <header>
            <div className="header-contents">
              <Link to={logoLink} className="logo-wrapper" aria-label="Cyoda">
                {logoComponent}
              </Link>
              {nameApp && (
                <small className="name-app">
                  {nameApp}
                </small>
              )}
            </div>
          </header>
          <main className="main main-contents">
            {children}
          </main>
          <footer>
            {footer}
          </footer>
        </div>
      </div>
    </div>
  )
}

