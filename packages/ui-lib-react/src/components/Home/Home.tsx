import React from 'react'
import { HomeMenuDisplay } from './HomeMenuDisplay'
import { defaultMenuItems, type MenuItem } from './types'
import './Home.scss'

export interface HomeProps {
  menus?: MenuItem[]
}

/**
 * Home Component
 * Main home page with menu items
 * 
 * Migrated from Vue: .old_project/packages/cyoda-ui-lib/src/components-library/elements/Home/Home.vue
 */
export const Home: React.FC<HomeProps> = ({
  menus = defaultMenuItems
}) => {
  return (
    <div className="wrap-home">
      {menus.map((menu, index) => (
        <HomeMenuDisplay 
          key={menu.link || `${menu.name}-${index}`} 
          menu={menu} 
        />
      ))}
    </div>
  )
}

