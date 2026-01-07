/**
 * Header Component
 * Migrated from @cyoda/processing-manager/src/components/PmHeader/PmHeader.vue
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import { LogOutButton } from '@cyoda/ui-lib-react';
import { useAppStore } from '../../stores/appStore';
import { useClusterStats } from '../../hooks/useProcessing';
import ProxyModeToggle from './ProxyModeToggle';
import LiveUpdateToggle from './LiveUpdateToggle';
import './Header.scss';

export default function Header() {
  const navigate = useNavigate();
  const sideBarToggle = useAppStore((state) => state.sideBarToggle);
  const liveUpdate = useAppStore((state) => state.liveUpdate);
  const [consistencyTimeLagMs, setConsistencyTimeLagMs] = useState<number>(0);

  // Mock user for demo purposes - in production this would come from auth store
  const user = { email: 'demo@cyoda.com' };

  const { data: clusterStats, refetch } = useClusterStats();

  // Poll cluster stats every second when live update is enabled
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchStats = async () => {
      if (liveUpdate) {
        const result = await refetch();
        if (result.data?.consistencyTimeLagMs !== undefined) {
          setConsistencyTimeLagMs(result.data.consistencyTimeLagMs);
        }
      }
      intervalId = setTimeout(fetchStats, 1000);
    };

    fetchStats();

    return () => {
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, [liveUpdate, refetch]);

  const handleLogout = async (clearData: boolean) => {
    // In production, this would call the actual logout function
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
          <Link className="c-header-nav-link" to="/processing-ui">
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

        {/* Consistency time lag */}
        <div className="consistency-time">
          Consistency time lag(millis): {consistencyTimeLagMs}
        </div>

        <div className="delimiter">|</div>

        {/* Live update toggle */}
        <LiveUpdateToggle />

        <div className="delimiter">|</div>

        {/* Proxy mode toggle */}
        <ProxyModeToggle />
      </div>
    </header>
  );
}

