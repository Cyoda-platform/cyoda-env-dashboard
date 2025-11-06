import React from 'react'
import { Link } from 'react-router-dom'
import './Breadcrumbs.scss'

export interface BreadcrumbItem {
  id?: string
  title: string
  route: string
}

export interface BreadcrumbsProps {
  breadcrumbs?: BreadcrumbItem[]
}

/**
 * Breadcrumbs Component
 * Navigation breadcrumbs for page hierarchy
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/BreadcrumbsComponent/BreadcrumbsComponent.vue
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrumbs = []
}) => {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null
  }

  return (
    <ul className="cyoda-breadcrumbs">
      {breadcrumbs.map((breadcrumb, index) => (
        <li key={breadcrumb.id || breadcrumb.title || index}>
          <Link to={breadcrumb.route}>{breadcrumb.title}</Link>
        </li>
      ))}
    </ul>
  )
}

