/**
 * Summary Console Component
 * Migrated from @cyoda/processing-manager/src/components/PmShardsDetailTab/PmShardsDetailTabSummary/PmShardsDetailTabSummarySsh.vue
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, message } from 'antd';
import { CodeOutlined, SettingOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import './SummaryConsole.scss';

interface SshSettings {
  hostname: string;
  username: string;
  password: string;
}

const STORAGE_KEY = 'ssh-settings';

export const SummaryConsole: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [consoleVisible, setConsoleVisible] = useState(false);
  const [form] = Form.useForm();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Load settings from localStorage
  const loadSettings = (): SshSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allSettings = JSON.parse(stored);
        const nodeSettings = allSettings.find((s: any) => s.name === name);
        if (nodeSettings) {
          return nodeSettings.form;
        }
      }
    } catch (error) {
      console.error('Failed to load SSH settings:', error);
    }
    return {
      hostname: name || '',
      username: '',
      password: '',
    };
  };

  const [sshSettings, setSshSettings] = useState<SshSettings>(loadSettings());

  // Handle iframe load to apply dark theme styles
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const iframeDoc = iframe.contentDocument;
        const style = iframeDoc.createElement('style');
        style.textContent = `
          body {
            background-color: #1A2332 !important;
            color: #F9FAFB !important;
          }
          * {
            background-color: #1A2332 !important;
          }
        `;
        iframeDoc.head.appendChild(style);
      }
    } catch (error) {
      // Cross-origin iframe - cannot access content
      // SSH server must support bgcolor parameter in URL
    }
  };

  // Sync settings with localStorage when name changes
  useEffect(() => {
    const currentSettings = loadSettings();
    setSshSettings(currentSettings);
  }, [name]);

  const handleLaunchConsole = () => {
    // Load latest settings before launching console
    const currentSettings = loadSettings();

    // Build SSH console URL
    const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
    const link = `${baseUrl}:8888/?hostname=${currentSettings.hostname}&username=${currentSettings.username}&password=${btoa(currentSettings.password)}`;

    // Open console in modal with iframe
    setConsoleVisible(true);
  };

  const handleSettings = () => {
    // Load current settings into form
    const currentSettings = loadSettings();
    form.setFieldsValue(currentSettings);
    setSettingsVisible(true);
  };

  const handleSettingsSave = () => {
    form.validateFields().then((values) => {
      setSshSettings(values);

      // Save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let allSettings = stored ? JSON.parse(stored) : [];

        // Remove existing settings for this node
        allSettings = allSettings.filter((s: any) => s.name !== name);

        // Add new settings
        allSettings.push({ name, form: values });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
      } catch (error) {
        console.error('Failed to save SSH settings:', error);
      }

      setSettingsVisible(false);
      message.success('SSH settings saved');
    });
  };

  return (
    <>
      <Card
        className="summary-console-card"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Console</span>
            <SettingOutlined
              className="settings-icon"
              style={{ fontSize: '16px' }}
              onClick={handleSettings}
            />
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <Button
          type="link"
          icon={<CodeOutlined />}
          onClick={handleLaunchConsole}
          className="console-launch-button"
        >
          Launch Console
        </Button>
      </Card>

      {/* SSH Settings Modal */}
      <Modal
        title="SSH Settings"
        open={settingsVisible}
        onOk={handleSettingsSave}
        onCancel={() => setSettingsVisible(false)}
        okText="Save"
        cancelText="Close"
        className="ssh-settings-modal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={sshSettings}
        >
          <Form.Item
            label="Host name"
            name="hostname"
            rules={[{ required: true, message: 'Please enter hostname' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* SSH Console Modal */}
      <Modal
        title="SSH Console"
        open={consoleVisible}
        onCancel={() => setConsoleVisible(false)}
        footer={[
          <Button key="close" onClick={() => setConsoleVisible(false)}>
            Close
          </Button>
        ]}
        width="80%"
        style={{ top: 20 }}
        className="ssh-console-modal"
      >
        {consoleVisible && (() => {
          const currentSettings = loadSettings();
          // Add dark theme parameters for webssh
          // Try different formats: #bgcolor=XXX or ?bgcolor=XXX
          const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;

          const sshUrl = `${baseUrl}:8888/?hostname=${currentSettings.hostname}&username=${currentSettings.username}&password=${btoa(currentSettings.password)}`;

          return (
            <div style={{
              backgroundColor: '#1A2332',
              padding: 0,
              minHeight: '700px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <iframe
                ref={iframeRef}
                title="SSH Console"
                src={sshUrl}
                width="100%"
                height="700px"
                style={{ border: 'none', display: 'block', backgroundColor: '#1A2332' }}
                onLoad={handleIframeLoad}
              />
            </div>
          );
        })()}
      </Modal>
    </>
  );
};

export default SummaryConsole;

