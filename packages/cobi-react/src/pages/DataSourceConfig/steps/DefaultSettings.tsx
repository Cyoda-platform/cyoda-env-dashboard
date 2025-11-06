import React from 'react';
import { Form, Input, Switch, Row, Col } from 'antd';
import type { DataSourceConfigDto } from '../../../types';

const { TextArea } = Input;

interface DefaultSettingsProps {
  config: DataSourceConfigDto;
  onChange: (updates: Partial<DataSourceConfigDto>) => void;
}

const DefaultSettings: React.FC<DefaultSettingsProps> = ({ config, onChange }) => {
  return (
    <div className="default-settings-step">
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Name"
              required
              validateStatus={!config.name ? 'error' : ''}
              help={!config.name ? 'Name is required' : ''}
            >
              <Input
                value={config.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="Enter configuration name"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Active">
              <Switch
                checked={config.active}
                onChange={(checked) => onChange({ active: checked })}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Description">
          <TextArea
            value={config.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Enter configuration description"
            rows={4}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default DefaultSettings;

