/**
 * Header Component
 * Migrated from @cyoda/processing-manager/src/components/PmHeader/PmHeader.vue
 */

import { Link, useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import { LogOutButton } from '@cyoda/ui-lib-react';
import { useAppStore } from '../../stores/appStore';
import './Header.scss';

export default function Header() {
  const navigate = useNavigate();
  const sideBarToggle = useAppStore((state) => state.sideBarToggle);

  // Mock user for demo purposes - in production this would come from auth store
  const user = { email: 'demo@cyoda.com' };

  const handleLogout = async (clearData: boolean) => {
    // In production, this would call the actual logout function
    console.log('Logout clicked, clearData:', clearData);
    navigate('/login');
  };

  return (
    <header className="c-header c-header-light c-header-fixed c-header-with-subheader">
      <button
        onClick={sideBarToggle}
        className="c-header-toggler c-class-toggler d-lg-none mr-auto"
        type="button"
      >
        <MenuOutlined />
      </button>
      <button
        onClick={sideBarToggle}
        className="c-header-toggler c-class-toggler ml-3 d-md-down-none"
        type="button"
      >
        <MenuOutlined />
      </button>
      <ul className="c-header-nav d-md-down-none">
        <li className="c-header-nav-item px-3">
          <Link className="c-header-nav-link" to="/dashboard">
            Dashboard
          </Link>
        </li>
      </ul>
      <ul className="c-header-nav ml-auto mr-4">
        <li>
          {user?.email} |{' '}
          <LogOutButton onLogout={handleLogout} buttonText="" type="link" />
        </li>
      </ul>
      <div className="c-subheader px-3">
        {/* Breadcrumbs portal target - to be implemented */}
        <div id="breadcrumbs-portal" />
      </div>
    </header>
  );
}

