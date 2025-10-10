import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Row, Col } from 'antd'
import type { MenuItem } from './types'
import './HomeMenuDisplay.scss'

export interface HomeMenuDisplayProps {
  menu: MenuItem
  isDisplayDescription?: boolean
}

/**
 * HomeMenuDisplay Component
 * Displays a single menu item with optional description
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/Home/HomeMenuDisplay.vue
 */
export const HomeMenuDisplay: React.FC<HomeMenuDisplayProps> = ({
  menu,
  isDisplayDescription = true
}) => {
  const getLink = (menu: MenuItem): string => {
    if (window.location.href.indexOf('localhost') > -1 && menu.localhostLink) {
      return menu.localhostLink
    } else {
      let url = `${location.protocol}//${location.hostname}`
      if (location.port) {
        url += `:${location.port}`
      }
      return `${url}${menu.link}`
    }
  }

  const handleClick = (menu: MenuItem) => {
    window.open(getLink(menu), '_blank')
  }

  // Render delimiter
  if (menu.name === 'delimiter') {
    return (
      <div className="home-menu-display">
        <hr />
      </div>
    )
  }

  return (
    <div className="home-menu-display">
      <Row gutter={20}>
        <Col
          span={isDisplayDescription ? 12 : 24}
          className={!isDisplayDescription ? 'text-center' : ''}
        >
          {menu.isRouterLink && menu.link ? (
            <Link className="cyoda-btn" to={menu.link}>
              {menu.name}
            </Link>
          ) : (
            <Button
              type="primary"
              className="cyoda-btn"
              onClick={() => handleClick(menu)}
              block
            >
              {menu.name}
            </Button>
          )}
        </Col>
        {isDisplayDescription && menu.description && (
          <Col span={12}>
            {menu.description}
          </Col>
        )}
      </Row>
    </div>
  )
}

