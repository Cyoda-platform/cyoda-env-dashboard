/**
 * ReportScheduling Component
 * Schedule reports to run automatically
 */

import React, { useState } from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Switch, Button, message, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { axios } from '@cyoda/http-api-react';
import type { ReportDefinition } from '../types';
import moment from 'moment';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface ReportSchedulingProps {
  visible: boolean;
  reportId?: string;
  reportName?: string;
  onClose: () => void;
}

interface ScheduleForm {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  time: moment.Moment;
  dayOfWeek?: number;
  dayOfMonth?: number;
  enabled: boolean;
  emailRecipients?: string[];
}

export const ReportScheduling: React.FC<ReportSchedulingProps> = ({ visible, reportId, reportName, onClose }) => {
  const [form] = Form.useForm();

  const scheduleMutation = useMutation({
    mutationFn: async (schedule: ScheduleForm) => {
      const { data } = await axios.post(`${API_BASE}/platform-api/reporting/schedules`, {
        reportId,
        ...schedule,
      });
      return data;
    },
    onSuccess: () => {
      message.success('Report scheduled successfully');
      onClose();
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to schedule report');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await scheduleMutation.mutateAsync(values);
    } catch (error) {
      // Validation failed
    }
  };

  return (
    <Modal
      title={`Schedule Report${reportName ? `: ${reportName}` : ''}`}
      open={visible}
      onCancel={onClose}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={scheduleMutation.isPending}
          >
            Schedule
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" initialValues={{ frequency: 'DAILY', enabled: true }}>
          <Form.Item
            label="Frequency"
            name="frequency"
            rules={[{ required: true, message: 'Please select frequency' }]}
          >
            <Select>
              <Select.Option value="DAILY">Daily</Select.Option>
              <Select.Option value="WEEKLY">Weekly</Select.Option>
              <Select.Option value="MONTHLY">Monthly</Select.Option>
              <Select.Option value="CUSTOM">Custom</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Time"
            name="time"
            rules={[{ required: true, message: 'Please select time' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.frequency !== currentValues.frequency}>
            {({ getFieldValue }) => {
              const frequency = getFieldValue('frequency');
              
              if (frequency === 'WEEKLY') {
                return (
                  <Form.Item label="Day of Week" name="dayOfWeek">
                    <Select>
                      <Select.Option value={1}>Monday</Select.Option>
                      <Select.Option value={2}>Tuesday</Select.Option>
                      <Select.Option value={3}>Wednesday</Select.Option>
                      <Select.Option value={4}>Thursday</Select.Option>
                      <Select.Option value={5}>Friday</Select.Option>
                      <Select.Option value={6}>Saturday</Select.Option>
                      <Select.Option value={0}>Sunday</Select.Option>
                    </Select>
                  </Form.Item>
                );
              }

              if (frequency === 'MONTHLY') {
                return (
                  <Form.Item label="Day of Month" name="dayOfMonth">
                    <Select>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <Select.Option key={day} value={day}>
                          {day}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }

              return null;
            }}
          </Form.Item>

          <Form.Item label="Enabled" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
  );
};

export default ReportScheduling;

