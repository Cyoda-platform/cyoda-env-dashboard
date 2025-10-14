/**
 * Sidebar Component
 * Migrated from @cyoda/processing-manager/src/components/PmSidebar/PmSidebar.vue
 */

import { Link, useLocation } from 'react-router-dom';
import { MenuOutlined, DashboardOutlined, ServerOutlined } from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';
import menuData from './menu.json';
import './Sidebar.scss';

interface MenuItem {
  link: string;
  name: string;
  icon: string;
}

const iconMap: Record<string, React.ComponentType> = {
  'tachometer-alt': DashboardOutlined,
  'server': ServerOutlined,
};

export default function Sidebar() {
  const location = useLocation();
  const sideBarIsShow = useAppStore((state) => state.sideBarIsShow);
  const sideBarIsMinimize = useAppStore((state) => state.sideBarIsMinimize);
  const sideBarMinimizeToggle = useAppStore((state) => state.sideBarMinimizeToggle);

  const menus: MenuItem[] = menuData;

  const isActive = (menuLink: string) => {
    return location.pathname === menuLink || location.pathname.startsWith(menuLink + '/');
  };

  return (
    <div
      className={`c-sidebar c-sidebar-dark c-sidebar-fixed ${
        sideBarIsShow ? 'c-sidebar-lg-show' : ''
      } ${sideBarIsMinimize ? 'c-sidebar-unfoldable' : ''}`}
      id="sidebar"
    >
      <div className="c-sidebar-brand">
        <Link to="/">
          <img
            className="c-sidebar-brand-full"
            src="/assets/images/cyoda-logo.png"
            width="118"
            alt="Cyoda Logo"
          />
          <img
            className="c-sidebar-brand-minimized"
            src="/assets/images/cyoda-small.png"
            width="28"
            alt="Cyoda Logo"
          />
        </Link>
      </div>
      <ul className="c-sidebar-nav">
        {menus.map((menu) => {
          const IconComponent = iconMap[menu.icon];
          return (
            <li key={menu.link} className="c-sidebar-nav-item">
              <Link
                to={menu.link}
                className={`c-sidebar-nav-link ${isActive(menu.link) ? 'c-active' : ''}`}
              >
                <span className="c-sidebar-nav-icon">
                  {IconComponent && <IconComponent />}
                </span>
                {menu.name}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        onClick={sideBarMinimizeToggle}
        className="c-sidebar-minimizer c-class-toggler"
        type="button"
      >
        <MenuOutlined />
      </button>
    </div>
  );
}

