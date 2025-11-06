/**
 * ReportUISettingsDialog Component
 * Dialog for configuring report UI settings (ID field selection)
 * Migrated from: .old_project/packages/http-api/src/components/ReportUISettings/ReportUISettingsPopUp.vue
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button } from 'antd';
import { useReportsStore } from '../stores/reportsStore';
import type { ConfigDefinition } from '../types';
import type { ReportSettings } from '../stores/reportsStore';
import './ReportUISettingsDialog.scss';

interface ReportUISettingsDialogProps {
  visible: boolean;
  reportDefinitionId: string;
  configDefinition: ConfigDefinition;
  idFieldList: Array<{ value: string; label: string }>;
  storedSettings?: ReportSettings;
  onClose: () => void;
}

const ReportUISettingsDialog: React.FC<ReportUISettingsDialogProps> = ({
  visible,
  reportDefinitionId,
  idFieldList,
  storedSettings,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { setReportsSettings } = useReportsStore();

  // Initialize form when dialog opens or stored settings change
  useEffect(() => {
    if (visible && storedSettings && storedSettings.settings) {
      form.setFieldsValue({
        idField: storedSettings.settings.idField || undefined,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, storedSettings, form]);

  const handleChange = (value: string) => {
    // Save settings immediately when changed
    setReportsSettings({
      id: reportDefinitionId,
      settings: {
        idField: value,
      },
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      title="Settings"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" type="primary" onClick={handleClose}>
          Close
        </Button>,
      ]}
      width={600}
      className="report-ui-settings-dialog"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Id Field" name="idField">
          <Select
            placeholder="Select ID field"
            allowClear
            onChange={handleChange}
            options={idFieldList}
            popupClassName="report-ui-settings-dropdown"
            dropdownStyle={{ minWidth: '300px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReportUISettingsDialog;

