import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Drawer } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { HomeMenuDisplay } from './HomeMenuDisplay'
import { defaultMenuItems, type MenuItem } from './types'
import './HomeDrawer.scss'

export interface HomeDrawerProps {
  menus?: MenuItem[]
}

export interface HomeDrawerRef {
  drawer: boolean
  setDrawer: (open: boolean) => void
}

/**
 * HomeDrawer Component
 * Drawer menu with navigation items
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/Home/HomeDrawer.vue
 */
export const HomeDrawer = forwardRef<HomeDrawerRef, HomeDrawerProps>(({
  menus = defaultMenuItems
}, ref) => {
  const [drawer, setDrawer] = useState(false)
  const location = useLocation()

  // Expose drawer state and setter to parent via ref
  useImperativeHandle(ref, () => ({
    drawer,
    setDrawer
  }))

  const handleClickBars = () => {
    setDrawer(true)
  }

  const handleClose = () => {
    setDrawer(false)
  }

  return (
    <div className="wrap-home-drawer">
      {location.pathname !== '/' && (
        <MenuOutlined 
          className="wrap-bars" 
          onClick={handleClickBars}
        />
      )}
      <Drawer
        className="home-drawer"
        title="Menu"
        placement="left"
        open={drawer}
        onClose={handleClose}
      >
        <div className="inner">
          {menus.map((menu, index) => (
            <HomeMenuDisplay
              key={menu.link || `${menu.name}-${index}`}
              menu={menu}
              isDisplayDescription={false}
            />
          ))}
        </div>
      </Drawer>
    </div>
  )
})

HomeDrawer.displayName = 'HomeDrawer'

