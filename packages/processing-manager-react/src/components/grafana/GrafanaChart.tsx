/**
 * Grafana Chart Component
 * Migrated from @cyoda/processing-manager/src/components/PmGrafanaChart/PmGrafanaChart.vue
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, Empty } from 'antd';
import { useParams } from 'react-router-dom';
import { useGrafanaDashboardByName, useGrafanaPanelsByUid } from '../../hooks';
import './GrafanaChart.scss';

interface GrafanaChartProps {
  node?: string;
  port?: string;
  dashboardName: string;
  panelName: string;
  job?: string;
  height?: number;
}

// Event emitter for chart reset
const grafanaEvents = {
  listeners: [] as Array<() => void>,
  on: (callback: () => void) => {
    grafanaEvents.listeners.push(callback);
  },
  off: (callback: () => void) => {
    grafanaEvents.listeners = grafanaEvents.listeners.filter(cb => cb !== callback);
  },
  emit: () => {
    grafanaEvents.listeners.forEach(cb => cb());
  },
};

export { grafanaEvents };

export default function GrafanaChart({
  node = '',
  port = '',
  dashboardName,
  panelName,
  job = '',
  height = 300,
}: GrafanaChartProps) {
  const params = useParams<{ name: string }>();
  const [link, setLink] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [dashboardUid, setDashboardUid] = useState<string>('');

  const computedPanelName = panelName.replace('$instance', `${params.name}:${port}`);

  const { data: dashboardData } = useGrafanaDashboardByName(dashboardName);
  const { data: panelsData } = useGrafanaPanelsByUid(dashboardUid);

  // Find chart data recursively
  const getChartData = useCallback((obj: any): any => {
    if (!obj || !obj.panels) return null;
    
    for (let i = 0; i < obj.panels.length; i++) {
      const panel = obj.panels[i];
      if (panel.title?.toLowerCase() === panelName.toLowerCase()) {
        return panel;
      }
      if (panel.panels) {
        const chartData = getChartData(panel);
        if (chartData) return chartData;
      }
    }
    return null;
  }, [panelName]);

  // Build Grafana link
  useEffect(() => {
    if (!dashboardData || !panelsData) return;

    try {
      const dashboard = dashboardData[0];
      if (!dashboard) return;

      const { uid } = dashboard;
      const url = dashboard.url?.replace('/d/', '/d-solo/');
      if (!url) return;

      const chartData = getChartData(panelsData.dashboard);
      if (!chartData) return;

      // Get environment variables (these should be configured in your app)
      const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
      const grafanaPort = import.meta.env.MODE === 'development' ? '8000' : '8001';
      const grafanaSourceId = import.meta.env.VITE_APP_GRAFANA_SERVER_SOURCE_ID || '1';
      
      // Get auth token from localStorage or auth store
      const token = localStorage.getItem('auth_token') || '';

      const grafanaUrl = `${baseUrl}:${grafanaPort}${url}?orgId=${grafanaSourceId}&var-DS_PROMETHEUS=Prometheus&refresh=30s&var-job=${job}&var-instance=${node}:${port}&theme=light&panelId=${chartData.id}&token=${token}`;
      
      setLink(grafanaUrl);
    } catch (error) {
      console.error('Error building Grafana link:', error);
    }
  }, [dashboardData, panelsData, node, port, job, getChartData]);

  // Set dashboard UID when dashboard data is loaded
  useEffect(() => {
    if (dashboardData && dashboardData[0]) {
      setDashboardUid(dashboardData[0].uid);
    }
  }, [dashboardData]);

  // Handle chart reset
  useEffect(() => {
    const handleReset = () => {
      setIsEnabled(false);
      setTimeout(() => {
        setIsEnabled(true);
      }, 100);
    };

    grafanaEvents.on(handleReset);
    return () => {
      grafanaEvents.off(handleReset);
    };
  }, []);

  if (!node) {
    return (
      <Card
        className="grafana-chart-card"
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: '24px' } }}
      >
        <Empty
          description={
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                {computedPanelName}
              </div>
              <div>
                No data. IP {params.name} not connected to Grafana
              </div>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      className="grafana-chart-card"
      style={{ marginBottom: 16 }}
      styles={{ body: { padding: '24px' } }}
    >
      {isEnabled && link && (
        <iframe
          src={link}
          width="100%"
          height={height}
          frameBorder="0"
          title={computedPanelName}
        />
      )}
    </Card>
  );
}

