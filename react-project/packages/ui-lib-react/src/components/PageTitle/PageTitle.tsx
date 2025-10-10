import React from 'react'
import './PageTitle.scss'

export interface PageTitleProps {
  title: string
  subtitle?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

/**
 * PageTitle Component
 * Displays a page title with optional subtitle
 */
export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  level = 2,
  className = ''
}) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <div className={`page-title ${className}`}>
      <HeadingTag className="title">{title}</HeadingTag>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  )
}

